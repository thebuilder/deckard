# AGENTS Guidelines

This repository is a reusable Next.js slideshow template.

## Goal

Keep the project optimized for fast authoring of new slide decks with consistent navigation, styling, and configurable slide chrome.

## Core architecture

- Slide definitions live in `deck/slides.tsx`.
- Deck config lives in `deck/deck.ts` and is wrapped in `defineDeck`.
- Slide model, id resolution, and validation live in `lib/deck/*`.
- Slide chrome mode types live in `types/slides.ts`.
- Deck-authoring blocks live in `app/slides/blocks/*` and are split by concern:
  - `templates.tsx` for slide layout templates
  - `typography.tsx` for heading/eyebrow primitives
  - `collections.tsx` for list/grid content blocks
  - `media.tsx` for image/media composition blocks
- Shell/chrome behavior lives in `components/slideshow/slide-shell.tsx`.
- Background variants are centralized in `components/slideshow/slide-background.tsx`.

## Authoring rules

- Keep `deck/slides.tsx` definitions-only. Do not define component implementations there.
- Prefer composing slides from `app/slides/blocks/*` primitives.
- Prefer explicit variant components over mode flags/booleans (composition pattern):
  - good: `ContentSlideCard` + `OpenContentSlide`
  - good: `FullscreenMediaSlide` with `media.kind: "image" | "video"`
  - avoid: single component with `variant`/`animate*` branching props
- Use slide-level metadata (`layout`, `header`, `footer`, `background`, `stepCount`) instead of route-specific hacks.
- Use reusable media primitives (for example `ImageShowcaseSlide`) for media-first slides and keep assets in `public/images`.
- Prefer static image imports (`ImageProps["src"]`) over raw strings when possible, so blur placeholders are available.
- Reuse `deck` values for branding/title instead of hardcoding strings.

## UX expectations

- Keyboard navigation must keep working (`Arrow`, `PageUp/PageDown`, `Space`).
- Command center (`Cmd/Ctrl + K`) should remain available whenever header is visible.
- Fullscreen slides should remain readable on both desktop and mobile.
- Theme toggle should remain functional in both light and dark modes.

## Change discipline

- Favor small, composable components over large monolithic slide bodies.
- Update README when introducing new slide model fields or behavior.
- Run `pnpm typecheck && pnpm lint && pnpm test` after structural changes.
