# Nexus theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.nexus-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A flight console. Dark is the home mode and `index.ts` pins
`defaultColorMode: "dark"`, so a deck opens on the blue-black sheet unless a
slide asks for light. Light mode is complete and shipped, and it reads as the
printed version of the same document rather than as a second theme.

Two things make it Nexus. Every heading is set in capitals with a hair of
positive tracking, and `h1` and `h2` carry a `--slide-halo` text shadow in the
accent. The halo is `none` in light mode, because a glow on paper looks like a
printing fault.

The same treatment covers `[data-stat-value]`, the figure the metrics block
renders. It is display type inside a description list rather than a heading
element, so it needs the selector to reach it.

The accent is amber, which is the readable choice on a blue-black field.
`--slide-grid-major` carries it into the blueprint background. In light mode the
amber drops to `oklch(0.535 0.155 48)`, a step darker and slightly redder than
the source design, so an eyebrow at `--slide-label-size` clears 4.5:1 on the
paper background. The source value measured 4.27:1 and would have failed.

Surfaces are flat panels on `--card` with a hairline border and a `0.125rem`
radius. That two-pixel corner is a blueprint corner, not a rounded one, and it
is what keeps a card from looking like a web component.

## Typography

The system sans stack for headings and body, `var(--font-mono)` for code.

The original design used Orbitron for headings, IBM Plex Sans for body, and IBM
Plex Mono for labels. Orbitron has no system equivalent and this theme does not
try to fake one. What it takes from Orbitron instead is the behavior: capitals
everywhere, wide label tracking, and the glow. If you want the real face, load
it in `app/layout.tsx` and put it at the front of `--slide-font-heading` alone,
not `--slide-font-body`. Orbitron is unreadable below about 24px and body copy
set in it will not survive a room.

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

Uppercase headings eat about 15% more width than the same words in mixed case.
The scale is set a step under the source design to pay for that. A six-word hero
title fits on two lines; a nine-word one will not, and cutting the title is the
fix rather than dropping `--slide-title-size`.

`--slide-label-tracking` is `0.3em`, the widest in the registry. The source
design runs eyebrows out to `0.34em`. Anything under `0.24em` and the labels
stop reading as instrument text.

## Spacing

`--slide-padding-inline` is `2.25rem` and `--slide-padding-block` is `2.75rem`.
`--slide-content-gap` is `1.75rem`, a step wider than the default theme, because
capitalized headings need more air under them than mixed-case ones.

Both radius tokens are `0.125rem`. Move them together or media frames stop
matching content cards.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide.

- `default` is deep field. A wash off the top edge, a horizon band along the
  floor, and one blurred amber running light in the bottom right corner.
- `grid` is the blueprint. A `1.75rem` cell grid with every fifth line drawn at
  `--slide-grid-major`, faded to the background outside a center ellipse so copy
  never sits on a line. This is the variant the theme is built around.
- `spotlight` is an approach light: one wide beam off the top edge, a tube
  vignette under it, and the corner glow again.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The colors come from `--slide-wash`, `--slide-veil`, `--slide-glow`,
`--slide-grid-color`, `--slide-grid-size`, and `--slide-spotlight`, plus two
tokens this theme adds.

## Theme-private tokens

`--slide-grid-major` is the heavier every-fifth-line color in the `grid`
variant. Set it equal to `--slide-grid-color` for a plain single-density grid.

`--slide-halo` is the text shadow on `h1` and `h2`. It is `none` in light mode.
Set it to `none` in dark as well if you are projecting onto a surface with poor
black levels, where the glow smears rather than reads.

Both are defined in the light block and overridden in dark, like every other
token here.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Nexus runs console strips. Both are set in capitals at `0.28em`, the deck name in
`--primary` with the same halo as the headings, `//` before the slide title, and
the date in the mono face at a tighter tracking. The counter lights its current
number in the accent.

The progress element is a tick readout: the track repeats 2px ticks across the
full width in `--slide-grid-major`, and the fill repeats the same ticks in
`--primary` up to `--slide-progress`. Nothing animates but the width.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, `--slide-halo`, and
`--slide-grid-major` together; the source design ships cyan and magenta
alternates. Recheck `--primary` against `--background` in light mode after any
accent change, since that is the pair with the least room.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1. The
shipped palette clears 5.1:1 at its worst pair.

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

Turning off the capitals. `text-transform: uppercase` on headings is the theme.
A deck that overrides it back to mixed case has a blue background and nothing
else.

Writing long headings. Capitals plus a nine-word title runs to four lines and
the layout breaks. Run `pnpm deck:check-overflow` after writing hero copy.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.nexus-theme`.

Assuming `.dark` on `<html>` is the only switch. This theme defaults the canvas
to dark through `data-slide-color-mode`, and the dark block matches both that
and `.dark` on the document. Copy that selector pair when you add a
mode-dependent rule.
