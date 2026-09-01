#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const themesSource = path.join(packageRoot, "src")
const themesTarget = path.join(packageRoot, "dist")

// tsc emits the compiled index.js next to nothing else, so the stylesheet the
// module imports and the document the eject command copies have to be carried
// over by hand.
const assets = ["theme.css", "THEME.md"]

function themeNames(): string[] {
  return fs
    .readdirSync(themesSource, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function copy(): number {
  let copied = 0

  for (const theme of themeNames()) {
    fs.mkdirSync(path.join(themesTarget, theme), { recursive: true })

    for (const asset of assets) {
      const from = path.join(themesSource, theme, asset)

      if (!fs.existsSync(from)) {
        throw new Error(`src/${theme} is missing ${asset}`)
      }

      fs.copyFileSync(from, path.join(themesTarget, theme, asset))
      copied += 1
    }
  }

  return copied
}

process.stdout.write(`theme assets copied (${copy()} files)\n`)
