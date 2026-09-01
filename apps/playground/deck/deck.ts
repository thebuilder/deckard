import { defineDeck } from "@deckard/core"
import { deckard } from "@deckard/core/themes"
import { slides } from "@/deck/slides"

export const deck = defineDeck({
  canvas: {
    fit: "contain",
    height: 1080,
    mode: "fixed",
    width: 1920,
  },
  description: "Beautiful React presentations with shadcn-native theming.",
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
  theme: deckard,
  title: "Deckard",
})
