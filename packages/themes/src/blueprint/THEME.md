# Blueprint theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.blueprint-theme` on the slide
canvas. `index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to
`defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

An engineering drawing. The canvas is a cold blue-black in dark mode, which is
where the theme opens, and a cool paper white in light. Nothing is rounded:
`--slide-radius` and `--slide-radius-lg` are both `0`, so a card, a code block,
a media frame, and a badge are all hard rectangles.

Nothing is raised either. `--slide-surface-shadow` is `none` and
`--slide-surface` and `--slide-surface-muted` are the same colour, so a panel is
separated by its rule rather than by its fill. A rule opens a group, a heavier
rule in the ink colour opens the group the slide is about, and the accent marks
the one thing on the sheet that changed.

The accent is a cyan in dark mode and a deeper blue on paper. Use it on a
reference number, a boxed section numeral, and the one card a deck is arguing
for. A slide with the accent on four things has no accent.

## Typography

Chivo for headings and body, Azeret Mono for reference numbers, labels, and
code. Both are the source design's own, and both ship with the theme:
`theme.css` declares them from `../fonts/`, so there is nothing to load in
`app/layout.tsx` and no font host is called at render time. Both are SIL Open
Font License 1.1, covered by `fonts/chivo.OFL.txt` and
`fonts/azeret-mono.OFL.txt`. Each is one variable file over the weight range
`theme.css` declares.

Body copy runs a weight under regular. `.blueprint-theme` sets `font-weight:
300` on the canvas, and every heading, label, and marker sets its own weight
directly, so inheritance reaches the running copy and nothing else. Set a
paragraph to 400 and the sheet stops reading as a drawing.

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
at that root. The interval between `--slide-title-size` and
`--slide-heading-size` is wide, so a hero and a content slide read as different
kinds of page. Retune the two together or that difference goes.

`h1` and `h2` carry `-0.03em` of tracking at weight 600, `h3` through `h6`
`-0.02em`. `--slide-label-tracking` is wide, because the labels are drawing
annotations rather than headings.

## Spacing

The frame is the whole canvas inside `--slide-padding-inline` and
`--slide-padding-block`, left aligned. There is no measure cap and no centred
column, so a slide starts at the left margin and runs to the right one.
`--slide-padding-inline` and `--slide-padding-block` are the source template's
sheet margins. The template draws a shorter bottom margin than top; the contract
carries one block padding for both edges, so this theme takes the top value and
lets `--slide-footer-space` shorten the bottom edge when the footer is on.

`--slide-content-gap` is the rhythm between the intro block and the body.
`--slide-item-gap` is the smaller rhythm between rows inside a body.
`--slide-rail-size` is narrower than the contract default, matching the label
rail the source template runs down the left of a prose sheet.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

- `default` paints the flat canvas colour.
- `grid` is the sheet the theme is named for. Two pitches over each other from
  the same corner: a cell grid in `--slide-grid-color` and a division grid five
  cells wide in `--slide-grid-major`. Drawing both from the origin is what puts
  a division line on a cell line instead of between two.
- `spotlight` is the drawing plate: a tighter cell grid alone, on the second
  sheet colour, which is what the source template puts a render or a section
  view on.
- `accent` floods the canvas with the accent and flips the ink, with the grid
  off. A field is not a sheet.
- `none` renders nothing at all. `SlideBackground` returns `null`.

`accent` is painted by two unlayered rules in this file. A base-layer fallback
for it ships in `@thebuilder/deckard-core/styles.css`, and a theme's unlayered CSS always
wins over the base layer, so every theme in the registry restates the pair. The
first rule sets `--background` and `--foreground` on the canvas. The second
remaps the ink one level down, on `[data-slide-frame]`, `[data-slide-header]`,
and `[data-slide-footer]`: a custom property resolves against the element that
uses it, so remapping `--primary` on the same element that reads
`var(--primary)` for the field would flood the slide with its own ink.

This theme leaves `--slide-scanline`, `--slide-hatch`, and `--slide-halo` at the
contract's `none`. A glow behind display type undoes the drawing.

One token here is private to the theme, and it is shared with `nexus` under the
same name. `--slide-grid-major` is the heavier of the two grid pitches, and it
also stands in as `--slide-progress-track`. It is not in the contract in
`@thebuilder/deckard-core/styles.css`, so a block must not read it; only this stylesheet
and `nexus/theme.css` do.

## Block parts

The contract has two halves. Tokens are values, and the sections above cover
them. Data attributes are parts: a block names the piece of itself a theme might
want to reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. A block is then free to change its class names and
its markup as long as the attributes stay where they are. The full list lives in
the "Block part contract" comment at the bottom of `@thebuilder/deckard-core/styles.css`.

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide content, so they go in a
block the deck composes.

- `[data-slide-breaker-index]` is boxed the way a drawing numbers a detail: a
  square in three strokes of the accent with the numeral centred in it, set in
  the mono face. It sizes itself rather than scaling off
  `--slide-title-size`, so the box holds its proportion when the title scale
  moves.
- `[data-slide-hero-meta]` becomes the title block along the foot of the sheet:
  a panel in the second sheet colour, ruled on all four sides, opened by a
  three-pixel stroke of the accent across its head. It is the one part of an
  opener that carries a fill.
- `[data-slide-grid]` paints a field of the line colour and drops its gutter to
  two pixels, and `[data-slide-card]` paints the sheet colour with no border of
  its own. The cards butt together and the gutters read as drawn divisions
  rather than as space. `[data-slide-card-accent]` takes a four-pixel accent
  stroke across its head instead of the tint, which is how a drawing marks the
  option it recommends.
- `[data-slide-accent-rule]` is drawn as a dimension line: a filled square where
  it starts, then a hairline across the measure. The square is a `::before` on
  the rule, so a block that stops rendering the rule loses both.
- `[data-slide-list]` gains a two-pixel rule in the ink colour across its head,
  and `[data-slide-column]`, `[data-slide-contents]`, `[data-slide-log]`,
  `[data-slide-rail]`, and `[data-stat-item]` recolour the rule they already
  draw to the same ink. That rule is the theme's only grouping device.
- `[data-slide-list-marker]`, `[data-slide-timeline-date]`,
  `[data-slide-rail-term]`, `[data-slide-card-label]`, and
  `[data-slide-column-label]` are set in the mono face with the tracking pulled
  in, because they are part numbers rather than labels. The list marker and the
  card label also lose their capitals, so a reference like `REQ-114` reads as
  the string it is.

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

Both strips are the drawing's margin notes: mono, capitals, spaced out, ruled
off from the sheet. A forward slash separates the deck name from the slide
title, the brand and the current slide number take the accent, and the progress
runs across the top edge on a track in `--slide-grid-major`.

Raise `--slide-chrome-size` if the chrome has to be readable from the back of a
room. The tracking is what costs the width, so drop `--slide-chrome-tracking`
first.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, and `--accent` together; the
source design ships amber and magenta alternates at the same lightness. Change
the mood by moving `--background`, `--card`, and the two grid colors.

The grid alphas carry the sheet. Raise `--slide-grid-color` and
`--slide-grid-major` together if the field is invisible on your projector, and
keep the major roughly twice the minor or the two pitches stop reading as two.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1.

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

Rounding something. One radius anywhere breaks the sheet, and the two radius
tokens are `0` so that a block never introduces one.

Filling a card. The grids are read as divisions because every card is the sheet
colour and only the gutter is drawn. A card with its own fill turns the grid
back into a set of boxes.

Spending the accent. It marks one thing per sheet. Put it on the boxed numeral
and the reference numbers and stop.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.blueprint-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
