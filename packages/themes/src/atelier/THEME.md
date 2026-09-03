# Atelier theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.atelier-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A printed poster. Flat colour, hard rules, and capitals at a display size no
other theme here goes near. The canvas is warm stock in light mode and warm ink
in dark.

`--slide-surface-border` and `--slide-rule` are both `--foreground`. A rule here
is full-strength ink rather than a tint of it, in either color mode, and that is
the single decision the rest of the theme follows from. Soften it and the deck
becomes an ordinary sans deck with large headings.

`--slide-radius` and `--slide-radius-lg` are `0rem` and `--slide-surface-shadow`
is `none`. Nothing is rounded and nothing is raised.

`--slide-accent-soft` is the accent itself rather than a tint of it. The block
the deck singles out, a `CardGrid` accent card or a highlighted `DataTable` row,
is flooded with the accent and the rules at the bottom of this file flip its ink
to `--primary-foreground`.

## Typography

Archivo sets every word on the slide; Space Mono sets every label, caption and
numeral around it. Both ship with the theme: `theme.css` declares them from
`../fonts/`, so there is nothing to load in `app/layout.tsx` and no font host is
called at render time. Both are SIL Open Font License 1.1, covered by
`fonts/archivo.OFL.txt` and `fonts/space-mono.OFL.txt`.

Archivo is variable across weight, so the whole range from body copy to the
weight 800 capitals is one file per subset. Space Mono is not variable, so the
roman and the bold are separate files; the metadata rules below ask for the
bold, which is the weight the source design sets every caption in.

Each family stays at the front of the system stack it replaces, so a build that
loses a file degrades rather than fails, and `font-display: swap` paints that
stack while the woff2 lands. latin-ext sits behind its own `unicode-range` and is
only fetched by a deck that sets a character in it.

Every heading is uppercase at weight 800 with negative tracking and a
line-height under 1. `[data-slide-statement-text]`, `[data-stat-value]` and
`[data-slide-quote-text]` take the same treatment by name, because all three are
display type without being heading elements.

| Token                      | Used by                               |
| -------------------------- | ------------------------------------- |
| `--slide-title-size`       | hero, breaker, statement headlines     |
| `--slide-heading-size`     | the `h1` on a content slide            |
| `--slide-subheading-size`  | an `h2` or `h3` inside a slide body    |
| `--slide-lead-size`        | the sentence under a headline          |
| `--slide-body-size`        | bullet copy, the main text of a slide  |
| `--slide-code-size`        | the type inside a `CodeBlock`          |
| `--slide-support-size`     | captions, grid copy, metadata rows     |
| `--slide-label-size`       | eyebrows and other uppercase labels    |
| `--slide-figure-size`      | the figure in a metrics block          |
| `--slide-figure-unit-size` | the unit suffix beside that figure     |

`--slide-code-size` sits a step under `--slide-body-size` rather than level with
it. Space Mono is a wide face, and a code block set at the body size runs past
the frame on a two-column split.

The display size is the thing to watch when you edit this theme. It is the
largest in the registry, and a headline that runs to three lines on
`MinimalBreakerSlide` or `StatementSlide` will reach the canvas floor. Run
`deckard check-overflow` in both color modes after changing it.

## Spacing

The frame is the whole canvas inside its margins. There is no measure cap and no
centred column, so a slide starts at the left margin and runs to the right one.
The contract has one `--slide-padding-block` for the head and the foot, and the
source design sets those two a few pixels apart, so this file takes the head
margin and the foot follows it.

`--slide-content-gap` is the vertical rhythm between the intro block and the body
of a slide. `--slide-item-gap` is the smaller gap between rows inside one block.

## Rule width

`--slide-poster-rule` is theme-private, and it is the 4px measure the source
design draws every divider at. The blocks set their own border widths in the
markup, at one or two pixels, so each part this theme thickens names the token:
`[data-slide-rail]`, `[data-slide-contents]`, `[data-slide-column]`,
`[data-slide-log]`, `[data-stat-item]`, `[data-slide-hero-meta]`,
`[data-slide-quote-attribution]`, `[data-slide-panel]`, the header, the footer
and the progress bar.

`[data-slide-table-heading]` is the odd one. `DataTable` draws the head rule on
the row rather than the cell, and a row is not a part a theme may reach, so the
rule is restated on each heading cell instead and the collapsed border resolves
to the same line.

There is no rule-width token in the contract, so a block that adds a new ruled
part draws it at the block's own width until it is listed in one of the
selectors above.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

