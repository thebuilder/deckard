import fs from "node:fs"
import path from "node:path"

import type { SlideTheme } from "@deckard/core"

import { type ParsedArgs, stringFlag } from "../args.ts"
import { loadDeck } from "../deck/deck-module.ts"
import {
  applyLocalTheme,
  deckSourcePath,
  findThemeImport,
} from "../deck/deck-source.ts"
import {
  builtInThemePath,
  builtInThemes,
  isBuiltInTheme,
  localThemeDirectory,
  moveLocalThemeAdvice,
} from "../deck/theme-source.ts"
import { write } from "../output.ts"
import { projectPath } from "../project.ts"

const kinds = ["theme"] as const

function readDeckSource(): string {
  try {
    return fs.readFileSync(projectPath(deckSourcePath), "utf8")
  } catch (error) {
    throw new Error(
      `No ${deckSourcePath} here. Run this from the deck root, next to package.json.`,
      { cause: error }
    )
  }
}

function chooseTheme(args: ParsedArgs, source: string): string {
  const forced = stringFlag(args, "theme")
  const imported = findThemeImport(source)

  if (imported?.kind === "local" && !forced) {
    throw new Error(
      `This deck already imports its theme from ${localThemeDirectory}, so there is nothing to eject.`
    )
  }

  const name = forced ?? imported?.name

  if (!name) {
    throw new Error(
      `${deckSourcePath} imports no theme from @deckard/themes, so there is no built-in to copy. Name one with --theme <${builtInThemes.join("|")}>.`
    )
  }

  if (!isBuiltInTheme(name)) {
    throw new Error(
      `"${name}" is not a built-in theme. The built-ins are ${builtInThemes.join(", ")}.`
    )
  }

  return name
}

function assertNoLocalTheme(): void {
  if (!fs.existsSync(projectPath(localThemeDirectory))) {
    return
  }

  throw new Error(
    `${localThemeDirectory} already exists, so there is nothing to eject over it. ${moveLocalThemeAdvice}`
  )
}

function themeEntry(theme: SlideTheme): string {
  return `import type { SlideTheme } from "@deckard/core"

import "./theme.css"

export const theme = {
  className: "${theme.className}",
  colorModes: [${theme.colorModes.map((mode) => `"${mode}"`).join(", ")}],
  defaultColorMode: "${theme.defaultColorMode}",
  id: "${theme.id}",
} satisfies SlideTheme
`
}

function copyAsset(name: string, asset: string): void {
  const from = builtInThemePath(name, asset)

  if (!fs.existsSync(from)) {
    throw new Error(
      `The installed @deckard/core has no ${asset} for the ${name} theme. Reinstall the deck's dependencies.`
    )
  }

  fs.copyFileSync(from, projectPath(localThemeDirectory, asset))
}

// A theme that self-hosts a typeface points at it from theme.css with a
// relative url, so the woff2 files and the licence beside them have to land in
// the ejected directory or the copy renders in the fallback stack.
function copyFonts(name: string): string[] {
  const from = builtInThemePath(name, "fonts")

  if (!fs.existsSync(from)) {
    return []
  }

  const to = projectPath(localThemeDirectory, "fonts")

  fs.mkdirSync(to, { recursive: true })

  const files = fs.readdirSync(from).sort()

  for (const file of files) {
    fs.copyFileSync(path.join(from, file), path.join(to, file))
  }

  return files.map((file) => path.join("fonts", file))
}

async function ejectTheme(args: ParsedArgs): Promise<void> {
  const source = readDeckSource()
  const name = chooseTheme(args, source)

  assertNoLocalTheme()

  const deck = await loadDeck()

  if (deck.theme.id !== name) {
    throw new Error(
      `${deckSourcePath} imports "${name}" but the deck renders the "${deck.theme.id}" theme. Pass --theme ${deck.theme.id} if that is the one to copy.`
    )
  }

  fs.mkdirSync(projectPath(localThemeDirectory), { recursive: true })
  copyAsset(name, "theme.css")
  copyAsset(name, "THEME.md")

  const fonts = copyFonts(name)

  fs.writeFileSync(
    projectPath(localThemeDirectory, "index.ts"),
    themeEntry(deck.theme)
  )
  fs.writeFileSync(projectPath(deckSourcePath), applyLocalTheme(source))

  write(`Ejected the ${name} theme into ${localThemeDirectory}/`)

  for (const asset of ["theme.css", "index.ts", "THEME.md", ...fonts]) {
    write(`  ${path.join(localThemeDirectory, asset)}`)
  }

  write(
    `\n${deckSourcePath} now imports it from "@/deck/theme". The three files are yours: read THEME.md, then edit theme.css.`
  )
}

export function runEject(args: ParsedArgs): Promise<void> {
  const [kind] = args.positionals

  if (!(kinds as readonly string[]).includes(kind)) {
    throw new Error(
      `deckard eject takes ${kinds.join(" or ")}, not "${kind ?? ""}". Try: deckard eject theme`
    )
  }

  return ejectTheme(args)
}
