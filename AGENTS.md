# AGENTS Guidelines

This repository is Deckard, a React presentation framework for building
polished, fixed-canvas slides with reusable components, custom React content,
presenter tooling, and shadcn-native themes. It runs on Next.js.

It is a pnpm workspace driven by Turborepo:

- `packages/core` is `@deckard/core`, the deck contract and the slideshow
  runtime. It compiles to `dist/` with `tsc`, and apps consume the build. Turbo
  builds it before an app builds, and `pnpm dev` runs its `tsc --watch`
  alongside the app.
- `apps/playground` is the reference deck and the app the visual checks run
  against.
- `apps/docs` is the documentation site.
- `registry` holds theme sources the playground does not use. `registry.json` at
  the root publishes them and the blocks through shadcn.
- `tools/package-smoke` packs the package and builds a scratch app against it.
- `tools/registry-smoke` installs the registry into a scratch app and builds it.

Every script runs from the root: `pnpm dev` (playground on :3000), `pnpm build`,
`pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm analyze`, `pnpm smoke:package`,
`pnpm registry:build`, `pnpm smoke:registry`.

A registry item that ships a file has to keep pointing at the file the repo
actually renders. Move `apps/playground/app/slides/blocks/*` or
`apps/playground/deck/theme/*` and `registry.json` breaks silently, because
`shadcn build` reads those paths.

## Goal

Keep the project optimized for fast authoring of new slide decks with consistent navigation, styling, and configurable slide chrome.

Keep deck-specific content out of `packages/core`. Colors, sizes, backgrounds,
and copy belong to the deck that owns them.

A presentation built on Deckard is a plain Next.js app: `app/`, `components/`,
`deck/`, `public/`, `package.json`, plus one `@import "@deckard/core/styles.css"`.
No `transpilePackages`, no Tailwind `@source`. Nothing about the workspace
layout leaks into the app someone generates from the framework.

## Core architecture

- Slide definitions live in `apps/playground/deck/slides.tsx`, and the exported array always defines deck order. `resolveSlides` never sorts.
- File-per-slide modules live in `apps/playground/deck/slides/*.slide.tsx`. `slides.tsx` discovers them with one eager `import.meta.glob` and spreads the group into the array. A single module can also be imported by hand through `slideFromModule`.
- Deck config lives in `apps/playground/deck/deck.ts` and is wrapped in `defineDeck`.
- Slide model, id resolution, and validation live in `packages/core/src/deck/*`, exported from `@deckard/core`. A slide id is its `slug` or its 1-based position, and lookups match it exactly, so a slugged slide has no numeric URL. Numeric slugs are rejected.
- Slide chrome mode types live in `packages/core/src/types/slides.ts`, exported from `@deckard/core`.
- Deck-authoring blocks live in `apps/playground/app/slides/blocks/*` and are split by concern:
  - `templates.tsx` for slide layout templates
  - `typography.tsx` for heading/eyebrow primitives
  - `collections.tsx` for list/grid content blocks
  - `media.tsx` for image/media composition blocks
- Shell/chrome behavior lives in `packages/core/src/components/slide-shell.tsx`, exported from `@deckard/core/components`.
- The fixed canvas lives in `packages/core/src/components/slide-viewport.tsx` (fit and centering) and `slide-canvas.tsx` (the 1920x1080 coordinate space). Canvas size comes from `apps/playground/deck/deck.ts` through `packages/core/src/deck/canvas.ts`.
- The deck theme lives in `apps/playground/deck/theme/` (`theme.css`, the `SlideTheme` export, `THEME.md`). `SlideCanvas` puts the theme class on the canvas, so the theme reaches the slide and nothing else.
- `packages/core/src/components/slide-background.tsx` is a hook, not a look. It renders one element carrying `data-slide-background`; the theme paints the variants.
- Light/dark lives in `packages/core/src/components/color-mode-provider.tsx`. It is color mode only. The deck theme is static config and never switches at runtime.

## Authoring rules

- Keep `apps/playground/deck/slides.tsx` close to definitions-only. A slide-local async Server Component that loads data is fine, the visuals still come from blocks.
- Prefer composing slides from `apps/playground/app/slides/blocks/*` primitives.
- Prefer explicit variant components over mode flags/booleans (composition pattern):
  - good: `ContentSlideCard` + `OpenContentSlide`
  - good: `FullscreenMediaSlide` with `media.kind: "image" | "video"`
  - avoid: single component with `variant`/`animate*` branching props
