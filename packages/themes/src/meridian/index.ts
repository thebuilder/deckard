import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const meridian = {
  card: { colors: cardColors, font: { family: cardFontFamily, weight: 700 } },
  className: "meridian-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "meridian",
} satisfies SlideTheme
