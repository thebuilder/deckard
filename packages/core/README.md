# @thebuilder/deckard-core

The deck contract and the runtime behind [Deckard](https://deckard.thebuilder.dk), a React presentation framework for Next.js. `defineDeck`, the fixed 1920x1080 canvas, the slide shell, keyboard navigation, presenter mode, and the Next.js route adapters.

## Install

```bash
pnpm add @thebuilder/deckard-core @thebuilder/deckard-themes
```

Import the stylesheet once, in `app/globals.css`:

```css
@import "tailwindcss";
@import "@thebuilder/deckard-core/styles.css";
```

## A deck

```ts
// deck/deck.ts
import { defineDeck } from "@thebuilder/deckard-core"
import { meridian } from "@thebuilder/deckard-themes"
import { slides } from "@/deck/slides"

export const deck = defineDeck({
  slides,
  theme: meridian,
  title: "Q1 review",
})
```

```tsx
// deck/slides.tsx
import type { SlideDefinition } from "@thebuilder/deckard-core"

export const slides: SlideDefinition[] = [
  { slug: "intro", title: "Q1 review", body: <Intro /> },
  { title: "The numbers", notes: "Pause here.", body: <Numbers /> },
]
```

The route files re-export `createSlideRoute`, `createPresenterPage`, `createDeckSitemap`, and `createFirstSlideRedirect` from `@thebuilder/deckard-core/next`. `npx @thebuilder/deckard-cli init` writes all of it.

## Documentation

- [Introduction](https://deckard.thebuilder.dk/introduction)
- [Writing slides](https://deckard.thebuilder.dk/guides/writing-slides)
- [The canvas](https://deckard.thebuilder.dk/guides/the-canvas)
- [Core reference](https://deckard.thebuilder.dk/reference/core)
- [Deck config reference](https://deckard.thebuilder.dk/reference/deck-config)

MIT licensed. Source at [github.com/thebuilder/deckard](https://github.com/thebuilder/deckard).
