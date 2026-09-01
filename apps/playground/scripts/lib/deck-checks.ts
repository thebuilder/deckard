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
  type?: string
}

export type ReadFile = (relativePath: string) => string | null

const classNamePattern = /className:\s*"([^"]+)"/
const themeCssPath = "deck/theme/theme.css"

export function checkSlides(
  deck: Deck,
  hasSourceFile: (sourcePath: string) => boolean
): Section {
  const problems: string[] = []

  for (const slide of deck.slides) {
    problems.push(...checkSlide(slide, hasSourceFile))
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

function checkColorModes(
  theme: SlideTheme,
  report: ReturnType<typeof inspectThemeCss>
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

export function checkTheme(theme: SlideTheme, css: string | null): Section {
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
    `${report.lightTokens.length} tokens in the light block, ${report.darkTokens.length} dark overrides`
  )

  return { name: "theme", problems: checkColorModes(theme, report), summary }
}

interface ThemeSource {
  className: string | undefined
  css: string
  cssPath: string
  entryPath: string
}

function readThemeSource(
  item: RegistryItem,
  readFile: ReadFile
): ThemeSource | null {
  const files = item.files ?? []
  const entryPath = files.find((file) => file.path?.endsWith("index.ts"))?.path
  const cssPath = files.find((file) => file.path?.endsWith("theme.css"))?.path

  if (!(entryPath && cssPath)) {
    return null
  }

  const entry = readFile(entryPath)
  const css = readFile(cssPath)

  if (!(entry && css)) {
    return null
  }

  return {
    className: classNamePattern.exec(entry)?.[1],
    css,
    cssPath,
    entryPath,
  }
}

function checkRegistryThemeItem(item: RegistryItem, readFile: ReadFile) {
  const source = readThemeSource(item, readFile)

  if (!source) {
    return []
  }

  const { className, css, cssPath, entryPath } = source

  if (!className) {
    return [
      `Registry item "${item.name}" ships ${entryPath} without a className. A theme scopes itself to the canvas with one.`,
    ]
  }

  if (inspectThemeCss(css, className).hasSelector) {
    return []
  }

  return [
    `Registry item "${item.name}" sets className "${className}" in ${entryPath}, but ${cssPath} has no rule for .${className}.`,
  ]
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

    if (item.type === "registry:theme") {
      problems.push(...checkRegistryThemeItem(item, readFile))
    }
  }

  return {
    name: "registry",
    problems,
    summary: [`${items.length} items, ${fileCount} files`],
  }
}
