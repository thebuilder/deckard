# AGENTS Guidelines

Deckard is a React presentation framework for fixed-canvas slides with reusable
blocks, presenter tooling, and shadcn-native themes. It runs on Next.js and is a
pnpm workspace driven by Turborepo.

This file describes work inside this repository, where the decks are
`apps/playground` and `apps/demo`. Someone building a real presentation does not
clone this repo: they own a Next.js app with `@deckard/core` as a dependency and
their theme and blocks installed from the registry. The same authoring rules
apply there, against their own `deck/` directory.

- `packages/core` is `@deckard/core`, the deck contract and the slideshow
  runtime. It compiles to `dist/` with `tsc`, and apps consume the build. Turbo
  builds it before an app builds, and `pnpm dev` runs its `tsc --watch`
  alongside the app.
- `apps/playground` is the reference deck and the app every visual check runs
  against. It exercises every feature on purpose, so it is a test surface, not a
  template and not anyone's presentation.
- `apps/demo` is a 19-slide talk shaped like a consumer project, and the proof
  that the framework works outside the playground. `docs/MIGRATION-NOTES.md`
  records what that migration surfaced.
- `apps/docs` is the documentation site.
- `packages/themes` is `@deckard/themes`, the six deck themes. Each one is a
  `theme.css`, an `index.ts` exporting one `SlideTheme`, and a `THEME.md`. It
  compiles to `dist/` with `tsc` and `scripts/copy-theme-assets.ts` carries the
  stylesheets and the documents across. `pnpm dev` runs `scripts/dev.ts`, which
  copies once, watches `src/*/theme.css` and `src/*/THEME.md`, and spawns
  `tsc --watch` as its child. One node process owns both halves so one signal
  ends both; a shell `a & b` leaves the asset watcher writing into a `dist`
  nothing is compiling.
- `registry.json` at the root publishes the blocks through shadcn. Themes are
  not in it.
- `packages/cli` is `@deckard/cli`, the one public binary: `deckard init`,
  `validate`, `doctor`, `check-overflow`, `screenshots`, `contact-sheet`,
  `export pdf`, `add`, and `eject`. It compiles to `dist/` with `tsc` and treats
  the current working directory as the deck. `packages/cli/template` is what
  `init` writes, and it is build output: gitignored, rebuilt by
  `scripts/sync-template.ts` on every CLI build and again on `prepack`. The
  hand-authored half is `packages/cli/template-src`; the blocks, the pinned
  dependency versions, and the package manager pins are copied in from the
  playground and the root `package.json`. Edit `template-src` or the playground,
  never `template`.
- `tools/package-smoke` packs the package and builds a scratch app against it.
- `tools/registry-smoke` installs the registry into a scratch app and builds it.
- `tools/cli-smoke` installs the packed CLI outside the workspace and runs
  `deckard init` through it, once under pnpm and once under npm, then builds,
  validates, and screenshots what it generated.

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
| `pnpm cli:build`           | builds `@deckard/core`, `@deckard/themes`, and `@deckard/cli` |
| `pnpm deck:validate`       | deck resolves, theme is coherent, registry paths exist       |
| `pnpm deck:doctor`         | node, package resolution, stylesheet import, deck, routes    |
| `pnpm deck:check-overflow` | fails listing slides that lose content to the canvas edge, the chrome, or a clipped box |
| `pnpm deck:screenshots`    | one PNG per slide at canvas size, `--light` for light mode   |
| `pnpm deck:contact-sheet`  | every screenshot in one grid image for review                |
| `pnpm export:pdf`          | one PDF page per slide at canvas size                        |
| `pnpm demo`                | the demo talk on :3002                                       |
| `pnpm demo:validate`       | the same checks against `apps/demo`, plus `demo:doctor`, `demo:check-overflow`, `demo:screenshots`, `demo:contact-sheet`, `demo:export:pdf` |
| `pnpm registry:build`      | compiles `registry.json` into `apps/docs/public/r`           |
| `pnpm smoke:package`       | packs `@deckard/core` and builds a scratch app against it    |
| `pnpm smoke:registry`      | installs the registry into a scratch app and builds it       |
| `pnpm smoke:cli`           | `deckard init` from the packed CLI on pnpm and npm, then build, validate, shoot it |

`deck:validate` takes about a second. Run it after any structural change: a new
slug, a moved slide module, a theme edit, a registry path. Run
`deck:check-overflow` after changing slide content, and read a fresh
`deck:contact-sheet` before calling a deck done.

`deck:check-overflow` and the amber ring `next dev` draws share one measurement,
`measureSlideLayout` in `packages/core/src/lib/slide-layout.ts`, exported as
`@deckard/core/layout`. It reads the canvas edge, the header and footer bands,
and any box inside the frame that hides its own overflow. The CLI evaluates it in
the page from the deck's own installed `@deckard/core`, so the gate and the
warning are literally the same code. Keep it in one place: a second copy is how
the two start disagreeing.

## Authoring slides

Read `.claude/skills/slide-authoring/SKILL.md` first. It covers the blocks, when
a slide earns its own file, the Server Component boundary, canvas sizing, tokens,
metadata, and discovery ordering.

Read `packages/themes/src/deckard/THEME.md` before changing a color or a
size token in the default theme. Each of the six themes carries its own.

