import type { SlideDefinition, SlideTheme } from "@deckard/core"
import { defineDeck } from "@deckard/core"
import { describe, expect, it } from "vitest"

import { checkRegistry, checkSlides, checkTheme } from "./deck-checks.ts"

function buildDeck(slides: SlideDefinition[]) {
  return defineDeck({
    description: "A deck under test.",
    footer: { mode: "counter" },
    header: { brand: "Test", href: "/", mode: "auto" },
    slides,
    title: "Test",
  })
}

const theme: SlideTheme = {
  className: "test-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "test",
}

const themeCss = `
.test-theme { --background: white; --border: gray; }
.test-theme:where(.dark, .dark *) { --background: black; --border: silver; }
`

describe("checkSlides", () => {
  it("counts inline, discovered, slugged, and numbered slides", () => {
    const deck = buildDeck([
      { body: "one", slug: "one" },
      { body: "two", sourcePath: "slides/two.slide.tsx" },
    ])

    const section = checkSlides(deck, () => true)

    expect(section.problems).toEqual([])
    expect(section.summary[0]).toBe("2 slides: 1 inline, 1 discovered")
    expect(section.summary[1]).toBe("1 slugs, 1 numbered")
  })

  it("reports a sourcePath that is not a file", () => {
    const deck = buildDeck([
      { body: "one", sourcePath: "slides/gone.slide.tsx" },
    ])

    const section = checkSlides(deck, () => false)

    expect(section.problems).toHaveLength(1)
    expect(section.problems[0]).toContain("slides/gone.slide.tsx")
  })

  it("reports a slide without a body", () => {
    const deck = buildDeck([{ body: null, title: "Empty" }])

    const section = checkSlides(deck, () => true)

    expect(section.problems[0]).toContain("has no body")
  })
})

describe("checkTheme", () => {
  it("passes a theme whose class and color blocks line up", () => {
    const section = checkTheme(theme, themeCss)

    expect(section.problems).toEqual([])
    expect(section.summary[1]).toBe(
      "2 tokens in the light block, 2 dark overrides"
    )
  })

  it("reports a className the stylesheet never selects", () => {
    const section = checkTheme({ ...theme, className: "tets-theme" }, themeCss)

    expect(section.problems[0]).toContain(".tets-theme")
  })

  it("reports a missing stylesheet", () => {
    const section = checkTheme(theme, null)

    expect(section.problems[0]).toContain("deck/theme/theme.css is missing")
  })

  it("reports a token only the dark block defines", () => {
    const section = checkTheme(
      theme,
      `${themeCss}\n.test-theme:where([data-slide-color-mode="dark"]) { --accent: blue; }`
    )

    expect(section.problems[0]).toContain("--accent")
  })

  it("reports a dark block the theme does not claim to support", () => {
    const section = checkTheme(
      { ...theme, colorModes: ["light"], defaultColorMode: "light" },
      themeCss
    )

    expect(section.problems[0]).toContain('does not list "dark" in colorModes')
  })

  it("reports a claimed dark mode the stylesheet never paints", () => {
    const section = checkTheme(theme, ".test-theme { --background: white; }")

    expect(section.problems[0]).toContain("has no dark block")
  })
})

describe("checkRegistry", () => {
  const files = new Map([
    ["themes/x/index.ts", 'export const theme = { className: "x-theme" }'],
    ["themes/x/theme.css", ".x-theme { --background: white; }"],
  ])
  const readFile = (relativePath: string) => files.get(relativePath) ?? null

  it("reports a path that is not in the repository", () => {
    const section = checkRegistry(
      [{ files: [{ path: "themes/x/missing.css" }], name: "theme-x" }],
      readFile
    )

    expect(section.problems[0]).toContain("themes/x/missing.css")
  })

  it("reports a registry theme whose class the stylesheet never selects", () => {
    const section = checkRegistry(
      [
        {
          files: [
            { path: "themes/x/index.ts" },
            { path: "themes/x/theme.css" },
          ],
          name: "theme-x",
          type: "registry:theme",
        },
      ],
      (relativePath) =>
        relativePath === "themes/x/theme.css"
          ? ".y-theme { --background: white; }"
          : readFile(relativePath)
    )

    expect(section.problems[0]).toContain("has no rule for .x-theme")
  })

  it("passes a registry whose files all resolve", () => {
    const section = checkRegistry(
      [
        {
          files: [
            { path: "themes/x/index.ts" },
            { path: "themes/x/theme.css" },
          ],
          name: "theme-x",
          type: "registry:theme",
        },
      ],
      readFile
    )

    expect(section.problems).toEqual([])
    expect(section.summary[0]).toBe("1 items, 2 files")
  })
})
