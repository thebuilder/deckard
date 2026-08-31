import { createPresenterPage } from "@deckard/core/next"

import { deck } from "@/deck/deck"

const { Page, metadata } = createPresenterPage(deck)

export { metadata }
export default Page
