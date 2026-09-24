import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const phosphor = {
  card: {
    ...cardColors.dark,
    font: { family: cardFontFamily, uppercase: true, weight: 700 },
  },
  className: "phosphor-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "dark",
  id: "phosphor",
} satisfies SlideTheme
