# Meridian theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.meridian-theme` on the slide
canvas. `index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to
`defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

Restraint. This is the quietest theme in the registry and that is the whole
brief. The canvas is a near-white blue-gray in light mode and a cool near-black
in dark. Cards are a flat surface with a hairline border and `0.625rem` corners,
and `--slide-surface-shadow` is `none` in both modes.

Dropping the shadow was the one decision worth arguing about. A white card on a
white sheet with no shadow needs its border to carry the whole separation, which
is a thinner line to walk than the default theme's soft drop shadow. The source
design draws it that way on every card slide, so this theme does too. If a deck
of yours reads flat rather than calm, put a shadow back on
`--slide-surface-shadow` and leave everything else alone.

The accent is a mid blue. It appears on eyebrows, numerals, the primary button,
and focus rings, and one place per slide at most. `--accent` is a pale tint of
it, which is where the source design put its one highlighted card and its one
highlighted table row.

## Typography

One family for everything, from the system sans stack. No web font loads.

The original design used Schibsted Grotesk for headings and body and JetBrains
Mono for labels. Schibsted is a touch narrower than the system grotesks and
carries a lower cap height, so a headline set in it fits about a word more per
line than what ships here. Load it in `app/layout.tsx` and put it at the front
of `--slide-font-heading` and `--slide-font-body` if you want the original
measure back.

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
canvas pixels and the scale reads the way it does from the back of a room rather
than the way it does in a browser window. The numbers are the source template's
own: `--slide-title-size` is `6.5rem`, the template's 104px display line;
`--slide-heading-size` is `4.25rem` for its 68px title; `--slide-subheading-size`
and `--slide-lead-size` are both `2.625rem` for its 42px sub; `--slide-body-size`
is `2rem` for 32px of body copy; `--slide-support-size` is `1.75rem` for 28px of
small text; and `--slide-label-size` is `1.5rem` for its 24px micro line.
`--slide-code-size` is `2rem` rather than the contract's `1.75rem`, because a
mono face at the body size sets visibly smaller than the sans beside it.

Six sizes and nothing else set the hierarchy on a slide with no decoration on
it, so the intervals between them are the whole structure. Retune them together
or a slide loses its order.

A metrics figure is display type without being a heading, so it sizes itself:
`--slide-figure-size` is `7.5rem` and `--slide-figure-unit-size` is `3.5rem`. A
stat slide keeps its proportion when the title scale moves.

`h1` and `h2` carry `-0.03em` of tracking. `h3` through `h6` carry `-0.02em` and
drop to weight 500. That negative tracking is the single most identifiable thing
about this theme. Set the same headline at `0` and it stops looking like
Meridian and starts looking like a default Tailwind page.

`--slide-label-tracking` is `0.16em`, tighter than every other theme here,
because the labels are short and the theme has no capitals to open up anywhere
else.

## Spacing

The frame is the whole canvas inside `--slide-padding-inline` and
`--slide-padding-block`, left aligned. There is no measure cap and no centred
column, so a slide starts at the left margin and runs to the right one, and
content that wants to be centred centres itself inside its own block. Meridian
sets `--slide-padding-inline` to `7.5rem` and `--slide-padding-block` to
`6.25rem`, the 120px and 100px margins the source template draws. When the
header or the footer is on, `--slide-header-space` and `--slide-footer-space`
stand in for the block padding on that edge, so a theme that redesigns either
strip moves the content with it.

`--slide-content-gap` is `3rem`, the vertical rhythm between the intro block and
the body of a slide. `--slide-item-gap` is `1.625rem`, the smaller rhythm
between rows inside a body: cards in a grid, and the padding a template layout
holds off the frame. `--slide-radius` is `0.625rem` on cards and code blocks and
`--slide-radius-lg` is `0.875rem` on the outer content card and media frames.
The source design offers a square and a round variant at 0px and 22px; both work
here if you move the two tokens together.

`--slide-meter-size` is the height of the proportion bar under a stat figure.
Meridian leaves it at the contract's `0.875rem` and only rounds it off, which is
in the block parts below.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide.

- `default` paints the flat canvas colour and nothing else. The source design
  puts one colour behind a slide and lets the type carry it.
