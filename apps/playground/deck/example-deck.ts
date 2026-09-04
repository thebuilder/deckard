import { defineDeck } from "@thebuilder/deckard-core"
import { meridian } from "@thebuilder/deckard-themes"
import { canvas } from "@/deck/canvas"
import { exampleSlides } from "@/deck/example-slides"

export const exampleDeck = defineDeck({
  canvas,
  description: "A short engineering review built from Deckard slide patterns.",
  footer: { mode: "visible" },
  header: { brand: "Acme", href: "/example", meta: "Q1 review", mode: "auto" },
  routes: { presenter: false, slides: "/example" },
  slides: exampleSlides,
  theme: meridian,
  title: "What we shipped in Q1",
})
