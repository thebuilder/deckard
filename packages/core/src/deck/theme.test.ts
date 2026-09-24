import { describe, expect, it } from "vitest"

import { defineDeck } from "./define-deck"
import {
  canSwitchColorMode,
  forcedColorMode,
  homeColorMode,
  motionField,
  resolveBackground,
  resolveTheme,
  toDeckPresentation,
} from "./theme"
import type { SlideTheme, SlideThemeCard } from "./types"

const bothModes: SlideTheme = {
  className: "test-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "test",
}

const idError = /non-empty id/
const unknownFieldError = /The fields are aurora, waves, wash/
const noneVariantError = /renders no background at all/
const emptyModesError = /at least one color mode/
const duplicateModeError = /same color mode twice/
const systemError = /defaults to "system"/
const unsupportedDefaultError = /defaults to "light"/
const oklchCardError =
  /Slide theme "test" sets card.colors.light.accent to "oklch\(0.5 0.1 20\)"/
const varCardError =
  /Slide theme "test" sets card.colors.dark.muted to "var\(--muted\)"/
const familyError = /Slide theme "test" needs card.font.family/
const weightError = /Slide theme "test" sets card.font.weight to 650/

describe("theme motion backgrounds", () => {
  const withMotion: SlideTheme = {
    ...bothModes,
    motion: { closing: "waves", hero: "aurora" },
  }

  it("names the field a variant is painted with, and nothing for the rest", () => {
    expect(motionField(withMotion, "hero")).toBe("aurora")
    expect(motionField(withMotion, "closing")).toBe("waves")
    expect(motionField(withMotion, "grid")).toBeUndefined()
    expect(motionField(bothModes, "hero")).toBeUndefined()
  })

  it("keeps the map on the resolved theme", () => {
    expect(resolveTheme(withMotion).motion).toEqual(withMotion.motion)
  })

  it("fails on a field the runtime cannot paint", () => {
    expect(() =>
      resolveTheme({
        ...bothModes,
        motion: { hero: "shimmer" as "aurora" },
      })
    ).toThrow(unknownFieldError)
  })

  it("fails on a variant that renders no background layer", () => {
    expect(() =>
      resolveTheme({ ...bothModes, motion: { none: "aurora" } })
    ).toThrow(noneVariantError)
  })
})

describe("resolveBackground", () => {
  const withMotion: SlideTheme = {
    ...bothModes,
    motion: { closing: "waves", hero: "aurora", sunrise: "wash" },
  }

  it("keeps a role the theme paints in motion and hands over its field", () => {
    expect(resolveBackground(withMotion, "hero")).toEqual({
      field: "aurora",
      variant: "hero",
    })
    expect(resolveBackground(withMotion, "closing")).toEqual({
      field: "waves",
      variant: "closing",
    })
  })

  it("falls a role back to its built-in variant when the theme has no field for it", () => {
    expect(resolveBackground(bothModes, "hero")).toEqual({ variant: "default" })
    expect(resolveBackground(bothModes, "statement")).toEqual({
      variant: "default",
    })
    expect(resolveBackground(bothModes, "breaker")).toEqual({
      variant: "spotlight",
    })
    expect(resolveBackground(bothModes, "closing")).toEqual({
      variant: "accent",
    })
    expect(resolveBackground(withMotion, "breaker")).toEqual({
      variant: "spotlight",
    })
  })

  it("keeps a theme's own motion variant and its field", () => {
    expect(resolveBackground(withMotion, "sunrise")).toEqual({
      field: "wash",
      variant: "sunrise",
    })
  })

  it("passes every other variant through for the stylesheet", () => {
    expect(resolveBackground(bothModes, "grid")).toEqual({ variant: "grid" })
    expect(resolveBackground(bothModes, "duotone")).toEqual({
      variant: "duotone",
    })
    expect(resolveBackground(withMotion, "toString")).toEqual({
      variant: "toString",
    })
  })
})