- `grid` paints a `3.5rem` square grid in `--slide-grid-color`, edge to edge and
  at the same alpha everywhere.
- `spotlight` paints `--slide-hatch`, the 135 degree fill a printed report
  reserves a figure with, promoted here to a whole background.
- `accent` floods the canvas with the theme accent and flips the ink. It is the
  statement slide: one flat field, no border, no card, nothing else on it.
- `none` renders nothing at all. `SlideBackground` returns `null`.

There is no radial wash, no veil, and no blurred corner glow anywhere in this
file, and no `--slide-wash`, `--slide-veil`, `--slide-glow`, or
`--slide-spotlight` token behind them. None of the source templates has one, and
on a pale sheet a bloom behind the copy reads as a stain rather than as light.
If a variant is invisible on your projector, raise the alpha on
`--slide-grid-color` rather than adding a layer.

`accent` is painted by two unlayered rules in this file. A base-layer fallback
for it ships in `@deckard/core/styles.css`, but a theme's unlayered CSS always
wins over the base layer, which is why every theme in the registry restates the
pair and why the variant survives a theme swap. The first rule sets
`--background` and `--foreground` on the canvas. The second remaps the ink one
level down, on `[data-slide-frame]`, `[data-slide-header]`, and
`[data-slide-footer]`: a custom property resolves against the element that uses
it, so remapping `--primary` on the same element that reads `var(--primary)` for
the field would flood the slide with its own ink.

The decoration tokens are `--slide-grid-color`, `--slide-grid-size`,
`--slide-hatch`, `--slide-rule`, `--slide-scanline`, and `--slide-halo`, and all
six are part of the contract in `@deckard/core/styles.css`. Meridian paints with
the first three, publishes `--slide-rule` as the hairline colour for anything
that wants one, and leaves `--slide-scanline` and `--slide-halo` at the
contract's `none`. This theme adds no private tokens of its own.

## Block parts

The contract has two halves. Tokens are values, and the sections above cover
them. Data attributes are parts: a block names the piece of itself a theme might
want to reach, and the theme styles that attribute, decorative `::before` and
`::after` content included. A block is then free to change its class names and
its markup as long as the attributes stay where they are. The full list lives in
the "Block part contract" comment at the bottom of `@deckard/core/styles.css`.

What does not belong in a theme is anything that is new content rather than a
treatment of existing content. A boot log, a status table, a cursor line with
words in it are all slide content, so they go in a block the deck composes.

Meridian is quiet here too, and reaches three parts:

- `[data-slide-breaker-index]`, the section numeral a divider carries, is held
  at the plain `--slide-title-size` in `--muted-foreground` with the theme's
  `-0.03em` of tracking. Other themes set the numeral larger than a heading;
  this one refuses to let it outrank the section it introduces.
- `[data-slide-list-marker]` drops to `font-size: 0` and its `::before` draws a
  `0.75rem` round dot in `--primary`, which is the marker the source design puts
  in front of a bullet. Blanking the marker rather than hiding it keeps the row
  in the layout the block set.
- `[data-stat-meter]` takes a `999px` radius, so the proportion bar under a
  figure reads as a pill rather than as a bar chart.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Meridian keeps both nearly silent. No rules, no capitals, and the whole strip
held at three quarters opacity. The contract sizes chrome off
`--slide-label-size`; this theme sets `--slide-chrome-size` to `1.375rem`
instead, a step under even the labels. A middle dot separates
the deck name from the slide title, the counter runs in tabular figures, and the
progress is a 1px hairline on the bottom edge of the canvas in `--border`.

If a deck needs the chrome to be readable from the back of a room, raise
`--slide-chrome-size` and drop the opacity rule. That is the trade this theme
makes on purpose.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, and `--accent` together; the
source design ships teal and plum alternates at the same lightness. Change the
mood by moving `--background`, `--card`, and the background variant colors.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1. The
shipped palette clears 5.4:1 at its worst pair, which is the muted foreground on
the muted surface, so that is the pair to recheck if you lighten either.

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

Decorating it. Every instinct to add a gradient, a glow, or a second accent is
the instinct this theme exists to refuse. If a slide feels empty, the copy is
too short, not the background.

Losing the tracking. Any rule that sets `letter-spacing` on a heading after this
file wins, and the theme goes generic.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.meridian-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
