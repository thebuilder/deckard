import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const nexus = {
  card: {
    colors: cardColors,
    font: { family: cardFontFamily, uppercase: true, weight: 700 },
  },
  className: "nexus-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "dark",
  id: "nexus",
} satisfies SlideTheme
