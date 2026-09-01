import fs from "node:fs"
import path from "node:path"

import { projectPath, resolveFromProject } from "../project.ts"

export const builtInThemes = [
  "broadsheet",
  "deckard",
  "ledger",
  "meridian",
  "nexus",
  "phosphor",
] as const

export type BuiltInTheme = (typeof builtInThemes)[number]

export const localThemeDirectory = "deck/theme"

export interface ThemeStylesheet {
  css: string | null
  source: string
}

export function isBuiltInTheme(name: string): name is BuiltInTheme {
  return (builtInThemes as readonly string[]).includes(name)
}

export function hasLocalTheme(): boolean {
  return fs.existsSync(projectPath(localThemeDirectory))
}

export const themesPackage = "@deckard/themes"

// The presets ship inside the package the deck installed, so their source is
// wherever that copy landed rather than anywhere in the deck.
export function builtInThemePath(name: string, ...segments: string[]): string {
  const manifest = resolveFromProject(`${themesPackage}/package.json`)

  if (!manifest) {
    throw new Error(
      `${themesPackage} does not resolve from this directory. Install it, and run this from the deck root, next to package.json.`
    )
  }

  return path.join(path.dirname(manifest), "dist", name, ...segments)
}

function readIfPresent(file: string): string | null {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null
}

// A deck reads its theme from one of two places, and every check that inspects
// the stylesheet has to name the one it actually read.
export function readThemeStylesheet(themeId: string): ThemeStylesheet {
  const local = path.join(localThemeDirectory, "theme.css")
  const localCss = readIfPresent(projectPath(local))

  if (localCss !== null) {
    return { css: localCss, source: local }
  }

  if (!isBuiltInTheme(themeId)) {
    return { css: null, source: local }
  }

  return {
    css: readIfPresent(builtInThemePath(themeId, "theme.css")),
    source: `${themesPackage}/${themeId}`,
  }
}
