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
