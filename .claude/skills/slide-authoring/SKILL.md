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
| `HeroSlide` (templates.tsx)               | the opener, one big headline                      |
| `BreakerSlide` (templates.tsx)            | a section divider, left aligned                   |
| `ContentSlideCard` (templates.tsx)        | intro copy above a bordered panel                 |
| `OpenContentSlide` (templates.tsx)        | the same intro with no panel                      |
| `FocusSlide` (templates.tsx)              | one block and no heading at all                   |
| `BulletList` (collections.tsx)            | four to six numbered points                       |
| `FeatureGrid` (collections.tsx)           | three parallel cards                              |
| `StatGrid` (metrics.tsx)                  | exactly three figures with their comparisons      |
| `ImageShowcaseSlide` (media.tsx)          | an image beside a caption panel                   |
| `FullscreenMediaSlide` (media.tsx)        | an image or video bleeding to every canvas edge   |
| `Eyebrow`, `SlideHeading` (typography.tsx)| your own layout, with the deck's type rhythm      |

Prefer an explicit variant component over a boolean prop. `ContentSlideCard`,
`OpenContentSlide`, and `FocusSlide` are three components on purpose.

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

The rule is enforced as well as documented. A block with its own surface carries
`data-slide-surface`, and `ContentSlideCard`'s panel carries
`data-slide-panel`; a panel that holds a surface drops its border, background,
shadow, and padding. Write it the right way anyway. The attribute keeps a
mistake from looking bad, it does not make the composition right.

A new block that paints a border or a background needs `data-slide-surface` on
its outer element, or a card wrapped around it will frame a frame.

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
brand, the slide title, the date, the counter, and `[data-slide-progress]`;
the theme's `theme.css` decides what they look like.

## Metadata

`slug` fixes the URL at `/slides/<slug>`; without one the slide is served at its
1-based position. Lowercase letters, digits, and hyphens only, and unique.

`stepCount` plus `SlideStep` reveals content in phases. Steps stay in the layout
while hidden, so a stepped slide takes its full height from the first step.

`notes` is speaker-only text. It reaches the presenter window, which opens with
`P` or the popout button and lives at `/presenter`.

`layout: "fullscreen"`, `header`, `footer`, and `background` change the frame for
one slide. Use them instead of route-level special cases.

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
