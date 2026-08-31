import type { DeckCanvasConfig } from "@deckard/core"

// deck.ts imports the slides, so a slide importing deck.ts would be a cycle.
// The canvas lives here because the scale demo needs the same numbers the deck does.
export const canvas: DeckCanvasConfig = {
  fit: "contain",
  height: 1080,
  margin: 0,
  mode: "fixed",
  width: 1920,
}
