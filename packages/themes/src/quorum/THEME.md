# Quorum theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.quorum-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A board pack. The canvas is a near-white with a trace of blue in it, which is
where the theme opens, and a deep blue-grey in dark. Corners are softened by a
single step, `--slide-radius` and `--slide-radius-lg` both at the same small
value, so a card is squared off without being hard.

Nothing is raised. `--slide-surface-shadow` is `none`, and a card is separated
by a five-pixel stroke on its leading edge rather than by a box. That stroke is
the theme's one repeated shape: it opens a card, a divider, and a column, and it
takes the accent on the one item a deck is arguing for.

The accent is a navy on paper and a lighter blue after dark. It is the only
chroma on most slides. Green is reserved, and it is reserved narrowly: see
"Direction" below.

## Typography

IBM Plex across the board. Plex Sans for headings and body, Plex Serif for
figures and pull quotes, Plex Mono for numbering, metadata, and code. All three
are the source design's own, and all three ship with the theme: `theme.css`
declares them from `../fonts/`, so there is nothing to load in `app/layout.tsx`
and no font host is called at render time. All are SIL Open Font License 1.1,
covered by `fonts/ibm-plex-sans.OFL.txt`, `fonts/ibm-plex-serif.OFL.txt`, and
`fonts/ibm-plex-mono.OFL.txt`. Plex Sans and Plex Mono are the same files
`nexus` declares, so a deck that offers both themes downloads one copy.

Body copy runs a weight under regular. `.quorum-theme` sets `font-weight: 300`
on the canvas, and every heading, label, and marker sets its own weight directly,
so inheritance reaches the running copy and nothing else. That weight is what
lets this scale hold a dense slide.

Each family stays at the front of the system stack it replaces, so a build that
loses a file degrades rather than fails, and `font-display: swap` paints that
stack while the woff2 lands. latin-ext sits behind its own `unicode-range` and
is only fetched by a deck that sets a character in it.

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
canvas pixels, and each one is the source template's own pixel value converted
at that root. The scale is short from `--slide-heading-size` down, and
`--slide-figure-size` sits well under the contract default, which is what lets a
four-figure band and a six-row table hold one slide at full size. A deck that
raises the scale here loses that, so raise the padding with it or drop a row.

`h1` and `h2` carry `-0.02em` of tracking at weight 600. `h3` through `h6` carry
`-0.01em` at weight 500, because a card heading in this deck is a statement
rather than a label.

`--slide-font-figure` is a token this theme adds. `--slide-font-heading` covers
headings and figures together in the contract, and this design splits them, so
`[data-stat-value]`, `[data-stat-unit]`, and `[data-slide-quote-text]` read from
the new name and everything else stays on the heading face. It is not in the
contract in `@deckard/core/styles.css`, so a block must not read it; only this
stylesheet does.

## Spacing

The frame is the whole canvas inside `--slide-padding-inline` and
`--slide-padding-block`, left aligned. There is no measure cap and no centred
column, so a slide starts at the left margin and runs to the right one.

Both paddings sit under the contract default, short to match the type scale: a
tight scale inside a wide margin reads as a slide with a hole in it. Move the
two together. The source template draws a shorter bottom margin than top; the
contract carries one block padding for both edges, so this theme takes the top
value and lets `--slide-footer-space` shorten the bottom edge when the footer is
on.

`--slide-content-gap` is the rhythm between the intro block and the body.
`--slide-item-gap` is the smaller rhythm between rows inside a body, and it is
the gutter between cards in a grid. `--slide-rail-size` matches the pull-figure
rail the source template runs down the right of a prose slide.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

- `default` paints the flat canvas colour, which is where most of a pack lives.
- `grid` paints a square rule grid in `--slide-grid-color`, faint enough to read
  as ruled paper rather than as a chart.
- `spotlight` paints `--slide-hatch` over the second sheet colour, the fill
  reserved for an exhibit that has not been dropped in yet.
- `accent` inverts the sheet. See below.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The source design runs its statement slide and its covers as the negative of the
sheet rather than as a field of the accent, in both colour modes: ink behind
paper-coloured type in light, and paper behind ink in dark. `accent` does that
here, so `background: "accent"` on a `StatementSlide` gives you the slide the
template draws. `--quorum-paper` and `--quorum-ink` hold the sheet and its ink
under their own names, because a custom property resolves against the element
that uses it and `--background: var(--foreground)` inside a rule that redefines
`--foreground` would resolve against itself.

`accent` is painted by two unlayered rules in this file. A base-layer fallback
for it ships in `@deckard/core/styles.css`, and a theme's unlayered CSS always
wins over the base layer, so every theme in the registry restates the pair. The
first rule sets `--background` and `--foreground` on the canvas. The second
remaps the ink one level down, on `[data-slide-frame]`, `[data-slide-header]`,
and `[data-slide-footer]`.

