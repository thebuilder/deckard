import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const cotton = {
  card: { ...cardColors.light, font: { family: cardFontFamily, weight: 600 } },
  className: "cotton-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "cotton",
} satisfies SlideTheme
