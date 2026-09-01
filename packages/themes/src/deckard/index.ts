import type { SlideTheme } from "@deckard/core"

import "./theme.css"

export const deckard = {
  className: "deckard-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "deckard",
} satisfies SlideTheme