- Use slide-level metadata (`layout`, `header`, `footer`, `background`, `stepCount`) instead of route-specific hacks.
- Size slide content against the canvas (`h-full`, percentages, fixed values). No browser viewport units (`svh`, `svw`, `vh`, `vw`) and no responsive breakpoints (`sm:`, `lg:`) inside the canvas: the canvas is one fixed size and the browser window is not.
- Content that has to scroll goes in `SlideScrollArea` so scrolling does not step the deck. Everything else has to fit, the canvas clips it and warns in development.
- Use reusable media primitives (for example `ImageShowcaseSlide`) for media-first slides and keep assets in the app's `public/images`.
- Prefer static image imports (`ImageProps["src"]`) over raw strings when possible, so blur placeholders are available.
- Reuse `deck` values for branding/title instead of hardcoding strings.
- Inside the canvas, style with semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`) or slide tokens (`--slide-title-size`, `--slide-surface`, `--slide-radius`). Never a hardcoded color, and never a raw font size where a token exists. Read `apps/playground/deck/theme/THEME.md` before adding one.
- Outside the canvas (utility bar, command center, presenter console, dialogs), keep the app tokens from `apps/playground/app/globals.css`. Those have to stay readable whatever the deck theme does.
- Changing how a background variant looks is an `apps/playground/deck/theme/theme.css` edit, not a component edit.

## Slide modules and Server Components

- Slide entry modules are Server Components. Never put `"use client"` at the top of `apps/playground/deck/slides.tsx` or a `deck/slides/*.slide.tsx` file. `apps/playground/deck/slides.test.ts` fails on it.
- Put interactivity one level down, in a nested client component beside the slide (for example `apps/playground/deck/slides/interactive-demo-widget.tsx`), and render it from the slide body.
- Fetch data inside the slide component with `await`. The route renders the slide after the data resolves.
- Metadata stays synchronously readable. Export `meta` and `notes` as plain values so the deck can list, order, and title a slide without rendering it.
- A slide module exports `default` (the component), `meta`, and `notes`. `slideFromModule` turns it into a `SlideDefinition`.
- Anything crossing into a client component has to be serializable. Pass a `SlideSummary` built from a `ResolvedSlide`, and let the rendered body cross only as `children`.
- Discovery is an organizational convenience. The glob is eager, so extracting a slide changes where you edit it and nothing about what ships. Keep a slide inline while it is metadata and one block, give it a file once it loads data, brings a client widget, or carries long notes.
- The spread position in `apps/playground/deck/slides.tsx` is authoritative. `sort` only orders slides inside the discovered group, and `discoverSlides` drops `meta.order` from the definitions so a module can never reorder the deck around it.
- `sort: "path"` (the default) compares glob keys segment by segment with numeric-aware compare, `sort: "order"` reads `meta.order` and falls back to path order, and a comparator gets `{ path, meta }` for both slides. The deck uses `"order"`.
- A discovered module has to be synchronous. Top-level await or a WebAssembly dependency anywhere in its imports turns it into an async module, the eager glob hands back a promise, and discovery throws naming the file. That is why `CodeBlock` ships from `@deckard/core/code-block` rather than the components barrel, and why a slide using it stays in the array with `slideFromModule`.
- Adding or deleting a `.slide.tsx` file while `next dev` runs leaves page routes serving stale modules. Restart the dev server.
- A slide that throws renders the inline card from `SlideErrorBoundary` and navigation keeps working. That covers `next dev` and anything a nested client component throws after hydration. In a production build, a Server Component that throws is fatal to the route and Next serves its own error page instead.

## UX expectations

- Keyboard navigation must keep working (`Arrow`, `PageUp/PageDown`, `Space`).
- Command center (`Cmd/Ctrl + K`) should remain available whenever header is visible.
- Fullscreen slides should remain readable on both desktop and mobile.
- Theme toggle should remain functional in both light and dark modes.

## The package boundary

- Apps import the runtime through the package exports only: `@deckard/core`, `/components`, `/code-block`, `/discovery`, `/next`, `/slide-from-module`, `/ui`, `/utils`, `/styles.css`. Never a deep path into `packages/core/src`.
- New runtime code goes in `packages/core` and gets an export. New deck content goes in `apps/playground`. If a component names the deck, a color, or a slide, it is deck content.
- A new export means adding it to the matching index file, and a new subpath means adding it to the `exports` map in `packages/core/package.json`, where every entry points at `dist`. `packages/core/src/index.ts`, `src/components/index.ts`, and `src/ui/index.ts` are the only barrels, and biome allows barrels only there.
- Route files belong to `@deckard/core/next`. An app's `app/slides/[id]/page.tsx`, `app/presenter/page.tsx`, `app/sitemap.ts`, and `app/page.tsx` are re-exports of `createSlideRoute`, `createPresenterPage`, `createDeckSitemap`, and `createFirstSlideRedirect`.
- The slide route is static. Nothing in it may read the request: `presenterPreview` and `step` are read on the client, so the whole deck prerenders.
- Nothing heavy or async belongs in the components barrel. `CodeBlock` sits behind its own entry point because shiki loads WebAssembly, and a discovered slide module that reaches it through the barrel would throw.
- Adding a dependency to the runtime means adding it to `packages/core/package.json`, not the app's. `pnpm smoke:package` catches the ones that only work because the workspace hoisted them.

## Change discipline

- Favor small, composable components over large monolithic slide bodies.
- Update README when introducing new slide model fields or behavior.
- Run `pnpm typecheck && pnpm lint && pnpm test` after structural changes, and `pnpm smoke:package` after touching the package exports or its dependencies.
- Read the Next.js docs for the pinned version in `node_modules/next/dist/docs/` before writing App Router code. The APIs move fast, and `next dev` is configured not to inject its own agent-rules block into this file (`agentRules: false` in each app's `next.config.mjs`).