- `default` is bare stock. The type carries the slide.
- `grid` is the registration grid a poster is pasted up on: one line each way at
  `--slide-grid-size`, in `--slide-grid-color`.
- `spotlight` is the 45 degree two-tone stripe the source design fills an empty
  plate with, promoted to a whole sheet. It is `--slide-hatch`, drawn in
  `--slide-stripe`.
- `accent` floods the canvas with the accent and flips the ink, which is the
  closing slide of the source design.
- `none` renders nothing at all. `SlideBackground` returns `null`.

`accent` is painted by two unlayered rules at the bottom of this file. A
base-layer fallback ships in `@deckard/core/styles.css`, and a theme's unlayered
CSS always wins over the base layer, so every theme in the registry restates the
pair. The field colour is read on the canvas, where `--background` is remapped to
`--primary`. The ink is remapped one level down, on `[data-slide-frame]`,
`[data-slide-header]`, and `[data-slide-footer]`, because a custom property
resolves against the element that uses it: moving `--primary` on the same element
that reads `var(--primary)` for the field would flood the slide with its own ink.

## Block parts

The contract has two halves. Tokens are values, a size or a colour or a
gradient. Data attributes are parts: a block names the piece of itself a theme
may reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. The full list is in the "Block part contract"
comment at the bottom of `@deckard/core/styles.css`.

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide copy, so they go in a block
the deck composes.

`[data-slide-list-marker]` goes to `font-size: 0` rather than `display: none`, so
the rail keeps its width, and a `::before` puts a solid accent square where the
number was. Every list in the deck starts its copy on the same column.

`[data-slide-card]` loses its border and takes `justify-content: space-between`,
so a grid cell reads as a flat colour block with its heading at the top and its
copy on the floor. `[data-stat-item]` does the same, which is the composition the
source design gives a metrics row.

`[data-slide-card-accent]` and `[data-slide-table-highlight]` carry the ink flip
described above. Both select their descendants, because the card's heading and
body and the row's cells set their own colours in the markup.

`[data-slide-breaker-index]` is set at a multiple of `--slide-title-size` at
`line-height: 0.7`. The source design stands this numeral in an accent panel
beside the copy at a size no column layout can hold; `BreakerSlide` is one
column, so the numeral takes the accent and the panel goes. Raising the multiple
much past where it sits will push the breaker off the canvas.

`[data-slide-quote-text]` takes the heading capitals and hangs its own opening
quotation mark into the margin. The block writes no quotation marks of its own.

`[data-slide-media-frame]` is filled with `--slide-hatch`, which is the stripe
the source design reserves an empty plate with.

Every label, caption and standing numeral runs in Space Mono at weight 700, in
capitals. The full list is the two selectors under "Every label, caption and
numeral" in `theme.css`.

## Theme-private tokens

`--slide-rule`, `--slide-hatch`, `--slide-halo` and `--slide-scanline` are part
of the contract in `@deckard/core/styles.css` rather than private to this theme.

Two tokens here are private. `--slide-poster-rule` is the rule width described
above. `--slide-stripe` is the colour of the diagonal in `--slide-hatch`, defined
in the light block and overridden in dark like every other token here. Nothing
outside this file reads either, so renaming one is safe as long as you rename
every use.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer
holds `[data-slide-counter]`, split into `[data-slide-counter-current]`,
`[data-slide-counter-separator]`, and `[data-slide-counter-total]`, and
`[data-slide-progress]`, which carries the position in the deck as a fraction on
`--slide-progress`.

Atelier sets a colophon. Both bands run in Space Mono capitals at
`--slide-chrome-tracking`, the widest setting in the theme, held between rules at
`--slide-poster-rule`. The brand takes the accent. The progress bar sits on the
floor at the same measure as every other rule.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring` and `--slide-accent-soft` together.
Change the stock by moving `--background`, `--card` and `--slide-stripe`.

Three rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. Keep `--slide-surface-border` and
`--slide-rule` equal to `--foreground`, or the theme stops being this theme. And
keep contrast: body copy against `--background` and against `--slide-surface`
both have to clear 4.5:1.

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

Softening `--slide-surface-border` to a tint. The full-strength rule is the
theme, and a hairline turns the deck into a quiet sans deck with unusually large
headings.

Adding a corner radius or a shadow back. One rounded card in a flat set reads as
a rendering bug rather than as emphasis.

Leaving `--slide-title-size` where it is and adding a fourth line of headline
copy. The display size is the largest in the registry and the canvas does not
grow. Trim the sentence, or reach for `HeroSplitSlide`, which gives the headline
a narrower column and puts the facts beside it.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.atelier-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
