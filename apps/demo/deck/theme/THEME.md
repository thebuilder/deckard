# Demo theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background, scoped to `.demo-theme` on the slide canvas. `index.ts`
exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

It started as the built-in `broadsheet` theme, ejected unchanged into
`deck/theme/`. Everything below is what this deck changed after that, and why.
Read this before editing a token, because several of these values are load
bearing for slides that already exist.

## What stayed

Warm newsprint in light, warm ink in dark. Flat surfaces: `--slide-radius` is
`0.125rem` and `--slide-surface-shadow` is `none`, so a content card is a panel
with a hairline rule around it rather than a floating object. Serif headings with
`-0.015em` of tracking. The `default` background, which is bare stock with one
hairline across the head where a paper carries its folio, and the ruled-paper
`grid` variant.

The `accent` variant stayed word for word. It is the inverted statement slide:
the canvas floods with `--primary` and the ink flips to `--primary-foreground`.
Two unlayered rules paint it here, the same two every registry theme carries. A
base-layer fallback ships in `@deckard/core/styles.css`, but a theme's unlayered
CSS always wins over the base layer, so each theme restates the pair and the
variant survives an eject. The field colour is read on the canvas and the ink is
remapped one level down, on `[data-slide-frame]`, `[data-slide-header]`, and
`[data-slide-footer]`, because a custom property resolves against the element
that uses it: remapping `--primary` on the element that reads `var(--primary)`
for the field would flood the slide with its own ink. Leave both rules alone
unless the deck is changing what a statement slide means.

## What changed

### The accent is teal, not oxblood

```
- --primary: oklch(0.47 0.15 31)      /* light: oxblood  */
+ --primary: oklch(0.44 0.088 205)    /* light: deep teal */
- --primary: oklch(0.75 0.13 48)      /* dark: terracotta */
+ --primary: oklch(0.81 0.098 197)    /* dark: pale teal  */
```

`--ring` moves with it, and `--accent` / `--accent-foreground` move to the same
hue so an inline code chip belongs to the accent rather than sitting beside it.

Broadsheet's oxblood is a warm red on warm paper, which is coherent and which
made every eyebrow read as part of the sheet instead of as a label on it. This
deck is about measurement, and it needs one cool note that the paper cannot
absorb. Teal is the only hue in the theme that is not warm, and it is used in
exactly four places: eyebrows, the primary button, focus rings, and the code
chip.

### Serif headings, sans body

```
- --slide-font-body: ui-serif, Georgia, "Iowan Old Style", ...
+ --slide-font-body: var(--font-sans)
```

Broadsheet is serif top to bottom, which is right for a deck that is mostly
prose. Eight slides in this deck put identifiers, file paths, and script names
inside running sentences. Georgia sets `deck:check-overflow` next to "builds,
serves, and measures" at visibly different weights, and the sentence comes apart.
The headings stay serif, so the editorial voice survives where it does the work.

### The scale sits one step under broadsheet's

Broadsheet sets its type and its margins to the numbers the source templates
draw on a 1920x1080 canvas. This deck follows it up to a point and then stops
one step short, because broadsheet's title is sized for a headline of three or
four words and every headline here is a full sentence.

```
- --slide-padding-inline:  8rem       + 7rem
- --slide-padding-block:   6.5rem     + 5.75rem
- --slide-content-gap:     2.75rem    + 2.5rem
- --slide-item-gap:        1.625rem   + 1.5rem
- --slide-title-size:      7.5rem     + 6.5rem
- --slide-heading-size:    4.75rem    + 4.25rem
- --slide-subheading-size: 2.75rem    + 2.5rem
- --slide-lead-size:       2.75rem    + 2.5rem
- --slide-body-size:       2.0625rem  + 1.9375rem
- --slide-code-size:       1.875rem   + 1.75rem
- --slide-support-size:    1.75rem    + 1.625rem
- --slide-label-size:      1.5rem     + 1.4375rem
- --slide-label-tracking:  0.22em     + 0.2em
- --slide-figure-size:     8.5rem     + 7.5rem
- --slide-figure-unit-size: 3.5rem    + 3.25rem
- --slide-chrome-size:     1.5rem     + 1.375rem
```

Every number is set against the canvas at a 16px root, so `1rem` is 16 canvas
pixels: this deck's `1.9375rem` body line is 31 of them and broadsheet's
`2.0625rem` is 33. The frame is the whole canvas inside
`--slide-padding-inline` and `--slide-padding-block`, left aligned, with no
measure cap and no centred column, so those two margins are the only thing
holding a slide off the edge.

`pnpm demo:check-overflow` is the check that matters when any of these move.
Raising one of them is what pushes a slide past the frame, and the deck already
sits close to it: four slides had to lose a clause when the scale went up.

`--slide-label-tracking` came down because sans capitals are narrower than serif
capitals, and broadsheet's `0.22em` reads as gappy on them.

`--slide-meter-size`, the height of the proportion bar under a stat figure, is
the contract's `0.875rem` in both themes.

### Nested panels recede instead of rising

