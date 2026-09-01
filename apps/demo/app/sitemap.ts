import { createDeckSitemap } from "@deckard/core/next"
import { deck } from "@/deck/deck"

export default createDeckSitemap(deck, {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002",
})
