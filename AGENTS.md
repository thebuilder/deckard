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
- File-per-slide modules live in `deck/slides/*.slide.tsx`. `deck/slides.tsx` discovers them with one eager `import.meta.glob` and spreads the group into the array. A single module can also be imported by hand through `slideFromModule`.
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
- The fixed canvas lives in `components/slideshow/slide-viewport.tsx` (fit and centering) and `components/slideshow/slide-canvas.tsx` (the 1920x1080 coordinate space). Canvas size comes from `deck/deck.ts` through `lib/deck/canvas.ts`.
- The deck theme lives in `deck/theme/` (`theme.css`, the `SlideTheme` export, `THEME.md`). `SlideCanvas` puts the theme class on the canvas, so the theme reaches the slide and nothing else.
- `components/slideshow/slide-background.tsx` is a hook, not a look. It renders one element carrying `data-slide-background`; the theme paints the variants.
- Light/dark lives in `components/color-mode-provider.tsx`. It is color mode only. The deck theme is static config and never switches at runtime.

## Authoring rules

- Keep `deck/slides.tsx` close to definitions-only. A slide-local async Server Component that loads data is fine, the visuals still come from blocks.
- Prefer composing slides from `app/slides/blocks/*` primitives.
- Prefer explicit variant components over mode flags/booleans (composition pattern):
  - good: `ContentSlideCard` + `OpenContentSlide`
  - good: `FullscreenMediaSlide` with `media.kind: "image" | "video"`
  - avoid: single component with `variant`/`animate*` branching props
- Use slide-level metadata (`layout`, `header`, `footer`, `background`, `stepCount`) instead of route-specific hacks.
- Size slide content against the canvas (`h-full`, percentages, fixed values). No browser viewport units (`svh`, `svw`, `vh`, `vw`) and no responsive breakpoints (`sm:`, `lg:`) inside the canvas: the canvas is one fixed size and the browser window is not.
- Content that has to scroll goes in `SlideScrollArea` so scrolling does not step the deck. Everything else has to fit, the canvas clips it and warns in development.
- Use reusable media primitives (for example `ImageShowcaseSlide`) for media-first slides and keep assets in `public/images`.
- Prefer static image imports (`ImageProps["src"]`) over raw strings when possible, so blur placeholders are available.
- Reuse `deck` values for branding/title instead of hardcoding strings.
- Inside the canvas, style with semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`) or slide tokens (`--slide-title-size`, `--slide-surface`, `--slide-radius`). Never a hardcoded color, and never a raw font size where a token exists. Read `deck/theme/THEME.md` before adding one.
- Outside the canvas (utility bar, command center, presenter console, dialogs), keep the app tokens from `app/globals.css`. Those have to stay readable whatever the deck theme does.
- Changing how a background variant looks is a `deck/theme/theme.css` edit, not a component edit.

## Slide modules and Server Components

- Slide entry modules are Server Components. Never put `"use client"` at the top of `deck/slides.tsx` or a `deck/slides/*.slide.tsx` file. `deck/slides.test.ts` fails on it.
- Put interactivity one level down, in a nested client component beside the slide (for example `deck/slides/interactive-demo-widget.tsx`), and render it from the slide body.
- Fetch data inside the slide component with `await`. The route renders the slide after the data resolves.
- Metadata stays synchronously readable. Export `meta` and `notes` as plain values so the deck can list, order, and title a slide without rendering it.
- A slide module exports `default` (the component), `meta`, and `notes`. `slideFromModule` turns it into a `SlideDefinition`.
- Anything crossing into a client component has to be serializable. Pass a `SlideSummary` built from a `ResolvedSlide`, and let the rendered body cross only as `children`.
- Discovery is an organizational convenience. The glob is eager, so extracting a slide changes where you edit it and nothing about what ships. Keep a slide inline while it is metadata and one block, give it a file once it loads data, brings a client widget, or carries long notes.
- The spread position in `deck/slides.tsx` is authoritative. `sort` only orders slides inside the discovered group, and `discoverSlides` drops `meta.order` from the definitions so a module can never reorder the deck around it.
- `sort: "path"` (the default) compares glob keys segment by segment with numeric-aware compare, `sort: "order"` reads `meta.order` and falls back to path order, and a comparator gets `{ path, meta }` for both slides. The deck uses `"order"`.
- A discovered module has to be synchronous. Top-level await or a WebAssembly dependency anywhere in its imports turns it into an async module, the eager glob hands back a promise, and discovery throws naming the file. That is why a slide using `CodeBlock` (shiki loads WebAssembly) stays in the array with `slideFromModule`.
- Adding or deleting a `.slide.tsx` file while `next dev` runs leaves page routes serving stale modules. Restart the dev server.
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
