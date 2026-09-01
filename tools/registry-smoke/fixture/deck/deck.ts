import { defineDeck } from "@deckard/core"

import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "Proves the Deckard registry installs into a clean Next.js app.",
  footer: { mode: "visible" },
  header: { brand: "Registry smoke", href: "/", mode: "auto" },
  slides,
  theme,
  title: "Registry smoke",
})
