#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

interface FontFace {
  file: string
  url: string
}

interface FontFamily {
  family: string
  licence: string
  theme: string
  version: string
  faces: FontFace[]
}

// Every family here is SIL Open Font License 1.1, which is what makes
// redistributing the binaries inside this package legal. The licence text lands
// beside them as OFL.txt and THEME.md names it.
//
// The URLs are the pinned files behind the Google Fonts CSS API for the latin
// and latin-ext subsets of each variable font, requested without the optical
// size axis where that axis costs more than it earns. Re-run this after bumping
// a version, then commit the woff2 files: the themes resolve them from disk and
// never call out to a font host at render time.
const families: FontFamily[] = [
  {
    faces: [
      {
        file: "jetbrains-mono-latin.woff2",
        url: "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwgknk-4.woff2",
      },
      {
        file: "jetbrains-mono-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx7cwgknk-6nFg.woff2",
      },
    ],
    family: "JetBrains Mono",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt",
    theme: "phosphor",
    version: "v24",
  },
  {
    faces: [
      {
        file: "orbitron-latin.woff2",
        url: "https://fonts.gstatic.com/s/orbitron/v35/yMJRMIlzdpvBhQQL_Qq7dy1biN15.woff2",
      },
    ],
    family: "Orbitron",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/OFL.txt",
    theme: "nexus",
    version: "v35",
  },
  {
    faces: [
      {
        file: "source-serif-4-latin.woff2",
        url: "https://fonts.gstatic.com/s/sourceserif4/v14/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4Y3qwzQ.woff2",
      },
      {
        file: "source-serif-4-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/sourceserif4/v14/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4Y3qwzSEi.woff2",
      },
      {
        file: "source-serif-4-italic-latin.woff2",
        url: "https://fonts.gstatic.com/s/sourceserif4/v14/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX2SzxEj.woff2",
      },
      {
        file: "source-serif-4-italic-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/sourceserif4/v14/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2SzxEjst4.woff2",
      },
    ],
    family: "Source Serif 4",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/sourceserif4/OFL.txt",
    theme: "ledger",
    version: "v14",
  },
  {
    faces: [
      {
        file: "schibsted-grotesk-latin.woff2",
        url: "https://fonts.gstatic.com/s/schibstedgrotesk/v7/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9GayojdSFO.woff2",
      },
      {
        file: "schibsted-grotesk-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/schibstedgrotesk/v7/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9IayojdSFOd1I.woff2",
      },
    ],
    family: "Schibsted Grotesk",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/schibstedgrotesk/OFL.txt",
    theme: "meridian",
    version: "v7",
  },
]

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function fetchFamily(entry: FontFamily): Promise<void> {
  const directory = path.join(packageRoot, "src", entry.theme, "fonts")

  fs.mkdirSync(directory, { recursive: true })

  for (const face of entry.faces) {
    const body = await download(face.url)

    fs.writeFileSync(path.join(directory, face.file), body)
    process.stdout.write(`${entry.theme}/fonts/${face.file} ${body.length}\n`)
  }

  const licence = await download(entry.licence)

  fs.writeFileSync(path.join(directory, "OFL.txt"), licence)
  process.stdout.write(
    `${entry.theme}/fonts/OFL.txt ${entry.family} ${entry.version}\n`
  )
}

for (const entry of families) {
  await fetchFamily(entry)
}
