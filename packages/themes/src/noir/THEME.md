# Noir theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.noir-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A fashion lookbook. Dark is home, `defaultColorMode` is `"dark"`, and light mode
is the same document printed. The accent is champagne after dark and a deeper
bronze on paper.

Every line is one pixel. `--slide-radius` and `--slide-radius-lg` are `0rem` and
`--slide-surface-shadow` is `none`, so a panel is a block of `--slide-surface`
with nothing drawn around it. `--slide-accent-soft` is that same surface rather
than a tint of the accent, because the source design marks a block by giving it
a second sheet colour and never by tinting it.

`--slide-padding-inline` is the widest in the registry. Nothing here is bold:
the display face runs at 300 and the body at 200, and the parts that arrive
carrying a heavier weight have it taken back in `theme.css`.

## Typography

Cormorant Garamond sets the display, Jost sets everything else. There is no third
family. Both ship with the theme: `theme.css` declares them from `../fonts/`, so
there is nothing to load in `app/layout.tsx` and no font host is called at render
time. Both are SIL Open Font License 1.1, covered by
`fonts/cormorant-garamond.OFL.txt` and `fonts/jost.OFL.txt`.

Cormorant is variable across the weights the source design uses, roman and
italic, so the light display type and the medium column headings come out of one
file per subset and the italic out of one more. Jost is variable across its
range, so the weight 200 body copy and the weight 400 capitals are one file.

Each family stays at the front of the system stack it replaces, so a build that
loses a file degrades rather than fails, and `font-display: swap` paints that
stack while the woff2 lands. latin-ext sits behind its own `unicode-range` and is
only fetched by a deck that sets a character in it.

Italic appears in two places: `[data-slide-statement-text]` and
`[data-slide-quote-text]`, both set in the display face, and
`[data-slide-header-title]`, the slide name in the masthead.

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

Headings carry almost no negative tracking. A serif at display size does not need
tightening, and pulling this one in is the fastest way to make the theme look
like a grotesk deck in the wrong face.

## The missing mono face

The source design has no monospace family. Where every other theme reaches for
one, this one sets the body sans in capitals and lets the tracking do the work.

The contract has `--slide-font-mono`, and the blocks read it for two different
jobs: metadata, which is the folio, the note number, the timeline date, the rail
and the credit row, and code, which is the type inside a `CodeBlock`. This theme
splits them.

`--slide-font-mono` carries the Jost stack, so every metadata part the blocks set
in it lands in the body sans. Code names a monospaced stack of its own in the
`:is(code, kbd, pre, samp)` rule rather than reading that token, because a code
sample set in a proportional face stops lining up.

Tracking runs at three widths. `--slide-label-tracking` is the narrowest and
covers the labels. Eyebrows and the badge sit a step wider. `--slide-track` is
the widest, and it is kept for the standing house lines: the brand in the header
and the credit row on an opener.

## Spacing

The frame is the whole canvas inside its margins. There is no measure cap and no
centred column; the layouts below that centre do it inside their own block. The
contract has one `--slide-padding-block` for the head and the foot, and the
source design sets those two a few pixels apart, so this file takes the head
margin and the foot follows it.

`--slide-rail-size` is narrower than the contract default, which is the
specification list of the source design: a label column against a value column on
hairlines. It sets the rail on both `HeroSplitSlide` and `ProseSlide`, so a
support line in a prose rail wraps sooner here than in another theme.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

- `default` is bare sheet.
- `grid` is a set of vertical hairlines at `--slide-grid-size`, in
  `--slide-grid-color`. Verticals only, because a full grid on a dark sheet reads
  as a table.
- `spotlight` is the 135 degree hatch of `--slide-hatch`.
- `accent` floods the canvas with the accent and flips the ink.
- `none` renders nothing at all. `SlideBackground` returns `null`.

`accent` is painted by two unlayered rules at the bottom of this file. A
base-layer fallback ships in `@thebuilder/deckard-core/styles.css`, and a theme's unlayered
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
comment at the bottom of `@thebuilder/deckard-core/styles.css`.

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide copy, so they go in a block
the deck composes.

