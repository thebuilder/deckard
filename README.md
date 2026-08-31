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
- Light/dark theme toggle
- Slide-level layout/background/header controls
- Typed image slide support
- PDF export pipeline for static handout rendering
- shadcn/ui components and tokens, so slides inherit your app theme

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `deck/slides.tsx`: slide definitions
- `deck/slides/*.slide.tsx`: file-per-slide modules wired in with `slideFromModule`
- `deck/deck.ts`: deck config (title, description, canvas, header and footer defaults) wrapped in `defineDeck`
- `lib/deck/*`: slide model, id resolution, and validation
- `app/slides/blocks/*`: deck-authoring building blocks (layout, typography, collections, media)
- `components/slideshow/slide-shell.tsx`: slideshow chrome (header, navigation, frame)
- `components/slideshow/slide-viewport.tsx`: fits the canvas to the browser viewport
- `components/slideshow/slide-canvas.tsx`: the fixed coordinate space slides are authored in
- `components/slideshow/slide-background.tsx`: shared background variants

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
  a console warning and an amber outline. Trim the content, or put the part
  that has to scroll in a `SlideScrollArea`.

`SlideScrollArea` keeps wheel, touch, and key scrolling inside itself so
scrolling never steps the deck:

```tsx
<SlideScrollArea label="Full config" maxHeight={360}>
  <ConfigTable />
</SlideScrollArea>
```

`CodeBlock` takes an optional `maxHeight` and uses it for long samples.

Utility controls (command center, presenter popout, theme toggle) live outside
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

Global default is configured in `deck/deck.ts`.

### Footer behavior

`footer` can be:

- `"visible"`: full previous/next controls + counter
- `"counter"`: counter only (`Slide x of y`)
- `"hidden"`: no footer

## Adding slides

Add entries to `deck/slides.tsx`.

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

Props that cross into a client component have to be serializable. The chrome
passes `SlideSummary` values (`id`, `number`, `title`, `href`, `stepCount`)
built from the resolved deck, and the rendered slide body crosses only as
`children`.

A slide that throws under `next dev` renders an inline error card with the
slide id and the message, and navigation keeps working. In a production build a
Server Component that throws is fatal to the route, so Next serves its own
error page.

## Presenter preview context

Presenter previews render slide routes with `?presenterPreview=1`, and slides
can detect that mode with `useIsPresenterPreview()` from
`components/slideshow/slide-context.tsx`.

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

Add custom variants in `components/slideshow/slide-background.tsx`.

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

- `out/slides.pdf`

Slide routes are discovered from `app/sitemap.ts` (`/sitemap.xml`) so export
stays aligned with your published slide paths.

Export mode behavior:

- one page per slide at the deck canvas size, captured from the canvas element
- animations/transitions disabled
- deck header/footer hidden

Page size comes from the `canvas` config in `deck/deck.ts`, so the export
cannot drift from what the audience sees.

Optional env vars:

- `PDF_EXPORT_PORT` (default `3410`)
- `PDF_EXPORT_OUTPUT` (default `out/slides.pdf`)

Skip build (reuse existing `.next` build):

```bash
pnpm export:pdf -- --skip-build
```

## Packages

Deckard is one app today. The reusable parts, the deck contract in `lib/deck`
and the chrome in `components/slideshow`, are being pulled out into `@deckard`
packages, so keep new code inside those directories free of deck-specific
content.
