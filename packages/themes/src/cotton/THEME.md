# Cotton theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.cotton-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

Warm, rounded and quiet. The canvas is a warm off-white in light mode and a warm
brown-black in dark, and a group is separated by a fill or a corner rather than
by a line.

Three decisions carry it. Body copy runs at weight 300, which is set on
`.cotton-theme` itself so every part that does not state a weight inherits it.
`--slide-radius` and `--slide-radius-lg` are the two radii of the source design,
the smaller one on cards and badges and the larger on panels, tables and media
frames. And `--slide-accent-soft` is the workhorse: the tinted card, the metrics
panel, the filled capsule and the highlighted table row all sit on it, with
`--accent-foreground` as the ink. Full `--primary` is kept for the breaker
numeral, the closing plate, the bullet dots and the numbered circles.

`--slide-surface-shadow` is the one lift in the theme, and `[data-slide-panel]`
is the only part in the registry that reads it, so a slide raises at most one
surface however many blocks it composes.

## Typography

Bricolage Grotesque sets the display, Outfit sets the body, DM Mono sets
numerals, credits and code. All three ship with the theme: `theme.css` declares
them from `../fonts/`, so there is nothing to load in `app/layout.tsx` and no
font host is called at render time. All three are SIL Open Font License 1.1,
covered by `fonts/bricolage-grotesque.OFL.txt`, `fonts/outfit.OFL.txt` and
`fonts/dm-mono.OFL.txt`.

Bricolage carries an optical size axis alongside its weight axis, and the file
is the whole axis rather than one instance. Every rule that sets the display face
also sets `font-optical-sizing: auto`, so a headline and a card title are drawn
from different points on that axis rather than from one pinned design. Take that
declaration out and the whole theme collapses onto a single optical size, which
shows first in the small type.

Outfit is variable across the weights the source design uses, so the weight 300
body copy and the weight 500 labels are one file per subset. DM Mono is not
variable, so its roman and its medium are separate files.

Each family stays at the front of the system stack it replaces, so a build that
loses a file degrades rather than fails, and `font-display: swap` paints that
stack while the woff2 lands. latin-ext sits behind its own `unicode-range` and is
only fetched by a deck that sets a character in it.

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

Labels are the body face at weight 500 rather than the mono one. The mono face is
kept for the folio, the column index, the note number, the timeline date, the
media credit and code, which is where the source design puts it.

## Spacing

The frame is the whole canvas inside its margins. There is no measure cap and no
centred column, so a slide starts at the left margin and runs to the right one.
The contract has one `--slide-padding-block` for the head and the foot, and the
source design sets those two a few pixels apart, so this file takes the head
margin and the foot follows it.

`--slide-content-gap` is the vertical rhythm between the intro block and the body
of a slide. `--slide-item-gap` is the smaller gap between rows inside one block,
and this theme also uses it as the gap between the contents rows, which are
separate blocks here rather than rows between rules.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints. Nothing paints a
wash: on a warm pale sheet a bloom behind the copy reads as a stain.

- `default` is bare stock.
- `grid` is one line each way at `--slide-grid-size`, in `--slide-grid-color`.
- `spotlight` is the 135 degree hatch of `--slide-hatch`.
- `accent` floods the canvas with the accent and flips the ink, which is the
  closing slide of the source design. The shadow goes with it, so nothing lifts
  off a flat field.
- `none` renders nothing at all. `SlideBackground` returns `null`.

`accent` is painted by two unlayered rules at the bottom of this file. A
base-layer fallback ships in `@deckard/core/styles.css`, and a theme's unlayered
CSS always wins over the base layer, so every theme in the registry restates the
pair. The field colour is read on the canvas, where `--background` is remapped to
`--primary`. The ink is remapped one level down, on `[data-slide-frame]`,
`[data-slide-header]`, and `[data-slide-footer]`, because a custom property
resolves against the element that uses it: moving `--primary` on the same element
that reads `var(--primary)` for the field would flood the slide with its own ink.
This theme remaps `--accent-foreground` and `--slide-accent-soft` in that block
too, because the tinted parts read both.

## Block parts

The contract has two halves. Tokens are values, a size or a colour or a
gradient. Data attributes are parts: a block names the piece of itself a theme
may reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. The full list is in the "Block part contract"
comment at the bottom of `@deckard/core/styles.css`.

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide copy, so they go in a block
the deck composes.

`[data-slide-badge]`, `[data-slide-timeline-marker]`, `[data-slide-accent-rule]`,
`[data-stat-meter]`, `[data-slide-log-status]`, `[data-slide-quote-portrait]`
and `[data-slide-counter]` are all capsules at `--slide-pill`. The badge is
outlined and the log status is filled with the tint, which is the pair the source
design alternates between.

`[data-slide-list-marker]` goes to `font-size: 0` rather than `display: none`, so
the rail keeps its width, and a `::before` puts an accent dot where the number
was. Every list in the deck starts its copy on the same column.

`[data-slide-contents-item]` drops its rules and becomes a rounded row on
`--slide-surface`, and `[data-slide-contents-index]` becomes a filled circle
holding the numeral in the display face. That is the numbered step of the source
design, built out of the parts `ContentsList` already names.

`[data-slide-card]` loses its border, so a grid reads as a set of soft blocks,
and `[data-slide-card-accent]` takes `--accent-foreground` down through its
heading and its body.

`[data-stat-grid]` becomes one tinted panel with the figures inside it rather
than each figure being ruled off on its own, so `[data-stat-item]` gives back its
top rule and its padding.

`[data-slide-table]` sits inside a rounded `--slide-surface` panel with hairline
row rules. `DataTable` clears the padding on its first and last cell so the first
word lands on the frame margin; inside a panel that would put it on the panel
edge instead, so the two end cells take their padding back here.

`[data-slide-statement]` is centred, which no other layout in this theme is, and
`[data-slide-accent-rule]` is a soft disc rather than a line.

`[data-slide-media-frame]` is a flat fill at `--slide-radius-lg` with no line
around it and no stripe in it.

## Theme-private tokens

`--slide-rule`, `--slide-hatch`, `--slide-halo` and `--slide-scanline` are part
of the contract in `@deckard/core/styles.css` rather than private to this theme.

This theme has one private token. `--slide-pill` is the capsule radius, named
once so squaring the theme off is one edit rather than a search. Nothing outside
this file reads it, so renaming it is safe as long as you rename every use.

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

Cotton draws no rules across either band: `--slide-chrome-border` is
`transparent`. The brand runs in the display face and the counter is one more
capsule, filled with `--slide-surface-muted`.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--accent-foreground`, `--ring` and
`--slide-accent-soft` together. The source design also carries a softness
variant: raise `--slide-radius` and `--slide-radius-lg` together for the loose
setting, drop them together and square `--slide-pill` for the tight one.

Two rules bound the edits. Keep both color blocks in sync, so every token defined
for light is also defined for dark. And keep contrast: body copy against
`--background`, against `--slide-surface` and against `--slide-accent-soft` all
have to clear 4.5:1, and weight 300 at the support size is the pair to check
first.

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

Letting body copy default to weight 400. The 300 is what makes the theme read
soft, and it is set once on `.cotton-theme`, so a block that hardcodes
`font-normal` takes itself out of the theme.

Putting the shadow on more than one thing. A grid of six raised cards is a
different theme. `--slide-surface-shadow` reaches `[data-slide-panel]` and
nothing else.

Reaching for `--primary` where `--slide-accent-soft` belongs. Full accent behind
copy is loud enough that the parts that are meant to be loud, the breaker and the
closing plate, stop reading as louder than anything else.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.cotton-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
