import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

// The runtime depends on the token contract in styles.css, never on a preset.
// A theme is data the deck picks, so nothing under these directories may reach
// for one.
const runtimeDirectories = ["components", "deck", "next"]
const importPattern = /\bfrom\s+"([^"]+)"|\bimport\s+"([^"]+)"/g
const sourcePattern = /\.tsx?$/

function sourceFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { recursive: true })
    .map((entry) => path.join(directory, String(entry)))
    .filter((entry) => sourcePattern.test(entry) && fs.statSync(entry).isFile())
}

function themeImports(file: string): string[] {
  const source = fs.readFileSync(file, "utf8")

  return [...source.matchAll(importPattern)]
    .map((match) => match[1] ?? match[2])
    .filter(
      (specifier) =>
        specifier.includes("themes/") || specifier.endsWith("/themes")
    )
}

describe("the runtime boundary", () => {
  it("keeps every theme preset out of the runtime", () => {
    const violations = runtimeDirectories.flatMap((directory) =>
      sourceFiles(path.join(sourceRoot, directory)).flatMap((file) =>
        themeImports(file).map(
          (specifier) =>
            `${path.relative(sourceRoot, file)} imports ${specifier}`
        )
      )
    )

    expect(violations).toEqual([])
  })

  it("finds the runtime source it is scanning", () => {
    const counted = runtimeDirectories.map(
      (directory) => sourceFiles(path.join(sourceRoot, directory)).length
    )

    expect(counted.every((count) => count > 0)).toBe(true)
  })
})
