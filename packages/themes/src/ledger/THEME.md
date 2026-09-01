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

Source Serif 4 for headings, Public Sans for body, IBM Plex Mono for labels and
code. All three are the source design's own, and all three ship with the theme:
`theme.css` declares them from `../fonts/`, so there is nothing to load in
`app/layout.tsx` and no font host is called at render time. Every family is SIL
Open Font License 1.1, covered by `fonts/source-serif-4.OFL.txt`,
`fonts/public-sans.OFL.txt`, and `fonts/ibm-plex-mono.OFL.txt`.

Source Serif is the one carrying the theme. It has lower contrast and a larger
x-height than Georgia, so it holds together at `--slide-title-size` where a
system serif starts to look thin. It ships roman and italic, both variable
across 400 to 700, because the folio title in the header is set in the italic
and a synthesised oblique serif at that size reads as a mistake. Public Sans is
variable across 300 to 700, which reaches the weight 300 body copy the design
sets. IBM Plex Mono is not variable, so 400 and 500 are separate files.

Each family stays at the front of the system stack it replaces, so a build that
loses a file degrades rather than fails, and `font-display: swap` paints that
stack while the woff2 lands. An English deck downloads 139KB across the four
files, the most of any theme here, and the serif italic is half of it. Drop the
italic faces from `theme.css` if the header title is not worth 51KB to you.
latin-ext sits behind its own `unicode-range` and is only fetched by a deck that
sets a character in it.

Every size below is set against the 1920x1080 canvas at a 16px root, so 1rem is
16 canvas pixels and the scale reads the way it does on a projector rather than
the way it does in a browser window. The px column is what the source template
declares.

| Token                      | Size              | Used by                               |
| -------------------------- | ----------------- | ------------------------------------- |
| `--slide-title-size`       | `7.75rem`, 124px  | hero and breaker headlines            |
| `--slide-heading-size`     | `4.875rem`, 78px  | the `h1` on a content slide           |
| `--slide-subheading-size`  | `2.75rem`, 44px   | an `h2` inside a slide body           |
| `--slide-lead-size`        | `2.75rem`, 44px   | the sentence under a headline         |
| `--slide-body-size`        | `2.0625rem`, 33px | bullet copy, the main text of a slide |
| `--slide-code-size`        | `1.9375rem`, 31px | the type inside a `CodeBlock`         |
| `--slide-support-size`     | `1.75rem`, 28px   | captions, grid copy, metadata rows    |
| `--slide-label-size`       | `1.5rem`, 24px    | eyebrows and other uppercase labels   |
| `--slide-figure-size`      | `8.75rem`, 140px  | the figure in a metrics block         |
| `--slide-figure-unit-size` | `3.5rem`, 56px    | the unit suffix beside that figure    |

A metrics figure is display type without being a heading, so it takes
`--slide-figure-size` instead of borrowing the title size. The contract also
carries `--slide-meter-size`, the height of the proportion bar under that
figure, and this theme takes the default.

The scale drops hard between title and heading, 124px to 78px, because the
design opens a chapter at half again the size of the slide it introduces. Keep
that gap if you retune. Closing it makes every slide look like a cover.

Headings carry `-0.012em` of tracking and weight 600, and so does
`[data-stat-value]`, the figure the metrics block renders. That figure is
display type inside a description list rather than a heading element, so it
needs the selector to reach it. `--slide-label-tracking`
is `0.18em`, which suits the mono labels this theme leans on. Mono capitals
already sit wide, so the `0.3em` of the default theme reads as broken.

`--slide-support-size` is `1.75rem`, 28px on the canvas. Captions here are mono,
and mono a step under that stops resolving from the back of a room.

`--slide-chrome-size` is `1.5rem`, the same 24px as `--slide-label-size`. The
contract defaults it to `var(--slide-label-size)` so a theme that retunes its
labels moves the header and the footer with them; this file pins the number
outright instead.

## Spacing

The frame is the whole canvas inside its margins. There is no measure cap and no
centred column, so a slide starts at the left margin and runs to the right one,
and anything that wants to sit in the middle centres itself inside its own
block. `--slide-padding-inline` is `8rem`, 128px, and `--slide-padding-block` is
`6.5rem`, 104px, off the source template's 128px side margin and 104px head
margin. Report margins are wide, and the flat panels have no shadow holding them
off the edge of the frame.

