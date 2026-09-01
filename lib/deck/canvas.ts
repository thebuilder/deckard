import type { DeckCanvasConfig } from "@/lib/deck/types"

const defaultDeckCanvas: DeckCanvasConfig = {
  fit: "contain",
  height: 1080,
  margin: 0,
  mode: "fixed",
  width: 1920,
}

function assertSide(label: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `Deck canvas ${label} has to be a positive number of logical pixels, got ${value}.`
    )
  }
}

export function resolveCanvas(
  canvas: Partial<DeckCanvasConfig> = {}
): DeckCanvasConfig {
  const resolved = { ...defaultDeckCanvas, ...canvas }

  assertSide("width", resolved.width)
  assertSide("height", resolved.height)

  if (!Number.isFinite(resolved.margin) || resolved.margin < 0) {
    throw new Error(
      `Deck canvas margin has to be zero or more logical pixels, got ${resolved.margin}.`
    )
  }

  return resolved
}
