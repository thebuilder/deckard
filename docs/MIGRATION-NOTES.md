# Migration notes

The record of building `apps/demo` on Deckard: a 19-slide conference talk, in a
project shaped like something a consumer would generate rather than a copy of
the playground. This was the last check before calling the API stable, and the
point of writing it down is the friction, not the result.

Everything below is what actually happened, in the order it happened.

## What got built

19 slides. 10 defined inline in `deck/slides.tsx`, 9 discovered from
`deck/slides/*.slide.tsx`. 7 slugs, 12 numbered. Every slide carries speaker
notes. One inline async Server Component reads four files off disk while the
page renders, one slide module carries a nested client component that computes
contain fit, two slides use `stepCount`, one is fullscreen media, one is a code
walkthrough that scrolls inside the canvas.

The theme is the broadsheet registry theme, installed and then changed in six
places. `deck/theme/THEME.md` records the diff.

## Did `slides.tsx` stay manageable at 19 slides?

Yes, and the honest reason is that 9 of the 19 slides are not in it.

`deck/slides.tsx` is 454 lines. 341 of those are the array itself, and 61 more
are one template literal holding the code sample that one slide displays. Take
that sample out and the file is under 400 lines for 10 slides, notes included.
Scrolling it to find a headline is fine. Scrolling it to find a headline at 19
inline slides would not have been, and I would have extracted more.

The rule in the authoring skill held up without me thinking about it. Every
slide that grew data, a widget, or notes longer than its body ended up in a file,
and the ones that are metadata plus a block stayed in the array. Nothing pushed
back on either choice.

One thing I did not expect: the notes are what make the array long. Speaker notes
written the way a speaker writes them run three or four paragraphs, and they sit
in the same object as the copy. At 19 slides that is fine. At 60 it would not be,
and the escape hatch is the same one, a file per slide.

## Friction

### The slide route is copied, not written

`apps/demo/app/slides/[id]/page.tsx` is 87 lines and I wrote none of them. It is
the playground's route with the pieces I did not need removed. Params, metadata
with the deck-title special case, the presenter preview flag, the step query
parameter and its clamp, prefetch of the three neighbouring slides, the chrome
override when exporting a PDF.

Not one line is a decision this deck gets to make. If the runtime ever adds a
search parameter, every deck in existence migrates by hand, and half of them will
get the clamp wrong. This is the single biggest thing I would change.

**Recommended:** ship the route from the package, something like

```tsx
export { generateMetadata, generateStaticParams } from "@deckard/core/route"
export { default } from "@deckard/core/route"
```

with an escape hatch for the deck that genuinely needs its own.

**Resolved.** `@deckard/core/next` now ships `createSlideRoute`,
`createPresenterPage`, `createDeckSitemap`, and `createFirstSlideRedirect`. Each
one takes the deck and returns the route pieces, so all four route files are
re-exports an app writes once and never revisits:

```tsx
// app/slides/[id]/page.tsx
import { createSlideRoute } from "@deckard/core/next"
import { deck } from "@/deck/deck"

const { Page, generateMetadata, generateStaticParams } = createSlideRoute(deck)

export { generateMetadata, generateStaticParams }
export default Page
```

The 87 lines are now 7. The presenter preview flag and the step parameter moved
into the client, which is what lets every slide prerender statically instead of
opting into a dynamic render to read a query string. The escape hatch is that
nothing forces the adapter: the components it composes are still exported, so a
deck that needs its own route writes one. `apps/demo` runs on the adapters, and
so do both smoke fixtures.

### A slide cannot read its own deck

The scale demo needs the canvas dimensions. `deck/deck.ts` imports
`deck/slides.tsx`, so a slide importing `deck/deck.ts` closes a cycle. I moved
the canvas into `deck/canvas.ts`, which both files import, and it works, but it
means the deck's canvas now lives somewhere other than `defineDeck`.

This costs a new file in every deck that wants to draw anything against its own
geometry, and drawing against your own geometry is a normal thing for a slide to
want.

**Recommended:** put the resolved canvas in slide context alongside `title` and
`isPresenterPreview`. `SlideShell` already has it. The provider already exists.

### The deck harness was welded to one app

`deck:validate`, `deck:check-overflow`, `deck:screenshots`, `deck:contact-sheet`,
and `export:pdf` lived in `apps/playground/scripts` and resolved the app from
their own file location, so a second deck could only get them by copying them.

Fixed first, in `tools/deck-scripts`, before anything else. The harness now takes
the invoking package's directory as the deck and ships each script as a bin, so
`apps/demo/package.json` reads `"deck:validate": "deck-validate"`. The registry
check became opt-in behind `--registry=<path>`, because a deck outside this
repository has no `registry.json` to check.

That refactor was the right size. It also means the scripts are now a thing a
published deck could depend on, which they were not before.

### An SVG in `public/` gets a 400 from `next/image`

The fullscreen slide points at `/canvas-field.svg`. `next/image` refuses to
optimize SVG unless `images.dangerouslyAllowSVG` is set, which is a wide setting
to turn on for one file I wrote myself. Next's own error message suggests the
`unoptimized` prop, and the media block had no way to pass it.

Fixed in the block, in both the registry source and the demo copy. The demo's
`next.config.ts` never had to grow a key for it.

This one was worth fixing rather than documenting. A deck full of diagrams is a
normal deck, diagrams are SVG, and the first thing a consumer would have found is
a broken image and a config flag with "dangerously" in the name.

### Registry blocks are tuned for the theme they shipped with

