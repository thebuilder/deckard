import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const ledger = {
  card: { colors: cardColors, font: { family: cardFontFamily, weight: 600 } },
  className: "ledger-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "ledger",
} satisfies SlideTheme
