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
  themesPackage,
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

function readAsset(name: string, asset: string): string {
  const from = builtInThemePath(name, asset)

  if (!fs.existsSync(from)) {
    throw new Error(
      `The installed ${themesPackage} has no ${asset} for the ${name} theme. Reinstall the deck's dependencies.`
    )
  }

  return fs.readFileSync(from, "utf8")
}

function copyAsset(name: string, asset: string): void {
  fs.writeFileSync(
    projectPath(localThemeDirectory, asset),
    readAsset(name, asset)
  )
}

// A face is named <family>[-<weight>][-italic]-<subset>.woff2 and its licence is
// <family>.OFL.txt, so the family is whatever stands before the subset once the
// weight, when it is a three digit one, and the slope are taken off.
function licenceFor(file: string): string {
  const family = file.slice(0, file.indexOf("-latin"))

  return `${family.replace(/-(?:italic|\d{3})$/, "")}.OFL.txt`
}

// The built-in themes share one fonts directory, so a stylesheet reaches its
// faces at ../fonts. An ejected theme is a directory the deck owns and moves
// around, so it takes a copy of only the faces it names, at ./fonts, and the
// stylesheet is repointed to match. The licence travels with the binaries.
function copyFonts(css: string): { css: string; files: string[] } {
  const named = [...css.matchAll(/url\("\.\.\/fonts\/([\w.-]+\.woff2)"\)/g)].map(
    (match) => match[1]
  )

  if (named.length === 0) {
    return { css, files: [] }
  }

  const wanted = [...new Set([...named, ...named.map(licenceFor)])].sort()
  const to = projectPath(localThemeDirectory, "fonts")

  fs.mkdirSync(to, { recursive: true })

  for (const file of wanted) {
    const from = builtInThemePath("fonts", file)

    if (!fs.existsSync(from)) {
      throw new Error(
        `The installed ${themesPackage} has no fonts/${file}. Reinstall the deck's dependencies.`
      )
    }

    fs.copyFileSync(from, path.join(to, file))
  }

  return {
    css: css.replaceAll('url("../fonts/', 'url("./fonts/'),
    files: wanted.map((file) => path.join("fonts", file)),
  }
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
  copyAsset(name, "THEME.md")

  const fonts = copyFonts(readAsset(name, "theme.css"))

  fs.writeFileSync(projectPath(localThemeDirectory, "theme.css"), fonts.css)
  fs.writeFileSync(
    projectPath(localThemeDirectory, "index.ts"),
    themeEntry(deck.theme)
  )
  fs.writeFileSync(projectPath(deckSourcePath), applyLocalTheme(source))

  write(`Ejected the ${name} theme into ${localThemeDirectory}/`)

  for (const asset of ["theme.css", "index.ts", "THEME.md", ...fonts.files]) {
    write(`  ${path.join(localThemeDirectory, asset)}`)
  }

  write(
    `\n${deckSourcePath} now imports it from "@/deck/theme". The directory is yours: read THEME.md, then edit theme.css.`
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
