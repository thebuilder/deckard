import { defineDeck } from "@deckard/core"
import { __DECK_THEME__ } from "@deckard/themes"
import { slides } from "@/deck/slides"

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
  theme: __DECK_THEME__,
  title: "__DECK_TITLE__",
})
