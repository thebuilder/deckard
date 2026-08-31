import { describe, expect, it } from "vitest"

import { defineDeck } from "@/lib/deck/define-deck"
import type { DeckConfig, SlideTheme } from "@/lib/deck/types"

const theme: SlideTheme = {
  className: "test-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "test",
}

function config(overrides: Partial<DeckConfig> = {}): DeckConfig {
  return {
    description: "Test deck",
    footer: { mode: "counter" },
    header: { brand: "Test", href: "/", mode: "auto" },
    slides: [{ body: null, title: "One" }],
    title: "Test",
    ...overrides,
  }
}

const systemError = /defaults to "system"/

describe("defineDeck", () => {
  it("falls back to the app tokens when a deck declares no theme", () => {
    expect(defineDeck(config()).theme.id).toBe("base")
  })

  it("stores the resolved theme on the deck", () => {
    expect(defineDeck(config({ theme })).theme).toEqual(theme)
  })

  it("fails on a theme whose default color mode it cannot support", () => {
    expect(() =>
      defineDeck(config({ theme: { ...theme, colorModes: ["light"] } }))
    ).toThrow(systemError)
  })
})
