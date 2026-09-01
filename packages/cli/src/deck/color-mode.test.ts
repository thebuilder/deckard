import { describe, expect, it } from "vitest"

import type { ColorMode } from "../output.ts"
import {
  appliedColorMode,
  assertColorMode,
  colorModeStorageKey,
} from "./color-mode.ts"

const modes: ColorMode[] = ["dark", "light"]

describe("colorModeStorageKey", () => {
  it("is the key next-themes stores the chosen mode under", () => {
    expect(colorModeStorageKey).toBe("theme")
  })
})

describe("appliedColorMode", () => {
  it("reads the mode next-themes wrote onto the html element", () => {
    expect(appliedColorMode(["antialiased", "dark"])).toBe("dark")
    expect(appliedColorMode(["light", "font-sans"])).toBe("light")
  })

  it("reports nothing when no color mode class was applied", () => {
    expect(appliedColorMode(["antialiased"])).toBeUndefined()
    expect(appliedColorMode([])).toBeUndefined()
  })
})

describe("assertColorMode", () => {
  it("passes every mode the run asked for against itself", () => {
    for (const mode of modes) {
      expect(() => assertColorMode([mode], mode, "intro")).not.toThrow()
    }
  })

  // The regression: a theme defaulting to dark answered --light in dark, and
  // the run wrote a dark PNG under a manifest that said light.
  it("names the slide and both modes when the other one rendered", () => {
    expect(() => assertColorMode(["dark"], "light", "numbers")).toThrow(
      "/slides/numbers rendered in dark color mode after light was requested"
    )
  })

  it("fails on a page that applied no mode at all", () => {
    expect(() => assertColorMode(["antialiased"], "dark", "intro")).toThrow(
      "rendered in no color mode after dark was requested"
    )
  })
})
