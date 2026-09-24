import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const quorum = {
  card: { colors: cardColors, font: { family: cardFontFamily, weight: 600 } },
  className: "quorum-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "light",
  id: "quorum",
} satisfies SlideTheme
