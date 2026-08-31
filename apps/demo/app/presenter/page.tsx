import { PresenterConsole } from "@deckard/core/components"
import type { Metadata } from "next"
import { deck } from "@/deck/deck"

export const metadata: Metadata = {
  title: "Presenter View",
}

export default function PresenterPage() {
  return <PresenterConsole canvas={deck.canvas} />
}
