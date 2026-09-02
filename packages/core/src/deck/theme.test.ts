import { describe, expect, it } from "vitest"

import { defineDeck } from "./define-deck"
import {
  canSwitchColorMode,
  forcedColorMode,
  motionField,
  resolveTheme,
  toDeckPresentation,
} from "./theme"
import type { SlideTheme } from "./types"

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
