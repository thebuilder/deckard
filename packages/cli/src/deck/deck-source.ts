export type ThemeImportKind = "builtin" | "local"

export interface ThemeImport {
  binding: string
  kind: ThemeImportKind
  name: string | null
}

export const themesSpecifier = "@deckard/themes"
export const localThemeSpecifier = "@/deck/theme"

const importLinePattern = /^import\s.+?\sfrom\s+"([^"]+)"\r?\n/gm
const namedImportPattern = /\{\s*([\w$]+)(?:\s+as\s+([\w$]+))?\s*\}/
const themePropertyPattern = /^(\s*)theme(?::\s*[\w$]+)?,$/m
const specifierPattern = /\sfrom\s+"([^"]+)"/

interface ImportLine {
  end: number
  specifier: string
  start: number
  text: string
}

function importLines(source: string): ImportLine[] {
  importLinePattern.lastIndex = 0

  const lines: ImportLine[] = []
  let match = importLinePattern.exec(source)

  while (match) {
    lines.push({
      end: match.index + match[0].length,
      specifier: match[1],
      start: match.index,
      text: match[0],
    })
    match = importLinePattern.exec(source)
  }

  return lines
}

// Package imports first, then the "@/" aliases, each group alphabetical. That is
// the order the formatter writes, so a rewritten deck.ts needs no reformatting.
function importRank(specifier: string): number {
  return specifier.startsWith("@/") ? 1 : 0
}

function compareImports(left: string, right: string): number {
  const ranked = importRank(left) - importRank(right)

  return ranked === 0 ? left.localeCompare(right) : ranked
}

function bindingOf(line: string): { binding: string; imported: string } | null {
  const [, imported, alias] = namedImportPattern.exec(line) ?? []

  return imported ? { binding: alias ?? imported, imported } : null
}

export function findThemeImport(source: string): ThemeImport | null {
  for (const line of importLines(source)) {
    if (line.specifier === themesSpecifier) {
      const named = bindingOf(line.text)

      if (named) {
        return { binding: named.binding, kind: "builtin", name: named.imported }
      }
    }

    if (line.specifier === localThemeSpecifier) {
      const named = bindingOf(line.text)

      if (named) {
        return { binding: named.binding, kind: "local", name: null }
      }
    }
  }

  return null
}

function withoutImport(source: string, specifier: string): string {
  const line = importLines(source).find(
    (entry) => entry.specifier === specifier
  )

  return line ? source.slice(0, line.start) + source.slice(line.end) : source
}

function withImport(source: string, line: string): string {
  const lines = importLines(source)
  const specifier = specifierPattern.exec(line)?.[1] ?? ""

  if (lines.length === 0) {
    return line + source
  }

  const after = lines.find(
    (entry) => compareImports(specifier, entry.specifier) < 0
  )

  const at = after ? after.start : lines.at(-1)?.end

  if (at === undefined) {
    return line + source
  }

  return source.slice(0, at) + line + source.slice(at)
}

function withThemeProperty(source: string, value: string): string {
  if (!themePropertyPattern.test(source)) {
    throw new Error(
      "deck/deck.ts does not pass a theme to defineDeck, so there is nothing to rewrite. Add `theme` to the call and try again."
    )
  }

  return source.replace(
    themePropertyPattern,
    (_match, indent: string) =>
      `${indent}${value === "theme" ? "theme," : `theme: ${value},`}`
  )
}

export function applyBuiltInTheme(source: string, name: string): string {
  const current = findThemeImport(source)

  if (!current) {
    throw new Error(
      `deck/deck.ts imports no theme. Add \`import { ${name} } from "${themesSpecifier}"\` and pass it to defineDeck.`
    )
  }

  const stripped = withoutImport(
    source,
    current.kind === "builtin" ? themesSpecifier : localThemeSpecifier
  )

  return withThemeProperty(
    withImport(stripped, `import { ${name} } from "${themesSpecifier}"\n`),
    name
  )
}

export function applyLocalTheme(source: string): string {
  const stripped = withoutImport(source, themesSpecifier)

  return withThemeProperty(
    withImport(stripped, `import { theme } from "${localThemeSpecifier}"\n`),
    "theme"
  )
}