Keep deck-specific content out of `packages/core`. Colors, sizes, backgrounds,
and copy belong to the deck that owns them. If a component names the deck, a
color, or a slide, it is deck content.

A presentation built on Deckard is a plain Next.js app: `app/`, `components/`,
`deck/`, `public/`, `package.json`, plus one `@import "@deckard/core/styles.css"`
and one theme imported from `@deckard/themes`.
No `transpilePackages`, no Tailwind `@source`. Nothing about the workspace
layout leaks into the app someone generates from the framework. `deckard init`
is what generates it, so a change to that shape belongs in
`packages/cli/template-src` and has to survive `pnpm smoke:cli`.

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
  `templates.tsx`, `typography.tsx`, `collections.tsx`, `media.tsx`, and
  `metrics.tsx`.
- Chrome and shell behavior: `packages/core/src/components/slide-shell.tsx`.
- The fixed canvas: `slide-viewport.tsx` fits and centers it,
  `slide-canvas.tsx` is the 1920x1080 coordinate space, and the size comes from
  `deck.ts` through `packages/core/src/deck/canvas.ts`.
- The themes: `packages/themes/src/<name>/`, each a `theme.css`, an
  `index.ts` exporting one `SlideTheme`, and a `THEME.md`. `SlideCanvas` puts
  the theme class on the canvas, so the theme reaches the slide and nothing
  else. `apps/demo/deck/theme` is an ejected fork and stays local.
- Color mode: `packages/core/src/components/color-mode-provider.tsx`. It is
  light and dark only. The deck theme is static config and never switches at
  runtime.
- Deck tooling: `packages/cli/src/commands/`, with the shared build, server, and
  canvas harness in `packages/cli/src/deck/preview.ts`.

## The package boundary

- Apps import the runtime through the package exports only: `@deckard/core`, `/components`, `/code-block`, `/discovery`, `/layout`, `/next`, `/slide-from-module`, `/ui`, `/utils`, `/styles.css`, and `@deckard/themes` for the presets. Never a deep path into `packages/core/src` or `packages/themes/src`.
- The runtime depends on the token contract, never on a preset. Presets live in `@deckard/themes`, a theme is data the deck chooses, and `packages/core` must not reference it: the dependency runs one way, `@deckard/themes` takes `SlideTheme` from `@deckard/core` as a type-only import and names it a peer, so nothing crosses at runtime. A theme's stylesheet is copied into `dist` next to its compiled module by `scripts/copy-theme-assets.ts`, which is why importing the module carries its CSS.
- New runtime code goes in `packages/core` and gets an export. New deck content goes in `apps/playground`. If a component names the deck, a color, or a slide, it is deck content.
- A new export means adding it to the matching index file, and a new subpath means adding it to the `exports` map in `packages/core/package.json`, where every entry points at `dist`. `packages/core/src/index.ts`, `src/components/index.ts`, and `src/ui/index.ts` are the only barrels, and biome allows barrels only there.
- Route files belong to `@deckard/core/next`. An app's `app/slides/[id]/page.tsx`, `app/presenter/page.tsx`, `app/sitemap.ts`, and `app/page.tsx` are re-exports of `createSlideRoute`, `createPresenterPage`, `createDeckSitemap`, and `createFirstSlideRedirect`.
- The slide route is static. Nothing in it may read the request: `presenterPreview` and `step` are read on the client, so the whole deck prerenders.
- Nothing heavy or async belongs in the components barrel. `CodeBlock` sits behind its own entry point because shiki loads WebAssembly, and a discovered slide module that reaches it through the barrel would throw.
- Adding a dependency to the runtime means adding it to `packages/core/package.json`, not the app's. `pnpm smoke:package` catches the ones that only work because the workspace hoisted them.
- Each of the three packages has a `prepack` that builds itself and nothing else: `tsc` for core, `tsc` plus the asset copy for themes, the template sync for the CLI. A package cannot build its dependencies, so ordering the three is `pnpm release:pack`'s job. That command cleans every `dist`, the CLI template, and the build info beside them, builds the three through turbo with `--force`, packs them into `dist-tarballs/`, checks each tarball carries what an installer needs, and runs the CLI smoke against those exact files. It is the release path, so it is the one CI runs.

## Change discipline

- Favor small, composable components over large slide bodies.
- One surface per slide. A slide is a framed panel with flat content inside it,
  or an open frame holding content that carries its own surface, never a
  bordered panel full of bordered cards. It is a convention, not CSS: the panel
  in `ContentSlideCard` always paints its card, so a framed block inside it
  frames a frame and looks like it. A block that paints a border or a background
  carries `data-slide-surface`, the panel carries `data-slide-panel`, and the
  panel warns in development when it finds one inside itself, naming
  `OpenContentSlide` and `FocusSlide`. The markers are how the mistake gets
  named, not how it gets fixed.
- Update the README when you add a slide model field or change its behavior.
- Run `pnpm typecheck && pnpm lint && pnpm test` after structural changes, plus
  `pnpm deck:validate`, and `pnpm smoke:package` after touching the package
  exports or its dependencies.
- Read the Next.js docs for the pinned version in `node_modules/next/dist/docs/`
  before writing App Router code. The APIs move fast, and `next dev` is
  configured not to inject its own agent-rules block into this file
  (`agentRules: false` in each app's `next.config.ts`).
