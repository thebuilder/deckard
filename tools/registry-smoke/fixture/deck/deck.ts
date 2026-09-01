import { defineDeck } from "@deckard/core"
import { broadsheet } from "@deckard/themes"

import { slides } from "@/deck/slides"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "Proves the Deckard registry installs into a clean Next.js app.",
  footer: { mode: "visible" },
  header: { brand: "Registry smoke", href: "/", mode: "auto" },
  slides,
  theme: broadsheet,
  title: "Registry smoke",
})
