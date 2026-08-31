---
name: slide-authoring
description: Write and edit Deckard slides in this repository. Use when adding a slide, rewriting slide copy, reordering a deck, extracting a slide into deck/slides/*.slide.tsx, building a slide block, restyling a slide, or checking a deck change before handing it back.
---

# Authoring Deckard slides

A slide is an object with a `body` in `apps/playground/deck/slides.tsx`, or a
module in `apps/playground/deck/slides/*.slide.tsx` that discovery spreads into
that array. Everything else is metadata.

`apps/demo` has the same shape, and its blocks and theme are its own copies. Work
in whichever deck the change belongs to, and read that deck's
`deck/theme/THEME.md`, not the other one's.

Read `apps/playground/deck/theme/THEME.md` before you touch a color or a size.

## Start from a block

Compose the body from the blocks in `apps/playground/app/slides/blocks/`. Write
new markup only when none of these fits.

| Block                                     | Use it for                                        |
| ----------------------------------------- | ------------------------------------------------- |
| `HeroSlide` (templates.tsx)               | the opener, one big headline                      |
| `BreakerSlide` (templates.tsx)            | a section divider, left aligned                   |
| `ContentSlideCard` (templates.tsx)        | intro copy above a bordered panel                 |
| `OpenContentSlide` (templates.tsx)        | the same intro with no panel                      |
| `BulletList` (collections.tsx)            | four to six numbered points                       |
| `FeatureGrid` (collections.tsx)           | three parallel cards                              |
| `ImageShowcaseSlide` (media.tsx)          | an image beside a caption panel                   |
| `FullscreenMediaSlide` (media.tsx)        | an image or video bleeding to every canvas edge   |
| `Eyebrow`, `SlideHeading` (typography.tsx)| your own layout, with the deck's type rhythm      |

Prefer an explicit variant component over a boolean prop. `ContentSlideCard` and
`OpenContentSlide` are two components on purpose.

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
`border-border`) or slide tokens (`--slide-title-size`, `--slide-surface`,
`--slide-radius`). Never a hardcoded color. Changing how a background variant
looks is a `deck/theme/theme.css` edit, not a component edit.

Outside the canvas, in the utility bar, command center, presenter console, and
dialogs, keep the app tokens from `app/globals.css`.

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
