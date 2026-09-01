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

| Token                     | Used by                                  |
| ------------------------- | ---------------------------------------- |
| `--slide-title-size`      | hero and breaker headlines               |
| `--slide-heading-size`    | the `h1` on a content slide              |
| `--slide-subheading-size` | an `h2` inside a slide body              |
| `--slide-lead-size`       | the sentence under a headline            |
| `--slide-body-size`       | bullet copy, the main text of a slide    |
| `--slide-support-size`    | captions, grid copy, code, metadata rows |
| `--slide-label-size`      | eyebrows and other uppercase labels      |

The scale is the tightest of the four themes in this registry, and every size is
a step under the default theme. That is deliberate. With no decoration on the
slide, the type is the only thing setting hierarchy, and a compressed scale
reads as composed where a wide one reads as loud.

`h1` and `h2` carry `-0.03em` of tracking. `h3` through `h6` carry `-0.02em` and
drop to weight 500. That negative tracking is the single most identifiable thing
about this theme. Set the same headline at `0` and it stops looking like
Meridian and starts looking like a default Tailwind page.

`--slide-label-tracking` is `0.16em`, tighter than every other theme here,
because the labels are short and set in mono.

## Spacing

`--slide-padding-inline` is `2rem` and `--slide-padding-block` is `2.75rem`,
both modest. The negative space in this theme comes from the empty regions of
the layout rather than from the frame.

`--slide-content-gap` is the vertical rhythm between the intro block and the
body of a slide. `--slide-radius` is `0.625rem` on cards and code blocks and
`--slide-radius-lg` is `0.875rem` on the outer content card and media frames.
The source design offers a square and a round variant at 0px and 22px; both work
here if you move the two tokens together.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide.

- `default` paints one wash down from the head of the canvas and one faint lift
  along the floor. There is no corner glow and no second layer.
- `grid` paints a `3.5rem` square grid at low alpha and fades it to the
  background outside a center ellipse, so the grid is visible at the margins and
  gone behind the copy.
- `spotlight` paints one wide radial off the top edge plus the bottom scrim the
  source design puts under full-bleed media.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The alphas here are half what the other themes use. If a variant is invisible on
your projector, raise `--slide-wash` and `--slide-spotlight` rather than adding
a layer.

The colors come from `--slide-wash`, `--slide-veil`, `--slide-glow`,
`--slide-grid-color`, `--slide-grid-size`, and `--slide-spotlight`. This theme
adds no private tokens of its own.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-date]`, rendered
only when `deck.ts` sets one. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Meridian keeps both nearly silent. No rules, no capitals, one step below the body
size, and the whole strip held at three quarters opacity. A middle dot separates
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
