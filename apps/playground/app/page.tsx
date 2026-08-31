import { redirect } from "next/navigation"

import { deck } from "@/deck/deck"

export default function Page() {
  redirect(deck.slides[0].href)
}
