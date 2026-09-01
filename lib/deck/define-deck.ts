import { resolveSlides } from "@/lib/deck/resolve-slides"
import type { Deck, DeckConfig } from "@/lib/deck/types"

export function defineDeck(config: DeckConfig): Deck {
  const { slides, ...deck } = config

  return {
    ...deck,
    slides: resolveSlides(slides, {
      footer: config.footer.mode,
      header: config.header.mode,
    }),
  }
}
