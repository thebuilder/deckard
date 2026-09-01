# Broadsheet theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.broadsheet-theme` on the slide
canvas. `index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to
`defineDeck`.

Nothing here reaches the utility bar, the command center, the presenter console,
or any dialog. Those keep the app tokens in `app/globals.css` so they stay
readable whatever the deck looks like.

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

Headings carry `-0.015em` of tracking. Serif display faces set loose at 5rem,
and pulling them in is what keeps a title from looking like body copy scaled up.
Code and `kbd` reset tracking to zero, since the mono face is already even.

| Token                     | Used by                                  |
| ------------------------- | ---------------------------------------- |
| `--slide-title-size`      | hero and breaker headlines               |
| `--slide-heading-size`    | the `h1` on a content slide              |
| `--slide-subheading-size` | an `h2` inside a slide body              |
| `--slide-lead-size`       | the sentence under a headline            |
| `--slide-body-size`       | bullet copy, the main text of a slide    |
| `--slide-support-size`    | captions, grid copy, code, metadata rows |
| `--slide-label-size`      | eyebrows and other uppercase labels      |

The scale runs one step larger than the default theme at the top and one step
smaller at the bottom. Serif copy at 1.7rem reads at the back of a room, and
serif captions below 0.9rem stop resolving on a projector.

`--slide-label-tracking` is `0.22em`, tighter than the default. Serif capitals
have more width built in than sans capitals, so the same tracking value reads as
too loose here.

## Spacing

`--slide-padding-inline` is `2.5rem` and `--slide-padding-block` is `3rem`, both
wider than the default theme. Print margins are generous, and the flat surfaces
have no shadow to hold them off the edge.

`--slide-content-gap` is the vertical rhythm between the intro block and the
body of a slide. `--slide-radius` and `--slide-radius-lg` are both near zero on
purpose. Do not raise one without the other, or media frames and content cards
stop matching.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide.

- `default` paints a warm wash down from the top edge, a soft ellipse behind the
  headline, and a low glow along the bottom.
- `grid` paints horizontal rules every `--slide-grid-size`, like ruled paper,
  and fades them into the background at the top and bottom edges. There are no
  vertical rules. A square grid fights serif copy.
- `spotlight` paints two vertical column rules at the thirds, the way a
  broadsheet splits a page, plus a center ellipse and a bottom fade.
- `none` renders nothing at all. `SlideBackground` returns `null`.

The colors come from `--slide-wash`, `--slide-veil`, `--slide-glow`,
`--slide-grid-color`, `--slide-grid-size`, and `--slide-spotlight`. Dark mode
carries them at higher alpha, because a wash that reads on paper disappears on a
dark sheet.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, and `--ring` together. Change the paper by
moving `--background`, `--card`, and the background variant colors.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1.

If you change the class name, change it in `index.ts` too. The class in the
`SlideTheme` and the selector in the stylesheet are the same string, and nothing
checks that for you.

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

Adding a shadow back. `--slide-surface-shadow` is `none` because the borders are
sized to carry the separation on their own. A shadow on top of them reads as a
mistake rather than as depth.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the utility bar and the presenter console too. Everything in this file
starts at `.broadsheet-theme`.

Assuming `.dark` on `<html>` is the only switch. A deck can pin the canvas
through `data-slide-color-mode`, and the dark block matches both. Copy that
selector pair when you add a mode-dependent rule.