Every part the blocks rule off at two pixels comes back to one:
`[data-slide-rail]`, `[data-slide-contents]`, `[data-slide-column]`,
`[data-slide-log]`, `[data-slide-quote-attribution]`, `[data-stat-item]` and
`[data-slide-table-heading]`. The table head rule is drawn on the row in the
markup, and a row is not a part a theme may reach, so it is restated on each
heading cell and the collapsed border resolves to the same line.

`[data-slide-hero]`, `[data-slide-breaker]`, `[data-slide-statement]` and
`[data-slide-quote]` centre their content, which is the composition the source
design opens on. The hero selector carries `:not(:has([data-slide-rail]))`, so
`HeroSplitSlide` keeps its columns while `HeroSlide` centres.

`ContentsList` is the one layout the source design centres that this theme
leaves alone. Its numeral, title and folio sit on a fixed three-column grid, and
centring the rows would mean changing that grid, which is a block decision rather
than a theme one.

`[data-slide-contents-index]` and `[data-slide-column-index]` go to
`font-size: 0`, and a `::before` counts the rows and prints
`counter(noir-numeral, upper-roman)`, so an index the block wrote as 01, 02, 03
reads I, II, III. `[data-slide-breaker-index]` keeps its arabic numeral: the
breaker index is authored copy on a single slide, so there is no sequence for a
counter to walk.

`[data-slide-list-marker]` uses the same `font-size: 0` swap, with a hairline
dash where the number was, so the rail keeps its width and every list starts its
copy on the same column.

`[data-slide-accent-rule]` is the recurring ornament: a short accent hairline
under a centred title and over a statement.

`[data-slide-card]` loses its border, so a card is a block of the second sheet
colour. `[data-slide-card-accent]` keeps a hairline in the accent, which is the
only line in the theme that is not `--slide-surface-border`.

## Theme-private tokens

`--slide-rule`, `--slide-hatch`, `--slide-halo` and `--slide-scanline` are part
of the contract in `@thebuilder/deckard-core/styles.css` rather than private to this theme.

This theme has one private token. `--slide-track` is the widest letter-spacing
here, described under "The missing mono face" above.
`--slide-chrome-tracking` reads it, so moving one moves the masthead with it.
Nothing outside this file reads it, so renaming it is safe as long as you rename
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

Noir sets a masthead. Both bands run in capitals at `--slide-track`, held between
hairlines, with the slide title in the serif italic at reading tracking so it
stays a title rather than a label. The progress bar is one pixel on the floor.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--accent-foreground` and `--ring`
together. The source design also carries a `smallCaps` variant: take the
`text-transform` off the label selectors and drop the tracking to a hair, and the
metadata reads as small caps rather than as signage.

Three rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. Keep the weights light; the theme
sets nothing above 400 and one bold heading takes it apart. And keep contrast:
body copy against `--background` and against `--slide-surface` both have to clear
4.5:1, and weight 200 at the support size is the pair to check first.

If you change the class name, change it in `index.ts` too. The class in the
`SlideTheme` and the selector in the stylesheet are the same string.
`pnpm deck:validate` fails when they drift apart, and when a token is dark-only.

## Media overlays

`--slide-media-foreground`, `--slide-media-foreground-muted`, and the three
`--slide-media-overlay-*` gradients ship in the base layer of
`@thebuilder/deckard-core/styles.css` rather than here, because a scrim over a photograph
is dark in both color modes. Override them in this file if a deck needs a
different scrim.

## Common mistakes

Pointing `--slide-font-mono` back at a monospace family. The blocks read it for
metadata as well as for code, so a mono face there puts a terminal label on every
folio, date and credit line, which is the one thing the source design does not
do.

Thickening a rule. One pixel everywhere is the theme; a two pixel rule under a
heading reads as a mistake next to the rest.

Setting a heading bold to give it emphasis. Emphasis here is size, tracking and
the italic. Weight is not on the table.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.noir-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
