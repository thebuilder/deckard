# playground

The reference deck. It is a normal Deckard presentation, so it doubles as the
example of what an app built on `@deckard/core` looks like, and as the deck the
visual checks and the PDF export run against.

Run it from the repository root with `pnpm dev`, on port 3000.

`pnpm export:pdf` writes `out/slides.pdf`. It runs its own production build
first, so run it from this directory or as `pnpm --filter playground
export:pdf`.

Slides live in `deck/`. The framework side of things is documented in the root
README.

## Switching theme

Any slide URL takes `?theme=<id>`, naming a built-in from `@deckard/themes`, and
a picker beside the deck controls switches between them. The choice follows the
reader across slides, into a shared link, and into the presenter window. The
light and dark toggle is left alone, so a comparison moves one thing at a time.

`deck/deck.ts` still names one theme, and that is the one `deckard validate`,
`check-overflow`, `screenshots`, and `export pdf` measure. The switch lives in
`components/theme-switch/` and this app's `app/slides/[id]/page.tsx` renders the
shell to apply it. A deck scaffolded with `deckard init` re-exports
`createSlideRoute` and gets none of this.
