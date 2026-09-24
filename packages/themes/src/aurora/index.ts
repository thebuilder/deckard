import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const aurora = {
  card: { ...cardColors.dark, font: { family: cardFontFamily, weight: 600 } },
  className: "aurora-theme",
  colorModes: ["dark", "light"],
  defaultColorMode: "dark",
  id: "aurora",
  // The four background variants this theme paints in a canvas instead of CSS,
  // keyed by the name a deck writes as `background`. Each one also paints a
  // gradient in theme.css, which is the slide when there is no WebGL.
  motion: {
    breaker: "aurora",
    closing: "waves",
    hero: "aurora",
    statement: "wash",
  },
} satisfies SlideTheme
