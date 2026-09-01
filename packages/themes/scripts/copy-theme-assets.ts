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

// A theme that self-hosts a typeface resolves the woff2 files relative to
// theme.css, so the directory has to land beside the copied stylesheet or the
// published package ships a stylesheet pointing at nothing. OFL.txt rides along
// with them: the licence has to travel wherever the binaries do.
const fontsDirectory = "fonts"

// An editor writing a file lands as more than one event, and the copy is twelve
// files, so a burst is answered once the directory has been quiet this long.
const settleMs = 50

function themeNames(): string[] {
  return fs
    .readdirSync(themesSource, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function copyFonts(theme: string): number {
  const from = path.join(themesSource, theme, fontsDirectory)

  if (!fs.existsSync(from)) {
    return 0
  }

  const to = path.join(themesTarget, theme, fontsDirectory)

  fs.mkdirSync(to, { recursive: true })

  const files = fs.readdirSync(from).sort()

  if (!files.includes("OFL.txt")) {
    throw new Error(`src/${theme}/${fontsDirectory} is missing OFL.txt`)
  }

  for (const file of files) {
    fs.copyFileSync(path.join(from, file), path.join(to, file))
  }

  return files.length
}

export function copyThemeAssets(): number {
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

    copied += copyFonts(theme)
  }

  return copied
}

// One watcher per theme directory rather than a recursive watch on src: the
// recursive option is not implemented on every platform Node runs on. Any
// change recopies all twelve files, which is cheaper than tracking which theme
// an event came from and cannot leave dist half written.
export function watchThemeAssets(onCopy: (copied: number) => void): void {
  let timer: NodeJS.Timeout | undefined

  for (const theme of themeNames()) {
    fs.watch(path.join(themesSource, theme), (_event, filename) => {
      if (!(filename && assets.includes(path.basename(filename)))) {
        return
      }

      clearTimeout(timer)
      timer = setTimeout(() => onCopy(copyThemeAssets()), settleMs)
    })
  }
}

function report(copied: number): void {
  process.stdout.write(`theme assets copied (${copied} files)\n`)
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  report(copyThemeAssets())

  if (process.argv.includes("--watch")) {
    watchThemeAssets(report)
  }
}
