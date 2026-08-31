import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const useClientDirective = /^["']use client["']/
const deckDirectory = import.meta.dirname
const moduleDirectory = path.join(deckDirectory, "slides")

function slideModulePaths() {
  if (!existsSync(moduleDirectory)) {
    return []
  }

  return readdirSync(moduleDirectory)
    .filter((entry) => entry.endsWith(".slide.tsx"))
    .map((entry) => path.join(moduleDirectory, entry))
}

function firstStatement(source: string) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("//"))
}

const entryModulePaths = [
  path.join(deckDirectory, "slides.tsx"),
  ...slideModulePaths(),
]

describe("slide entry modules", () => {
  it("includes the deck array and at least one slide module file", () => {
    expect(slideModulePaths().length).toBeGreaterThan(0)
    expect(existsSync(path.join(deckDirectory, "slides.tsx"))).toBe(true)
  })

  for (const modulePath of entryModulePaths) {
    const name = path.relative(deckDirectory, modulePath)

    it(`keeps ${name} on the server`, () => {
      const source = readFileSync(modulePath, "utf8")

      expect(firstStatement(source)).not.toMatch(useClientDirective)
    })
  }
})
