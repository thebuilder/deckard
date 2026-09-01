import type { Metadata } from "next"

import { PresenterConsole } from "@/components/slideshow/presenter-console"
import { deck } from "@/deck/deck"

export const metadata: Metadata = {
  title: "Presenter View",
}

export default function PresenterPage() {
  return <PresenterConsole canvas={deck.canvas} />
}
