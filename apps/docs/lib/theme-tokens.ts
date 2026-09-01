import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

export const swatchTokens = [
  "background",
  "card",
  "muted",
  "border",
  "primary",
  "foreground",
] as const

export type SwatchToken = (typeof swatchTokens)[number]
export type Swatches = Partial<Record<SwatchToken, string>>

const themeSource = "packages/themes/src"

// Neither cwd nor this module's own path is stable: Blume drives Astro from the
// generated .blume runtime, and the production build bundles this module into a
// chunk at a different depth than the source. Walking up for the directory that
// actually holds the themes is the only anchor that survives both.
function findRepoRoot() {
  const starts = [process.cwd(), path.dirname(fileURLToPath(import.meta.url))]

  for (const start of starts) {
    let directory = start
    let parent = path.dirname(directory)

    while (directory !== parent) {
      if (fs.existsSync(path.join(directory, themeSource))) {
        return directory
      }

      directory = parent
      parent = path.dirname(directory)
    }
  }

  return null
}

const repoRoot = findRepoRoot()

if (!repoRoot) {
  console.warn(
    `[theme-tokens] No ${themeSource} directory above ${process.cwd()}. The theme gallery will render empty swatches.`
  )
}

function readToken(css: string, token: SwatchToken) {
  return [
    ...css.matchAll(new RegExp(`^\\s*--${token}:\\s*([^;]+);`, "gm")),
  ].map((match) => match[1].trim())
}

// A swatch is documentation, not the docs build. A stylesheet that moved or a
// token it never defines leaves that square blank instead of failing the build.
function readThemeCss(theme: string) {
  if (!repoRoot) {
    return ""
  }

  try {
    return fs.readFileSync(
      path.join(repoRoot, themeSource, theme, "theme.css"),
      "utf8"
    )
  } catch {
    return ""
  }
}

// Each theme.css declares its light values first and its dark values in the
// block below, so the first match is light and the last is dark.
export function readThemeSwatches(theme: string) {
  const css = readThemeCss(theme)
  const light: Swatches = {}
  const dark: Swatches = {}

  for (const token of swatchTokens) {
    const values = readToken(css, token)

    if (values.length === 0) {
      continue
    }

    light[token] = values[0]
    dark[token] = values.at(-1) ?? values[0]
  }

  return { dark, light }
}
