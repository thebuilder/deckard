import fs from "node:fs"
import path from "node:path"
import { resolveRepoDirectory } from "./repo-file"

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

const tokenReference = /^var\(\s*--([a-z-]+)\s*\)$/

const themeSource = "packages/themes/src"
const themeDirectory = resolveRepoDirectory(themeSource)

if (themeDirectory === null) {
  console.warn(
    `[theme-tokens] No ${themeSource} directory above this build. The theme gallery will render empty swatches.`
  )
}

/*
 * The rule bodies of a stylesheet, paired with their selector, by brace
 * matching. A theme sets the same token in several rules, the dark block and
 * the accent variant included, so a swatch has to read the one rule it means
 * rather than the last match in the file.
 */
function readRules(css: string) {
  const rules: { body: string; selector: string }[] = []
  let depth = 0
  let start = 0
  let selectorStart = 0

  for (let i = 0; i < css.length; i += 1) {
    if (css[i] === "{") {
      depth += 1

      if (depth === 1) {
        start = i + 1
      }

      continue
    }

    if (css[i] !== "}") {
      continue
    }

    depth -= 1

    if (depth === 0) {
      rules.push({
        body: css.slice(start, i),
        selector: css.slice(selectorStart, start - 1).trim(),
      })
      selectorStart = i + 1
    }
  }

  return rules
}

function selectorParts(selector: string) {
  return selector.split(",").map((part) => part.trim())
}

// The palette rules: the theme class on its own, and the same class qualified
// only by a color mode. Anything with a descendant, a background variant, or a
// part attribute is styling, not the palette.
function isPaletteSelector(
  selector: string,
  themeClass: string,
  dark: boolean
) {
  return selectorParts(selector).some((part) => {
    if (!part.startsWith(themeClass)) {
      return false
    }

    const rest = part.slice(themeClass.length)

    if (rest.includes(" ") || rest.includes("[data-slide-background")) {
      return false
    }

    const isDark = rest.includes(".dark") || rest.includes('color-mode="dark"')

    return dark ? isDark : rest === ""
  })
}

function readToken(body: string, token: SwatchToken) {
  const matches = [
    ...body.matchAll(new RegExp(`(?:^|;)\\s*--${token}:\\s*([^;]+);`, "g")),
  ]

  return matches.at(-1)?.[1].trim()
}

// A value may name another token. Resolve it inside the palette it came from,
// falling back to light, so a swatch paints the color the theme paints rather
// than whatever the docs page happens to define.
function resolveValue(
  value: string | undefined,
  own: Swatches,
  fallback: Swatches
): string | undefined {
  const seen = new Set<string>()
  let current = value

  while (current !== undefined) {
    const reference = current.match(tokenReference)?.[1]

    if (!reference || seen.has(reference) || !isSwatchToken(reference)) {
      return current
    }

    seen.add(reference)
    current = own[reference] ?? fallback[reference]
  }

  return current
}

function isSwatchToken(name: string): name is SwatchToken {
  return (swatchTokens as readonly string[]).includes(name)
}

// A swatch is documentation, not the docs build. A stylesheet that moved or a
// token it never defines leaves that square blank instead of failing the build.
function readThemeCss(theme: string) {
  if (themeDirectory === null) {
    return ""
  }

  try {
    return fs.readFileSync(
      path.join(themeDirectory, theme, "theme.css"),
      "utf8"
    )
  } catch {
    return ""
  }
}

function readPalette(
  rules: ReturnType<typeof readRules>,
  themeClass: string,
  dark: boolean
) {
  const body = rules
    .filter((rule) => isPaletteSelector(rule.selector, themeClass, dark))
    .map((rule) => rule.body)
    .join(";")

  const palette: Swatches = {}

  for (const token of swatchTokens) {
    const value = readToken(body, token)

    if (value !== undefined) {
      palette[token] = value
    }
  }

  return palette
}

export function readThemeSwatches(theme: string) {
  const rules = readRules(readThemeCss(theme))
  const themeClass = `.${theme}-theme`
  const rawLight = readPalette(rules, themeClass, false)
  const rawDark = { ...rawLight, ...readPalette(rules, themeClass, true) }

  const light: Swatches = {}
  const dark: Swatches = {}

  for (const token of swatchTokens) {
    const lightValue = resolveValue(rawLight[token], rawLight, rawLight)
    const darkValue = resolveValue(rawDark[token], rawDark, rawLight)

    if (lightValue !== undefined) {
      light[token] = lightValue
    }

    if (darkValue !== undefined) {
      dark[token] = darkValue
    }
  }

  return { dark, light }
}
