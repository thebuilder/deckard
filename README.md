# Deckard

Beautiful React presentations with shadcn-native theming.

Deckard is a React presentation framework for building polished, fixed-canvas
slides with reusable components, custom React content, presenter tooling, and
shadcn-native themes. It runs on Next.js and Tailwind, and every slide is a
React component, so a chart, a live demo, or a form is as easy to put on a
slide as a bullet list.

## Screenshots

### Landing page

![Landing page](assets/landingpage.png)

### Presenter view

![Presenter view](assets/presenter-view.png)

## What you get

- Route-per-slide presentation flow (`/slides/[id]`)
- Fixed 1920x1080 slide canvas that scales to any screen
- Keyboard navigation (`Arrow`, `PageUp/PageDown`, `Space`)
- Step reveals with `stepCount` + `SlideStep`
- Click-to-advance reveal area for stepped slides
- Command center (`Cmd/Ctrl + K`) for quick jump
- Presenter popout window with `BroadcastChannel` sync
- Presenter notes per slide via `notes` in `deck/slides.tsx`
- Presenter timer + 24h current-time clock
- Presenter next-step preview (aware of reveal steps)
- Presenter flow window (previous 2 + current + next 5 slide titles)
- Presenter notes font-size controls
- Deck theme with canvas-scoped tokens, light and dark
- Light/dark color mode toggle
- Slide-level layout/background/header controls
- Typed image slide support
- PDF export pipeline for static handout rendering
- shadcn/ui components and tokens, so slides inherit your app theme

## Using Deckard in your own app

```bash
npx @deckard/cli init my-talk
cd my-talk
npm run dev
```

That writes the app below, installs it, makes the first commit, and typechecks
it. The deck it lands with is five slides you delete.

`init` uses the package manager that ran it. Through `npx` that is npm, through
`pnpm dlx` it is pnpm, and the generated `package.json` records the one it used
in its `packageManager` field. Nothing in the generated app assumes pnpm, and
every later `deckard` command reads that field rather than guessing.

```
my-talk/
  app/                   layout, globals.css, and the slide routes
    slides/blocks/       the four block families, yours to edit
  deck/
    deck.ts              defineDeck config
    slides.tsx           the slide array
    slides/*.slide.tsx   file-per-slide modules
    theme/               the theme you picked, yours to edit
  public/
  components.json
  next.config.mjs
  package.json
```

`init` takes `--theme broadsheet` for the editorial look, `--empty` for two
slides instead of the sample deck, `--package-manager npm|pnpm|yarn|bun` to
override the one it detected, and `--no-install` or `--no-git` to skip those
steps. It asks no questions.

A presentation built on Deckard is a plain Next.js app that you own. You do not
clone this repository to build a deck, and you do not write your slides in
`apps/playground`. This repository is where the framework is built. The full
walkthrough lives on the docs site under Getting started, and the short version
is below.

### One command surface

`deckard` is the only binary. Every command except `init` runs against the deck
in the current directory, which is how a generated app wires its own scripts.

| Command | What it does |
| --- | --- |
| `deckard init <dir>` | write a deck, install it, commit it, typecheck it |
| `deckard validate` | load the deck, check its slides and its theme |
| `deckard doctor` | check node, the package, the stylesheet, the deck, and the routes |
| `deckard check-overflow` | fail listing the slides the canvas clips |
| `deckard screenshots` | one PNG per slide at canvas size, `--max <n>` to stop early |
| `deckard contact-sheet` | every screenshot in one labelled grid |
| `deckard export pdf` | one PDF page per slide |
| `deckard add theme <name>` | install a registry theme into `deck/theme`, `--yes` to overwrite |
| `deckard add block <name>` | install a registry block into `app/slides/blocks` |

The four checks that need a browser build the app and serve it on a spare port.
They take `--port <n>` and `--skip-build`, and every one but the PDF export
takes `--light`.

### The packages are not on npm yet

`@deckard/core` and `@deckard/cli` are built for npm and are not published
there. Publishing them is the plan before the API is called stable, so the
`npx` line above does not work yet from a clean machine. Until it does, pack
both here and point the init at the tarballs:

