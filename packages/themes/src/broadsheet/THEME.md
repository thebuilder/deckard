# Broadsheet theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.broadsheet-theme` on the slide
canvas. `index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to
`defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

Print, not screen. The canvas is warm newsprint in light mode and warm ink in
dark mode. Both sit off the neutral gray of the app chrome, so the slide reads
as paper.

Everything is serif and everything is flat. `--slide-radius` is `0.125rem` and
`--slide-surface-shadow` is `none`, so a content card is a panel with a hairline
rule around it rather than a floating object. Where the deckard theme separates
a card from the sheet with a shadow, this one uses a border two steps darker
than the default border, because a flat card on flat paper needs the line to do
all of the work.

The accent is oxblood in light mode and terracotta in dark. It appears on
eyebrows, the primary button, and focus rings, and never as a fill behind copy.

## Typography

Serif headings and serif body, from a system stack. `ui-serif` picks up New York
on Apple platforms and falls back to Georgia elsewhere. No web font loads, so
this theme adds nothing to the page weight and works offline.

Headings carry `-0.015em` of tracking. Serif display faces set loose at 120px,
and pulling them in is what keeps a title from looking like body copy scaled up.
Headings keep the browser's bold rather than the 600 ledger drops to, because
the whole deck is serif and a heading has to separate itself from serif copy by
weight as well as by size. Code and `kbd` reset tracking to zero, since the mono
face is already even.

Every size below is set against the 1920x1080 canvas at a 16px root, so 1rem is
16 canvas pixels.

| Token                      | Size              | Used by                               |
| -------------------------- | ----------------- | ------------------------------------- |
| `--slide-title-size`       | `7.5rem`, 120px   | hero and breaker headlines            |
| `--slide-heading-size`     | `4.75rem`, 76px   | the `h1` on a content slide           |
| `--slide-subheading-size`  | `2.75rem`, 44px   | an `h2` inside a slide body           |
| `--slide-lead-size`        | `2.75rem`, 44px   | the sentence under a headline         |
| `--slide-body-size`        | `2.0625rem`, 33px | bullet copy, the main text of a slide |
| `--slide-code-size`        | `1.875rem`, 30px  | the type inside a `CodeBlock`         |
| `--slide-support-size`     | `1.75rem`, 28px   | captions, grid copy, metadata rows    |
| `--slide-label-size`       | `1.5rem`, 24px    | eyebrows and other uppercase labels   |
| `--slide-figure-size`      | `8.5rem`, 136px   | the figure in a metrics block         |
| `--slide-figure-unit-size` | `3.5rem`, 56px    | the unit suffix beside that figure    |

A metrics figure takes `--slide-figure-size` instead of borrowing the title
size. The contract also carries `--slide-meter-size`, the height of the
proportion bar under that figure, and this theme takes the default.

Broadsheet has no source template of its own, so the scale was set against
ledger's and pulled back a notch at the top, 120px against 124px for a title and
76px against 78px. Serif body carries more weight than ledger's sans at the same
size, so the deck reads as heavy at slightly less.

`--slide-label-tracking` is `0.22em`, tighter than the default theme's `0.3em`.
Serif capitals have more width built in than sans capitals, so the same tracking
value reads as too loose here.

`--slide-chrome-size` is `1.5rem`, the same 24px as `--slide-label-size`. The
contract defaults it to `var(--slide-label-size)` so a theme that retunes its
labels moves the header and the footer with them; this file pins the number
outright instead.

## Spacing

The frame is the whole canvas inside its margins. There is no measure cap and no
centred column, so a slide starts at the left margin and runs to the right one,
and anything that wants to sit in the middle centres itself inside its own
block. `--slide-padding-inline` is `8rem`, 128px, and `--slide-padding-block` is
`6.5rem`, 104px. Print margins are generous, and the flat surfaces have no
shadow to hold them off the edge.

`--slide-content-gap` is `2.75rem`, the vertical rhythm between the intro block
and the body of a slide. `--slide-item-gap` is `1.625rem`, the smaller gap
between rows inside one block: bullets in a list, cards in a grid.
`--slide-radius` and `--slide-radius-lg` are both near zero. Do not raise one
without the other, or media frames and content cards stop matching.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide. On a pale sheet a bloom behind the copy reads as a stain, so no variant
paints a wash or a corner glow.

- `default` is bare stock with one 1px rule across the head, where a paper
  carries its folio. The rule sits 5.5% of the canvas height down from the top
  and is inset 5.5% of the canvas width from each side.
- `grid` paints one horizontal rule every `--slide-grid-size`, `2.75rem` here,
  like ruled paper. There are no vertical rules. A square grid fights serif copy.
- `spotlight` paints two vertical column rules at the thirds, the way a
  broadsheet splits a page.
- `accent` is the inverted statement slide. The canvas floods with the theme
  accent and the ink flips, the way a paper sets a standfirst it wants read
  first.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The colors come from `--slide-grid-color`, `--slide-grid-size`, and
`--slide-rule`. Dark mode redeclares both colors as light ink, because the same
dark line disappears on a dark sheet.

This theme declares no private tokens. `--slide-rule`, `--slide-halo`,
`--slide-scanline`, and `--slide-hatch` are all part of the contract in
`@deckard/core/styles.css`. This theme sets `--slide-hatch`, the 135 degree fill
the templates put behind a reserved plate, in its own `--slide-grid-color` so it
stays quiet under body copy, and no variant here draws it yet.

`accent` is painted by two unlayered rules at the bottom of this file. A
base-layer fallback ships in `@deckard/core/styles.css`, and a theme's unlayered
CSS always wins over the base layer, so every theme in the registry restates the
pair. The field colour is read on the canvas, where `--background`
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

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide copy, so they go in a block
the deck composes.

Broadsheet has no source design behind it, so it stays quiet here. Everything
below is the same two moves applied to more parts.

`[data-slide-breaker-index]`, the section number a divider carries, is set in
the heading face at `calc(var(--slide-title-size) * 1.5)`, so a chapter opens on
a numeral larger than any headline in the deck.

Every label and numeral in the deck runs in small caps with oldstyle numerals
and `text-transform` cleared: `[data-slide-list-marker]`,
`[data-slide-hero-meta]`, `[data-slide-contents-index]`,
`[data-slide-contents-folio]`, `[data-slide-column-index]`,
`[data-slide-note-index]`, `[data-slide-rail-term]`,
`[data-slide-statement-source]`, `[data-slide-table-heading]`, and
`[data-slide-badge]`. Lining figures in a serif list read as a table of
contents; oldstyle ones sit down into the copy.

`[data-slide-quote-text]` is set in the masthead face, italic, which is where a
paper puts a pull quote. It draws no hanging quotation mark; ledger does that.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Broadsheet sets a running head. The deck name reads as a masthead in small caps,
the slide title runs italic in the middle of the line, and the date sits right in
old-style figures, all in the serif the deck is set in. The foot centers the
folio in small caps under a rule.

`--slide-progress-fill` is `transparent`, so there is no progress bar. A deck
that wants one sets it to `--primary`.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, and `--ring` together. Change the paper by
moving `--background`, `--card`, and the background variant colors.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1.

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

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Adding a shadow back. `--slide-surface-shadow` is `none`, and the borders are
sized to carry the separation on their own. A shadow on top of them reads as a
mistake rather than as depth.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.broadsheet-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
