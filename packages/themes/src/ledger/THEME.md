# Ledger theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.ledger-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A bound report, not a slide deck. The canvas is warm paper in light mode and
warm ink in dark mode, and rules carry the structure that a shadow would carry
in a product theme. `--slide-radius` and `--slide-radius-lg` are both `0rem`,
and `--slide-surface-shadow` is `none`. A content card here is a ruled panel.

The split between families is the point. Headings are serif, body copy is sans,
and small labels are mono. That is three families on one slide, which usually
goes wrong, and it works because each one owns exactly one job: the serif says
what the section is, the sans argues it, the mono numbers it.

The accent is oxblood on paper and a warmer rust after dark. It appears on
eyebrows, folio numbers, the primary button, focus rings, and the margin rule in
the `grid` background. It never fills a block behind copy.

`--slide-surface-border` sits three steps darker than `--border`. With no shadow
under a panel, the line has to do all of the separating, and a hairline at
`--border` weight disappears against paper.

## Typography

Serif headings from `ui-serif`, which is New York on Apple platforms and Georgia
elsewhere. Body copy from the system sans stack. No web font loads, so the theme
adds nothing to page weight and renders the same offline.

The original design used Source Serif 4 for headings, Public Sans for body, and
IBM Plex Mono for labels. If you want them, load them in `app/layout.tsx` and
put each family at the front of the matching stack. Source Serif is the one
worth the request; it has a lower contrast and a larger x-height than Georgia,
so it holds together better at `--slide-title-size`.

| Token                     | Used by                                  |
| ------------------------- | ---------------------------------------- |
| `--slide-title-size`      | hero and breaker headlines               |
| `--slide-heading-size`    | the `h1` on a content slide              |
| `--slide-subheading-size` | an `h2` inside a slide body              |
| `--slide-lead-size`       | the sentence under a headline            |
| `--slide-body-size`       | bullet copy, the main text of a slide    |
| `--slide-code-size`       | the type inside a `CodeBlock`            |
| `--slide-support-size`    | captions, grid copy, metadata rows       |
| `--slide-label-size`      | eyebrows and other uppercase labels      |

The scale drops hard between title and heading, `5rem` to `3.25rem`, because the
design opens a chapter at nearly twice the size of the slide it introduces.
Keep that gap if you retune. Closing it makes every slide look like a cover.

Headings carry `-0.012em` of tracking and weight 600, and so does
`[data-stat-value]`, the figure the metrics block renders. That figure is
display type inside a description list rather than a heading element, so it
needs the selector to reach it. `--slide-label-tracking`
is `0.18em`, which suits the mono labels this theme leans on. Mono capitals
already sit wide, so the `0.3em` of the default theme reads as broken.

`--slide-support-size` is `1rem`, a step larger than the other themes ship.
Captions here are mono, and mono at `0.875rem` stops resolving from the back of
a room.

## Spacing

`--slide-padding-inline` is `2.75rem` and `--slide-padding-block` is `3rem`.
Report margins are wide, and the flat panels have no shadow holding them off
the edge of the frame.

`--slide-content-gap` is the vertical rhythm between the intro block and the
body of a slide. Both radius tokens are zero on purpose. Raising one without
the other leaves media frames rounded against square content cards.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide.

- `default` paints a warm wash from the head of the page, a low glow along the
  floor, and the 2px rule that closes every page in the source design.
- `grid` is ledger paper. Horizontal rules every `--slide-grid-size`, faded out
  at the top and bottom edges, plus one accent margin rule down the left at 11%
  of the canvas width. That rule is the whole reason this variant exists.
- `spotlight` lights the headline and falls off into every corner, the way a
  page reads under a desk lamp. It keeps the same closing rule as `default`.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The colors come from `--slide-wash`, `--slide-veil`, `--slide-glow`,
`--slide-grid-color`, `--slide-grid-size`, and `--slide-spotlight`, plus two
tokens this theme adds.

## Theme-private tokens

`--slide-rule` is the heavy closing rule under `default` and `spotlight`. It is
the foreground at around 65% alpha in both modes.

`--slide-margin-rule` is the accent line down the left of the `grid` variant.

Both are defined in the light block and overridden in dark, like every other
token here. Nothing outside this file reads them, so renaming them is safe as
long as you rename every use.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-date]`, rendered
only when `deck.ts` sets one. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Ledger sets a folio line. The head carries the deck name in small caps under the
heavy 2px rule this theme uses everywhere, the slide title in the italic of the
heading face, and the date on the right in mono capitals. The foot centers the
page numbers in mono, where a printed page carries them, under a lighter rule.

There is no progress bar: `--slide-progress-fill` is `transparent`, because a
page does not tell you how far into the book you are. Set it to `--primary` if
your talk wants one.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, and `--slide-margin-rule`
together. Change the paper by moving `--background`, `--card`, and the
background variant colors.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1. The
palette as shipped clears 5.7:1 at its worst pair, which leaves room to darken
the paper or lighten the ink by a step without checking again.

If you change the class name, change it in `index.ts` too. The class in the
`SlideTheme` and the selector in the stylesheet are the same string.
`pnpm deck:validate` fails when they drift apart, and when a token is dark-only.

## Media overlays

`--slide-media-foreground`, `--slide-media-foreground-muted`, and the three
`--slide-media-overlay-*` gradients ship in the base layer of
`@deckard/core/styles.css` rather than here, because a scrim over a photograph
is dark in both color modes. Override them in this file if a deck needs a
different scrim.

## Common mistakes

Adding a corner radius back. Every surface in this theme is square, and one
rounded card reads as a rendering bug rather than as emphasis.

Setting a heading in the body font to make it feel modern. The serif and sans
split is the theme. Collapse it and this becomes an ordinary sans deck with
unusually wide margins.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.ledger-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
