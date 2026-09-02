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
`--slide-rule` carries it into the corner brackets at 45%, and
`--slide-grid-major` carries it into the blueprint grid on the dark sheet. In
light mode the amber drops to `oklch(0.535 0.155 48)`, a step darker and
slightly redder than the source design, so an eyebrow at `--slide-label-size`
clears 4.5:1 on the paper background. The source value measured 4.27:1 and
would have failed.

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

Every size below is set against the 1920x1080 canvas at a 16px root, so `1rem`
is 16 canvas pixels and the numbers read the way they do on a projector rather
than the way they do in a browser window.

| Token                     | Value      | Used by                               |
| ------------------------- | ---------- | ------------------------------------- |
| `--slide-title-size`      | `7rem`     | hero and breaker headlines            |
| `--slide-heading-size`    | `4.5rem`   | the `h1` on a content slide           |
| `--slide-subheading-size` | `2.75rem`  | an `h2` inside a slide body           |
| `--slide-lead-size`       | `2.75rem`  | the sentence under a headline         |
| `--slide-body-size`       | `2.125rem` | bullet copy, the main text of a slide |
| `--slide-code-size`       | `2rem`     | the type inside a `CodeBlock`         |
| `--slide-support-size`    | `1.75rem`  | captions, grid copy, metadata rows    |
| `--slide-label-size`      | `1.5rem`   | eyebrows and other uppercase labels   |

Those are the source design's own sizes: `--slide-title-size` is `7rem`, 112
canvas pixels, and each step under it lands where the template puts it. The
scale runs a step above phosphor because this is a proportional sans and that
one is monospace, which sets about 20% wider per character, so phosphor reaches
the same margin from `5.5rem` and both fill the same canvas.

Uppercase headings eat about 15% more width than the same words in mixed case,
which is what the line count has to be checked against. A six-word hero title
fits on two lines; a nine-word one will not, and cutting the title is the fix
rather than dropping `--slide-title-size`.

Three sizes sit outside that ladder. `--slide-figure-size` is `8.25rem` and
`--slide-figure-unit-size` is `3.25rem`: the figure a metrics block renders is
display type without being a heading, so it sizes itself rather than borrowing
the title size, and the unit suffix takes its own size so it hangs off the
figure instead of matching it. `--slide-meter-size` is the height of the
proportion bar under that figure and comes from the contract at `0.875rem`.
`--slide-chrome-size` is `1.5rem` here; the contract now writes that token as
`var(--slide-label-size)`, so header and footer type reads at the size of an
eyebrow unless a theme says otherwise.

`--slide-label-tracking` is `0.3em`, the widest in the registry. The source
design runs eyebrows out to `0.34em`. Anything under `0.24em` and the labels
stop reading as instrument text.

## Spacing

The frame is not a centred column. It is the whole canvas inside
`--slide-padding-inline` and `--slide-padding-block`, left aligned, with no cap
on the measure, so a slide starts at the left margin and runs to the right one.
A slide that wants its content centred centres it inside that frame.

`--slide-padding-inline` is `6.875rem` and `--slide-padding-block` is `6rem`,
110 and 96 canvas pixels, the margins the source design rules its panels to.

`--slide-content-gap` is `2.75rem`, the rhythm between the intro block and the
body of a slide. `--slide-item-gap` is `1.625rem`, the gap between the cards of
a grid, the rows a panel stacks, and the breathing room a layout keeps above
and below itself.

Both radius tokens are `0.125rem`. Move them together or media frames stop
matching content cards.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

Every sheet is flat. There is no radial wash and no blurred corner glow left
anywhere in the registry, and `--slide-wash`, `--slide-veil`, `--slide-glow`,
and `--slide-spotlight` went out of the contract with them. None of the source
templates has a bloom, and on a pale sheet one reads as a stain.

- `default` is deep field: the flat sheet with a hairline bracket in the top
  left corner and another in the bottom right, `7rem` on a side, drawn in
  `--slide-rule` on the background's `::before` and `::after`. The brackets are
  the frame the source design rules its panels with, pulled out to the canvas
  edge.
