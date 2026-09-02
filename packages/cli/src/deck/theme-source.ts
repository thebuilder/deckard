import fs from "node:fs"
import path from "node:path"

import type { BuiltInThemeId } from "@deckard/themes/ids"

import { projectPath, resolveFromProject } from "../project.ts"
import { defaultThemeId, themeIds } from "./built-in-themes.ts"
import {
  deckSourcePath,
  findThemeImport,
  type ThemeImportKind,
} from "./deck-source.ts"

// The names and the default are decided in @deckard/themes/ids and copied into
// ./built-in-themes.ts by the build. Nothing the CLI ships imports the theme
// package at runtime, so it installs on its own; the copy is generated rather
// than kept by hand.
export const builtInThemes = themeIds

export type BuiltInTheme = BuiltInThemeId

export const defaultTheme: BuiltInTheme = defaultThemeId

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

// A directory left on disk is not a decision. deck/deck.ts names the theme the
// deck renders, so a stale deck/theme beside a built-in import is read by
// nothing, this included.
export const moveLocalThemeAdvice = `Move or delete ${localThemeDirectory} first: a deck has one theme, and nothing writes over that directory.`

export function themeStylesheetKind(
  deckSource: string | null,
  localThemeExists: boolean
): ThemeImportKind {
  const imported = deckSource ? findThemeImport(deckSource) : null

  if (imported) {
    return imported.kind
  }

  return localThemeExists ? "local" : "builtin"
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
// the stylesheet has to name the one it actually read. Which one that is comes
// from the import in deck/deck.ts, never from whatever is on disk.
export function readThemeStylesheet(themeId: string): ThemeStylesheet {
  const local = path.join(localThemeDirectory, "theme.css")
  const kind = themeStylesheetKind(
    readIfPresent(projectPath(deckSourcePath)),
    hasLocalTheme()
  )

  if (kind === "local") {
    return { css: readIfPresent(projectPath(local)), source: local }
  }

  if (!isBuiltInTheme(themeId)) {
    return { css: null, source: local }
  }

  return {
    css: readIfPresent(builtInThemePath(themeId, "theme.css")),
    source: `${themesPackage}/${themeId}`,
  }
}
