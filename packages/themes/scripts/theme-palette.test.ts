import { describe, expect, it } from "vitest"

import {
  firstFontFamily,
  oklchToHex,
  readThemePalettes,
  toCardColor,
} from "./theme-palette.ts"

const colorMixError = /Theme "demo" sets --primary to color-mix/
const unparsedError = /Theme "demo" sets --primary to oklch\(0\.5 wide 20\)/
const opaqueHex = /^#[\da-f]{6}$/

describe("oklchToHex", () => {
  it("converts the sRGB primaries and the extremes", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff")
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000")
    expect(oklchToHex("oklch(0.6279 0.2577 29.23)")).toBe("#ff0000")
    expect(oklchToHex("oklch(0.8664 0.2948 142.5)")).toBe("#00ff00")
    expect(oklchToHex("oklch(0.452 0.3132 264.05)")).toBe("#0000ff")
  })

  it("reads percentages, degrees, and none", () => {
    expect(oklchToHex("oklch(62.79% 64.43% 29.23deg)")).toBe("#ff0000")
    expect(oklchToHex("oklch(0.5 0 none)")).toBe(oklchToHex("oklch(0.5 0 0)"))
  })

  it("appends an alpha byte only when the color is not opaque", () => {
    expect(oklchToHex("oklch(1 0 0 / 0.5)")).toBe("#ffffff80")
    expect(oklchToHex("oklch(1 0 0 / 1)")).toBe("#ffffff")
  })

  it("clamps a color outside sRGB instead of wrapping it", () => {
    expect(oklchToHex("oklch(0.9 0.4 145)")).toMatch(opaqueHex)
  })
})

describe("toCardColor", () => {
  it("passes hex and rgb() through", () => {
    expect(toCardColor("#0a0a0a", "demo", "background")).toBe("#0a0a0a")
    expect(toCardColor("rgb(10 10 10)", "demo", "background")).toBe(
      "rgb(10 10 10)"
    )
  })

  it("converts oklch()", () => {
    expect(toCardColor(" oklch(1 0 0) ", "demo", "background")).toBe("#ffffff")
  })

  it("names the theme and the token for a value it cannot resolve", () => {
    expect(() =>
      toCardColor("color-mix(in oklab, red 50%, blue)", "demo", "primary")
    ).toThrow(colorMixError)
    expect(() => toCardColor("oklch(0.5 wide 20)", "demo", "primary")).toThrow(
      unparsedError
    )
  })
})

describe("readThemePalettes", () => {
  const css = `
    @font-face { font-family: "Demo"; }
    .demo-theme {
      --background: #ffffff;
      --primary: #112233;
      --ring: var(--primary);
    }
    .demo-theme:where([data-slide-color-mode="dark"]) {
      --background: #000000;
    }
    .demo-theme .slide-background[data-slide-background="hero"] {
      --background: #ff0000;
    }
  `

  it("reads the palette rules and nothing that styles a part", () => {
    const { dark, light } = readThemePalettes(css, "demo", [
      "background",
      "primary",
    ])

    expect(light).toEqual({ background: "#ffffff", primary: "#112233" })
    expect(dark).toEqual({ background: "#000000", primary: "#112233" })
  })

  it("resolves a reference to another token it reads", () => {
    expect(readThemePalettes(css, "demo", ["primary", "ring"]).light.ring).toBe(
      "#112233"
    )
    expect(readThemePalettes(css, "demo", ["ring"]).light.ring).toBe(
      "var(--primary)"
    )
  })
})

describe("firstFontFamily", () => {
  it("unquotes the first family in the list", () => {
    expect(firstFontFamily('"Source Serif 4", ui-serif, serif')).toBe(
      "Source Serif 4"
    )
    expect(firstFontFamily("Chivo, ui-sans-serif")).toBe("Chivo")
  })

  it("gives nothing for a variable or a missing token", () => {
    expect(firstFontFamily("var(--font-sans)")).toBeUndefined()
    expect(firstFontFamily(undefined)).toBeUndefined()
  })
})
