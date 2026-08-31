# AGENTS Guidelines

Deckard is a React presentation framework for fixed-canvas slides with reusable
blocks, presenter tooling, and shadcn-native themes. It runs on Next.js and is a
pnpm workspace driven by Turborepo.

- `packages/core` is `@deckard/core`, the deck contract and the slideshow
  runtime. It compiles to `dist/` with `tsc`, and apps consume the build. Turbo
  builds it before an app builds, and `pnpm dev` runs its `tsc --watch`
  alongside the app.
- `apps/playground` is the reference deck and the app the visual checks run
  against.
- `apps/demo` is a 19-slide talk shaped like a consumer project, and the proof
  that the framework works outside the playground. `docs/MIGRATION-NOTES.md`
  records what that migration surfaced.
- `apps/docs` is the documentation site.
- `registry` holds theme sources the playground does not use. `registry.json` at
  the root publishes them and the blocks through shadcn.
- `tools/deck-scripts` is `@deckard/deck-scripts`, the deck tooling every app
  runs. It exposes `deck-validate`, `deck-check-overflow`, `deck-screenshots`,
  `deck-contact-sheet`, and `deck-export-pdf` as bins, and treats the invoking
  package's directory as the deck.
- `tools/package-smoke` packs the package and builds a scratch app against it.
- `tools/registry-smoke` installs the registry into a scratch app and builds it.

## Scripts

All of these run from the root.

| Command                    | What it does                                                |
| -------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                 | playground on :3000                                          |
| `pnpm build`               | builds every app                                             |
| `pnpm typecheck`           | `tsc` across the workspace                                   |
| `pnpm test`                | vitest, node and browser projects                            |
| `pnpm lint`                | ultracite fix, warnings are errors                           |
| `pnpm analyze`             | fallow dead code, duplication, health                        |
| `pnpm deck:validate`       | deck resolves, theme is coherent, registry paths exist       |
| `pnpm deck:check-overflow` | fails listing slides whose content the canvas clips          |
| `pnpm deck:screenshots`    | one PNG per slide at canvas size, `--light` for light mode   |
| `pnpm deck:contact-sheet`  | every screenshot in one grid image for review                |
| `pnpm export:pdf`          | one PDF page per slide at canvas size                        |
| `pnpm demo`                | the demo talk on :3002                                       |
| `pnpm demo:validate`       | the deck scripts against `apps/demo`, plus `demo:check-overflow`, `demo:screenshots`, `demo:contact-sheet`, `demo:export:pdf` |
| `pnpm registry:build`      | compiles `registry.json` into `apps/docs/public/r`           |
| `pnpm smoke:package`       | packs `@deckard/core` and builds a scratch app against it    |
| `pnpm smoke:registry`      | installs the registry into a scratch app and builds it       |

`deck:validate` takes about a second. Run it after any structural change: a new
slug, a moved slide module, a theme edit, a registry path. Run
`deck:check-overflow` after changing slide content, and read a fresh
`deck:contact-sheet` before calling a deck done.

## Authoring slides

Read `.claude/skills/slide-authoring/SKILL.md` first. It covers the blocks, when
a slide earns its own file, the Server Component boundary, canvas sizing, tokens,
metadata, and discovery ordering.

Read `apps/playground/deck/theme/THEME.md` before changing a color or a size
token.

Keep deck-specific content out of `packages/core`. Colors, sizes, backgrounds,
and copy belong to the deck that owns them. If a component names the deck, a
color, or a slide, it is deck content.

A presentation built on Deckard is a plain Next.js app: `app/`, `components/`,
`deck/`, `public/`, `package.json`, plus one `@import "@deckard/core/styles.css"`.
No `transpilePackages`, no Tailwind `@source`. Nothing about the workspace
layout leaks into the app someone generates from the framework.

## Where things live

- Slide definitions: `apps/playground/deck/slides.tsx`, with file-per-slide
  modules in `apps/playground/deck/slides/*.slide.tsx` that one eager
  `import.meta.glob` discovers. The exported array always defines deck order,
  and `resolveSlides` never sorts.
- Deck config: `apps/playground/deck/deck.ts`, wrapped in `defineDeck`.
- Slide model, id resolution, validation: `packages/core/src/deck/*`. A slide
  id is its `slug` or its 1-based position, matched exactly, so a slugged slide
  has no numeric URL. Numeric slugs are rejected.
- Authoring blocks: `apps/playground/app/slides/blocks/`, split into
  `templates.tsx`, `typography.tsx`, `collections.tsx`, `media.tsx`.
- Chrome and shell behavior: `packages/core/src/components/slide-shell.tsx`.
- The fixed canvas: `slide-viewport.tsx` fits and centers it,
  `slide-canvas.tsx` is the 1920x1080 coordinate space, and the size comes from
  `deck.ts` through `packages/core/src/deck/canvas.ts`.
- The deck theme: `apps/playground/deck/theme/`. `SlideCanvas` puts the theme
  class on the canvas, so the theme reaches the slide and nothing else.
- Color mode: `packages/core/src/components/color-mode-provider.tsx`. It is
  light and dark only. The deck theme is static config and never switches at
  runtime.
- Deck tooling: `tools/deck-scripts/`, with the shared build, server, and canvas
  harness in `lib/preview.ts`.

## The package boundary

- Apps import the runtime through the package exports only: `@deckard/core`, `/components`, `/code-block`, `/discovery`, `/next`, `/slide-from-module`, `/ui`, `/utils`, `/styles.css`. Never a deep path into `packages/core/src`.
- New runtime code goes in `packages/core` and gets an export. New deck content goes in `apps/playground`. If a component names the deck, a color, or a slide, it is deck content.
- A new export means adding it to the matching index file, and a new subpath means adding it to the `exports` map in `packages/core/package.json`, where every entry points at `dist`. `packages/core/src/index.ts`, `src/components/index.ts`, and `src/ui/index.ts` are the only barrels, and biome allows barrels only there.
- Route files belong to `@deckard/core/next`. An app's `app/slides/[id]/page.tsx`, `app/presenter/page.tsx`, `app/sitemap.ts`, and `app/page.tsx` are re-exports of `createSlideRoute`, `createPresenterPage`, `createDeckSitemap`, and `createFirstSlideRedirect`.
- The slide route is static. Nothing in it may read the request: `presenterPreview` and `step` are read on the client, so the whole deck prerenders.
- Nothing heavy or async belongs in the components barrel. `CodeBlock` sits behind its own entry point because shiki loads WebAssembly, and a discovered slide module that reaches it through the barrel would throw.
- Adding a dependency to the runtime means adding it to `packages/core/package.json`, not the app's. `pnpm smoke:package` catches the ones that only work because the workspace hoisted them.

## Change discipline

- Favor small, composable components over large slide bodies.
- Update the README when you add a slide model field or change its behavior.
- Run `pnpm typecheck && pnpm lint && pnpm test` after structural changes, plus
  `pnpm deck:validate`, and `pnpm smoke:package` after touching the package
  exports or its dependencies.
- Read the Next.js docs for the pinned version in `node_modules/next/dist/docs/`
  before writing App Router code. The APIs move fast, and `next dev` is
  configured not to inject its own agent-rules block into this file
  (`agentRules: false` in each app's `next.config.mjs`).
