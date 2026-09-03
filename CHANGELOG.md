# Changelog

The three packages version together: `@thebuilder/deckard-core`, `@thebuilder/deckard-themes`, and `@thebuilder/deckard-cli` ship the same number, and `deckard init` pins a new deck to the CLI's own version.

## 0.1.0, 2026-09-03

The first release on npm.

- `@thebuilder/deckard-core`: `defineDeck`, the fixed 1920x1080 canvas, the slide shell, keyboard navigation and step reveals, the command menu, presenter mode with notes and a timer, the Next.js route adapters, and the layout measurement the overflow gate shares with `next dev`.
- `@thebuilder/deckard-themes`: every built-in theme as one import, each with its own stylesheet and self-hosted fonts, and `deckard eject theme` to take ownership of one.
- `@thebuilder/deckard-cli`: `init`, `validate`, `doctor`, `check-overflow`, `screenshots`, `contact-sheet`, `export pdf`, `add`, and `eject`. Playwright and pdf-lib are dev dependencies of the deck rather than of the CLI, so the first `npx @thebuilder/deckard-cli init` stays small.
- Slide blocks install into a deck as source through the `@deckard` shadcn registry served from the docs site.
