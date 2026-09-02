import { defineDeck } from "@deckard/core"
import { meridian } from "@deckard/themes"
import { canvas } from "@/deck/canvas"
import { slides } from "@/deck/slides"

export const deck = defineDeck({
  canvas,
  description: "Beautiful React presentations with shadcn-native theming.",
  footer: {
    mode: "visible",
  },
  header: {
    brand: "Deckard",
    href: "/",
    meta: "March 2026",
    mode: "auto",
  },
  slides,
  theme: meridian,
  title: "Deckard",
})
