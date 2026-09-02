# Aurora theme

This directory is the deck's look. `theme.css` holds every audience-facing color,
size, and background in the deck, scoped to `.aurora-theme` on the slide canvas.
`index.ts` exports the `SlideTheme` that `deck/deck.ts` hands to `defineDeck`.

The header and the footer belong to this file. They are painted inside the
canvas, so they scale with the deck and print with it. Nothing here reaches the
deck controls in the corner, the command center, the presenter console, or any
dialog. Those keep the app tokens in `app/globals.css` so they stay readable
whatever the deck looks like.

## Visual direction

A lit field behind a quiet deck. Four background variants paint in a WebGL
canvas instead of in CSS, and every other slide is one flat colour with type on
it. That split is the theme: the slides that open, break, state, and close carry
the field, and the slides in between carry the argument.

Dark is the home mode and `index.ts` pins `defaultColorMode: "dark"`. Light mode
is complete, field colours included, and it reads as the daylight version of the
same deck rather than as a second theme.

Body copy runs at the lightest weight Manrope ships here, under display type set
in Space Grotesk with heavy negative tracking. The distance between those two
weights is what carries a slide the field does not reach.

## Typography

Space Grotesk for display, Manrope for body, IBM Plex Mono for labels, code, and
the deck chrome. All three are the source design's own, and all three ship with
the theme: `theme.css` declares them from `../fonts/`, so there is nothing to
load in `app/layout.tsx` and no font host is called at render time. Every family
is SIL Open Font License 1.1, covered by `fonts/space-grotesk.OFL.txt`,
`fonts/manrope.OFL.txt`, and `fonts/ibm-plex-mono.OFL.txt`.

Space Grotesk and Manrope are both variable across the weights this theme asks
for, so each is one file per subset. IBM Plex Mono is not variable and is
already vendored for the other themes that use it, which is why the mono face
here costs a deck nothing extra when it also loads one of those.

Each family stays at the front of the system stack it replaces, so a build that
loses a file degrades rather than fails, and `font-display: swap` paints that
stack while the woff2 lands. latin-ext sits behind its own `unicode-range` and
is only fetched by a deck that sets a character in it.

Every size below is set against the 1920x1080 canvas at a 16px root, so `1rem`
is 16 canvas pixels. The values are the source design's own scale, and they are
in `theme.css`.

| Token                     | Used by                               |
| ------------------------- | ------------------------------------- |
| `--slide-title-size`      | hero and breaker headlines            |
| `--slide-heading-size`    | the `h1` on a content slide           |
| `--slide-subheading-size` | an `h2` inside a slide body           |
| `--slide-lead-size`       | the sentence under a headline         |
| `--slide-body-size`       | bullet copy, the main text of a slide |
| `--slide-code-size`       | the type inside a `CodeBlock`         |
| `--slide-support-size`    | captions, grid copy, metadata rows    |
| `--slide-label-size`      | eyebrows and other uppercase labels   |

The display size is the largest in the registry, and the step under it is a long
way down. A hero title of more than about five words runs to three lines and
starts eating the field, so cut the title rather than the size. Run
`pnpm deck:check-overflow` after writing hero copy.

`--slide-label-tracking` is narrower than the registry's other themes take, and
the chrome is tracked out further than the labels. Labels are set in the body
face and the chrome in mono, which reads wider at the same tracking.

## Spacing

The frame is the whole canvas inside `--slide-padding-inline` and
`--slide-padding-block`, left aligned, with no measure cap and no centred
column. A slide that wants its content centred centres it inside that frame.

One `--slide-padding-block` covers both edges. The source design rules a
slightly shallower bottom margin than top, which is a distinction the contract
does not carry, so the top margin is the one this theme takes.

`--slide-content-gap` is the rhythm between the intro block and the body of a
slide. `--slide-item-gap` is the gap between the cards of a grid and the rows a
panel stacks; it is tighter than the content gap by more than a step, which is
what keeps a grid reading as one object under this much display type.

Both radius tokens carry the source design's one corner. Move them together or
media frames stop matching content cards.

## Background variants

`SlideBackground` renders one empty `div` with `data-slide-background` and no
styling of its own. This file decides what each variant paints.

- `default` is the flat sheet. Nothing is drawn on it.
- `grid` is a plain cell grid in `--slide-grid-color` at `--slide-grid-size`.
- `spotlight` is `--slide-hatch`, a fine 120 degree rule field.
- `accent` is the inverted statement slide: the canvas floods with the theme
  accent and the ink flips.
