import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import { type ParsedArgs, stringFlag } from "../args.ts"
import {
  checkRegistry,
  checkSlides,
  checkTheme,
  type RegistryItem,
  type Section,
  themeBackgrounds,
} from "../deck/deck-checks.ts"
import { loadDeck } from "../deck/deck-module.ts"
import { readThemeStylesheet } from "../deck/theme-source.ts"
import { write } from "../output.ts"
import { projectPath, projectRoot } from "../project.ts"

function hasSlideModule(sourcePath: string) {
  return fs.existsSync(projectPath("deck", sourcePath))
}

function registryReader(registryPath: string) {
  return (relativePath: string) => {
    try {
      return fs.readFileSync(
        path.join(path.dirname(registryPath), relativePath),
        "utf8"
      )
    } catch {
      return null
    }
  }
}

function readRegistryItems(registryPath: string): RegistryItem[] {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
    items?: RegistryItem[]
  }

  return registry.items ?? []
}

async function deckSections(): Promise<Section[]> {
  try {
    const deck = await loadDeck()
    const stylesheet = readThemeStylesheet(deck.theme.id)

    return [
      checkSlides(
        deck,
        hasSlideModule,
        themeBackgrounds(deck.theme, stylesheet)
      ),
      checkTheme(deck.theme, stylesheet),
    ]
  } catch (error) {
    return [
      {
        name: "deck",
        problems: [error instanceof Error ? error.message : String(error)],
        summary: [
          "Raised while loading deck/deck.ts, which resolves deck/slides.tsx and every deck/slides/*.slide.tsx module.",
        ],
      },
    ]
  }
}

function sectionLines(section: Section) {
  return section.problems.length > 0
    ? ["FAILED", ...section.problems, ...section.summary]
    : section.summary
}

function printSections(sections: Section[]) {
  const width = Math.max(...sections.map((section) => section.name.length)) + 2
  const indent = " ".repeat(width)

  for (const section of sections) {
    for (const [index, line] of sectionLines(section).entries()) {
      write(`${index === 0 ? section.name.padEnd(width) : indent}${line}`)
    }
  }
}

// A deck validates its own slides and theme. Only the repository that publishes
// a shadcn registry passes --registry, and its paths are relative to that file.
export async function runValidate(args: ParsedArgs): Promise<void> {
  const registryFlag = stringFlag(args, "registry")
  const registryPath = registryFlag
    ? path.resolve(projectRoot, registryFlag)
    : null

  const sections = [
    ...(await deckSections()),
    ...(registryPath
      ? [
          checkRegistry(
            readRegistryItems(registryPath),
            registryReader(registryPath)
          ),
        ]
      : []),
  ]

  printSections(sections)

  const problems = sections.reduce(
    (total, section) => total + section.problems.length,
    0
  )

  if (problems === 0) {
    write("\ndeckard validate passed")
    return
  }

  process.stderr.write(
    `\ndeckard validate found ${problems} problem${problems === 1 ? "" : "s"}\n`
  )
  process.exit(1)
}
