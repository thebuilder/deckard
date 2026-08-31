# AGENTS Guidelines

This repository is Deckard, a React presentation framework for building
polished, fixed-canvas slides with reusable components, custom React content,
presenter tooling, and shadcn-native themes. It ships as a Next.js app.

## Goal

Keep the project optimized for fast authoring of new slide decks with consistent navigation, styling, and configurable slide chrome.

The reusable parts (`lib/deck`, `components/slideshow`) are headed for `@deckard` packages, so keep deck-specific content out of them.

## Core architecture

- Slide definitions live in `deck/slides.tsx`, and the exported array always
  defines deck order. `resolveSlides` never sorts.
- File-per-slide modules live in `deck/slides/*.slide.tsx` and join the array through `slideFromModule`.
- Deck config lives in `deck/deck.ts` and is wrapped in `defineDeck`.
- Slide model, id resolution, and validation live in `lib/deck/*`. A slide id
  is its `slug` or its 1-based position, and lookups match it exactly, so a
  slugged slide has no numeric URL. Numeric slugs are rejected.
- Slide chrome mode types live in `types/slides.ts`.
- Deck-authoring blocks live in `app/slides/blocks/*` and are split by concern:
  - `templates.tsx` for slide layout templates
  - `typography.tsx` for heading/eyebrow primitives
  - `collections.tsx` for list/grid content blocks
  - `media.tsx` for image/media composition blocks
- Shell/chrome behavior lives in `components/slideshow/slide-shell.tsx`.
- Background variants are centralized in `components/slideshow/slide-background.tsx`.

## Authoring rules

- Keep `deck/slides.tsx` close to definitions-only. A slide-local async Server Component that loads data is fine, the visuals still come from blocks.
- Prefer composing slides from `app/slides/blocks/*` primitives.
- Prefer explicit variant components over mode flags/booleans (composition pattern):
  - good: `ContentSlideCard` + `OpenContentSlide`
  - good: `FullscreenMediaSlide` with `media.kind: "image" | "video"`
  - avoid: single component with `variant`/`animate*` branching props
- Use slide-level metadata (`layout`, `header`, `footer`, `background`, `stepCount`) instead of route-specific hacks.
- Use reusable media primitives (for example `ImageShowcaseSlide`) for media-first slides and keep assets in `public/images`.
- Prefer static image imports (`ImageProps["src"]`) over raw strings when possible, so blur placeholders are available.
- Reuse `deck` values for branding/title instead of hardcoding strings.

## Slide modules and Server Components

- Slide entry modules are Server Components. Never put `"use client"` at the top of `deck/slides.tsx` or a `deck/slides/*.slide.tsx` file. `deck/slides.test.ts` fails on it.
- Put interactivity one level down, in a nested client component beside the slide (for example `deck/slides/interactive-demo-widget.tsx`), and render it from the slide body.
- Fetch data inside the slide component with `await`. The route renders the slide after the data resolves.
- Metadata stays synchronously readable. Export `meta` and `notes` as plain values so the deck can list, order, and title a slide without rendering it.
- A slide module exports `default` (the component), `meta`, and `notes`. `slideFromModule` turns it into a `SlideDefinition`.
- Anything crossing into a client component has to be serializable. Pass a `SlideSummary` built from a `ResolvedSlide`, and let the rendered body cross only as `children`.
- A slide that throws renders the inline card from `SlideErrorBoundary` and navigation keeps working. That covers `next dev` and anything a nested client component throws after hydration. In a production build, a Server Component that throws is fatal to the route and Next serves its own error page instead.

## UX expectations

- Keyboard navigation must keep working (`Arrow`, `PageUp/PageDown`, `Space`).
- Command center (`Cmd/Ctrl + K`) should remain available whenever header is visible.
- Fullscreen slides should remain readable on both desktop and mobile.
- Theme toggle should remain functional in both light and dark modes.

## Change discipline

- Favor small, composable components over large monolithic slide bodies.
- Update README when introducing new slide model fields or behavior.
- Run `pnpm typecheck && pnpm lint && pnpm test` after structural changes.
- Read the Next.js docs for the pinned version in `node_modules/next/dist/docs/` before writing App Router code. The APIs move fast, and `next dev` is configured not to inject its own agent-rules block into this file (`agentRules: false` in `next.config.mjs`).
