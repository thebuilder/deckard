// Reads a theme's palette out of its own stylesheet. The docs gallery paints
// its swatches from this, and generate-cards.ts writes each theme's share card
// colours from it, so both read a token the same way.
//
// No relative imports: the docs site imports this file across the repository,
// and node runs the card generator against it directly.

export interface CssRule {
  body: string
  selector: string
}

export type Palette<Token extends string> = Partial<Record<Token, string>>

const tokenReference = /^var\(\s*--([a-z0-9-]+)\s*\)$/

/*
 * The rule bodies of a stylesheet, paired with their selector, by brace
 * matching. A theme sets the same token in several rules, the dark block and
 * the accent variant included, so a reader has to take the one rule it means
 * rather than the last match in the file.
 */
export function readRules(css: string): CssRule[] {
  const rules: CssRule[] = []
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
export function isPaletteSelector(
  selector: string,
  themeClass: string,
  dark: boolean
): boolean {
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

/** The last value a rule body declares for `--<token>`, or nothing. */
export function readToken(body: string, token: string): string | undefined {
  const matches = [
    ...body.matchAll(new RegExp(`(?:^|;)\\s*--${token}:\\s*([^;]+);`, "g")),
  ]

  return matches.at(-1)?.[1].trim()
}

// A value may name another token. Resolve it inside the palette it came from,
// falling back to light, so a reader gets the color the theme paints. A name
// outside `tokens` is left as written.
function resolveValue<Token extends string>(
  value: string | undefined,
  tokens: readonly Token[],
  own: Palette<Token>,
  fallback: Palette<Token>
): string | undefined {
  const seen = new Set<string>()
  let current = value

  while (current !== undefined) {
    const reference = current.match(tokenReference)?.[1]

    if (
      !reference ||
      seen.has(reference) ||
      !(tokens as readonly string[]).includes(reference)
    ) {
      return current
    }

    seen.add(reference)
    current = own[reference as Token] ?? fallback[reference as Token]
  }

  return current
}

function readPalette<Token extends string>(
  rules: CssRule[],
  themeClass: string,
  dark: boolean,
  tokens: readonly Token[]
) {
  const body = rules
    .filter((rule) => isPaletteSelector(rule.selector, themeClass, dark))
    .map((rule) => rule.body)
    .join(";")

  const palette: Palette<Token> = {}

  for (const token of tokens) {
    const value = readToken(body, token)

    if (value !== undefined) {
      palette[token] = value
    }
  }

  return palette
}

/**
 * The values `tokens` take in a theme's light and dark palettes, with a
 * `var(--token)` naming another of `tokens` resolved. Dark inherits every token
 * its own block does not set from light. A token neither palette declares is
 * missing from the result.
 */
export function readThemePalettes<Token extends string>(
  css: string,
  theme: string,
  tokens: readonly Token[]
): { dark: Palette<Token>; light: Palette<Token> } {
  const rules = readRules(css)
  const themeClass = `.${theme}-theme`
  const rawLight = readPalette(rules, themeClass, false, tokens)
  const rawDark = {
    ...rawLight,
    ...readPalette(rules, themeClass, true, tokens),
  }

  const light: Palette<Token> = {}
  const dark: Palette<Token> = {}

  for (const token of tokens) {
    const lightValue = resolveValue(rawLight[token], tokens, rawLight, rawLight)
    const darkValue = resolveValue(rawDark[token], tokens, rawDark, rawLight)

    if (lightValue !== undefined) {
      light[token] = lightValue
    }

    if (darkValue !== undefined) {
      dark[token] = darkValue
    }
  }

  return { dark, light }
}

const hexColor = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i
const rgbColor = /^rgba?\([^()]*\)$/i
const oklchColor = /^oklch\(\s*([^()]*?)\s*\)$/i
const oklchParts = /[\s/]+/
const degreeSuffix = /deg$/

function channel(value: string, percentScale: number, name: string) {
  const number = value.endsWith("%")
    ? (Number.parseFloat(value) / 100) * percentScale
    : Number.parseFloat(value.replace(degreeSuffix, ""))

  if (Number.isNaN(number)) {
    throw new Error(`"${value}" is not a number for oklch ${name}.`)
  }

  return number
}

function gamma(linear: number) {
  const encoded =
    linear <= 0.003_130_8 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055

  return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
}

function hexByte(value: number) {
  return value.toString(16).padStart(2, "0")
}

/**
 * An `oklch(L C H)` or `oklch(L C H / A)` color as `#rrggbb`, or `#rrggbbaa`
 * when it is not opaque. Out-of-gamut channels are clamped to sRGB.
 */
export function oklchToHex(color: string): string {
  const inner = color.trim().match(oklchColor)?.[1]

  if (inner === undefined) {
    throw new Error(`"${color}" is not an oklch() color.`)
  }

  const parts = inner.split(oklchParts).filter(Boolean)

  if (parts.length !== 3 && parts.length !== 4) {
    throw new Error(`"${color}" needs a lightness, a chroma, and a hue.`)
  }

  const [lightnessPart, chromaPart, huePart, alphaPart] = parts.map((part) =>
    part === "none" ? "0" : part
  )
  const lightness = channel(lightnessPart, 1, "lightness")
  const chroma = channel(chromaPart, 0.4, "chroma")
  const hue = (channel(huePart, 360, "hue") * Math.PI) / 180
  const alpha = alphaPart === undefined ? 1 : channel(alphaPart, 1, "alpha")

  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)

  const l = (lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3
  const m = (lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3
  const s = (lightness - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3

  const red = gamma(
    4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s
  )
  const green = gamma(
    -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s
  )
  const blue = gamma(
    -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s
  )

  const hex = `#${hexByte(red)}${hexByte(green)}${hexByte(blue)}`

  return alpha >= 1
    ? hex
    : `${hex}${hexByte(Math.round(Math.max(0, alpha) * 255))}`
}

/**
 * A color the share card renderer reads: hex and `rgb()` pass through, and
 * `oklch()` converts to hex. Anything else throws naming the theme and the
 * token, since the card cannot paint it.
 */
export function toCardColor(value: string, theme: string, token: string) {
  const color = value.trim()

  if (hexColor.test(color) || rgbColor.test(color)) {
    return color
  }

  if (oklchColor.test(color)) {
    try {
      return oklchToHex(color)
    } catch (error) {
      throw new Error(
        `Theme "${theme}" sets --${token} to ${color}, which does not parse: ${(error as Error).message}`,
        { cause: error }
      )
    }
  }

  throw new Error(
    `Theme "${theme}" sets --${token} to ${color}. A share card needs a hex, rgb(), or oklch() color it can convert, so set the token to one of those in the theme's palette block.`
  )
}

/** The first family a `font-family` list names, unquoted, or nothing when it starts with a `var()`. */
export function firstFontFamily(value: string | undefined): string | undefined {
  const first = value?.split(",")[0]?.trim()

  if (!first || first.startsWith("var(")) {
    return undefined
  }

  return first.replace(/^["']|["']$/g, "")
}
