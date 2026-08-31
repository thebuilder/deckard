import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const repoRoot = path.resolve(process.cwd(), "../..")

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

function readToken(css: string, token: SwatchToken) {
  return [
    ...css.matchAll(new RegExp(`^\\s*--${token}:\\s*([^;]+);`, "gm")),
  ].map((match) => match[1].trim())
}

// A swatch is documentation, not the docs build. A stylesheet that moved or a
// token it never defines leaves that square blank instead of failing the build.
function readThemeCss(source: string) {
  try {
    return fs.readFileSync(path.join(repoRoot, source), "utf8")
  } catch {
    return ""
  }
}

export function readThemeSwatches(source: string) {
  const css = readThemeCss(source)
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
