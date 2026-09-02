import type { Deck, ResolvedSlide, SlideTheme } from "@deckard/core"

import { inspectThemeCss } from "./theme-css.ts"

export interface Section {
  name: string
  problems: string[]
  summary: string[]
}

export interface RegistryItem {
  files?: { path?: string; target?: string }[]
  name?: string
}

export type ReadFile = (relativePath: string) => string | null

// The variants the runtime hands every deck. A theme may name more, in its
// motion map or in its stylesheet, so a background in none of the three is a
// misspelling and the slide renders the wrong thing quietly. Written out rather
// than imported: the CLI reads the deck's runtime and never loads its own, and
// deck-checks.test.ts holds this list to what @deckard/core declares.
export const builtInBackgrounds = [
  "accent",
  "default",
  "grid",
  "none",
  "spotlight",
] as string[]

export function checkSlides(
  deck: Deck,
  hasSourceFile: (sourcePath: string) => boolean,
  paintedByTheme: string[] = []
): Section {
  const problems: string[] = []
  const painted = new Set([
    ...builtInBackgrounds,
    ...paintedByTheme,
    ...Object.keys(deck.theme.motion ?? {}),
  ])

  for (const slide of deck.slides) {
    problems.push(...checkSlide(slide, hasSourceFile))
    problems.push(...checkBackground(slide, deck.theme.id, painted))
  }

  const discovered = deck.slides.filter((slide) => slide.sourcePath).length
  const slugged = deck.slides.filter((slide) => slide.slug).length

  return {
    name: "deck",
    problems,
    summary: [
      `${deck.slides.length} slides: ${deck.slides.length - discovered} inline, ${discovered} discovered`,
      `${slugged} slugs, ${deck.slides.length - slugged} numbered`,
      `canvas ${deck.canvas.width}x${deck.canvas.height}, margin ${deck.canvas.margin}`,
    ],
  }
}

function checkSlide(
  slide: ResolvedSlide,
  hasSourceFile: (sourcePath: string) => boolean
) {
  const problems: string[] = []
  const source = slide.sourcePath ?? "deck/slides.tsx"

  if (slide.body === undefined || slide.body === null) {
    problems.push(
      `Slide ${slide.number} (${slide.id}) has no body. Every slide needs one, look in ${source}.`
    )
  }

  if (slide.sourcePath && !hasSourceFile(slide.sourcePath)) {
    problems.push(
      `Slide ${slide.number} (${slide.id}) reports sourcePath "${slide.sourcePath}", which is not a file under deck/.`
    )
  }

  return problems
}

function checkBackground(
  slide: ResolvedSlide,
  themeId: string,
  painted: Set<string>
) {
  if (painted.has(slide.background)) {
    return []
  }

  return [
    `Slide ${slide.number} (${slide.id}) asks for the background "${slide.background}", which theme "${themeId}" never paints. It renders as an unstyled background layer. Pick one of: ${[...painted].sort().join(", ")}.`,
  ]
}

function checkColorModes(
  theme: SlideTheme,
  report: ReturnType<typeof inspectThemeCss>,
  themeCssPath: string
) {
  const problems: string[] = []
  const supportsDark = theme.colorModes.includes("dark")

  if (supportsDark && !report.hasDarkBlock) {
    problems.push(
      `Theme "${theme.id}" lists "dark" in colorModes, but ${themeCssPath} has no dark block. The toggle switches to a mode the theme never paints.`
    )
  }

  if (!supportsDark && report.hasDarkBlock) {
    problems.push(
      `${themeCssPath} has a dark block, but theme "${theme.id}" does not list "dark" in colorModes. The canvas is pinned to ${theme.colorModes.join(", ")}, so those rules never apply.`
    )
  }

  if (report.darkOnlyTokens.length > 0) {
    problems.push(
      `${themeCssPath} defines ${report.darkOnlyTokens.join(", ")} only in the dark block. Light mode renders without ${report.darkOnlyTokens.length === 1 ? "it" : "them"}.`
    )
  }

  return problems
}

export interface ThemeStylesheet {
  css: string | null
  source: string
}

/** The background variants a theme's own stylesheet selects. */
export function themeBackgrounds(
  theme: SlideTheme,
  stylesheet: ThemeStylesheet
): string[] {
  if (!(stylesheet.css && theme.className)) {
    return []
  }

  return inspectThemeCss(stylesheet.css, theme.className).backgrounds
}

export function checkTheme(
  theme: SlideTheme,
  stylesheet: ThemeStylesheet
): Section {
  const { css, source: themeCssPath } = stylesheet

  const summary = [
    `${theme.id}${theme.className ? ` (.${theme.className})` : " (app tokens, no class)"}: ${theme.colorModes.join(" and ")}, default ${theme.defaultColorMode}`,
  ]

  if (theme.className.length === 0) {
    return { name: "theme", problems: [], summary }
  }

  if (css === null) {
    return {
      name: "theme",
      problems: [
        `Theme "${theme.id}" carries the class .${theme.className}, but ${themeCssPath} is missing.`,
      ],
      summary,
    }
  }

  const report = inspectThemeCss(css, theme.className)

  if (!report.hasSelector) {
    return {
      name: "theme",
      problems: [
        `Theme "${theme.id}" sets className "${theme.className}", but ${themeCssPath} has no rule for .${theme.className}. The canvas carries that class, so none of the theme reaches the slide.`,
      ],
      summary,
    }
  }

  summary.push(
    `${report.lightTokens.length} tokens in the light block, ${report.darkTokens.length} dark overrides, from ${themeCssPath}`
  )

  return {
    name: "theme",
    problems: checkColorModes(theme, report, themeCssPath),
    summary,
  }
}

export function checkRegistry(
  items: RegistryItem[],
  readFile: ReadFile
): Section {
  const problems: string[] = []
  let fileCount = 0

  for (const item of items) {
    for (const file of item.files ?? []) {
      fileCount += 1

      if (!(file.path && readFile(file.path) !== null)) {
        problems.push(
          `registry.json item "${item.name}" points at "${file.path}", which is not a file in the repository. shadcn build reads that path.`
        )
      }
    }
  }

  return {
    name: "registry",
    problems,
    summary: [`${items.length} items, ${fileCount} files`],
  }
}
