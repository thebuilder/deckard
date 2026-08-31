import { resolveCanvas } from "@/lib/deck/canvas"
import { resolveSlides } from "@/lib/deck/resolve-slides"
import { resolveTheme } from "@/lib/deck/theme"
import type { Deck, DeckConfig } from "@/lib/deck/types"

export function defineDeck(config: DeckConfig): Deck {
  const { canvas, slides, theme, ...deck } = config

  return {
    ...deck,
    canvas: resolveCanvas(canvas),
    slides: resolveSlides(slides, {
      footer: config.footer.mode,
      header: config.header.mode,
    }),
    theme: resolveTheme(theme),
  }
}
