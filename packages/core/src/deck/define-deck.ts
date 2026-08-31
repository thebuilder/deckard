import { resolveCanvas } from "./canvas"
import { resolveSlides } from "./resolve-slides"
import { resolveTheme } from "./theme"
import type { Deck, DeckConfig } from "./types"

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
