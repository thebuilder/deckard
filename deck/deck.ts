import { slides } from "@/deck/slides"
import { defineDeck } from "@/lib/deck/define-deck"

export const deck = defineDeck({
  description: "Beautiful React presentations with shadcn-native theming.",
  footer: {
    mode: "counter",
  },
  header: {
    brand: "Deckard",
    href: "/",
    mode: "auto",
  },
  slides,
  title: "Deckard",
})
