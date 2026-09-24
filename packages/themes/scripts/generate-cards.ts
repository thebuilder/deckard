#!/usr/bin/env node
// Writes src/<id>/card-colors.ts for every built-in theme: the share card
// colours in both modes, converted to hex from the theme's own palette, and the
// display family its headings name.
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { themeIds } from "../src/ids.ts"
import {
  firstFontFamily,
  type Palette,
  readThemePalettes,
  toCardColor,
} from "./theme-palette.ts"

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src"
)

export const generateCommand =
  "pnpm --filter @thebuilder/deckard-themes generate:cards"

// The card field each palette token paints, in the order the file lists them.
const cardTokens = {
  accent: "primary",
  background: "background",
  foreground: "foreground",
  muted: "muted-foreground",
} as const

const paletteTokens = [
  ...Object.values(cardTokens),
  "slide-font-heading",
] as const

type PaletteToken = (typeof paletteTokens)[number]

function cardColors(
  palette: Palette<PaletteToken>,
  theme: string,
  mode: string
) {
  return Object.entries(cardTokens).map(([field, token]) => {
    const value = palette[token]

    if (value === undefined) {
      throw new Error(
        `Theme "${theme}" sets no --${token} in its ${mode} palette, so its share card has no ${field} color.`
      )
    }

    return `    ${field}: "${toCardColor(value, theme, token)}",`
  })
}

/** The contents of src/<theme>/card-colors.ts, generated from its stylesheet. */
export function renderCardColors(theme: string, css: string): string {
  const { dark, light } = readThemePalettes(css, theme, paletteTokens)
  const family = firstFontFamily(light["slide-font-heading"])

  return [
    `// Generated from theme.css by \`${generateCommand}\`. Do not edit.`,
    "",
    "export const cardColors = {",
    "  dark: {",
    ...cardColors(dark, theme, "dark"),
    "  },",
    "  light: {",
    ...cardColors(light, theme, "light"),
    "  },",
    "} as const",
    "",
    "// The first family --slide-font-heading names, or undefined when it names a",
    "// variable the theme index resolves instead.",
    `export const cardFontFamily = ${family === undefined ? "undefined" : `"${family}"`}`,
    "",
  ].join("\n")
}

export function cardColorsPath(theme: string): string {
  return path.join(sourceRoot, theme, "card-colors.ts")
}

/** Every built-in theme's card-colors.ts, keyed by the path it is written to. */
export function renderAllCardColors(): Map<string, string> {
  return new Map(
    themeIds.map((theme) => [
      cardColorsPath(theme),
      renderCardColors(
        theme,
        fs.readFileSync(path.join(sourceRoot, theme, "theme.css"), "utf8")
      ),
    ])
  )
}

function main() {
  for (const [file, contents] of renderAllCardColors()) {
    fs.writeFileSync(file, contents)
    process.stdout.write(`wrote ${path.relative(process.cwd(), file)}\n`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
