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
`-0.015em` of tracking. Generous print margins. The `default` background wash and
the ruled-paper `grid` variant.

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

### The scale came down at the top and up at the bottom

```
- --slide-title-size:      5rem       + 4.5rem
- --slide-heading-size:    3.75rem    + 3.25rem
- --slide-subheading-size: 2rem       + 1.875rem
- --slide-body-size:       1.7rem     + 1.5rem
- --slide-support-size:    0.9375rem  + 1.0625rem
- --slide-label-tracking:  0.22em     + 0.2em
```

A sans body at `1.5rem` carries about a fifth more words per line than serif at
`1.7rem`, so the body size came down without losing a word. The headings came
down with it to keep the intervals.

`--slide-support-size` is the one that went up, and it is the one that cost
something. Broadsheet uses `0.9375rem` for captions and labels. This deck uses
the same token for whole sentences inside feature cards, and at `0.9375rem` those
sentences did not read from the back of a room. Raising it three pixels clipped
two slides, `deck:check-overflow` named both, and both lost a sentence. If you
lower it again, those slides will look thin rather than break.

`--slide-label-tracking` came down because sans capitals are narrower than serif
capitals, and broadsheet's `0.22em` reads as gappy on them.

### Nested panels recede instead of rising

```
- --slide-surface-muted: oklch(0.955 0.012 84 / 68%)   /* lighter than the sheet */
+ --slide-surface-muted: oklch(0.925 0.014 84 / 62%)   /* darker than the sheet  */
+ --slide-surface-muted: oklch(0.17 0.012 58 / 55%)    /* dark mode, same idea   */
```

Broadsheet's muted surface is a shade lighter than the paper, which is invisible
once it sits inside a content card that is also lighter than the paper. With no
shadow to separate them, a feature card read as a border and nothing else. Going
one step darker than the sheet gives the nesting a direction.

### `spotlight` is a horizon, not columns

Broadsheet paints two vertical rules at the thirds, the way a broadsheet splits a
page, plus a centre ellipse and a bottom fade. This deck paints one wide glow
high on the canvas, a lit band across the bottom third, and a hairline along the
top edge of that band.

The column rules are newspaper furniture, and the only slide here that uses
`spotlight` is a left-aligned section breaker. The rule at 33% landed inside the
headline. The horizon reads as a stage instead, which is what a section break in
a talk is.

This adds `--slide-horizon` and drops `--slide-rule`.

### Ruled paper, spaced for the sans body

```
- --slide-grid-size: 2.75rem   + 3.5rem
```

Rules spaced for a `1.7rem` serif line sit too close under a `1.5rem` sans line
and start to look like a texture rather than a baseline.

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
when the slide has a title of its own; and `[data-slide-header-date]`, rendered
only when `deck.ts` sets one. The footer holds `[data-slide-counter]`, split
into `[data-slide-counter-current]`, `[data-slide-counter-separator]`, and
`[data-slide-counter-total]`, and `[data-slide-progress]`, which carries the
position in the deck as a fraction on `--slide-progress`.

The demo deck keeps broadsheet's running head: masthead small caps, the slide
title italic in the middle of the line, the date right, and the folio centered at
the foot in small caps. Both strips are set in `--slide-font-heading`, which is
the serif, while the slide body is sans.

It differs from broadsheet in one place. Broadsheet has no progress bar, and this
deck keeps a 2px rule along the bottom edge of the canvas in `--primary`, because
a talk has a length and a page does not.

## Removed

`--slide-rule` is gone. Broadsheet defines it in both color blocks and no rule in
that stylesheet, no block, and no runtime component reads it. If you reinstall
broadsheet over this file, it comes back unused.

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
