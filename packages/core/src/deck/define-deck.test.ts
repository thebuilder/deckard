import { describe, expect, it } from "vitest"

import { defineDeck } from "./define-deck"
import type { DeckConfig, SlideTheme } from "./types"

const theme: SlideTheme = {
  className: "test-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "test",
}

function config(overrides: Partial<DeckConfig> = {}): DeckConfig {
  return {
    description: "Test deck",
    footer: { mode: "visible" },
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

  it("leaves every slide's motion on auto by default", () => {
    expect(defineDeck(config()).slides[0].motion).toBe("auto")
  })

  it("freezes every slide when the deck asks for a still deck", () => {
    const frozen = defineDeck(
      config({
        motion: "frozen",
        slides: [{ body: null }, { body: null, motion: "auto" }],
      })
    )

    expect(frozen.slides[0].motion).toBe("frozen")
    expect(frozen.slides[1].motion).toBe("auto")
  })

  it("carries the optional header meta onto the deck", () => {
    const described = defineDeck(
      config({
        header: { brand: "Test", href: "/", meta: "March 2026", mode: "auto" },
      })
    )

    expect(described.header.meta).toBe("March 2026")
    expect(defineDeck(config()).header.meta).toBeUndefined()
  })
})
