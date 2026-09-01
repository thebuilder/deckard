import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"
import { defineDeck } from "@/lib/deck/define-deck"

export const deck = defineDeck({
  canvas: {
    fit: "contain",
    height: 1080,
    mode: "fixed",
    width: 1920,
  },
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
  theme,
  title: "Deckard",
})
