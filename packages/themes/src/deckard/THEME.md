# Deckard theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.deckard-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

Quiet paper, one accent. The canvas is an off-white sheet in light mode and a
blue-black sheet in dark mode, never the pure white or pure black of the app
chrome around it, so the canvas reads as a slide and not as the page.

Content sits on raised surfaces: a near-opaque card, a hairline border, and a
soft shadow. In light mode the shadow does most of the work, since a white card
on a white sheet has nothing else to separate it.

The accent is teal in both modes, at the lightness each mode can carry: a deep
teal on paper, a bright cyan-teal on the dark sheet. It appears on eyebrows, the
primary button, focus rings, and the background washes. One accent, used in few
places, is the whole palette.

The washes carry a supporting blue alongside it. `--slide-wash` and
`--slide-glow` sit on the accent hue, while `--slide-veil` and
`--slide-spotlight` fall back toward blue so the layers separate without
introducing a second color.

## Typography

Geist for everything. The hierarchy is size, not family.

| Token                      | Used by                                  |
| -------------------------- | ---------------------------------------- |
| `--slide-title-size`       | hero and breaker headlines               |
| `--slide-heading-size`     | the `h1` on a content slide              |
| `--slide-subheading-size`  | an `h2` inside a slide body              |
| `--slide-lead-size`        | the sentence under a headline            |
| `--slide-body-size`        | bullet copy, the main text of a slide    |
| `--slide-code-size`        | the type inside a `CodeBlock`            |
| `--slide-support-size`     | captions, grid copy, metadata rows       |
| `--slide-label-size`       | eyebrows and other uppercase labels      |

Line height rides along as a unitless multiplier in the blocks, so changing a
size token keeps its leading proportional. Never pair a size token with a fixed
`leading-7`.

`--slide-label-tracking` is the letter spacing on uppercase labels. It is wide on
purpose. Lowering it below `0.2em` makes eyebrows read as ordinary small text.

## Spacing

`--slide-padding-inline` is the gutter on both sides of the frame and inside the
canvas header. `--slide-padding-block` is the top and bottom padding when that
slide has no header or footer. The header and footer offsets themselves are
canvas geometry and live in `slide-shell.tsx`, not here.

`--slide-content-gap` is the vertical rhythm between the intro block and the body
of a slide. `--slide-radius` is the corner on cards and code blocks;
`--slide-radius-lg` is the larger corner on the outer content card and on media
frames.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the
canvas variables `--canvas-width` and `--canvas-height` for anything sized
against the slide.

- `default` paints a top wash, a downward veil over the upper 72% of the canvas,
  and a blurred glow in the bottom right corner.
- `grid` paints 44px rules plus the same wash on top.
- `spotlight` paints one wide radial from the top edge and a smaller corner glow.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The colors come from `--slide-wash`, `--slide-veil`, `--slide-glow`,
`--slide-grid-color`, `--slide-grid-size`, and `--slide-spotlight`. Dark mode
carries them at roughly double the alpha, because a wash that reads on paper
disappears on a dark sheet.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Deckard drops both rules and lets the type carry the line: the deck name in the
text weight, a slash before the slide title in the border color, the date on the
right in tabular figures, and the counter at the far end in small uppercase. The
progress bar moves to the bottom edge of the canvas and fills in `--primary`, so
the one line in the chrome is the one that means something.

`--slide-chrome-foreground`, `--slide-chrome-emphasis`, `--slide-chrome-border`,
`--slide-chrome-size`, `--slide-chrome-tracking`, `--slide-chrome-gap`,
`--slide-progress-track`, and `--slide-progress-fill` are the tokens behind it.
Setting `--slide-progress-fill: transparent` is how a deck turns the bar off
without touching the markup.

## Safe to change

Every token in `theme.css` is meant to be edited. Change the accent by moving
`--primary`, `--primary-foreground`, and `--ring` together. Change the mood of a
deck by moving `--background`, `--card`, and the four background variant colors.
Retune the type scale by editing the size tokens alone.

Two rules bound the edits. The dark block only overrides, so every token it
defines has to exist in the light block above it; a token that appears only in
dark leaves light mode without it. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1.

If you change the class name, change it in `index.ts` too. The class in the
`SlideTheme` and the selector in the stylesheet are the same string.
`pnpm deck:validate` fails when they drift apart, and when a token is dark-only.

## Media overlays

`--slide-media-foreground`, `--slide-media-foreground-muted`, and the three
`--slide-media-overlay-*` gradients sit in the base layer of `app/globals.css`
rather than here, because a scrim over a photograph is dark in both color modes.
Override them in this file if a deck needs a different scrim.

## Common mistakes

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Styling a background variant in the React component. The component is a hook. If
a variant needs a third layer, add it here as a pseudo-element.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.deckard-theme`.

Adding a color mode to `colorModes` without writing its block. `defineDeck`
checks that the list is coherent, not that the CSS exists. A theme that claims
`light` and only styles dark renders as unthemed light. `pnpm deck:validate`
compares the list against the blocks this file actually carries.

Assuming `.dark` on `<html>` is the only switch. A single-mode theme pins the
canvas through `data-slide-color-mode`, and the dark block matches both. Copy
that selector pair when you add a mode-dependent rule.
