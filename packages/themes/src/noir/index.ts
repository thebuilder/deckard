import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const noir = {
  card: { colors: cardColors, font: { family: cardFontFamily, weight: 300 } },
  className: "noir-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "dark",
  id: "noir",
} satisfies SlideTheme