- `none` renders nothing at all. `SlideBackground` returns `null`.
- `hero`, `breaker`, `statement`, and `closing` are the fields, below.

`accent` is painted by two unlayered rules near the bottom of this file. A base
layer fallback ships in `@deckard/core/styles.css`, and a theme's unlayered CSS
always wins over the base layer, so every theme in the registry restates the
pair. The first rule reads the field colour on the canvas, moving `--primary`
into `--background` and `--primary-foreground` into `--foreground`. The second
remaps the ink one level down, on `[data-slide-frame]`, `[data-slide-header]`,
and `[data-slide-footer]`, because a custom property resolves against the
element that uses it: remapping `--primary` on the same element that reads
`var(--primary)` for the field would flood the slide with its own ink.

## The motion fields

`index.ts` names four variants in `motion`, which is what makes
`SlideBackground` render a canvas inside the background layer for them:

| Variant     | Field    | Where it goes in a deck                    |
| ----------- | -------- | ------------------------------------------ |
| `hero`      | `aurora` | The opener, and any slide that reopens one |
| `breaker`   | `aurora` | A section break                            |
| `statement` | `wash`   | The one sentence a deck is built around    |
| `closing`   | `waves`  | The last slide, and a thank-you            |

The three fields are the shader programs `@deckard/core` ships: `aurora` is
banded curtains over noise, `waves` is a horizontal band that undulates, and
`wash` is a soft noise field with a dither. A deck picks a field by picking the
variant whose name matches the moment it is on, so `background: "closing"` on a
mid-deck slide is a legal way to ask for the wave field.

Each variant sets `--slide-motion-color-1`, `--slide-motion-color-2`, and
`--slide-motion-color-3` on the background layer, which the canvas inherits and
the runtime reads off it. They follow the color mode like every other colour
here: the dark values are the source design's, and the light values are this
theme's own, pale enough that the deck's dark ink still reads on them.

`--slide-motion-speed` is left at the contract default. Set it on a variant to
move that field alone; the runtime clamps it to the range in
`packages/core/src/lib/motion-field.ts`.

**Each variant also paints a gradient of its own three colours.** The canvas
covers that gradient once WebGL is up, and the gradient is what an audience sees
while the runtime chunk is loading, on a machine with no WebGL, and after a lost
context. Change one of the three colours and both halves move together, because
the gradient is written in the same custom properties the shader reads. A
variant that paints nothing underneath its canvas renders as a bare sheet on
every one of those paths.

A field carries display type and nothing smaller. The brightest band in the dark
sets holds 3.6:1 against the deck's ink, which clears the large-text threshold a
headline is measured against and misses the 4.5:1 body copy is measured against.
A paragraph over a field is the thing to move onto the flat sheet.

A frozen field still draws. It renders one fixed frame and holds it, so a
screenshot, a contact sheet, and a PDF page of the same slide are the same
image. Reduced motion, a running capture, the presenter preview, and a deck or
slide that asks for `motion: "frozen"` each freeze it.

The four variants also lighten `--slide-chrome-border` and
`--slide-progress-track` to a mix off the foreground, because the border colour
that reads on the flat sheet disappears against a field.

## Block parts

The contract has two halves. Tokens are values: a size, a colour, a gradient.
Data attributes are parts. A block names the piece of itself a theme may reach,
and the theme styles that attribute, decorative `::before` and `::after` content
included. The full list lives in the "Block part contract" comment at the bottom
of `@deckard/core/styles.css`. A block is free to rewrite its markup and its
class names as long as those attributes stay where they are.

A theme treats existing content and never adds new content. A boot log, a status
table, a cursor line with words in it are all slide copy, and copy in a
stylesheet cannot be edited, translated, or read by a screen reader.

What this theme does with the parts it reaches:

- `[data-slide-panel]`, the panel a `ContentSlideCard` frames its body in, is
  the emphasised surface: a `120deg` gradient from `--secondary` to
  `--slide-surface`, lit from the top left corner. Every other surface stays
  flat, so one box on a slide is the raised one.
- `[data-slide-breaker-index]` is set in the display face at a multiple of
  `--slide-title-size`, in the accent at 70%, on a line tighter than one.
- `[data-stat-value]`, `[data-slide-statement-text]`, and
  `[data-slide-quote-text]` take the display face and its tracking. All three
  are display type without being heading elements, so the `h1, h2` rule does not
  reach them.
