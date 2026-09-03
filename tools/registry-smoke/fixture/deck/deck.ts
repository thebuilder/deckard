import { defineDeck } from "@thebuilder/deckard-core"
import { ledger } from "@thebuilder/deckard-themes"

import { slides } from "@/deck/slides"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "Proves the Deckard registry installs into a clean Next.js app.",
  footer: { mode: "visible" },
  header: { brand: "Registry smoke", href: "/", mode: "auto" },
  slides,
  theme: ledger,
  title: "Registry smoke",
})
