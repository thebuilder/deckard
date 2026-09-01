import type { SlideTheme } from "@deckard/core"

import "./theme.css"

export const theme = {
  className: "ledger-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "ledger",
} satisfies SlideTheme
