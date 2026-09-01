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
carry them. `none` paints nothing at all, and `accent` sets `--slide-scanline`
to `none` because scanlines over a lit field read as a fault rather than as a
tube. If you want any other slide without them, set that slide's background to
`none`.

Every corner is square. `--slide-radius`, `--slide-radius-lg`, and `--radius`
are all `0rem`, and `--slide-surface-shadow` is `none`. A terminal has no
rounded windows.

## Typography

JetBrains Mono for headings, body, and code. That is the whole type system, and
the letterforms are the theme rather than a refinement of it.

The face ships with the theme. `theme.css` declares it from
`../fonts/jetbrains-mono-latin.woff2`, one variable file covering weights 400
through 800, which is the range the source design uses. Nothing to wire up in
`app/layout.tsx`, and no font host is called at render time. The licence is SIL
Open Font License 1.1 and travels with the file as
`fonts/jetbrains-mono.OFL.txt`; `deckard eject theme` copies both.

The system mono stack stays behind it in all three tokens, so a build that loses
the file falls back to SF Mono on Apple platforms and Cascadia on Windows rather
than to nothing. `font-display: swap` paints that stack while the woff2 lands.
An English deck downloads 31KB; latin-ext sits behind its own `unicode-range`
and is only fetched by a deck that sets a character in it.

Every size below is set against the 1920x1080 canvas at a 16px root, so `1rem`
is 16 canvas pixels and the numbers read the way they do on a projector rather
than the way they do in a browser window.

| Token                     | Value      | Used by                               |
| ------------------------- | ---------- | ------------------------------------- |
| `--slide-title-size`      | `5.5rem`   | hero and breaker headlines            |
| `--slide-heading-size`    | `3.75rem`  | the `h1` on a content slide           |
| `--slide-subheading-size` | `2.375rem` | an `h2` inside a slide body           |
| `--slide-lead-size`       | `2.375rem` | the sentence under a headline         |
| `--slide-body-size`       | `1.875rem` | bullet copy, the main text of a slide |
| `--slide-code-size`       | `1.875rem` | the type inside a `CodeBlock`         |
| `--slide-support-size`    | `1.625rem` | captions, grid copy, metadata rows    |
| `--slide-label-size`      | `1.5rem`   | eyebrows and other uppercase labels   |

`--slide-code-size` sits at `--slide-body-size` rather than at
`--slide-support-size`, where the contract puts it. This is the one theme where
code is not a supporting element: the slide is already set in the same family,
so a code block below the body size reads as a footnote instead of as the thing
being shown.

The scale is a step under nexus, and the reason is the family. Monospace runs
roughly 20% wider than a proportional sans at the same point size, so the same
headline reaches the same margin from a smaller size. `--slide-title-size` is
`5.5rem`, 88 canvas pixels, where nexus sits at `7rem`, and both fill the same
canvas.

Four sizes sit outside that ladder. `--slide-figure-size` is `7rem` and
`--slide-figure-unit-size` is `3rem`: the figure a metrics block renders is
display type without being a heading, so it sizes itself rather than borrowing
the title size, and the unit suffix takes its own size so it hangs off the
figure instead of matching it. `--slide-meter-size` is the height of the
proportion bar under that figure and comes from the contract at `0.875rem`.
`--slide-chrome-size` is `1.5rem` here; the contract now writes that token as
`var(--slide-label-size)`, so header and footer type reads at the size of an
eyebrow unless a theme says otherwise.

Headings are uppercase at weight 700 with `-0.015em` of tracking. Monospace
capitals sit wide by construction, and pulling them in is what keeps a headline
from reading as a filename.

`--slide-label-tracking` is `0.2em`. The source design writes its eyebrows as
source comments, `// CONTEXT` and `/* FEEDBACK */`. Nothing in the theme enforces
that, but it is a two-character change to the slide copy and it is the detail
that sells the whole thing.

## Spacing

The frame is not a centred column. It is the whole canvas inside
`--slide-padding-inline` and `--slide-padding-block`, left aligned, with no cap
on the measure, so a slide starts at the left margin and runs to the right one.
A slide that wants its content centred centres it inside that frame.

`--slide-padding-inline` is `6rem` and `--slide-padding-block` is `5.25rem`, 96
and 84 canvas pixels, a step tighter than the `7rem` and `6rem` in the contract.
A terminal fills its window.

`--slide-content-gap` is `2.75rem`, the vertical rhythm between the intro block
and the body of a slide. `--slide-item-gap` is `1.5rem`, the gap between the
cards of a grid, the rows a panel stacks, and the breathing room a layout
keeps above and below itself.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

The sheet under the scanlines is flat in all of them. There is no radial wash
and no blurred corner glow left anywhere in the registry, and `--slide-wash`,
`--slide-veil`, `--slide-glow`, and `--slide-spotlight` went out of the contract
with them. None of the source templates has a bloom, and on a pale sheet one
reads as a stain.

- `default` is the scanlines over that flat sheet, and nothing else.
- `grid` is the character cell: vertical rules every `--slide-cell` and
  horizontal rules every `--slide-grid-size`, which together draw the shape of
  the text buffer behind the picture, with the scanlines riding on top.
- `spotlight` is the test card, `--slide-hatch` over the sheet and scanned like
  the rest. The hatch is the diagonal fill the source design puts in an empty
  capture.