```
- --slide-surface-muted: oklch(0.955 0.012 84 / 68%)   /* lighter than the sheet */
+ --slide-surface-muted: oklch(0.925 0.014 84 / 62%)   /* darker than the sheet  */
+ --slide-surface-muted: oklch(0.17 0.012 58 / 55%)    /* dark mode, same idea   */
```

Broadsheet's muted surface is a shade lighter than the paper, which is invisible
once it sits inside a content card that is also lighter than the paper. With no
shadow to separate them, a feature card read as a border alone. Going one step
darker than the sheet gives the nesting a direction.

### `spotlight` is a plate, not columns

Broadsheet paints two vertical rules at the thirds, the way a broadsheet splits a
page. This deck paints `--slide-hatch`, the 135 degree fill a printed report
reserves a figure with, under a 2px rule set low in the canvas at 14% of the
canvas height and inset 5.5% on each side.

The column rules are newspaper furniture, and the only slide here that uses
`spotlight` is a left-aligned section breaker. The rule at 33% landed inside the
headline. The plate reads as a reserved space instead, which is what a section
break in a talk is.

`--slide-hatch` is drawn in `--slide-grid-color`, this theme's own quiet ink, so
the fill stays under body copy rather than competing with it. Broadsheet defines
`--slide-hatch` to the same gradient and paints nothing with it.

There is no wash, no veil, and no blurred glow in this file, and no
`--slide-wash`, `--slide-veil`, `--slide-glow`, `--slide-spotlight`, or
`--slide-horizon` token behind them. None of the source templates has one, and
on warm stock a bloom behind the copy reads as a stain rather than as light.

### Ruled paper, spaced for the sans body

```
- --slide-grid-size: 2.75rem   + 3.5rem
```

Rules spaced for a `2.0625rem` serif line sit too close under a `1.9375rem` sans
line and start to look like a texture rather than a baseline.

### Inline code is a chip

New in this theme:

```css
.demo-theme :not(pre) > code {
  background-color: var(--accent);
  color: var(--accent-foreground);
  ...
}
```

Broadsheet only sets the mono family on `code`. That is enough when code appears
in a block. This deck writes `"use client"` and `deck:validate` in the middle of
sentences, and undecorated mono at `0.92em` disappears into the line. The chip is
accent-tinted rather than bordered, so it reads as a thing being named and not as
emphasis.

## Deck chrome

The runtime renders the header and the footer and names their parts, the way it
does with backgrounds. The header holds `[data-slide-header-brand]`, the deck
name as a link; `[data-slide-header-title]`, the current slide, rendered only
when the slide has a title of its own; and `[data-slide-header-meta]`, one line
of standing detail, rendered only when `deck.ts` sets `header.meta`. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

The demo deck keeps broadsheet's running head: masthead small caps, the slide
title italic in the middle of the line, the date right, and the folio centered at
the foot in small caps. Both strips are set in `--slide-font-heading`, which is
the serif, while the slide body is sans.

It differs from broadsheet in two places. Broadsheet has no progress bar, and
this deck keeps a 2px rule along the bottom edge of the canvas in `--primary`,
because a talk has a length and a page does not. And the footer rule is drawn in
`--slide-chrome-border`, which is `--border` here and `--slide-rule` in
broadsheet, so the line under the folio is a hairline rather than a printed rule.

## Block parts

The contract has two halves. Tokens are values, and every diff above moves one
of them. Data attributes are parts: a block names the piece of itself a theme
might want to reach, and the theme styles that attribute, decorative `::before`
and `::after` content included. A block is then free to change its class names
and its markup as long as the attributes stay where they are. The full list
lives in the "Block part contract" comment at the bottom of
`@deckard/core/styles.css`.

What does not belong in a theme is anything that is new content rather than a
treatment of existing content. A boot log, a status table, a cursor line with
words in it are all slide content, so they go in a block this deck composes
under `app/slides/blocks/`, not in `theme.css`.

This file styles no block parts at all. Beyond the `accent` variant and the deck
chrome, every named part renders the way the block sets it: the section numeral
comes out at `--slide-title-size` in `--primary` because `templates.tsx` puts it
there, and a list marker is a plain figure. A change to how numerals or markers
look on every slide belongs here; a change to what one slide says does not.

## Removed

Broadsheet's block-part rules are gone. It sets `[data-slide-breaker-index]` in
the heading face at `calc(var(--slide-title-size) * 1.5)` on `0.8` leading, and
puts `[data-slide-list-marker]` and `[data-slide-hero-meta]` into small caps
with oldstyle figures. Neither rule was carried over, which is why the section
numeral here is the block's own and not an oversized chapter number.
Broadsheet's oldstyle figures on `[data-slide-header-meta]` went with them. If
you reinstall broadsheet over this file, all four come back.

## The rules that still bind

Every token the dark block defines has to exist in the light block above it, or
light mode renders without it. `pnpm demo:validate` fails on that, and on a class
name in `index.ts` that the stylesheet does not carry.

Keep contrast: body copy against `--background` and against `--slide-surface`
both have to clear 4.5:1.

Style inside the canvas with semantic tokens (`bg-card`, `text-muted-foreground`)
or slide tokens (`--slide-title-size`, `--slide-surface`). Never a hardcoded
color, and never a background variant styled in a React component. The component
is a hook, the variant look lives here.
