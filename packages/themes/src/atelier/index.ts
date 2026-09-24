import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const atelier = {
  card: {
    ...cardColors.light,
    font: { family: cardFontFamily, uppercase: true, weight: 800 },
  },
  className: "atelier-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "atelier",
} satisfies SlideTheme
