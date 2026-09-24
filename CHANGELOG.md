# Changelog

Releases are tags. Pushing `v<version>` runs `.github/workflows/release.yml`, which packs, smokes, and publishes. The three packages version together: `@thebuilder/deckard-core`, `@thebuilder/deckard-themes`, and `@thebuilder/deckard-cli` ship the same number, and `deckard init` pins a new deck to the CLI's own version.

## Unreleased

- Every slide URL gets an Open Graph share card, rendered at build time by `createSlideShareCard` from `@thebuilder/deckard-core/next` in the deck's theme colors and display face. `deckard init` writes the `app/slides/[id]/opengraph-image.tsx` route; an existing deck adds that file to opt in.
- `SlideTheme` takes an optional `card`, and every built-in theme sets one generated from its own palette. `deckard eject theme` copies it.
- `deckSiteUrl()` in `@thebuilder/deckard-core` is the one source of a deck's public origin. The slide route and the generated root layout set `metadataBase` from it, so `og:image` is absolute.

## 0.1.1, 2026-09-23

- Launch Next.js builds and preview servers through Node so capture commands work without platform-specific executable wrappers on Windows.
- Install the generated smoke deck's matching Chromium before release browser checks.

## 0.1.0, 2026-09-03

The first release on npm.

- `@thebuilder/deckard-core`: `defineDeck`, the fixed 1920x1080 canvas, the slide shell, keyboard navigation and step reveals, the command menu, presenter mode with notes and a timer, the Next.js route adapters, and the layout measurement the overflow gate shares with `next dev`.
- `@thebuilder/deckard-themes`: every built-in theme as one import, each with its own stylesheet and self-hosted fonts, and `deckard eject theme` to take ownership of one.
- `@thebuilder/deckard-cli`: `init`, `validate`, `doctor`, `check-overflow`, `screenshots`, `contact-sheet`, `export pdf`, `add`, and `eject`. Playwright and pdf-lib are dev dependencies of the deck rather than of the CLI, so the first `npx @thebuilder/deckard-cli init` stays small.
- Slide blocks install into a deck as source through the `@deckard` shadcn registry served from the docs site.