```bash
# from the root of this repository
pnpm cli:build
pnpm --filter @deckard/core exec pnpm pack --pack-destination /tmp/deckard
pnpm --filter @deckard/cli exec pnpm pack --pack-destination /tmp/deckard
node packages/cli/bin/deckard.mjs init ~/code/my-talk \
  --core-tarball /tmp/deckard/deckard-core-0.0.1.tgz \
  --cli-tarball /tmp/deckard/deckard-cli-0.0.1.tgz
```

That is the in-repo path, and it runs the working copy of the binary. What
`pnpm smoke:cli` proves is the published one: it installs the CLI tarball into a
scratch directory outside the workspace and runs `init` through that copy, once
under pnpm and once under npm, so the template has to resolve from inside the
installed package. The other route is to build your deck inside this workspace
as a second app, the way `apps/demo` does, and move it out once the packages
publish. Once they do, `npx @deckard/cli init` is the whole install and nothing
in the generated app changes.

### One line of config

The package compiles to `dist/` with `tsc`: ESM, `.d.ts`, and the `use client`
directives preserved. No bundler, so a stack trace still points at a file that
matches the source. An app installs it and imports it like any other package,
with no `transpilePackages` entry and no Tailwind `@source` of its own.
`pnpm dev` runs `tsc --watch` beside the app, so an edit in the runtime lands
in the next render.

| Entry point | Contents |
| --- | --- |
| `@deckard/core` | `defineDeck`, slide resolution, summaries, theme helpers, every type |
| `@deckard/core/components` | `SlideShell`, `SlideViewport`, `SlideCanvas`, `SlideStep`, `SlideScrollArea`, `PresenterConsole`, `ColorModeProvider`, the slide context hooks |
| `@deckard/core/code-block` | `CodeBlock`, kept off the components barrel because shiki loads WebAssembly |
| `@deckard/core/discovery` | `discoverSlides` |
| `@deckard/core/next` | `createSlideRoute`, `createPresenterPage`, `createDeckSitemap`, `createFirstSlideRedirect` |
| `@deckard/core/slide-from-module` | `slideFromModule` |
| `@deckard/core/ui` | the shadcn primitives the runtime renders |
| `@deckard/core/utils` | `cn` |
| `@deckard/core/styles.css` | the `--slide-*` token contract |

The package holds nothing deck-specific. Colors, sizes, and backgrounds live in
the deck theme of the app that owns them.

### Adding Deckard to an app you already have

`deckard init` writes everything below into a new directory. Do it by hand when
the deck has to live inside an app that already exists.

A presentation built on Deckard is a plain Next.js app: `app/`, `components/`,
`deck/`, `public/`, `package.json`. One line connects it to the package.

```css
/* app/globals.css */
@import "tailwindcss";
@import "@deckard/core/styles.css";
```

That stylesheet registers the package's own compiled output as a Tailwind
source, so the chrome gets its utilities without the app naming a path inside
`node_modules`.

The routes come from `@deckard/core/next`, so an app owns its deck and nothing
else:

```tsx
// app/slides/[id]/page.tsx
import { createSlideRoute } from "@deckard/core/next"
import { deck } from "@/deck/deck"

const { Page, generateMetadata, generateStaticParams } = createSlideRoute(deck)

export { generateMetadata, generateStaticParams }
export default Page
```

| Adapter | Route |
| --- | --- |
| `createSlideRoute(deck)` | `app/slides/[id]/page.tsx`, returns `Page`, `generateMetadata`, `generateStaticParams` |
| `createPresenterPage(deck)` | `app/presenter/page.tsx`, returns `Page` and `metadata` |
| `createDeckSitemap(deck, { siteUrl })` | `app/sitemap.ts`, defaults to `NEXT_PUBLIC_SITE_URL` |
| `createFirstSlideRedirect(deck)` | `app/page.tsx`, redirects to the first slide |

### The theme and the blocks come from the registry

Themes and slide blocks are deliberately not in the package. They install into
your app as source files through shadcn, and you edit them from then on.

