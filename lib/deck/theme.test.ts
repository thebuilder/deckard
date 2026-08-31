import { describe, expect, it } from "vitest"

import {
  canSwitchColorMode,
  forcedColorMode,
  resolveTheme,
} from "@/lib/deck/theme"
import type { SlideTheme } from "@/lib/deck/types"

const bothModes: SlideTheme = {
  className: "test-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "test",
}

const idError = /non-empty id/
const emptyModesError = /at least one color mode/
const duplicateModeError = /same color mode twice/
const systemError = /defaults to "system"/
const unsupportedDefaultError = /defaults to "light"/

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
