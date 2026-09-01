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
    slides/blocks/       the five block families, yours to edit
  deck/
    deck.ts              defineDeck config
    slides.tsx           the slide array
    slides/*.slide.tsx   file-per-slide modules
  public/
  components.json
  next.config.ts
  package.json
```

`init` takes `--theme <name>` to pick one of deckard, broadsheet, ledger,
meridian, nexus, or phosphor, which it writes as an import rather than a copy,
`--empty` for two slides instead of the sample deck, `--package-manager npm|pnpm|yarn|bun` to override the one it detected,
and `--no-install` or `--no-git` to skip those steps. It asks no questions.

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
| `deckard add theme <name>` | point `deck/deck.ts` at another built-in theme |
| `deckard eject theme` | copy the built-in the deck uses into `deck/theme`, yours to edit |
| `deckard add block <name>` | install a registry block into `app/slides/blocks` |

The four checks that need a browser build the app and serve it on a spare port.
They take `--port <n>` and `--skip-build`, and every one but the PDF export
takes `--light`.

### The packages are not on npm yet

`@deckard/core`, `@deckard/themes`, and `@deckard/cli` are built for npm and are
not published there. Publishing them is the plan before the API is called
stable, so the `npx` line above does not work yet from a clean machine. Until it
does, pack all three here and point the init at the tarballs:

```bash
# from the root of this repository
pnpm cli:build
pnpm --filter @deckard/core exec pnpm pack --pack-destination /tmp/deckard
pnpm --filter @deckard/themes exec pnpm pack --pack-destination /tmp/deckard
pnpm --filter @deckard/cli exec pnpm pack --pack-destination /tmp/deckard
node packages/cli/bin/deckard.mjs init ~/code/my-talk \
  --core-tarball /tmp/deckard/deckard-core-0.0.1.tgz \
  --themes-tarball /tmp/deckard/deckard-themes-0.0.1.tgz \
  --cli-tarball /tmp/deckard/deckard-cli-0.0.1.tgz
```

The three version together, so `init` writes the same `^<cli version>` range for
all three when you do not pass a tarball. Splitting their versions is a decision
for the day one of them needs to move without the others.

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
a theme, and a theme is data: the runtime depends on the token contract in
`styles.css` and never on a preset. `@deckard/themes` is where the presets live,
and the dependency runs one way. It takes `SlideTheme` from `@deckard/core` as a
type-only import and names core a peer, so nothing crosses at runtime and core
does not know the themes exist.

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

### The themes come with the package

`@deckard/themes` is the second package a deck installs, and the six themes are
its only export. A deck picks one by importing it and handing it to
`defineDeck`, and importing the module pulls in its stylesheet, so there is
nothing else to wire.

```ts
// deck/deck.ts
import { defineDeck } from "@deckard/core"
import { phosphor } from "@deckard/themes"

import { slides } from "@/deck/slides"

export const deck = defineDeck({ slides, theme: phosphor, title: "My talk" })
```

`deckard add theme <name>` makes that edit for you. Only the theme a deck
imports reaches the bundle: the barrel re-exports all six, and the bundler drops
the modules nothing uses, stylesheets included.

`deckard eject theme` is the way out. It copies the theme the deck imports out
of the installed package into `deck/theme/` as `theme.css`, `index.ts`, and
`THEME.md`, and repoints `deck/deck.ts` at the copy. From then on the theme is
your source and the package never touches it. It refuses when `deck/theme/`
already exists, because a deck has exactly one theme. `apps/demo` is that
arrangement in the repository: an ejected fork of broadsheet it has since
edited.

### The blocks come from the registry

Slide blocks are deliberately not in the package. They install into your app as
source files through shadcn, and you edit them from then on.

```bash
deckard add block metrics

# or straight through shadcn
pnpm dlx shadcn@latest add @deckard/preset-blocks
```

`deckard add block` reads the registry URL from `components.json`, or takes
`--registry <url>` and hands that URL straight to shadcn. It checks the host
answers first and says what to start when it does not. shadcn asks before it
overwrites a file, and `--yes` answers for it. The registry has no public host
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
| `packages/themes` | `@deckard/themes`, the six deck themes |
| `apps/playground` | the reference deck. It exercises every feature on purpose and the visual checks run against it, so it is a test surface, not a template |
| `apps/demo` | a 19-slide conference talk shaped exactly like a consumer app, with an ejected theme of its own and its own copies of the blocks |
| `apps/docs` | the documentation site, which also serves the registry JSON at `/r/{name}.json` |
| `packages/cli` | `@deckard/cli`, the `deckard` binary: init, the deck checks, add, eject, doctor |
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
pnpm cli:build           # build @deckard/core, @deckard/themes, and @deckard/cli
pnpm deck:validate       # deck, theme, and registry integrity
pnpm deck:doctor         # the app-shape checks against the playground
pnpm deck:check-overflow # fail on slides the canvas clips
pnpm deck:screenshots    # one PNG per slide at canvas size
pnpm deck:contact-sheet  # every screenshot in one grid image
pnpm demo:validate  # the same checks against apps/demo, plus demo:doctor,
                    # demo:check-overflow, demo:screenshots, demo:contact-sheet,
                    # demo:export:pdf
pnpm registry:build # write the shadcn registry to apps/docs/public/r
pnpm smoke:package  # pack @deckard/core and @deckard/themes, build a scratch app on them
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
consumes `@deckard/core` through the workspace, owns its blocks and its ejected
theme as files, and runs the same checks as the playground through the
`deckard` binary. It carries a 19-slide talk with a manual opening and
close, nine discovered slide modules, an async Server Component that reads the
workspace at build time, a nested client widget, step reveals, a fullscreen media
slide, and a code walkthrough. Read `docs/MIGRATION-NOTES.md` for what building
it cost. If you want to see what a real deck looks like, read this one, not the
playground.

### Inside the playground

- `apps/playground/deck/slides.tsx`: slide definitions
- `apps/playground/deck/slides/*.slide.tsx`: file-per-slide modules, discovered by one glob or wired in with `slideFromModule`
- `apps/playground/deck/deck.ts`: deck config (title, description, canvas, theme, header and footer defaults) wrapped in `defineDeck`, with the deckard theme imported from `@deckard/themes`
- `apps/playground/app/slides/blocks/*`: deck-authoring building blocks (layout, typography, collections, media)
- `apps/playground/components/ui/*`: shadcn primitives this app adds on top of the ones the runtime ships

### Inside the package

- `packages/core/src/deck/*`: slide model, id resolution, validation, discovery
- `packages/core/src/components/slide-shell.tsx`: the shell that assembles a slide (frame, canvas chrome, deck controls)
- `packages/core/src/components/slide-chrome.tsx`: the themed header and footer inside the canvas
- `packages/core/src/components/deck-controls.tsx`: the corner cluster that drives the deck
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

Chrome splits in two. The header and the footer are deck layout: they live
inside the canvas, scale with it, and belong to the theme. The deck controls
(command center, presenter popout, color mode toggle, previous and next) live
outside the canvas, so they keep their own size and hit targets at any scale,
down to a phone.

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

- `"visible"`: the slide counter and the progress hook
- `"hidden"`: no footer

`"counter"` was the third mode, back when a visible footer also carried
previous and next buttons. Those buttons are in the deck controls now, so
`"counter"` and `"visible"` describe the same footer; a deck that still says
`"counter"` resolves to `"visible"`.

## Deck chrome

The header and the footer are painted inside the canvas, so they scale with the
deck, print into the PDF export, and show up in a presenter preview. The runtime
renders the structure and the theme decides the look:

```html
<header data-slide-header>
  <a data-slide-header-brand href="/">Deckard</a>
  <span data-slide-header-title>Themed chrome</span>
  <time data-slide-header-date>March 2026</time>
</header>

<footer data-slide-footer>
  <div data-slide-progress style="--slide-progress: 0.25"></div>
  <p data-slide-counter>
    <span data-slide-counter-current>3</span>
    <span data-slide-counter-separator> of </span>
    <span data-slide-counter-total>12</span>
  </p>
</footer>
```

The title renders only for a slide that has one, and the date only when
`deck/deck.ts` sets `header.date`. It is printed as written, so a deck picks its
own format. `--slide-progress` is the position in the deck as a fraction, which
is what a theme reads to paint a bar, a row of dots, or nothing.

`@deckard/core/styles.css` carries a neutral default on eight tokens:
`--slide-chrome-foreground`, `--slide-chrome-emphasis`, `--slide-chrome-border`,
`--slide-chrome-size`, `--slide-chrome-tracking`, `--slide-chrome-gap`,
`--slide-progress-track`, and `--slide-progress-fill`. Every theme in the
registry overrides them and styles the attributes above; each `THEME.md` has a
`Deck chrome` section describing what that theme does.

### Deck controls

The command center, the presenter popout, the color mode toggle, and compact
previous and next buttons sit in one cluster in the bottom right corner, outside
the canvas. The cluster is hidden at rest and reveals when the pointer comes
within 160px of the corner, when anything inside it takes focus, or while the
command dialog is open. On a touch device, where there is no hover, a handle
sits in the corner and expands the cluster on tap.

Hidden means transparent, not absent: the buttons stay in the accessibility
tree, tabbing into them reveals the cluster, and `Cmd/Ctrl+K` opens the command
center whether the cluster is showing or not. A presenter preview and a PDF
export drop the cluster entirely and keep the header and footer.

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
What each variant paints lives in the theme, so change the look in its
`theme.css` and read its `THEME.md` first. Run `deckard eject theme` when the
theme is still an import.

## Theme

A theme owns every audience-facing color, size, and background in the deck,
including the header and the footer. Its stylesheet is scoped to the theme
class, which `SlideCanvas` puts on the canvas element, so the deck controls,
command center, and presenter console keep the app tokens and stay readable
whatever the deck looks like.

A theme is three files: `theme.css`, an `index.ts` exporting one `SlideTheme`,
and a `THEME.md` naming every token. The six built-ins live in
`packages/themes/src/<name>` and reach a deck through
`@deckard/themes`; an ejected theme is the same three files in
`deck/theme/`.

```ts
export const deckard = {
  className: "deckard-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "deckard",
} satisfies SlideTheme
```

`defineDeck` validates the theme. `defaultColorMode: "system"` needs both color
modes. A theme that lists one mode pins the canvas to it and hides the
light/dark toggle. There is no runtime switching between named themes.

`defaultColorMode` decides what a browser opens on, not what the checks capture.
`--light` and the light PDF export force the mode they name, so a deck that
defaults to dark still shoots light when asked, and a capture that came out in
the other mode fails naming the slide instead of being written.

Inside the canvas, style with semantic tokens (`bg-card`, `text-muted-foreground`)
or slide tokens (`--slide-title-size`, `--slide-surface`). Never a hardcoded
color. The theme's `THEME.md` lists the tokens and what they control.

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
- the theme class is a selector in the stylesheet the deck actually renders,
  the dark block defines nothing the light block does not, and `colorModes`
  matches the blocks that stylesheet carries. It reads `deck/theme/theme.css`
  when the deck ejected its theme and the copy inside the installed
  `@deckard/core` when the deck imports a built-in, and names which one it read
- every `files[].path` in the root `registry.json` exists

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
- the deck header and footer print, exactly as the slide's own modes say
- the deck controls do not render

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

`pnpm smoke:package` packs `@deckard/core` and `@deckard/themes` with
`pnpm pack`, installs both tarballs into a scratch app under the system temp
directory, and runs
`next typegen`, `tsc --noEmit`, and `next build` there. The scratch app sits
outside the workspace and resolves nothing from this repo, so a missing
dependency or a broken export map fails there instead of in someone else's
project. It takes about 16 seconds.

That run is also the proof behind the tarball install above. The fixture it
copies lives in `tools/package-smoke/fixture` and covers a plain slide, an async
slide, a discovered module, a stepped slide, and a client widget. Its deck
imports the phosphor theme, and the run asserts `.phosphor-theme` reaches the
built stylesheet while the other five stay out of it, which is the tree shaking
across the barrel proved rather than assumed. The scratch
directory is deleted afterwards. Pass `--keep` to inspect it.

`pnpm smoke:cli` proves the same thing for the generator, and it proves it from
the tarball rather than from the checkout. It runs `pnpm cli:build`, so
`@deckard/core` and `@deckard/themes` are built before the CLI compiles against
their types, and packs
all three packages. Then it installs the CLI tarball into a scratch directory outside
the workspace and runs `deckard init` through that installed copy, with
`--core-tarball`, `--themes-tarball`, and `--cli-tarball`, letting the init do
its own install. The
template files it writes can only have come from inside the installed package.

It does that twice. The pnpm pass typechecks and builds the generated app,
asserts that `/slides/intro`, `/slides/keyboard`, and `/slides/2` are
prerendered HTML on disk, runs `deckard validate` and `deckard doctor` inside
it, captures one screenshot with `--max 1`, then runs `deckard eject theme` and
validates and typechecks the deck against the copy it wrote. The npm pass is the `npx` flow
on a machine without pnpm: install, typecheck, build, and the same prerender
assertion, with no browser. Both passes check that the generated
`packageManager` field names the manager that ran init and that no generated
script names a package manager at all. The whole run takes about 70 seconds and
prints a per-phase breakdown.

There is one gap worth naming: the template's dependency versions and the two
tarballs come from this repository, so the smoke proves the generated app works
against the code in the working tree, not against whatever is on npm.

## Registry

`registry.json` at the root publishes the blocks through shadcn.
`pnpm registry:build` writes the item JSON to `apps/docs/public/r`, which is
gitignored, so the docs site serves the registry at `/r/{name}.json`. The docs
site lists every item at `/registry` with its install command. There is no
public host for the registry yet, so a consuming app points at the docs site
running locally on port 3001.

There are six items. `block-typography`, `block-slide-layouts`,
`block-collections`, `block-media`, and `block-metrics` install to
`app/slides/blocks/`. `preset-blocks` pulls in all five and writes the one line
the app stylesheet needs, `@import "@deckard/core/styles.css"`. That sheet
registers the package's own Tailwind source, so there is nothing left to wire in
`next.config.ts`.

The themes used to be registry items and are not any more. They ship as
`@deckard/themes`, so a deck gets one by importing it rather than by installing
six files it did not ask to own. `deckard eject theme` is the install, on
demand, from the copy already on disk.

`pnpm smoke:registry` proves the whole path. It builds the registry, serves it
on a spare port, packs `@deckard/core` and `@deckard/themes`, and installs all
three into a scratch app
outside the workspace. It checks the blocks land where the items claim and that
nothing installs a `deck/theme`, that the preset wrote the stylesheet import and
nothing else, that the app builds with an empty `next.config.ts`, and that an
edit to an installed block, the stylesheet of the built-in theme the fixture
deck imports, and the runtime's own utility classes all reach the built
stylesheet. It takes about a minute.

### The init template comes from the same sources

`deckard init` cannot reach the registry, because a new app has no shadcn
config and the registry has no host. So the CLI ships the blocks inside
`packages/cli/template`.

That directory is build output. It is gitignored, and
`packages/cli/scripts/sync-template.ts` rebuilds it from scratch on every CLI
build and again on `prepack`: the hand-authored app shell, routes, tsconfig, and
sample slides come from `packages/cli/template-src`, the five blocks from
`apps/playground`, and the pinned versions of next, react, and tailwind out of
the playground's `package.json`. Nothing is committed twice, so there is no
drift gate to run and nothing to keep in sync by hand. Edit `template-src` or
the playground's blocks.

The theme is not in the template at all. `init` writes the import instead, so
`--theme phosphor` is one identifier in the generated `deck/deck.ts`.
