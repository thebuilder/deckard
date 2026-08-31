import type { SlideTheme } from "@/lib/deck/types"

import "./theme.css"

export const theme = {
  className: "deckard-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "deckard",
} satisfies SlideTheme
