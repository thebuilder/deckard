#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import { fail, readStringFlag, write } from "./lib/cli.ts"
import {
  checkRegistry,
  checkSlides,
  checkTheme,
  type RegistryItem,
  type Section,
} from "./lib/deck-checks.ts"
import { loadDeck } from "./lib/deck-module.ts"
import { projectRoot } from "./lib/paths.ts"

const themeCssPath = path.join(projectRoot, "deck", "theme", "theme.css")

// A deck validates its own slides and theme. Only the repository that publishes
// a shadcn registry passes --registry, and its paths are relative to that file.
const registryFlag = readStringFlag(process.argv, "registry")
const registryPath = registryFlag
  ? path.resolve(projectRoot, registryFlag)
  : null

function readRegistryFile(relativePath: string) {
  if (!registryPath) {
    return null
  }

  try {
    return fs.readFileSync(
      path.join(path.dirname(registryPath), relativePath),
      "utf8"
    )
  } catch {
    return null
  }
}

function readThemeCss() {
  return fs.existsSync(themeCssPath)
    ? fs.readFileSync(themeCssPath, "utf8")
    : null
}

function hasSlideModule(sourcePath: string) {
  return fs.existsSync(path.join(projectRoot, "deck", sourcePath))
}

function readRegistryItems(): RegistryItem[] {
  if (!registryPath) {
    return []
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
    items?: RegistryItem[]
  }

  return registry.items ?? []
}

async function deckSections(): Promise<Section[]> {
  try {
    const deck = await loadDeck()

    return [
      checkSlides(deck, hasSlideModule),
      checkTheme(deck.theme, readThemeCss()),
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

async function validate() {
  const sections = [
    ...(await deckSections()),
    ...(registryPath
      ? [checkRegistry(readRegistryItems(), readRegistryFile)]
      : []),
  ]

  printSections(sections)

  const problems = sections.reduce(
    (total, section) => total + section.problems.length,
    0
  )

  if (problems === 0) {
    write("\ndeck:validate passed")
    return
  }

  process.stderr.write(
    `\ndeck:validate found ${problems} problem${problems === 1 ? "" : "s"}\n`
  )
  process.exit(1)
}

validate().catch(fail)
