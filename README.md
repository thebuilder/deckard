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

- `deck/slides.tsx`: slide definitions only
- `deck/deck.ts`: deck config (title, description, header and footer defaults) wrapped in `defineDeck`
- `lib/deck/*`: slide model, id resolution, and validation
- `app/slides/blocks/*`: deck-authoring building blocks (layout, typography, collections, media)
- `components/slideshow/slide-shell.tsx`: slideshow chrome (header, navigation, frame)
- `components/slideshow/slide-background.tsx`: shared background variants

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

- fixed viewport (default `1920x1080`)
- animations/transitions disabled
- deck header/footer hidden

Optional env vars:

- `PDF_EXPORT_WIDTH` (default `1920`)
- `PDF_EXPORT_HEIGHT` (default `1080`)
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