- `accent` is the inverted statement slide: the canvas floods with the theme
  accent and the ink flips. The tube is off for it, since scanlines over a lit
  field read as a fault rather than as a CRT.
- `none` renders nothing at all, scanlines included. `SlideBackground` returns
  `null`.

`accent` is painted by two unlayered rules near the bottom of this file. A base
layer fallback ships in `@deckard/core/styles.css`, but a theme's unlayered CSS
always wins over the base layer, which is why every theme in the registry
restates the pair. The first rule reads the field colour on the canvas, moving
`--primary` into `--background` and `--primary-foreground` into `--foreground`.
The second remaps the ink one level down, on `[data-slide-frame]`,
`[data-slide-header]`, and `[data-slide-footer]`, because a custom property
resolves against the element that uses it: remapping `--primary` on the same
element that reads `var(--primary)` for the field would flood the slide with its
own ink. The status bar then flips once more, taking the ink for its bar and the
field for its type, so the footer still reads as one strip.

The colours come from `--slide-scanline`, `--slide-hatch`, `--slide-grid-color`,
`--slide-grid-size`, and `--slide-cell`.

## Block parts

The contract has two halves. Tokens are values: a size, a colour, a gradient.
Data attributes are parts. A block names the piece of itself a theme may reach,
and the theme styles that attribute, decorative `::before` and `::after` content
included. The full list lives in the "Block part contract" comment at the bottom
of `@deckard/core/styles.css`. A block is free to rewrite its markup and its
class names as long as those attributes stay where they are.

Anything that is new content rather than a treatment of existing content belongs
in a block the deck composes, not here. A boot log, a status table, a cursor line
with words in it are all slide copy, and copy in a stylesheet cannot be edited,
translated, or read by a screen reader.

What this theme does with the parts it reaches:

- `[data-slide-eyebrow]` gets `//` in front of it, because the source design
  writes its eyebrows as source comments.
- `[data-slide-list-marker]` drops to `font-size: 0` and a `::before` writes
  `[x]` back at `--slide-support-size`. The number goes to zero rather than
  `display: none` so the rail keeps its width and the copy stays on the same
  column as every other list in the deck.
- `[data-slide-card-title]` carries a status light before the words, a square
  `0.34em` on a side filled with `--primary` and lit with the halo.
- `[data-slide-hero-meta]` ends in a block cursor, a filled `::after` blinking
  on a 1.1s step. A `prefers-reduced-motion: reduce` rule drops the animation
  and leaves the cursor lit.
- `[data-stat-value]` takes the same `text-shadow` as `h1` and `h2`, since a
  metrics figure is display type without being a heading element.
- `[data-stat-meter]` takes its border in `--primary`.
- `[data-slide-breaker-index]` is set at 1.6 times `--slide-title-size`, with
  the halo on it.

## Theme-private tokens

`--slide-scanline`, `--slide-halo`, `--slide-rule`, and `--slide-hatch` are in
the token contract in `@deckard/core/styles.css` now rather than private here,
so a theme that wants a scanned sheet or a hatched plate sets a value instead of
inventing a name. `--slide-scanline` is the repeating gradient, two dark pixels
every five, and it is `none` in light mode, which is why every variant renders
flat on paper without a second rule. Set it to `none` in dark to keep the
palette and drop the tube. `--slide-hatch` is the 135 degree fill behind a
reserved plate, drawn in `--slide-grid-color` so it stays quiet under body copy.
`--slide-rule` is the hairline colour, the border green here. `--slide-halo` is
the bloom on `h1`, `h2`, and the parts listed above, `none` in light mode.

One token is private to this theme. `--slide-cell` is the column width of the
`grid` variant, the width of one character cell. Pair it with
`--slide-grid-size` for the row height. The shipped ratio is `1.25rem` to
`2.25rem`, which is close to a real terminal's cell.

Each is declared in the light block, and the ones that change with the mode are
redeclared in dark. `--slide-hatch` is not one of them: it draws itself in
`--slide-grid-color`, which is, so the fill follows the mode on its own.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

Phosphor reads the pair as a terminal. The head is a command line: a dashed rule
under it, `>` before the deck name in the halo the headings carry, and `::`
before the slide title. The foot is the status bar, held in reverse video on
`--primary`, with the counter in brackets and the separator swapped for a slash
through `[data-slide-counter-separator]`.

A status bar is one line of cells, not a band, so it holds itself a line thinner
than the base footer and gives that line back to the slide:
`--slide-footer-space` is `5.5rem` here rather than the `6rem` in the token
contract.

The progress bar sits along the bottom of that bar, a solid 3px fill in
`currentcolor` so it reads as one lit run rather than a row of cells cut
wherever the deck happens to be.

## Safe to change

Every token in `theme.css` is meant to be edited. The source design ships amber
and cyan phosphors alongside the green: those move `--foreground`,
`--muted-foreground`, `--border`, `--primary`, `--slide-grid-color`,
`--slide-rule`, and `--slide-halo` onto a new hue while leaving lightness alone.
Changing the hue number on those and leaving every lightness value untouched is
the safe way to do it, and the contrast numbers come out the same.

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

Raising the type scale further. Monospace is wide, and every size token here is
already set to fill the 1920x1080 canvas with that in mind, so the next step up
takes a title to a fourth line rather than to a bigger one.
`pnpm deck:check-overflow` is the check that catches it.

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
