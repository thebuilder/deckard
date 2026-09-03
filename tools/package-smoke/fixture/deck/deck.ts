import { defineDeck } from "@thebuilder/deckard-core"
import { phosphor } from "@thebuilder/deckard-themes"

import { slides } from "./slides"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description:
    "Proves @thebuilder/deckard-core installs and builds outside its repo.",
  footer: { mode: "visible" },
  header: { brand: "Smoke", href: "/", mode: "auto" },
  slides,
  theme: phosphor,
  title: "Smoke",
})
