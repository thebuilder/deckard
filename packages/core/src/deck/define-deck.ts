import { resolveCanvas } from "./canvas"
import { resolveSlides } from "./resolve-slides"
import { resolveTheme } from "./theme"
import type { Deck, DeckConfig, SlideDefaults } from "./types"

export function defineDeck(config: DeckConfig): Deck {
  const { canvas, motion, slides, theme, ...deck } = config
  const slideDefaults: Partial<SlideDefaults> = {
    footer: config.footer.mode,
    header: config.header.mode,
  }

  // Assigned rather than spread: a key set to undefined would win over the
  // fallback and leave every slide with no motion mode at all.
  if (motion) {
    slideDefaults.motion = motion
  }

  return {
    ...deck,
    canvas: resolveCanvas(canvas),
    slides: resolveSlides(slides, slideDefaults),
    theme: resolveTheme(theme),
  }
}
