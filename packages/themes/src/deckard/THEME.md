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
primary button, focus rings, the progress bar, and the whole field of the
`accent` background. One accent, used in few places, is the whole palette.

The decoration carries a supporting blue alongside it. `--slide-grid-color` and
`--slide-rule` both sit near hue 220 rather than on the teal, so a grid or a
hairline separates from the sheet without introducing a second colour.

## Typography

Geist for everything. The hierarchy is size, not family.

| Token                      | Used by                               |
| -------------------------- | ------------------------------------- |
| `--slide-title-size`       | hero and breaker headlines            |
| `--slide-heading-size`     | the `h1` on a content slide           |
| `--slide-subheading-size`  | an `h2` inside a slide body           |
| `--slide-lead-size`        | the sentence under a headline         |
| `--slide-body-size`        | bullet copy, the main text of a slide |
| `--slide-code-size`        | the type inside a `CodeBlock`         |
| `--slide-support-size`     | captions, grid copy, metadata rows    |
| `--slide-label-size`       | eyebrows and other uppercase labels   |
| `--slide-figure-size`      | the figure in a stat column           |
| `--slide-figure-unit-size` | the unit suffix beside it             |

Every size is set against the 1920x1080 canvas at a 16px root, so `1rem` is 16
canvas pixels and the scale reads the way it does on a projector rather than the
way it does in a browser window. Deckard has no source template of its own, so
it sits on the contract defaults in `@deckard/core/styles.css` and restates
them: `--slide-title-size` `6rem`, `--slide-heading-size` `4.25rem`,
`--slide-subheading-size` and `--slide-lead-size` `2.625rem`, `--slide-body-size`
`2rem`, `--slide-code-size` and `--slide-support-size` `1.75rem`, and
`--slide-label-size` `1.5rem`. That is the house scale the other themes are read
against, and a theme that departs from it is making a point.

A metrics figure is display type without being a heading, so it sizes itself
rather than borrowing the title size: `--slide-figure-size` is `7.5rem` and
`--slide-figure-unit-size` is `3.5rem`, both the contract values.

`--slide-chrome-size` is `1.5rem`. The contract sizes chrome off
`--slide-label-size`, and since this theme's labels are `1.5rem` too, the
explicit value is the same number written down.

Line height rides along as a unitless multiplier in the blocks, so changing a
size token keeps its leading proportional. Never pair a size token with a fixed
`leading-7`.

`--slide-label-tracking` is the letter spacing on uppercase labels. At `0.3em`
it is wider than the contract's `0.25em`, on purpose. Lowering it below `0.2em`
makes eyebrows read as ordinary small text.

## Spacing

The frame is the whole canvas inside `--slide-padding-inline` and
`--slide-padding-block`, left aligned. There is no measure cap and no centred
column, so a slide starts at the left margin and runs to the right one, and
content that wants to be centred centres itself inside its own block. Deckard
sets `7rem` and `6rem`, the contract values.

`--slide-padding-inline` is the gutter on both sides of the frame and inside the
canvas header, so the header and the body start at the same word.
`--slide-padding-block` is the top and bottom padding when that slide has no
header or footer. When either strip is on, `--slide-header-space` and
`--slide-footer-space` stand in for the block padding on that edge, which is how
a theme that redesigns the chrome moves the content with it.

`--slide-content-gap` is `2.75rem`, the vertical rhythm between the intro block
and the body of a slide. `--slide-item-gap` is `1.625rem`, the smaller rhythm
inside a body: the gap between cards in a grid, and the padding a template
layout holds off the frame. `--slide-meter-size` is the height of the proportion
bar under a stat figure, left at the contract's `0.875rem`.

`--slide-radius` is `1rem` on cards and code blocks; `--slide-radius-lg` is
`1.5rem`, the larger corner on the outer content card and on media frames.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the
canvas variables `--canvas-width` and `--canvas-height` for anything sized
against the slide.

