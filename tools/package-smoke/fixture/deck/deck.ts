import { defineDeck } from "@deckard/core"

import { slides } from "./slides"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "Proves @deckard/core installs and builds outside its repo.",
  footer: { mode: "counter" },
  header: { brand: "Smoke", href: "/", mode: "auto" },
  slides,
  title: "Smoke",
})