describe("resolveTheme", () => {
  it("falls back to the app tokens when a deck has no theme", () => {
    expect(resolveTheme()).toEqual({
      className: "",
      colorModes: ["light", "dark"],
      defaultColorMode: "system",
      id: "base",
    })
  })

  it("copies the color modes so the deck config stays immutable", () => {
    const resolved = resolveTheme(bothModes)

    expect(resolved).toEqual(bothModes)
    expect(resolved.colorModes).not.toBe(bothModes.colorModes)
  })

  it("rejects a theme without an id", () => {
    expect(() => resolveTheme({ ...bothModes, id: " " })).toThrow(idError)
  })

  it("rejects a theme that supports no color mode", () => {
    expect(() =>
      resolveTheme({
        ...bothModes,
        colorModes: [],
        defaultColorMode: "light",
      })
    ).toThrow(emptyModesError)
  })

  it("rejects a repeated color mode", () => {
    expect(() =>
      resolveTheme({ ...bothModes, colorModes: ["dark", "dark"] })
    ).toThrow(duplicateModeError)
  })

  it("rejects a system default on a single-mode theme", () => {
    expect(() => resolveTheme({ ...bothModes, colorModes: ["dark"] })).toThrow(
      systemError
    )
  })

  it("rejects a default the theme does not support", () => {
    expect(() =>
      resolveTheme({
        ...bothModes,
        colorModes: ["dark"],
        defaultColorMode: "light",
      })
    ).toThrow(unsupportedDefaultError)
  })

  it("accepts a single-mode theme that defaults to the mode it supports", () => {
    expect(
      resolveTheme({
        ...bothModes,
        colorModes: ["dark"],
        defaultColorMode: "dark",
      }).colorModes
    ).toEqual(["dark"])
  })
})

describe("color mode switching", () => {
  it("pins the canvas to the only mode a theme supports", () => {
    const darkOnly = resolveTheme({
      ...bothModes,
      colorModes: ["dark"],
      defaultColorMode: "dark",
    })

    expect(forcedColorMode(darkOnly)).toBe("dark")
    expect(canSwitchColorMode(darkOnly)).toBe(false)
  })

  it("leaves the canvas free when a theme supports both modes", () => {
    expect(forcedColorMode(bothModes)).toBeUndefined()
    expect(canSwitchColorMode(bothModes)).toBe(true)
  })
})

describe("toDeckPresentation", () => {
  it("hands the shell the header brand, link, and meta", () => {
    const presentation = toDeckPresentation(
      defineDeck({
        description: "Test deck",
        footer: { mode: "visible" },
        header: {
          brand: "Test brand",
          href: "/start",
          meta: "March 2026",
          mode: "auto",
        },
        slides: [{ body: null, title: "One" }],
        title: "Test deck title",
      })
    )

    expect(presentation.title).toBe("Test brand")
    expect(presentation.titleHref).toBe("/start")
    expect(presentation.meta).toBe("March 2026")
  })

  it("leaves the meta out when the deck sets none", () => {
    const presentation = toDeckPresentation(
      defineDeck({
        description: "Test deck",
        footer: { mode: "visible" },
        header: { brand: "Test brand", href: "/", mode: "auto" },
        slides: [{ body: null, title: "One" }],
        title: "Test deck title",
      })
    )

    expect(presentation.meta).toBeUndefined()
  })
})

describe("theme share card", () => {
  const palette = {
    accent: "#ff5500",
    background: "rgb(10 10 10)",
    foreground: "#fafafa",
    muted: "rgba(250, 250, 250, 0.7)",
  }
  const card: SlideThemeCard = {
    colors: { dark: palette, light: palette },
    font: { family: "Inter", weight: 700 },
  }

  it("keeps a card whose colors are hex or rgb()", () => {
    expect(resolveTheme({ ...bothModes, card }).card).toEqual(card)
  })

  it("leaves a theme with no card without one", () => {
    expect(resolveTheme(bothModes).card).toBeUndefined()
  })

  it("names the theme, the mode, and the field for an oklch color", () => {
    expect(() =>
      resolveTheme({
        ...bothModes,
        card: {
          ...card,
          colors: {
            ...card.colors,
            light: { ...palette, accent: "oklch(0.5 0.1 20)" },
          },
        },
      })
    ).toThrow(oklchCardError)
  })

  it("names the theme, the mode, and the field for a CSS variable", () => {
    expect(() =>
      resolveTheme({
        ...bothModes,
        card: {
          ...card,
          colors: {
            ...card.colors,
            dark: { ...palette, muted: "var(--muted)" },
          },
        },
      })
    ).toThrow(varCardError)
  })

  it("fails on a card with no face or an impossible weight", () => {
    expect(() =>
      resolveTheme({
        ...bothModes,
        card: { ...card, font: { family: " ", weight: 700 } },
      })
    ).toThrow(familyError)
    expect(() =>
      resolveTheme({
        ...bothModes,
        card: { ...card, font: { family: "Inter", weight: 650 as 600 } },
      })
    ).toThrow(weightError)
  })
})

describe("homeColorMode", () => {
  it("is the theme's default mode, or light for one that follows the system", () => {
    expect(homeColorMode({ ...bothModes, defaultColorMode: "dark" })).toBe(
      "dark"
    )
    expect(homeColorMode({ ...bothModes, defaultColorMode: "light" })).toBe(
      "light"
    )
    expect(homeColorMode(bothModes)).toBe("light")
  })
})
