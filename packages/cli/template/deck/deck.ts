import { defineDeck } from "@deckard/core"
import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  canvas: {
    fit: "contain",
    height: 1080,
    mode: "fixed",
    width: 1920,
  },
  description: "__DECK_DESCRIPTION__",
  footer: {
    mode: "visible",
  },
  header: {
    brand: "__DECK_TITLE__",
    href: "/",
    mode: "auto",
  },
  slides,
  theme,
  title: "__DECK_TITLE__",
})
