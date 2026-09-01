# Phosphor theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.phosphor-theme` on the slide
canvas. `index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to
`defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A green CRT. Dark is the home mode and `index.ts` pins
`defaultColorMode: "dark"`. Light mode exists, is complete, and turns the tube
off: no scanlines, no glow, dark green ink on a pale green sheet. Use it for
handouts and for printing.

Three things carry the theme. One family, monospace, for every word on the
slide. Scanlines painted across every background variant. A phosphor bloom on
display headings through `--slide-halo`.

The scanlines are the part worth understanding before you edit anything. They
are not decoration layered on top of a background; they are the first layer of
every variant's `background-image`, so `default`, `grid`, and `spotlight` all
carry them and only `none` does not. If you want a slide without them, set that
slide's background to `none`.

Every corner is square. `--slide-radius`, `--slide-radius-lg`, and `--radius`
are all `0rem`, and `--slide-surface-shadow` is `none`. A terminal has no
rounded windows.

## Typography

`ui-monospace` for headings, body, and code. That is the whole type system.

The original design used JetBrains Mono at weights 400 through 800. What ships
here is the system mono, which is SF Mono on Apple platforms, Cascadia on
Windows, and whatever the browser picks elsewhere. If you want JetBrains Mono,
load it in `app/layout.tsx` and put it at the front of all three font tokens
together. It is the one font swap in this registry that changes the theme
rather than refining it, since the letterforms are the theme.

| Token                     | Used by                                  |
| ------------------------- | ---------------------------------------- |
| `--slide-title-size`      | hero and breaker headlines               |
| `--slide-heading-size`    | the `h1` on a content slide              |
| `--slide-subheading-size` | an `h2` inside a slide body              |
| `--slide-lead-size`       | the sentence under a headline            |
| `--slide-body-size`       | bullet copy, the main text of a slide    |
| `--slide-code-size`       | the type inside a `CodeBlock`            |
| `--slide-support-size`    | captions, grid copy, metadata rows       |
| `--slide-label-size`      | eyebrows and other uppercase labels      |

`--slide-code-size` is `1.25rem` here against a `1.125rem` default. This is the
one theme where code is not a supporting element: the slide is already set in
the same family, so a code block that sits below the body size reads as a
footnote instead of as the thing being shown.

This is the smallest scale in the registry, and it has to be. Monospace runs
roughly 20% wider than a proportional sans at the same point size, so a title at
the default theme's `4.5rem` would take four lines where the sans takes two.
`--slide-title-size` is `3.75rem` for that reason alone. Raising it is the
fastest way to break a hero slide in this theme.

Headings are uppercase at weight 700 with `-0.015em` of tracking. Monospace
capitals sit wide by construction, and pulling them in is what keeps a headline
from reading as a filename.

`--slide-label-tracking` is `0.2em`. The source design writes its eyebrows as
source comments, `// CONTEXT` and `/* FEEDBACK */`. Nothing in the theme enforces
that, but it is a two-character change to the slide copy and it is the detail
that sells the whole thing.

## Spacing

`--slide-padding-inline` is `2rem` and `--slide-padding-block` is `2.5rem`, the
tightest in the registry. A terminal fills its window.

`--slide-content-gap` is the vertical rhythm between the intro block and the
body of a slide.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints, using the canvas
variables `--canvas-width` and `--canvas-height` for anything sized against the
slide.

- `default` is scanlines over a soft bloom behind the copy, with a low glow along
  the floor.
- `grid` is the character cell: vertical rules every `--slide-cell` and
  horizontal rules every `--slide-grid-size`, which together draw the shape of
  the text buffer behind the picture. Scanlines ride on top and the whole thing
  fades to the background outside a center ellipse.
- `spotlight` is the tube. Bloom at the center, falloff into every corner,
  scanlines throughout.
- `none` renders nothing at all, scanlines included. `SlideBackground` returns
  `null`.

The colors come from `--slide-wash`, `--slide-veil`, `--slide-glow`,
`--slide-grid-color`, `--slide-grid-size`, and `--slide-spotlight`, plus three
tokens this theme adds.

## Theme-private tokens

`--slide-scanline` is the repeating gradient, two dark pixels every five. It is
`none` in light mode, which is why every variant renders flat on paper without a
second rule. Set it to `none` in dark to keep the palette and drop the tube.

`--slide-cell` is the column width of the `grid` variant, the width of one
character cell. Pair it with `--slide-grid-size` for the row height. The shipped
ratio is `1.25rem` to `2.25rem`, which is close to a real terminal's cell.

`--slide-halo` is the bloom on `h1` and `h2`, `none` in light mode.

All three are defined in the light block and overridden in dark, like every
other token here.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-date]`, rendered
only when `deck.ts` sets one. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Phosphor reads the pair as a terminal. The head is a command line: a dashed rule
under it, `>` before the deck name in the halo the headings carry, and `::`
before the slide title. The foot is the status bar, held in reverse video on
`--primary`, with the counter in brackets and the separator swapped for a slash
through `[data-slide-counter-separator]`.

The progress bar sits along the bottom of that bar and is drawn in character
cells, a repeating gradient in `currentcolor`, so it fills in steps rather than
sliding.

## Safe to change

Every token in `theme.css` is meant to be edited. The source design ships amber
and cyan phosphors alongside the green: those move `--foreground`,
`--muted-foreground`, `--border`, `--primary`, and the three background tints
onto a new hue while leaving lightness alone. Changing the hue number on those
and leaving every lightness value untouched is the safe way to do it, and the
contrast numbers come out the same.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1. The
shipped palette clears 5.5:1 at its worst pair. Note that `--muted-foreground`
in dark sits a step lighter than the source design, which measured 5.55:1
against the muted surface once the surface alpha composited; the value here
holds 5.97:1.

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

Putting a photograph on a phosphor slide. The scanlines sit behind the content,
not over the media, so a full-color image on a green terminal reads as a
different deck. Use `background: "none"` on media slides, or keep the images
duotone.

Raising the type scale. Monospace is wide. Every size token here was set against
the 1920x1080 canvas with that in mind, and `pnpm deck:check-overflow` is the
check that catches it.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.phosphor-theme`.

Assuming `.dark` on `<html>` is the only switch. This theme defaults the canvas
to dark through `data-slide-color-mode`, and the dark block matches both that
and `.dark` on the document. Copy that selector pair when you add a
mode-dependent rule.
