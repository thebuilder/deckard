import type { SlideTheme } from "@deckard/core"

import "./theme.css"

export const theme = {
  className: "demo-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "demo",
} satisfies SlideTheme
