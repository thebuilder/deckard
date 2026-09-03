import { resolveCanvas } from "@thebuilder/deckard-core"

// deck.ts imports the slides, so a slide importing deck.ts would be a cycle.
// The canvas lives here because the scale slide needs the same numbers the deck does.
export const canvas = resolveCanvas({ height: 1080, width: 1920 })