This theme leaves `--slide-scanline` and `--slide-halo` at the contract's
`none`.

## Direction

A reporting pack colours a figure by which way it moved. The contract has no
direction on a figure and cannot have one: whether 41 million is good news is
data the deck holds and the theme does not. `--quorum-positive` is a token this
theme adds for the half of that pair `--destructive` does not already cover, and
it reaches only the two parts that carry a state of their own:

- `[data-slide-timeline-done]`, on the marker of a milestone that landed.
- `[data-slide-log-tone]`, valued `ok`, `note`, or `alert`. The status on an
  `ok` row takes the positive colour and an `alert` row takes `--destructive`.

To colour a figure by direction, put the direction in the block. A stat that
knows whether it rose is a prop on the block, not a rule in this file.

## Block parts

The contract has two halves. Tokens are values, and the sections above cover
them. Data attributes are parts: a block names the piece of itself a theme might
want to reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. A block is then free to change its class names and
its markup as long as the attributes stay where they are. The full list lives in
the "Block part contract" comment at the bottom of `@deckard/core/styles.css`.

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide content, so they go in a
block the deck composes.

- `[data-stat-value]` and `[data-stat-unit]` take the serif at weight 600, and
  `[data-slide-quote-text]` takes it at 400. Everything else stays on the sans,
  so a number being reported reads differently from a number being described.
- `[data-slide-breaker]` hangs off a five-pixel accent stroke on its leading
  edge with the content indented past it.
  `[data-slide-breaker]:not(:has([data-slide-breaker-index]))` drops both, so
  the centred minimal breaker keeps the short rule the block draws instead of
  gaining a stroke down one side of a centred slide.
- `[data-slide-breaker-index]` is set thin and large in the accent rather than
  bold, which is what keeps a section number from outweighing the section title.
- `[data-slide-card]` loses its border and takes the same five-pixel stroke on
  its leading edge, with the radius flattened on that side.
  `[data-slide-card-accent]` moves that stroke to the accent and drops the tint,
  so the one card a deck is arguing for is marked by the stroke and nothing
  else.
- `[data-slide-column]` thickens the rule it already draws to match, so a
  three-up reads as three headed blocks rather than as a table.
- `[data-slide-table-highlight]` drops the tint too. The row a pack closes on is
  ruled off in the ink colour and set a weight up, the way a total row is set in
  a report. `[data-slide-table-cell]` runs tabular figures so a column of
  numbers aligns.
- `[data-slide-contents-index]`, `[data-slide-list-marker]`,
  `[data-slide-note-index]`, `[data-slide-contents-folio]`,
  `[data-slide-quote-source]`, and `[data-slide-statement-source]` are set in
  the mono face without capitals, because they are references rather than
  labels.

## Deck chrome

The runtime renders the header and the footer and names their parts. The header
holds `[data-slide-header-brand]`, the deck name as a link;
`[data-slide-header-title]`, the current slide, rendered only when the slide has
a title of its own; and `[data-slide-header-meta]`, one line of standing detail,
rendered only when `deck.ts` sets `header.meta`. The footer holds
`[data-slide-counter]`, split into `[data-slide-counter-current]`,
`[data-slide-counter-separator]`, and `[data-slide-counter-total]`, and
`[data-slide-progress]`, which carries the position in the deck as a fraction on
`--slide-progress`.

Both strips are the running head of a bound pack: mono, sentence case, ruled
off, and no louder than the page number. The brand stays on the sans at weight
600, a vertical bar separates it from the slide title, and the progress runs
across the bottom edge with no track behind it.

Raise `--slide-chrome-size` if the chrome has to be readable from the back of a
room.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, and `--accent` together; the
source design ships teal and graphite alternates at the same lightness. Change
the mood by moving `--background` and `--card`.

`--quorum-positive` is the one colour outside that set. Move it and
`--destructive` together, or a pack ends up with a green that does not answer
its red.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark, `--quorum-paper` and `--quorum-ink`
included: the inverted slide reads them, so a mode that leaves one behind
inverts to the wrong colour. And keep contrast: body copy against `--background`
and against `--slide-surface` both have to clear 4.5:1.

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

Setting a headline in the serif. The serif carries figures and quotations. A
serif headline turns a board pack into an annual report.

Spending the green. It answers a red, on a milestone that landed and on a log
row that came back clean. Anywhere else it reads as decoration.

Loosening the scale. The padding is short to match the type, so raising one
without the other is what puts a slide over the canvas edge;
`pnpm deck:check-overflow` catches it.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.quorum-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