`HeroSlide` caps its headline at `max-w-[14ch]`. That reads well at the deckard
theme's sans display face. At this deck's 4.5rem serif it broke a 40-character
title into four ragged lines, the third of which was "without the". I widened it
to `20ch` in the demo's copy.

That is the arrangement working as designed, the blocks are files you own. It is
worth saying out loud in the docs, though, because a measure that assumes a font
is not an obvious thing to check.

### `FeatureGrid` is three columns, and I wanted four twice

The stats slide and the checks slide both have four items. `FeatureGrid` renders
`grid-cols-3`, which puts three on one row and one alone on the next. I wrote two
small local grids instead, which took ten minutes each and is the right answer
for one deck.

If a third deck writes the same 2x2, the block should take a column count. I am
not convinced yet, so I did not add one.

### A theme fork inherits nothing

Installing broadsheet and changing it was fast, about half an hour including the
background variant. The result is 218 lines of CSS with 169 lines that differ
from the file it came from.

The cost is invisible and arrives later. If broadsheet gains a token, or fixes a
contrast bug, this deck never hears about it, and no check can tell that the two
files have drifted. Owning the file is the right default. Owning it with no way
to see what you forked from is not.

**Recommended:** give themes a base layer to extend, or at minimum record the
registry item and version a theme was forked from so a check can say "broadsheet
moved and you did not".

### Reading files from a slide is undocumented

The stats slide uses `node:fs/promises` with `process.cwd()`. It works, in `next
dev`, in `next build`, and under the Vite loader `deck-validate` uses, because
that loader never calls the component. But nothing in the README says a slide may
touch the filesystem, and nothing says what `cwd` is during a build. I found out
by trying it.

Small doc gap, not an API gap.

## What did not push back at all

- **Discovery.** Nine files, numeric prefixes, `sort: "order"`, zero surprises.
  The one time I removed a `slug` from five modules at once, `deck:validate`
  reported the new count in a second and that was the whole verification.
- **The server boundary.** One async slide, one client widget nested a level
  down, and the `slides.test.ts` guard. I never had to think about it after the
  first slide.
- **Presenter mode.** It worked on the new app the moment `/presenter` existed.
  Pressing `P` opened the console, it connected, notes rendered, and arrow keys
  in the deck window drove it. No configuration beyond one 10-line route file.
- **PDF export.** 19 pages at 1440x810pt, which is 1920x1080 at 96dpi, first run.
- **The fixed canvas.** I never once wondered how something would look on another
  screen, which is the entire promise and it delivers.
- **The token contract.** Every visual change I wanted was a token edit. I did
  not reach into a runtime component once.

## The gate earned its place

`deck:check-overflow` caught two clipped slides after I raised
`--slide-support-size` from `0.9375rem` to `1.0625rem`. Both fixes were deleting
a sentence, which made the slides better. That is the check doing exactly what it
is for.

The contact sheet caught something no checker could. The scale demo and the stats
slide both ended above the halfway line of the canvas and looked unfinished, and
the presenter slide and the checks slide were the same numbered list back to
back. I would not have noticed either one slide at a time. All three got
reworked, and the changes are in a commit of their own.

## The duplication ledger

`pnpm analyze` reports every clone in the repository, and adding a second deck
lit it up. The five entries in `duplicates.ignore` in `.fallowrc.json` are the
exact list of what this framework makes a second deck copy:

```
apps/demo/app/**          the route, the layout, the token map
apps/demo/deck/theme/**   the theme, forked from broadsheet
```

The blocks and the theme belong there. Those are registry files, owned by the
deck by design, and the duplication is the feature.

`app/layout.tsx`, `app/globals.css`, and `app/slides/[id]/page.tsx` were the ones
worth reading as a debt list. Every deck wrote those three files, they were the
same three files every time, and the route was the one with no decisions in it at
all. The route adapters took that entry off the list: all four route files are
now re-exports too short to clone. What is left is the layout and the token map,
which do carry per-deck decisions.

`fallow health` reported 20 high-complexity functions against 16 at the branch
point, and `pnpm analyze` did not pass either way. The four new ones lived in
`apps/demo/app/slides/blocks/media.tsx` and `apps/demo/app/slides/[id]/page.tsx`,
byte-for-byte copies of playground files already on that list. The route copy is
gone now. Lowering the threshold to make the run green would still hide the 16
findings that predate this branch.

## Verdict

The architecture holds. Nothing in the model needed to change to build a real
talk on it, the parts that are meant to be owned by the deck were genuinely
editable, and the parts that are meant to be invisible stayed invisible.

The gaps are not missing exports. They are two places where the framework asks
the deck to write code that has no decision in it: the route, and the canvas
import cycle. Both are additive fixes. Neither breaks an existing deck.

The route shipped, in `@deckard/core/next`, and `apps/demo` was moved onto it.
The canvas in slide context and the theme fork ledger are still open, and both
can wait for a second consumer to confirm them.

## Changes this migration made

| Change | Where |
| --- | --- |
| Moved the deck harness out of the playground and made it app-agnostic | `tools/deck-scripts` |
| `--registry=<path>` made the registry check opt-in | `tools/deck-scripts/validate-deck.ts` |
| `unoptimized` passthrough on both media blocks | `app/slides/blocks/media.tsx` |
| Route adapters, so an app re-exports its four route files | `packages/core/src/next/routes.tsx` |
| The demo, the playground, and both smoke fixtures moved onto the adapters | `apps/*/app`, `tools/*-smoke/fixture/app` |

No speculative API work went into `@deckard/core` while the talk was being built.
The one code fix that came out of it at the time is the media block prop, and it
exists because a slide in this deck needed it. The route adapters landed after,
against the finding above, which is the order the notes were meant to produce.
