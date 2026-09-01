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
- Presenter notes per slide via `notes` in `apps/playground/deck/slides.tsx`
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

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the playground deck.
`pnpm --filter docs dev` serves the documentation site on port 3001.

## The monorepo

This is a pnpm workspace run by Turborepo.

| Path | What it is |
| --- | --- |
| `packages/core` | `@deckard/core`, the deck contract and the slideshow runtime |
| `apps/playground` | the reference deck, and the app the visual checks run against |
| `apps/docs` | the documentation site |
| `registry` | theme sources the playground does not use, published through the registry |
| `tools/package-smoke` | proves the package installs into a plain Next.js app |
| `tools/registry-smoke` | proves the registry installs into a plain Next.js app |

Every script runs from the root:

```bash
pnpm dev            # playground on :3000, core rebuilding on save
pnpm build          # every app
pnpm typecheck
pnpm test           # 85 tests across core and playground
pnpm lint
pnpm analyze
pnpm deck:validate       # deck, theme, and registry integrity
pnpm deck:check-overflow # fail on slides the canvas clips
pnpm deck:screenshots    # one PNG per slide at canvas size
pnpm deck:contact-sheet  # every screenshot in one grid image
pnpm registry:build # write the shadcn registry to apps/docs/public/r
pnpm smoke:package  # pack @deckard/core and build a scratch app against it
pnpm smoke:registry # install the registry into a scratch app and build it
```

`AGENTS.md` is the short version of the rules for a coding agent, and
`.claude/skills/slide-authoring/SKILL.md` is the slide-authoring skill it loads
when it writes or edits slides.

### @deckard/core

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

### Adding Deckard to your own app

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

Configure it in `apps/playground/deck/deck.ts`:

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

Utility controls (command center, presenter popout, color mode toggle) live outside
the canvas so they keep their own size and hit targets at any scale.

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

Global default is configured in `apps/playground/deck/deck.ts`.

### Footer behavior

`footer` can be:

- `"visible"`: full previous/next controls + counter
- `"counter"`: counter only (`Slide x of y`)
- `"hidden"`: no footer

## Adding slides

Add entries to `apps/playground/deck/slides.tsx`.

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
renders. Never put `"use client"` at the top of `apps/playground/deck/slides.tsx` or a slide
module, `apps/playground/deck/slides.test.ts` fails on it.

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

`apps/playground/deck/slides.tsx` is a plain array and stays one. Discovery only saves you the
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
`apps/playground/deck/theme/theme.css` and read `apps/playground/deck/theme/THEME.md` first.

## Theme

`apps/playground/deck/theme/` owns every audience-facing color, size, and background in the
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
color. `apps/playground/deck/theme/THEME.md` lists the tokens and what they control.

## Checking a deck

Four scripts in `apps/playground/scripts` cover the checks a deck needs. They
share one harness: `scripts/lib/preview.ts` builds the app, starts `next start`
on a spare port, and opens a page sized so the canvas renders at scale 1. The
PDF export runs on the same harness.

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
`apps/playground/out/screenshots/<id>.png`, plus a manifest. `deck:contact-sheet`
composes them into `apps/playground/out/contact-sheet.png`, a labelled grid of
the whole deck. Both take `--light`; the contact sheet takes `--columns=N`.

A build is reused when it is newer than everything in `app/`, `deck/`,
`components/`, `assets/`, `public/`, and `packages/core/src`. Pass
`--skip-build` to reuse whatever is in `.next`, or `--port=N` to move off the
default port.

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

This runs a production build in `NEXT_PUBLIC_PDF_EXPORT=1` mode and writes:

- `apps/playground/out/slides.pdf`

Slide routes are discovered from the app's `app/sitemap.ts` (`/sitemap.xml`) so export
stays aligned with your published slide paths.

Export mode behavior:

- one page per slide at the deck canvas size, captured from the canvas element
- animations/transitions disabled
- deck header/footer hidden

Page size comes from the `canvas` config in `apps/playground/deck/deck.ts`, so the export
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

The fixture it copies lives in `tools/package-smoke/fixture` and covers a plain
slide, an async slide, a discovered module, a stepped slide, and a client
widget. The scratch directory is deleted afterwards. Pass `--keep` to inspect
it.

## Registry

`registry.json` at the root publishes the themes and blocks through shadcn.
`pnpm registry:build` writes the item JSON to `apps/docs/public/r`, which is
gitignored, so the docs site serves the registry at `/r/{name}.json`. The docs
site lists every item at `/registry` with its install command.

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
