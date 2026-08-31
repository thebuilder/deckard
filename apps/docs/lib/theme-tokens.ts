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
export type Swatches = Record<SwatchToken, string>

function readToken(css: string, token: SwatchToken) {
  const matches = [
    ...css.matchAll(new RegExp(`^\\s*--${token}:\\s*([^;]+);`, "gm")),
  ]

  if (matches.length === 0) {
    throw new Error(`theme stylesheet defines no --${token}`)
  }

  return matches.map((match) => match[1].trim())
}

export function readThemeSwatches(source: string) {
  const css = fs.readFileSync(path.join(repoRoot, source), "utf8")
  const light = {} as Swatches
  const dark = {} as Swatches

  for (const token of swatchTokens) {
    const values = readToken(css, token)
    light[token] = values[0]
    dark[token] = values.at(-1) ?? values[0]
  }

  return { dark, light }
}
