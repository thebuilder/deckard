import { resolveCanvas } from "@thebuilder/deckard-core"
import { canvasConfig } from "@/deck/canvas-config"

// deck.ts imports the slides, so a slide importing deck.ts would be a cycle.
// The canvas lives here because the scale slide needs the same numbers the deck does.
export const canvas = resolveCanvas(canvasConfig)
