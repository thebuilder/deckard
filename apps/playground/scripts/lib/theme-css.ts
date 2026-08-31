const commentPattern = /\/\*[\s\S]*?\*\//g
const customPropertyPattern = /(--[\w-]+)\s*:/g
const darkPattern = /\bdark\b/

interface CssRule {
  body: string
  selector: string
}

export interface ThemeCssReport {
  darkOnlyTokens: string[]
  darkTokens: string[]
  hasDarkBlock: boolean
  hasSelector: boolean
  lightTokens: string[]
}

// A flat scanner, not a CSS parser: the theme contract is top-level rules and custom properties, and nothing here needs more.
function topLevelRules(css: string): CssRule[] {
  const source = css.replaceAll(commentPattern, "")
  const rules: CssRule[] = []
  let depth = 0
  let selectorStart = 0
  let bodyStart = 0
  let selector = ""

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (character === "{") {
      if (depth === 0) {
        selector = source.slice(selectorStart, index).trim()
        bodyStart = index + 1
      }

      depth += 1
    } else if (character === "}") {
      depth -= 1

      if (depth === 0) {
        rules.push({ body: source.slice(bodyStart, index), selector })
        selectorStart = index + 1
      }
    }
  }

  return rules
}

function customProperties(body: string): string[] {
  return [...body.matchAll(customPropertyPattern)].map((match) => match[1])
}

function mentionsClass(text: string, className: string): boolean {
  return new RegExp(`\\.${className}(?![\\w-])`).test(text)
}

export function inspectThemeCss(
  css: string,
  className: string
): ThemeCssReport {
  const rules = topLevelRules(css).filter(
    (rule) =>
      mentionsClass(rule.selector, className) ||
      mentionsClass(rule.body, className)
  )

  const light = new Set<string>()
  const dark = new Set<string>()

  for (const rule of rules) {
    const target = darkPattern.test(rule.selector) ? dark : light

    for (const property of customProperties(rule.body)) {
      target.add(property)
    }
  }

  return {
    darkOnlyTokens: [...dark].filter((token) => !light.has(token)).sort(),
    darkTokens: [...dark],
    hasDarkBlock: rules.some((rule) => darkPattern.test(rule.selector)),
    hasSelector: rules.length > 0,
    lightTokens: [...light],
  }
}
