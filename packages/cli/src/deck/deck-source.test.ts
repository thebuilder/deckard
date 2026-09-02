import { describe, expect, it } from "vitest"

import {
  applyBuiltInTheme,
  applyLocalTheme,
  findThemeImport,
} from "./deck-source.ts"

const noThemePattern = /imports no theme/
const noPropertyPattern = /does not pass a theme/

const builtInDeck = `import { defineDeck } from "@deckard/core"
import { meridian } from "@deckard/themes"
import { slides } from "@/deck/slides"

export const deck = defineDeck({
  description: "A deck.",
  slides,
  theme: meridian,
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

describe("findThemeImport", () => {
  it("names the built-in a deck imports", () => {
    expect(findThemeImport(builtInDeck)).toEqual({
      binding: "meridian",
      kind: "builtin",
      name: "meridian",
    })
  })

  it("sees through an alias", () => {
    const source = builtInDeck.replace(
      "{ meridian }",
      "{ phosphor as deckTheme }"
    )

    expect(findThemeImport(source)).toEqual({
      binding: "deckTheme",
      kind: "builtin",
      name: "phosphor",
    })
  })

  it("reports a local theme as local", () => {
    expect(findThemeImport(localDeck)).toEqual({
      binding: "theme",
      kind: "local",
      name: null,
    })
  })

  it("reports nothing for a deck with no theme", () => {
    expect(
      findThemeImport('import { defineDeck } from "@deckard/core"\n')
    ).toBe(null)
  })
})

describe("applyBuiltInTheme", () => {
  it("swaps one built-in for another", () => {
    expect(applyBuiltInTheme(builtInDeck, "phosphor")).toBe(
      builtInDeck
        .replace("{ meridian }", "{ phosphor }")
        .replace("theme: meridian,", "theme: phosphor,")
    )
  })

  it("replaces a local theme and sorts the import in", () => {
    expect(applyBuiltInTheme(localDeck, "nexus")).toBe(
      builtInDeck
        .replace("{ meridian }", "{ nexus }")
        .replace("theme: meridian,", "theme: nexus,")
    )
  })

  it("refuses a deck that imports no theme at all", () => {
    expect(() => applyBuiltInTheme("const deck = 1\n", "nexus")).toThrow(
      noThemePattern
    )
  })
})

describe("applyLocalTheme", () => {
  it("points a built-in deck at deck/theme", () => {
    expect(applyLocalTheme(builtInDeck)).toBe(localDeck)
  })

  it("refuses a deck that never passes a theme to defineDeck", () => {
    const source = builtInDeck.replace("  theme: meridian,\n", "")

    expect(() => applyLocalTheme(source)).toThrow(noPropertyPattern)
  })
})
