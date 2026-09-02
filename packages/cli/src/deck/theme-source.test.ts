import { themeIds } from "@deckard/themes/ids"
import { describe, expect, it } from "vitest"

import {
  builtInThemes,
  defaultTheme,
  themeStylesheetKind,
} from "./theme-source.ts"

const builtInDeck = `import { defineDeck } from "@deckard/core"
import { phosphor } from "@deckard/themes"
import { slides } from "@/deck/slides"

export const deck = defineDeck({
  description: "A deck.",
  slides,
  theme: phosphor,
  title: "A deck",
})
`

const localDeck = `import { defineDeck } from "@deckard/core"
import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  description: "A deck.",
  slides,
  theme,
  title: "A deck",
})
`

// built-in-themes.ts is generated, and committed so that typecheck and these
// tests can read it without a build. This is what catches it left behind: the
// checks job never regenerates it before running them.
describe("builtInThemes", () => {
  it("names every theme @deckard/themes ships, and no other", () => {
    expect([...builtInThemes]).toEqual([...themeIds])
  })

  it("defaults to a theme it lists", () => {
    expect(builtInThemes).toContain(defaultTheme)
  })
})

describe("themeStylesheetKind", () => {
  it("reads the built-in a deck imports even with a local theme left on disk", () => {
    expect(themeStylesheetKind(builtInDeck, true)).toBe("builtin")
  })

  it("reads the local copy a deck imports", () => {
    expect(themeStylesheetKind(localDeck, false)).toBe("local")
  })

  it("falls back to the directory when the deck imports no theme", () => {
    expect(themeStylesheetKind("export const deck = {}\n", true)).toBe("local")
    expect(themeStylesheetKind("export const deck = {}\n", false)).toBe(
      "builtin"
    )
  })

  it("falls back to the directory when there is no deck source to read", () => {
    expect(themeStylesheetKind(null, true)).toBe("local")
    expect(themeStylesheetKind(null, false)).toBe("builtin")
  })
})