`--slide-content-gap` is `2.75rem`, the vertical rhythm between the intro block
and the body of a slide. `--slide-item-gap` is `1.625rem`, the smaller gap
between rows inside one block: bullets in a list, cards in a grid. Both radius
tokens are zero on purpose. Raising one without the other leaves media frames
rounded against square content cards.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide. No variant paints a wash or a corner glow. None of the source templates
has one, and on a pale sheet a bloom behind the copy reads as a stain.

- `default` is bare paper under the 2px rule that closes every page in the
  source design. The rule is inset 20% of the canvas width from each side, so it
  runs to the content measure rather than to the bleed, and sits 7.5% of the
  canvas height up from the floor, clear of the footer.
- `grid` is ledger paper. One horizontal rule every `--slide-grid-size`, `2.5rem`
  here, plus one accent margin rule down the left at 11% of the canvas width.
  That rule is the whole reason this variant exists.
- `spotlight` is the plate a printed report reserves a figure with: the 135
  degree hatch of `--slide-hatch`, under the same closing rule as `default`.
- `accent` is the inverted statement slide. The canvas floods with the theme
  accent and the ink flips, the way a printed report opens a section.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The colors come from `--slide-grid-color`, `--slide-grid-size`, `--slide-rule`,
`--slide-hatch`, and `--slide-margin-rule`.

`accent` is painted by two unlayered rules at the bottom of this file. A
base-layer fallback ships in `@deckard/core/styles.css`, but a theme's unlayered
CSS always wins over the base layer, which is why every theme in the registry
restates the pair. The field colour is read on the canvas, where `--background`
is remapped to `--primary`. The ink is remapped one level down, on
`[data-slide-frame]`, `[data-slide-header]`, and `[data-slide-footer]`, because
a custom property resolves against the element that uses it: moving `--primary`
on the same element that reads `var(--primary)` for the field would flood the
slide with its own ink.

## Block parts

The contract has two halves. Tokens are values, a size or a colour or a
gradient. Data attributes are parts: a block names the piece of itself a theme
may reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. Between them they are the whole surface a theme
depends on, so a block is free to change its markup and its class names as long
as the attributes stay where they are. The full list is in the "Block part
contract" comment at the bottom of `@deckard/core/styles.css`.

What does not belong in a theme is anything that is new content rather than a
treatment of existing content. A boot log, a status table, a cursor line with
words in it are all slide copy, so they go in a block the deck composes.

Ledger reaches five parts.

`[data-slide-breaker-index]`, the section number a divider carries, is set in
the heading face at `calc(var(--slide-title-size) * 1.6)`, so a chapter opens on
a numeral larger than any headline in the deck.

`[data-slide-list-marker]` goes to `font-size: 0` rather than `display: none`,
so the rail keeps its width, and a `::before` hangs a `3.5rem` by 2px rule in
the accent where the number was. Every list in the deck starts its copy on the
same column.

`[data-slide-hero-meta]` and `[data-slide-kicker]`, the credit row along the
bottom of an opener and the label under a focus slide's body, run in small caps
with `text-transform` cleared, so they read as a printed caption rather than as
a UI label.

`[data-stat-value]` is the fifth. The heading tracking and weight described
above reach it by name, because the metrics figure sits inside a description
list rather than in a heading element.

## Theme-private tokens

`--slide-rule` and `--slide-halo` are no longer private. They were promoted into
the contract in `@deckard/core/styles.css`, alongside `--slide-scanline` and the
new `--slide-hatch`, because flat, ruled, scanned, and hatched are the four
things the source designs do to a background and every theme was declaring the
same names. `--slide-hatch` is the 135 degree fill the templates put behind a
reserved plate, drawn here in this theme's own `--slide-grid-color` so it stays
quiet under body copy.

One private token is left. `--slide-margin-rule` is the accent line down the
left of the `grid` variant. It is defined in the light block and overridden in
dark, like every other token here. Nothing outside this file reads it, so
renaming it is safe as long as you rename every use.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
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