- `grid` is the blueprint. A `--slide-grid-size` cell grid, `1.75rem` here, with
  every fifth line drawn again in `--slide-grid-major`. This is the variant the
  theme is built around.
- `spotlight` is the hazard hatch, `--slide-hatch`, the 135 degree fill the
  source design puts behind a missing plate.
- `accent` is the inverted statement slide: the canvas floods with the theme
  accent and the ink flips. The halo goes off with it, because a glow on a field
  of the same hue is invisible.
- `none` renders nothing at all. `SlideBackground` returns `null`.

`accent` is painted by two unlayered rules near the bottom of this file. A base
layer fallback ships in `@deckard/core/styles.css`, but a theme's unlayered CSS
always wins over the base layer, which is why every theme in the registry
restates the pair. The first rule reads the field colour on the canvas, moving
`--primary` into `--background` and `--primary-foreground` into `--foreground`.
The second remaps the ink one level down, on `[data-slide-frame]`,
`[data-slide-header]`, and `[data-slide-footer]`, because a custom property
resolves against the element that uses it: remapping `--primary` on the same
element that reads `var(--primary)` for the field would flood the slide with its
own ink.

The colours come from `--slide-rule`, `--slide-hatch`, `--slide-grid-color`,
`--slide-grid-size`, and `--slide-grid-major`.

## Block parts

The contract has two halves. Tokens are values: a size, a colour, a gradient.
Data attributes are parts. A block names the piece of itself a theme may reach,
and the theme styles that attribute, decorative `::before` and `::after` content
included. The full list lives in the "Block part contract" comment at the bottom
of `@deckard/core/styles.css`. A block is free to rewrite its markup and its
class names as long as those attributes stay where they are.

Anything that is new content rather than a treatment of existing content belongs
in a block the deck composes, not here. A boot log, a status table, a cursor line
with words in it are all slide copy, and copy in a stylesheet cannot be edited,
translated, or read by a screen reader.

What this theme does with the parts it reaches:

- `[data-slide-breaker-index]` is the loudest thing on the canvas, set at 2.5
  times `--slide-title-size` at weight 900 on a `0.8` line, with the halo behind
  it. The source design sets its section number far past any heading.
- `[data-slide-hero-meta]`, the credit row along the bottom of an opener, takes
  the mono face in capitals at `0.18em`.
- `[data-slide-list-marker]` and `[data-stat-unit]` take the mono face too, so
  the numbers on a list and the unit on a figure read as instrument text rather
  than as prose.
- `[data-stat-meter]` takes its border in `--primary` at 55%, which keeps the
  empty part of the bar quieter than the fill.

## Theme-private tokens

`--slide-halo`, `--slide-rule`, and `--slide-hatch` are in the token contract in
`@deckard/core/styles.css` now rather than private here, so a theme that wants a
lit heading, a ruled corner, or a hatched plate sets a value instead of
inventing a name. `--slide-halo` is the text shadow on `h1`, `h2`, and
`[data-stat-value]`, `none` in light mode; set it to `none` in dark as well if
you are projecting onto a surface with poor black levels, where the glow smears
rather than reads. `--slide-rule` is the hairline colour, the accent at 45% in
both modes, and it draws the corner brackets on the `default` variant.
`--slide-hatch` is the 135 degree fill behind a reserved plate, drawn in
`--slide-grid-color` so it stays quiet under body copy.

One token is private to this theme. `--slide-grid-major` is the heavier
every-fifth-line colour in the `grid` variant, and the chrome borders and the
progress track read it too. Set it equal to `--slide-grid-color` for a plain
single-density grid.

Each is declared in the light block, and the ones that change with the mode are
redeclared in dark. `--slide-hatch` is not one of them: it draws itself in
`--slide-grid-color`, which is, so the fill follows the mode on its own.

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

The progress element is a solid 3px bar: an unlit track in
`--slide-grid-major` with the lit part in `--primary` up to `--slide-progress`.
Nothing animates but the width.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, `--slide-halo`, `--slide-rule`,
and `--slide-grid-major` together; the source design ships cyan and magenta
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
