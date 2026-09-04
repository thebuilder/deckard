import { defineDeck } from "@thebuilder/deckard-core"
import { meridian } from "@thebuilder/deckard-themes"
import { canvas } from "@/deck/canvas"
import { slides } from "@/deck/slides"

export const deck = defineDeck({
  canvas,
  description:
    "Next.js presentations with editable slide patterns, presenter tools, themes, and source people and coding agents can review.",
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
