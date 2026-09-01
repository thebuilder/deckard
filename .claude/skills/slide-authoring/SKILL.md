---
name: slide-authoring
description: Write and edit Deckard slides in this repository. Use when adding a slide, rewriting slide copy, reordering a deck, extracting a slide into deck/slides/*.slide.tsx, building a slide block, restyling a slide, or checking a deck change before handing it back.
---

# Authoring Deckard slides

A slide is an object with a `body` in `apps/playground/deck/slides.tsx`, or a
module in `apps/playground/deck/slides/*.slide.tsx` that discovery spreads into
that array. Everything else is metadata.

`apps/demo` has the same shape, and its blocks and its ejected theme are its own
copies. Work in whichever deck the change belongs to, and read that deck's
theme, not the other one's.

Those two decks are this repository's decks. A presentation someone builds on
Deckard is their own Next.js app with the same `deck/` layout, and every rule
below applies there unchanged. Paths in this skill are written for this repo, so
drop the `apps/<name>/` prefix when the deck is a standalone app.

Read the `THEME.md` of the theme the deck renders before you touch a color or a
size. The playground imports `deckard` from `@deckard/themes`, so that is
`packages/themes/src/deckard/THEME.md`; the demo ejected its own, so that
is `apps/demo/deck/theme/THEME.md`.

## Start from a block

Compose the body from the blocks in `apps/playground/app/slides/blocks/`. Write
new markup only when none of these fits.

| Block                                     | Use it for                                        |
| ----------------------------------------- | ------------------------------------------------- |
| `HeroSlide` (templates.tsx)               | the opener, one headline and a credit row         |
| `HeroSplitSlide` (templates.tsx)          | the opener with its facts stood up in a rail      |
| `HeroCenteredSlide` (templates.tsx)       | the centered opener, with an optional pill badge  |
| `BreakerSlide` (templates.tsx)            | a section divider, with an optional index         |
| `MinimalBreakerSlide` (templates.tsx)     | a rule and a title, centered, nothing else        |
| `StatementSlide` (templates.tsx)          | one sentence at display size                      |
| `CodeSplitSlide` (templates.tsx)          | a block one side, numbered notes the other        |
| `ContentSlideCard` (templates.tsx)        | intro copy above a bordered panel                 |
| `OpenContentSlide` (templates.tsx)        | the same intro with no panel                      |
| `FocusSlide` (templates.tsx)              | one block and no heading at all                   |
| `BulletList` (collections.tsx)            | four to six numbered points                       |
| `ContentsList` (collections.tsx)          | an agenda: numeral, section, folio                |
| `ColumnGrid` (collections.tsx)            | parallel points as ruled, numbered columns        |
| `FeatureGrid` (collections.tsx)           | three parallel cards                              |
| `CardGrid` (collections.tsx)              | cards on two or three columns, one of them tinted |
| `StatGrid` (metrics.tsx)                  | two to four figures with their comparisons        |
| `QuoteSlide` (prose.tsx)                  | someone else's sentence, attributed on a rule     |
| `ProseSlide` (prose.tsx)                  | a label rail beside running copy                  |
| `DataTable` (tables.tsx)                  | columns of figures, one row highlighted           |
| `Timeline` (tables.tsx)                   | milestones as columns on one rule                 |
| `LogList` (tables.tsx)                    | timestamped rows with a status                    |
| `ImageShowcaseSlide` (media.tsx)          | copy left, one image right, caption under it      |
| `MediaPair` (media.tsx)                   | two captioned frames side by side                 |
| `MediaGallery` (media.tsx)                | captioned frames on a grid                        |
| `FullscreenMediaSlide` (media.tsx)        | an image or video bleeding to every canvas edge   |
| `Eyebrow`, `SlideHeading` (typography.tsx)| your own layout, with the deck's type rhythm      |

Prefer an explicit variant component over a boolean prop. `ContentSlideCard`,
`OpenContentSlide`, and `FocusSlide` are three components on purpose, and so are
`HeroSlide`, `HeroSplitSlide`, and `HeroCenteredSlide`.

Every block is left aligned and fills the padded frame. `HeroCenteredSlide` and
`MinimalBreakerSlide` are the only two that centre anything. No `mx-auto` on a
block's outer element, and cap a measure only where prose needs it, in canvas
pixels the way `typography.tsx` does.

Counts are yours. `FeatureGrid` is three across, but `ContentsList`,
`ColumnGrid`, `CardGrid`, `Timeline`, `MediaGallery`, and `DataTable` take as
many items as you give them, and the overflow check is what tells you when that
is too many. Two blocks say no in the type: `StatGrid` takes two to four, and
`MediaPair` takes exactly two.

## Card, open, or focus

One surface per slide. A slide is either a framed panel with flat content in it,
or an open frame holding content that carries its own surface. Never a bordered
panel full of bordered cards.

- `ContentSlideCard` when the body has no surface of its own: a paragraph, a
  short definition list, your own flat markup.
- `OpenContentSlide` when the body brings its own frame: `FeatureGrid`,
  `BulletList`, `StatGrid`, `CodeBlock`, a chart, a table.
- `FocusSlide` when the body is the whole point and the heading was scaffolding:
  a code sample, a list of keys, one image, three figures. It hands the block
  the whole frame at the normal type scale, so a code sample shows more lines
  rather than bigger ones, and takes one optional `kicker` string for
  orientation. No heading, no lead, no panel. Do not reach for it when the
  slide needs a sentence to make sense.

The rule is a convention with a warning behind it, not a stylesheet trick. A
block with its own surface carries `data-slide-surface`, `ContentSlideCard`'s
panel carries `data-slide-panel`, and the panel always paints its card. Put a
surfaced block inside one and you get a frame inside a frame on the slide, plus
a console warning in development naming `OpenContentSlide` and `FocusSlide`.
Nothing hides the mistake for you.

A new block that paints a border or a background needs `data-slide-surface` on
its outer element, so a card wrapped around it says so.

## Name the parts a theme reaches

Tokens are half the theme contract. Data attributes are the other half. Every
part of a block a theme might want to restyle carries one, from
`data-slide-eyebrow` and `data-slide-list-marker` to `data-stat-meter`, and the
theme styles those attributes including decorative `::before` content. Phosphor
writes `[x]` where the list number goes and ledger hangs a rule there instead,
and neither touches the block. The full list is the block part contract at the
bottom of `@deckard/core/styles.css`. A new block adds its parts to that list.

A theme styles parts; it never adds content. A boot log, a status table, a
cursor line with words in it are slide content, so they go in a block.

## Inline, or its own file

Keep a slide inline in `deck/slides.tsx` while it is metadata plus one block.
Move it to `deck/slides/<name>.slide.tsx` once it loads data, brings a client
widget, or carries long speaker notes.

A slide module exports the component as `default`, plus `meta` and `notes` as
plain values so the deck can title and order it without rendering it:

```tsx
import type { SlideMeta } from "@deckard/core"

export const meta: SlideMeta = { slug: "pricing", title: "Pricing" }
export const notes = "Pause on the middle tier."

export default async function PricingSlide() {
  return <PricingTable plans={await loadPlans()} />
}
```

Discovery is an editing convenience, nothing more. The glob is eager, so both
forms ship identical bundles.

## Server components

Slide entry modules are Server Components. Never put `"use client"` at the top of
`deck/slides.tsx` or a `*.slide.tsx` file. `deck/slides.test.ts` fails on it.

Interactivity goes one level down, in a nested client component the slide
renders. `deck/slides/interactive-demo-widget.tsx` is the worked example.

Fetch with `await` inside the slide component. The route renders the slide after
the data resolves.

A discovered module has to be synchronous. Top-level await anywhere in its
imports turns it into an async module, the eager glob hands back a promise, and
discovery throws naming the file. That is why `CodeBlock` ships from
`@deckard/core/code-block` and why a slide using it stays in the array.

## The canvas is 1920x1080, always

Size content with `h-full`, percentages, and fixed values. No `svh`, `vh`, `vw`,
and no `sm:` or `lg:` breakpoints inside the canvas. The canvas is one fixed size
and the browser window is not.

What does not fit gets clipped. `next dev` draws an amber outline and logs a
warning; `pnpm deck:check-overflow` fails on it. Trim the content, or wrap the
part that has to scroll in `SlideScrollArea` from `@deckard/core/components`, so
scrolling never steps the deck.

Inside the canvas, style with semantic tokens (`bg-card`, `text-muted-foreground`,
`border-border`) or slide tokens (`--slide-title-size`, `--slide-code-size`,
`--slide-surface`, `--slide-radius`). Never a hardcoded color, and never a raw
font size where a token exists. Changing how a background variant looks is a
`theme.css` edit, not a component edit.

Outside the canvas, in the deck controls, command center, presenter console, and
dialogs, keep the app tokens from `app/globals.css`.

The deck header and footer are inside the canvas and belong to the theme. Core
renders `[data-slide-header]` and `[data-slide-footer]` with named parts for the
brand, the slide title, the meta line, the counter, and `[data-slide-progress]`;
the theme's `theme.css` decides what they look like. `footer: { progress: false }`
in `deck.ts` leaves the progress element out of the deck entirely.

## Metadata

`slug` fixes the URL at `/slides/<slug>`; without one the slide is served at its
1-based position. Lowercase letters, digits, and hyphens only, and unique.

`stepCount` plus `SlideStep` reveals content in phases. Steps stay in the layout
while hidden, so a stepped slide takes its full height from the first step.

`notes` is speaker-only text. It reaches the presenter window, which opens with
`P` or the popout button and lives at `/presenter`.

`layout: "fullscreen"`, `header`, `footer`, and `background` change the frame for
one slide. Use them instead of route-level special cases.

`background` takes `"default"`, `"grid"`, `"spotlight"`, `"accent"`, or
`"none"`. `"accent"` is the inverted statement slide: the canvas floods with the
theme accent and the ink flips, chrome included. Use it once or twice in a deck,
for the one sentence that has to land, and never on two slides in a row.

`order` sorts a discovered module inside the discovered group. It cannot move the
group: the spread position in `deck/slides.tsx` is authoritative, and
`discoverSlides` drops `meta.order` from the definition. The deck sorts with
`sort: "order"`, which reads `meta.order` and falls back to filename order with a
numeric-aware compare, so `2-ordering` sorts before `10-interactive`.

Adding or deleting a `*.slide.tsx` file while `next dev` runs leaves routes
serving stale modules. Restart the dev server.

## Check the work

Run these from the repository root.

```
pnpm deck:validate        # deck resolves, theme is coherent, registry paths exist
pnpm deck:check-overflow  # every slide fits the canvas, nonzero exit on clipping
pnpm deck:screenshots     # out/screenshots/<id>.png, dark by default, --light for light
pnpm deck:contact-sheet   # out/contact-sheet.png, every slide in one grid
```

Every one of those has a `demo:` twin (`pnpm demo:validate`,
`pnpm demo:check-overflow`, `pnpm demo:screenshots`, `pnpm demo:contact-sheet`)
that runs the same script against `apps/demo`.

Run `pnpm deck:validate` after any structural change: a new slug, a moved file, a
theme edit, a registry path. It loads the real deck in about a second.

Run `pnpm deck:check-overflow` after changing slide content, and read the
contact sheet before calling a deck done. Screenshots build the app first and
reuse a fresh build, so the second run is fast.

Then the usual gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
