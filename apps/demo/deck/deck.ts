import { defineDeck } from "@deckard/core"
import { canvas } from "@/deck/canvas"
import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  canvas,
  description:
    "The story of turning a slideshow app into a presentation framework, and what the migration proved.",
  footer: {
    mode: "visible",
  },
  header: {
    brand: "Deckard",
    date: "March 2026",
    href: "/",
    mode: "auto",
  },
  slides,
  theme,
  title: "Deckard: React presentations without the ceremony",
})
