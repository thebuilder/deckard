import type { SlideTheme } from "@thebuilder/deckard-core"

import { cardColors, cardFontFamily } from "./card-colors"

import "./theme.css"

export const blueprint = {
  card: { ...cardColors.dark, font: { family: cardFontFamily, weight: 600 } },
  className: "blueprint-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "dark",
  id: "blueprint",
} satisfies SlideTheme