```bash
deckard add theme broadsheet
deckard add block media

# or straight through shadcn
pnpm dlx shadcn@latest add @deckard/preset-deckard
```

`deckard add` reads the registry URL from `components.json`, or takes
`--registry <url>` and hands that URL straight to shadcn. It checks the host
answers first and says what to start when it does not. shadcn asks before it
overwrites a theme, and `--yes` answers for it. The registry has no public host
yet, so it is served from this repository's docs site on port 3001, which is
what `deckard init` writes into `components.json`. See [Registry](#registry).

shadcn is a dependency of `@deckard/cli`, pinned to the version this repository
builds the registry with, and `deckard add` runs that installed binary. There is
no `dlx` and no download, so the same version runs on every package manager and
on every day.

### The routes come from the package

`@deckard/core/next` ships the route logic. An app's `app/slides/[id]/page.tsx`,
`app/presenter/page.tsx`, `app/sitemap.ts`, and `app/page.tsx` are thin
re-exports of `createSlideRoute`, `createPresenterPage`, `createDeckSitemap`,
and `createFirstSlideRedirect`. Every slide prerenders statically: the route
reads no request, and the presenter preview flags are read on the client.

## Working on the framework

This repository is a pnpm workspace run by Turborepo. Everything in it exists
to develop and prove the framework.

| Path | What it is |
| --- | --- |
| `packages/core` | `@deckard/core`, the deck contract and the slideshow runtime |
| `apps/playground` | the reference deck. It exercises every feature on purpose and the visual checks run against it, so it is a test surface, not a template |
| `apps/demo` | a 19-slide conference talk shaped exactly like a consumer app, with its own theme and its own copies of the blocks |
| `apps/docs` | the documentation site, which also serves the registry JSON at `/r/{name}.json` |
| `packages/cli` | `@deckard/cli`, the `deckard` binary: init, the deck checks, add, doctor |
| `registry` | theme sources the playground does not use, published through the registry |
| `tools/package-smoke` | proves the package installs into a plain Next.js app |
| `tools/registry-smoke` | proves the registry installs into a plain Next.js app |
| `tools/cli-smoke` | proves `deckard init` produces a deck that builds |

Slides added to the playground demonstrate the framework. They are nobody's
presentation and they ship to nobody.

```bash
pnpm install
pnpm dev                # playground on :3000
pnpm demo               # the demo talk on :3002
pnpm --filter docs dev  # the docs and the registry on :3001
```

Every script runs from the root:

```bash
pnpm build          # every app
pnpm typecheck
pnpm test           # 96 tests across core, the CLI, and both decks
pnpm lint
pnpm analyze
pnpm cli:build           # build @deckard/core and @deckard/cli
pnpm deck:validate       # deck, theme, and registry integrity
pnpm deck:doctor         # the app-shape checks against the playground
pnpm deck:check-overflow # fail on slides the canvas clips
pnpm deck:screenshots    # one PNG per slide at canvas size
pnpm deck:contact-sheet  # every screenshot in one grid image
pnpm demo:validate  # the same checks against apps/demo, plus demo:doctor,
                    # demo:check-overflow, demo:screenshots, demo:contact-sheet,
                    # demo:export:pdf
pnpm registry:build # write the shadcn registry to apps/docs/public/r
pnpm smoke:package  # pack @deckard/core and build a scratch app against it
pnpm smoke:registry # install the registry into a scratch app and build it
pnpm smoke:cli      # deckard init from the packed CLI on pnpm and npm, then build it
```

Every `deck:` and `demo:` script builds `@deckard/cli` first, through Turbo, so
the binary the app scripts call is current. Those app scripts are the same ones
`deckard init` writes, pointed at the workspace copy of the binary.

`AGENTS.md` is the short version of the rules for a coding agent, and
`.claude/skills/slide-authoring/SKILL.md` is the slide-authoring skill it loads
when it writes or edits slides. `docs/MIGRATION-NOTES.md` records what building
`apps/demo` on this API proved, including the parts that pushed back.

### Inside the demo

`apps/demo` is the proof that a deck built on Deckard is a plain Next.js app. It
consumes `@deckard/core` through the workspace, installs its blocks and its theme
as files it owns, and runs the same checks as the playground through the
`deckard` binary. It carries a 19-slide talk with a manual opening and
close, nine discovered slide modules, an async Server Component that reads the
workspace at build time, a nested client widget, step reveals, a fullscreen media
slide, and a code walkthrough. Read `docs/MIGRATION-NOTES.md` for what building
it cost. If you want to see what a real deck looks like, read this one, not the
playground.

### Inside the playground

- `apps/playground/deck/slides.tsx`: slide definitions
- `apps/playground/deck/slides/*.slide.tsx`: file-per-slide modules, discovered by one glob or wired in with `slideFromModule`
- `apps/playground/deck/deck.ts`: deck config (title, description, canvas, theme, header and footer defaults) wrapped in `defineDeck`
- `apps/playground/deck/theme/`: the deck theme (`theme.css`, the `SlideTheme` export, and `THEME.md`)
- `apps/playground/app/slides/blocks/*`: deck-authoring building blocks (layout, typography, collections, media)
- `apps/playground/components/ui/*`: shadcn primitives this app adds on top of the ones the runtime ships

### Inside the package

- `packages/core/src/deck/*`: slide model, id resolution, validation, discovery
- `packages/core/src/components/slide-shell.tsx`: slideshow chrome (header, navigation, frame)
- `packages/core/src/components/slide-viewport.tsx`: fits the canvas to the browser viewport
- `packages/core/src/components/slide-canvas.tsx`: the fixed coordinate space slides are authored in
- `packages/core/src/components/slide-background.tsx`: the background hook the theme paints

## The canvas

Every slide is authored in one fixed coordinate space, 1920x1080 by default.
`SlideViewport` scales that canvas to fit the browser window and centers it,
`SlideCanvas` holds the header, footer, background, and slide body inside it.
A slide looks the same on a laptop, a projector, a phone, and in the PDF: only
the scale changes.

The fit is measured in the browser and published as `--deckard-scale`, because
CSS cannot divide a length by a length in every engine Deckard targets. Slide
content stays server rendered, and the canvas stays hidden until the first
measurement lands so it never flashes at the wrong size.

Configure it in `deck/deck.ts`:

```ts
canvas: {
  mode: "fixed",
  width: 1920,
  height: 1080,
  fit: "contain",
  margin: 0,
}
```

`margin` is the gap in browser pixels between the canvas and the window edge.
It defaults to `0`, so a window with the canvas aspect ratio shows the canvas
edge to edge. Set it if a deck wants the canvas to float inside the window.
Content spacing is a slide concern: the default frame keeps slide bodies off
the canvas edges, and `layout: "fullscreen"` hands the whole canvas to the
slide so media can bleed to every edge.

Two rules follow from the fixed canvas:

- Size slide content against the canvas, with `h-full` and percentages. Browser
  viewport units (`svh`, `vw`) and responsive breakpoints (`sm:`, `lg:`) inside
  the canvas would react to the window instead of the slide, so the canvas is
  the wrong size for them.
- The canvas clips what does not fit. In development an overflowing slide gets
  a console warning and an amber outline, and `pnpm deck:check-overflow` fails
  on it. Trim the content, or put the part that has to scroll in a
  `SlideScrollArea`.

`SlideScrollArea` keeps wheel, touch, and key scrolling inside itself so
scrolling never steps the deck:

```tsx
<SlideScrollArea label="Full config" maxHeight={360}>
  <ConfigTable />
</SlideScrollArea>
```

`CodeBlock` takes an optional `maxHeight` and uses it for long samples.

Deck chrome (footer navigation and counter, command center, presenter popout,
color mode toggle) lives outside the canvas so it keeps its own size and hit
targets at any scale, down to a phone.

## Slide model

`SlideDefinition` supports:

- Required: `body`
- Optional identity: `slug`, `title`
- Optional flow: `stepCount`, `notes`
- Optional chrome/layout: `header`, `footer`, `layout`, `background`

### Slide ids

The exported `slides` array in `deck/slides.tsx` always defines deck order.
`resolveSlides` never reorders it, so moving a slide in the array is the only
way to move it in the deck.

Every slide gets an id, and the id is the URL. A slide without a `slug` is
served at its 1-based position, so the fourth slide is `/slides/4`. Give a
slide a `slug` when you want a link that survives reordering, and it is served
at `/slides/<slug>` instead. Slugs accept lowercase letters, digits, and
hyphens.

Ids are matched exactly. A slugged slide is served only at its slug, never
at its position, so there is one URL per slide.

Titles never become slugs. A slide with no `title` falls back to `Slide 4` in
the header, command center, and presenter flow.

The deck fails to build on a duplicate slug, an empty slug, a slug with
characters that are unsafe in a URL path, or a slug made only of digits.

Slide primitives can read the current slide `title` from context, so layout
blocks only need an explicit `title` prop when you want to override the slide
title text inside the layout.

### Header behavior

`header` can be:

- `"visible"`: always render header
- `"hidden"`: never render header
- `"auto"`: render in default layout, hide in fullscreen layout

Global default is configured in `deck/deck.ts`.

### Footer behavior

`footer` can be:

- `"visible"`: full previous/next controls + counter
- `"counter"`: counter only (`Slide x of y`)
- `"hidden"`: no footer

## Adding slides

Add entries to your deck's `deck/slides.tsx`.

Example content slide:

```tsx
{
  title: "My Slide",
  body: <MySlideComponent />,
  background: "spotlight",
}
```

Example slide with a stable route:

```tsx
{
  slug: "pricing",
  title: "Pricing",
  body: <MySlideComponent />,
}
```

Presenter notes example:

```tsx
{
  title: "My Slide",
  notes: "Speaker-only context and reminders shown in /presenter.",
  body: <MySlideComponent />,
}
```

Example image slide:

```tsx
{
  title: "Architecture Diagram",
  body: (
    <ImageShowcaseSlide
      image={{ src: diagramImage, alt: "System architecture", placeholder: "blur" }}
    />
  ),
  layout: "fullscreen",
  header: "hidden",
}
```

Example fullscreen video slide with autoplay:

```tsx
{
  title: "Launch Video",
  body: (
    <FullscreenMediaSlide
      media={{ kind: "video", src: "/videos/launch.mp4", autoplay: true }}
    />
  ),
  layout: "fullscreen",
  header: "hidden",
  footer: "hidden",
}
```

`FullscreenMediaSlide` options:

- `variant: "framed" | "background"` (`background` is edge-to-edge)
- `overlay: "none" | "subtle" | "medium" | "strong"` for text readability over media
- `media.fit: "cover" | "contain"` (defaults to `"cover"`)

## Server components and slide modules

Slides are Server Components. A slide body can be async and await its own data
before it renders:

```tsx
async function ReleaseSlide() {
  const releases = await loadReleases()

  return <ContentSlideCard eyebrow="Releases" title="Shipped this quarter">
    <FeatureGrid items={releases} />
  </ContentSlideCard>
}
```

Interactivity goes one level down, in a nested client component the slide
renders. Never put `"use client"` at the top of `deck/slides.tsx` or a slide
module, `deck/slides.test.ts` fails on it.

A slide can also live in its own file as a module that exports `default`,
`meta`, and `notes`:

```tsx
// deck/slides/pricing.slide.tsx
export const meta: SlideMeta = { slug: "pricing", title: "Pricing" }
export const notes = "Speaker-only context."
export default async function PricingSlide() {
  return <PricingTable plans={await loadPlans()} />
}
```

```tsx
// deck/slides.tsx
slideFromModule(pricingSlide, "deck/slides/pricing.slide.tsx")
```

`discoverSlides` does that import for you. See
[Discovering slide modules](#discovering-slide-modules).

Props that cross into a client component have to be serializable. The chrome
passes `SlideSummary` values (`id`, `number`, `title`, `href`, `stepCount`)
built from the resolved deck, and the rendered slide body crosses only as
`children`.

A slide that throws under `next dev` renders an inline error card with the
slide id and the message, and navigation keeps working. In a production build a
Server Component that throws is fatal to the route, so Next serves its own
error page.

## Discovering slide modules

`deck/slides.tsx` is a plain array and stays one. Discovery only saves you the
imports:

```tsx
const discoveredSlides = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

export const slides: SlideDefinition[] = [
  { slug: "intro", title: "Deckard", body: <HeroSlide /> },
  ...discoveredSlides,
  { title: "Use It", body: <HeroSlide /> },
]
```

The spread decides where the group lands. Slides before and after it are manual
entries, the discovered ones fill the gap in their sorted order, and moving the
spread moves the whole group.

### Inline or extracted

The glob is eager, so every matched module is in the bundle either way.
Extraction buys editing room, never loading speed.

Keep a slide in the array while it is metadata and one block. Give it a file
once it loads its own data, brings a client widget along, or carries notes
longer than the slide body. A deck that never adds a file loses nothing.

### Sorting

`discoverSlides` takes `sort`:

- `"path"` (default) compares the normalized glob keys segment by segment, with
  numbers compared as numbers. `2-intro.slide.tsx` sorts before
  `10-outro.slide.tsx`, and `10-context/20-b.slide.tsx` sorts after
  `10-context/10-a.slide.tsx` and before `20-solution/10-a.slide.tsx`.
- `"order"` reads `meta.order` first and falls back to path order for ties and
  for modules that set no order. Number the slides you care about and let the
  filenames handle the rest.
- A comparator function receives `{ path, meta }` for both slides and is used as
  given.

Sorting never reads the enumeration order of the glob object.

`meta.order` sorts inside the discovered group and nowhere else. `discoverSlides`
consumes it and leaves it off the definition it returns, so a module cannot push
itself past a manual slide or out of the spread. Explicit array placement wins.

### Two limits

A discovered module has to be a synchronous module. If it or anything it imports
uses top-level await or WebAssembly, the eager glob hands back a promise instead
of the exports, and discovery throws with the file path. `CodeBlock` is the case
here, because shiki loads a WebAssembly regex engine. That is why it ships from
`@deckard/core/code-block` instead of the components barrel: pulling it through
the barrel would make every discovered module async. A slide that shows
highlighted code belongs in the array, wired with `slideFromModule`.

Adding or deleting a matched file while `next dev` runs updates route handlers
but leaves page routes serving stale modules. Restart the dev server after
adding a slide file.

## Presenter preview context

Presenter previews render slide routes with `?presenterPreview=1`, and slides
can detect that mode with `useIsPresenterPreview()` from
`@deckard/core/components`.

The slide route never reads the query itself. `?presenterPreview=1` and `?step=`
are read on the client, inside a Suspense boundary that holds nothing but the
reader, so every slide prerenders as static HTML and only the preview wiring
(chrome visibility, the read-only stepper, presenter sync, frozen media) settles
after hydration.

Use that hook in custom client components to skip autoplay, audio, canvas, or
other expensive interactive rendering inside the presenter preview iframe.

The built-in video slide primitives already suppress autoplay in presenter
preview.

## Background variants

`background` supports:

- `"default"`
- `"spotlight"`
- `"grid"`
- `"none"`

`SlideBackground` renders one empty element carrying `data-slide-background`.
What each variant paints lives in the deck theme, so change the look in
`deck/theme/theme.css` and read `deck/theme/THEME.md` first.

## Theme

`deck/theme/` owns every audience-facing color, size, and background in the
deck. The stylesheet is scoped to the theme class, which `SlideCanvas` puts on
the canvas element, so the utility bar, command center, and presenter console
keep the app tokens and stay readable whatever the deck looks like.

```ts
export const theme = {
  className: "deckard-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "deckard",
} satisfies SlideTheme
```

`defineDeck` validates the theme. `defaultColorMode: "system"` needs both color
modes. A theme that lists one mode pins the canvas to it and hides the
light/dark toggle. There is no runtime switching between named themes.

Inside the canvas, style with semantic tokens (`bg-card`, `text-muted-foreground`)
or slide tokens (`--slide-title-size`, `--slide-surface`). Never a hardcoded
color. `deck/theme/THEME.md` lists the tokens and what they control.

## Checking a deck

Four subcommands of `deckard` cover the checks a deck needs. They share one
harness, `packages/cli/src/deck/preview.ts`, which builds the app, starts
`next start` on a spare port, and opens a page sized so the canvas renders at
scale 1. The PDF export runs on the same harness.

`@deckard/cli` installs into an app as a dev dependency and puts one binary on
the path, so a deck's `package.json` reads `"deck:validate": "deckard
validate"`. Every command takes the current working directory as the deck,
which is what makes one copy serve every app in this repo. Pass
`--registry <path>` to `deckard validate` to also check a shadcn
`registry.json`; without it the run covers the deck and its theme only.

```bash
pnpm deck:validate
```

Loads the real deck through a throwaway Vite server, in about a second, and
reports:

- the deck resolves, every slide has a body, and every `sourcePath` a discovered
  module reports is a file on disk. A duplicate slug, an unsafe slug, or a
  module without a default export comes back as one line naming the slide or the
  file, not a stack trace at build time
- the theme class in `deck/theme/index.ts` is a selector in `deck/theme/theme.css`,
  the dark block defines nothing the light block does not, and `colorModes`
  matches the blocks the stylesheet actually carries
- every `files[].path` in the root `registry.json` exists, and every registry
  theme's class is a selector in the stylesheet it ships

It exits nonzero on any of those and prints slide counts otherwise.

```bash
pnpm deck:check-overflow
```

Measures each slide's frame against the canvas with the same arithmetic as the
development-only `SlideOverflowGuard`, and exits nonzero listing every slide the
canvas clips and by how much. Add `--light` to check light mode instead of dark.

```bash
pnpm deck:screenshots
pnpm deck:contact-sheet
```

`deck:screenshots` writes one PNG per slide at canvas size to
`out/screenshots/<id>.png` in the deck's own app, plus a manifest.
`deck:contact-sheet` composes them into `out/contact-sheet.png`, a labelled grid
of the whole deck. Both take `--light`, the screenshots take `--max <n>` to stop
after the first few slides, and the contact sheet takes `--columns <n>`.

A build is reused when it is newer than everything in `app/`, `deck/`,
`components/`, `assets/`, `public/`, and the `src` of the `@deckard/core` the
app resolves. Pass `--skip-build` to reuse whatever is in `.next`, or
`--port <n>` to move off the default port.

```bash
pnpm deck:doctor
```

Checks the shape of the app rather than the content of the deck: the node
version, that `@deckard/core` resolves, that `app/globals.css` imports
`@deckard/core/styles.css`, that `deck/deck.ts` loads, and that the four route
files still re-export their adapters. Each failure prints what to do about it.
Reach for it when a deck that used to work stops, and for `validate` when the
slides changed.

## PDF export

Use Playwright + PDF-lib export:

```bash
pnpm exec playwright install chromium
pnpm export:pdf
```

Dark export theme:

```bash
pnpm export:pdf -- --dark
```

This runs a production build in `NEXT_PUBLIC_PDF_EXPORT=1` mode and writes
`out/slides.pdf` in the deck's app, which is `apps/playground/out/slides.pdf`
for the playground.

Slide routes are discovered from the app's `app/sitemap.ts` (`/sitemap.xml`) so export
stays aligned with your published slide paths.

Export mode behavior:

- one page per slide at the deck canvas size, captured from the canvas element
- animations/transitions disabled
- deck header/footer hidden

Page size comes from the `canvas` config in `deck/deck.ts`, so the export
cannot drift from what the audience sees.

Optional env vars:

- `PDF_EXPORT_PORT` (default `3410`, or pass `--port=N`)
- `PDF_EXPORT_OUTPUT` (default `out/slides.pdf`, relative to the app)

Skip build (reuse existing `.next` build):

```bash
pnpm export:pdf -- --skip-build
```

## Package compatibility

`pnpm smoke:package` packs `@deckard/core` with `pnpm pack`, installs the
tarball into a scratch app under the system temp directory, and runs
`next typegen`, `tsc --noEmit`, and `next build` there. The scratch app sits
outside the workspace and resolves nothing from this repo, so a missing
dependency or a broken export map fails there instead of in someone else's
project. It takes about 16 seconds.

That run is also the proof behind the tarball install above. The fixture it
copies lives in `tools/package-smoke/fixture` and covers a plain slide, an async
slide, a discovered module, a stepped slide, and a client widget. The scratch
directory is deleted afterwards. Pass `--keep` to inspect it.

`pnpm smoke:cli` proves the same thing for the generator, and it proves it from
the tarball rather than from the checkout. It runs `pnpm cli:build`, so
`@deckard/core` is built before the CLI compiles against its types, and packs
both packages. Then it installs the CLI tarball into a scratch directory outside
the workspace and runs `deckard init` through that installed copy, with
`--core-tarball` and `--cli-tarball`, letting the init do its own install. The
template files it writes can only have come from inside the installed package.

It does that twice. The pnpm pass typechecks and builds the generated app,
asserts that `/slides/intro`, `/slides/keyboard`, and `/slides/2` are
prerendered HTML on disk, runs `deckard validate` and `deckard doctor` inside
it, and captures one screenshot with `--max 1`. The npm pass is the `npx` flow
on a machine without pnpm: install, typecheck, build, and the same prerender
assertion, with no browser. Both passes check that the generated
`packageManager` field names the manager that ran init and that no generated
script names a package manager at all. The whole run takes about 70 seconds and
prints a per-phase breakdown.

There is one gap worth naming: the template's dependency versions and the two
tarballs come from this repository, so the smoke proves the generated app works
against the code in the working tree, not against whatever is on npm.

## Registry

`registry.json` at the root publishes the themes and blocks through shadcn.
`pnpm registry:build` writes the item JSON to `apps/docs/public/r`, which is
gitignored, so the docs site serves the registry at `/r/{name}.json`. The docs
site lists every item at `/registry` with its install command. There is no
public host for the registry yet, so a consuming app points at the docs site
running locally on port 3001.

There are seven items. `theme-deckard` and `theme-broadsheet` each install
three files to `deck/theme/`, so adding one replaces the other.
`block-typography`, `block-slide-layouts`, `block-collections`, and
`block-media` install to `app/slides/blocks/`. `preset-deckard` pulls in the
default theme and every block, and writes the one line the app stylesheet
needs, `@import "@deckard/core/styles.css"`. That sheet registers the package's
own Tailwind source, so there is nothing left to wire in `next.config.mjs`.

Theme sources live in two places. The deckard theme is published straight out
of `apps/playground/deck/theme`, where the reference deck uses it, so the
registry ships the file the playground renders. Broadsheet has no such home and
lives in `registry/themes/broadsheet`.

`pnpm smoke:registry` proves the whole path. It builds the registry, serves it
on a spare port, packs `@deckard/core`, and installs both into a scratch app
outside the workspace. It checks the files land where the items claim, that the
preset wrote the stylesheet import and nothing else, that the app builds with
an empty `next.config.mjs`, and that both an edit to the installed `theme.css`
and the runtime's own utility classes reach the built stylesheet. Then it swaps
in `theme-broadsheet` and typechecks again. It takes about a minute.

### The init template comes from the same sources

`deckard init` cannot reach the registry, because a new app has no shadcn
config and the registry has no host. So the CLI ships the same files inside
`packages/cli/template`, and `packages/cli/scripts/sync-template.ts` copies them
there from the canonical sources: the four blocks and the deckard theme from
`apps/playground`, broadsheet from `registry/themes`, and the pinned versions of
next, react, and tailwind out of the playground's `package.json`. The sync runs
on every CLI build, and `pnpm test` runs it again with `--check`, which fails
naming any file that drifted. Edit the playground's blocks, not the copies.
