import type { SlideDefinition, SlideTheme } from "@thebuilder/deckard-core"
import { defineDeck, slideBackgroundModes } from "@thebuilder/deckard-core"
import { describe, expect, it } from "vitest"

import {
  builtInBackgrounds,
  checkRegistry,
  checkSlides,
  checkTheme,
  themeBackgrounds,
} from "./deck-checks.ts"

function buildDeck(slides: SlideDefinition[], deckTheme?: SlideTheme) {
  return defineDeck({
    description: "A deck under test.",
    footer: { mode: "visible" },
    header: { brand: "Test", href: "/", mode: "auto" },
    slides,
    theme: deckTheme,
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

function stylesheet(css: string) {
  return { css, source: "deck/theme/theme.css" }
}

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

describe("slide backgrounds", () => {
  it("lists what @thebuilder/deckard-core paints for every deck", () => {
    expect(builtInBackgrounds).toEqual([...slideBackgroundModes])
  })

  it("passes a variant the theme paints in a canvas", () => {
    const deck = buildDeck([{ background: "hero", body: "one" }], {
      ...theme,
      motion: { hero: "aurora" },
    })

    expect(checkSlides(deck, () => true).problems).toEqual([])
  })

  it("passes a variant the theme stylesheet selects", () => {
    const deck = buildDeck([{ background: "duotone", body: "one" }], theme)
    const painted = themeBackgrounds(
      theme,
      stylesheet(
        `${themeCss}\n.test-theme .slide-background[data-slide-background="duotone"] { --background: red; }`
      )
    )

    expect(painted).toEqual(["duotone"])
    expect(checkSlides(deck, () => true, painted).problems).toEqual([])
  })

  it("reports a variant nothing paints", () => {
    const deck = buildDeck([{ background: "herro", body: "one" }], {
      ...theme,
      motion: { hero: "aurora" },
    })

    const section = checkSlides(deck, () => true)

    expect(section.problems[0]).toContain('"herro"')
    expect(section.problems[0]).toContain("hero")
  })
})

describe("checkTheme", () => {
  it("passes a theme whose class and color blocks line up", () => {
    const section = checkTheme(theme, stylesheet(themeCss))

    expect(section.problems).toEqual([])
    expect(section.summary[1]).toBe(
      "2 tokens in the light block, 2 dark overrides, from deck/theme/theme.css"
    )
  })

  it("reports a className the stylesheet never selects", () => {
    const section = checkTheme(
      { ...theme, className: "tets-theme" },
      stylesheet(themeCss)
    )

    expect(section.problems[0]).toContain(".tets-theme")
  })

  it("reports a missing stylesheet", () => {
    const section = checkTheme(theme, {
      css: null,
      source: "deck/theme/theme.css",
    })

    expect(section.problems[0]).toContain("deck/theme/theme.css is missing")
  })

  it("reports a token only the dark block defines", () => {
    const section = checkTheme(
      theme,
      stylesheet(
        `${themeCss}\n.test-theme:where([data-slide-color-mode="dark"]) { --accent: blue; }`
      )
    )

    expect(section.problems[0]).toContain("--accent")
  })

  it("reports a dark block the theme does not claim to support", () => {
    const section = checkTheme(
      { ...theme, colorModes: ["light"], defaultColorMode: "light" },
      stylesheet(themeCss)
    )

    expect(section.problems[0]).toContain('does not list "dark" in colorModes')
  })

  it("reports a claimed dark mode the stylesheet never paints", () => {
    const section = checkTheme(
      theme,
      stylesheet(".test-theme { --background: white; }")
    )

    expect(section.problems[0]).toContain("has no dark block")
  })
})

describe("checkRegistry", () => {
  const files = new Map([
    ["blocks/typography.tsx", "export function Eyebrow() {}"],
    ["blocks/metrics.tsx", "export function StatGrid() {}"],
  ])
  const readFile = (relativePath: string) => files.get(relativePath) ?? null

  it("reports a path that is not in the repository", () => {
    const section = checkRegistry(
      [{ files: [{ path: "blocks/missing.tsx" }], name: "block-missing" }],
      readFile
    )

    expect(section.problems[0]).toContain("blocks/missing.tsx")
  })

  it("passes a registry whose files all resolve", () => {
    const section = checkRegistry(
      [
        {
          files: [
            { path: "blocks/typography.tsx" },
            { path: "blocks/metrics.tsx" },
          ],
          name: "block-typography",
        },
      ],
      readFile
    )

    expect(section.problems).toEqual([])
    expect(section.summary[0]).toBe("1 items, 2 files")
  })
})
