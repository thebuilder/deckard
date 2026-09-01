import { defineDeck } from "@deckard/core"
import { phosphor } from "@deckard/themes"

import { slides } from "./slides"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "Proves @deckard/core installs and builds outside its repo.",
  footer: { mode: "visible" },
  header: { brand: "Smoke", href: "/", mode: "auto" },
  slides,
  theme: phosphor,
  title: "Smoke",
})