- `[data-slide-hero-meta]`, `[data-slide-list-marker]`, `[data-stat-unit]`,
  `[data-slide-contents-index]`, `[data-slide-column-index]`,
  `[data-slide-note-index]`, `[data-slide-rail-term]`,
  `[data-slide-statement-source]`, `[data-slide-table-heading]`, and
  `[data-slide-log-status]` run in the mono face at a hair of positive tracking.
- `[data-slide-column]`, `[data-slide-contents]`, `[data-slide-log]`,
  `[data-slide-rail]`, `[data-slide-accent-rule]`, and `[data-slide-badge]` take
  `--slide-aurora-edge`, so the rule that opens a group is the field's second
  colour.
- `[data-stat-meter]` takes its border in `--primary`, which keeps the empty
  part of the bar quieter than the fill.

## Theme-private tokens

One token is private to this theme. `--slide-aurora-edge` is the violet the
fields run their second band in, at an alpha that survives both sheets. It draws
every rule that opens a group, the badge border, and the accent rule. Set it to
`var(--border)` for a deck that wants the structure without the colour.

`--slide-grid-color`, `--slide-rule`, and `--slide-hatch` are in the token
contract in `@deckard/core/styles.css` rather than private here. `--slide-halo`
is `none` in both modes: a bloom behind copy on a field is a smudge, and the
field is already doing that job.

Each is declared in the light block, and the ones that change with the mode are
redeclared in dark. `--slide-hatch` is not one of them: it draws itself in
`--slide-grid-color`, which is, so the fill follows the mode on its own.

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

Aurora runs both bands in mono, uppercase, tracked out, in the muted ink, so
they read as a caption on the field rather than as a second heading. The counter
lights its current number in the accent. The progress element is a hairline at
the very bottom edge of the canvas rather than at the top of the footer, which
keeps it off the field.

## Safe to change

Every token in `theme.css` is meant to be edited. Move the accent by changing
`--primary`, `--primary-foreground`, `--ring`, `--slide-rule`, and
`--slide-aurora-edge` together, and move the fields with it by changing the
`--slide-motion-color-*` sets, or the deck will read as two palettes.

The light `--primary` is a step darker than the source design's teal. The source
value measured 4.04:1 against the light sheet and 3.18:1 against `--secondary`,
which the emphasised panel's gradient runs through, so an eyebrow set in it
failed on both. The shipped value clears 4.5:1 against every surface it can land
on. `--slide-rule` keeps the source teal, because it draws hairlines rather than
type.

Two rules bound the edits. Keep both color blocks in sync, so every token
defined for light is also defined for dark. And keep contrast: body copy against
`--background` and against `--slide-surface` both have to clear 4.5:1. The
shipped palette clears 4.6:1 at its worst pair, `--muted-foreground` on
`--secondary` in light.

If you change the class name, change it in `index.ts` too. The class in the
`SlideTheme` and the selector in the stylesheet are the same string.
`pnpm deck:validate` fails when they drift apart, when a token is dark-only, and
when a slide asks for a background neither the runtime nor this file paints.

## Media overlays

`--slide-media-foreground`, `--slide-media-foreground-muted`, and the three
`--slide-media-overlay-*` gradients ship in the base layer of
`@deckard/core/styles.css` rather than here, because a scrim over a photograph
is dark in both color modes. Override them in this file if a deck needs a
different scrim.

## Common mistakes

Putting a field behind a slide with a panel on it. The fields are for slides
whose whole content is a headline and a line under it. A card on a field hides
the half of the field it covers and leaves the rest competing with the copy.

Using more than one field in a row. Two moving slides back to back read as a
transition that failed, and the audience waits for it to finish.

Deleting the gradient under a canvas. It is the slide on every path where the
canvas paints nothing, and those paths are common: an old machine, a locked-down
browser, a lost context after a display change mid-talk.

Hardcoding a color inside the canvas. `text-white`, `bg-slate-900`, and
`rgba(15,23,42,0.2)` all survive a theme swap and then look wrong. Reach for a
semantic token (`text-foreground`, `bg-card`) or a slide token.

Redefining app tokens outside the theme class. A rule on `:root` or `.dark`
changes the deck controls and the presenter console too. Everything in this file
starts at `.aurora-theme`.

Assuming `.dark` on `<html>` is the only switch. This theme defaults the canvas
to dark through `data-slide-color-mode`, and the dark block matches both that
and `.dark` on the document. Copy that selector pair when you add a
mode-dependent rule, the per-variant field colours included.