- `default` paints the flat canvas colour with one 1px hairline down the left
  margin, at half the inline padding and inset 12% of the canvas height top and
  bottom, so the frame has an edge to start at. Nothing sits behind the copy:
  the type is the picture.
- `grid` paints a 44px square grid in `--slide-grid-color`, edge to edge.
- `spotlight` paints `--slide-hatch`, the 135 degree fill a printed report
  reserves a figure with.
- `accent` floods the canvas with the theme accent and flips the ink, which is
  the inverted statement slide the source templates all carry.
- `none` renders nothing at all. `SlideBackground` returns `null`.

There is no radial wash, no veil, and no blurred corner glow anywhere in this
file, and no `--slide-wash`, `--slide-veil`, `--slide-glow`, or
`--slide-spotlight` token behind them. None of the source templates has one, and
a bloom behind the copy reads as a smudge on a projector and as a stain on a
pale sheet.

`accent` is painted by two unlayered rules in this file. A base-layer fallback
for it ships in `@deckard/core/styles.css`, but a theme's unlayered CSS always
wins over the base layer, which is why every theme in the registry restates the
pair and why the variant survives a theme swap. The first rule sets
`--background` and `--foreground` on the canvas. The second remaps the ink one
level down, on `[data-slide-frame]`, `[data-slide-header]`, and
`[data-slide-footer]`: a custom property resolves against the element that uses
it, so remapping `--primary` on the same element that reads `var(--primary)` for
the field would flood the slide with its own ink.

The decoration tokens are `--slide-grid-color`, `--slide-grid-size`,
`--slide-hatch`, `--slide-rule`, `--slide-scanline`, and `--slide-halo`, and all
six are part of the contract in `@deckard/core/styles.css`. Deckard paints with
the first four and leaves `--slide-scanline` and `--slide-halo` at the
contract's `none`. `--slide-hatch` is drawn in `--slide-grid-color`, this
theme's own quiet ink, so a reserved plate stays quiet under body copy. Dark
mode carries `--slide-grid-color` and `--slide-rule` at their own alphas,
because a line that reads on paper disappears on a dark sheet. This theme adds
no private tokens of its own.

## Block parts

The contract has two halves. Tokens are values, and the sections above cover
them. Data attributes are parts: a block names the piece of itself a theme might
want to reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. A block is then free to change its class names and
its markup as long as the attributes stay where they are. The full list lives in
the "Block part contract" comment at the bottom of `@deckard/core/styles.css`.

What does not belong in a theme is anything that is new content rather than a
treatment of existing content. A boot log, a status table, a cursor line with
words in it are all slide content, so they go in a block the deck composes.

Deckard reaches exactly one part. `[data-slide-breaker-index]`, the section
numeral a divider carries, is set at `calc(var(--slide-title-size) * 1.4)` in
`--muted-foreground` with `-0.03em` of tracking, because the source layouts set
the numeral larger than a heading and quieter than one. Nothing else in this
file touches a block part. The house theme is the baseline the other themes are
read against, so it leaves the blocks looking the way the blocks set them.

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
`--primary`, `--primary-foreground`, and `--ring` together, and remember that
`--primary` is also the whole field of the `accent` slide. Change the mood of a
deck by moving `--background`, `--card`, `--slide-grid-color`, and
`--slide-rule`. Retune the type scale by editing the size tokens alone.

Two rules bound the edits. The dark block only overrides, so every token it
defines has to exist in the light block above it; a token that appears only in
dark leaves light mode without it. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1.

If you change the class name, change it in `index.ts` too. The class in the
`SlideTheme` and the selector in the stylesheet are the same string.
`pnpm deck:validate` fails when they drift apart, and when a token is dark-only.

## Media overlays

`--slide-media-foreground`, `--slide-media-foreground-muted`, and the three
`--slide-media-overlay-*` gradients sit in the base layer of
`@deckard/core/styles.css` rather than here, because a scrim over a photograph
is dark in both color modes.
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
