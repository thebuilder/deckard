#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const fontsDirectory = path.join(packageRoot, "src", "fonts")

interface FontFace {
  file: string
  url: string
}

interface FontFamily {
  faces: FontFace[]
  family: string
  licence: string
  slug: string
  version: string
}

// Every family here is SIL Open Font License 1.1, which is what makes shipping
// the binaries inside this package legal. Each one's licence lands beside its
// files as <slug>.OFL.txt, and both the packed tarball and `deckard eject theme`
// carry the licence wherever the woff2 files go.
//
// The urls are the pinned files behind the Google Fonts CSS API, latin and
// latin-ext, requested without the optical size axis where that axis costs more
// than it earns: Source Serif 4 drops from 122KB to 51KB without it.
//
// One directory for seven families, because two themes share JetBrains Mono and
// two share IBM Plex Mono, and a deck should download one copy either way. Only
// the faces a theme's stylesheet names are ever fetched by a browser.
//
// Re-run this after bumping a version, then commit the woff2 files. Nothing
// calls a font host at render time.
const families: FontFamily[] = [
  {
    faces: [
      {
        file: "archivo-latin.woff2",
        url: "https://fonts.gstatic.com/s/archivo/v25/k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLydOxKsv4Rn.woff2",
      },
      {
        file: "archivo-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/archivo/v25/k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLyTOxKsv4RnUPU.woff2",
      },
    ],
    family: "Archivo",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt",
    slug: "archivo",
    version: "v25",
  },
  {
    faces: [
      {
        file: "bricolage-grotesque-latin.woff2",
        url: "https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInHWVyNJ.woff2",
      },
      {
        file: "bricolage-grotesque-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGGInHWVyNJtvI.woff2",
      },
    ],
    family: "Bricolage Grotesque",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/OFL.txt",
    slug: "bricolage-grotesque",
    version: "v9",
  },
  {
    faces: [
      {
        file: "cormorant-garamond-latin.woff2",
        url: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtKky2F7g.woff2",
      },
      {
        file: "cormorant-garamond-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYp3tKky2F7i6C.woff2",
      },
      {
        file: "cormorant-garamond-italic-latin.woff2",
        url: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSqn7B6D.woff2",
      },
      {
        file: "cormorant-garamond-italic-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtGmSqn7B6DxjY.woff2",
      },
    ],
    family: "Cormorant Garamond",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/OFL.txt",
    slug: "cormorant-garamond",
    version: "v21",
  },
  {
    faces: [
      {
        file: "dm-mono-latin.woff2",
        url: "https://fonts.gstatic.com/s/dmmono/v16/aFTU7PB1QTsUX8KYthqQBK6PYK0.woff2",
      },
      {
        file: "dm-mono-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/dmmono/v16/aFTU7PB1QTsUX8KYthSQBK6PYK3EXw.woff2",
      },
      {
        file: "dm-mono-500-latin.woff2",
        url: "https://fonts.gstatic.com/s/dmmono/v16/aFTR7PB1QTsUX8KYvumzEYOtbYf-Vlg.woff2",
      },
      {
        file: "dm-mono-500-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/dmmono/v16/aFTR7PB1QTsUX8KYvumzEY2tbYf-Vlh3uA.woff2",
      },
    ],
    family: "DM Mono",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/dmmono/OFL.txt",
    slug: "dm-mono",
    version: "v16",
  },
  {
    faces: [
      {
        file: "ibm-plex-mono-latin.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1i8q131nj-o.woff2",
      },
      {
        file: "ibm-plex-mono-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1iEq131nj-otFQ.woff2",
      },
      {
        file: "ibm-plex-mono-500-latin.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgsAXHNk.woff2",
      },
      {
        file: "ibm-plex-mono-500-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwl5FgsAXHNlYzg.woff2",
      },
    ],
    family: "IBM Plex Mono",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt",
    slug: "ibm-plex-mono",
    version: "v20",
  },
  {
    faces: [
      {
        file: "ibm-plex-sans-latin.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexsans/v23/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYbSB4Zh.woff2",
      },
      {
        file: "ibm-plex-sans-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexsans/v23/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxQKYbSB4ZhRNU.woff2",
      },
    ],
    family: "IBM Plex Sans",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/OFL.txt",
    slug: "ibm-plex-sans",
    version: "v23",
  },
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
    slug: "jetbrains-mono",
    version: "v24",
  },
  {
    faces: [
      {
        file: "jost-latin.woff2",
        url: "https://fonts.gstatic.com/s/jost/v20/92zatBhPNqw73oTd4jQmfxI.woff2",
      },
      {
        file: "jost-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/jost/v20/92zatBhPNqw73ord4jQmfxIC7w.woff2",
      },
    ],
    family: "Jost",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/jost/OFL.txt",
    slug: "jost",
    version: "v20",
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
    slug: "orbitron",
    version: "v35",
  },
  {
    faces: [
      {
        file: "outfit-latin.woff2",
        url: "https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2",
      },
      {
        file: "outfit-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJuktqUYLkn8BJ.woff2",
      },
    ],
    family: "Outfit",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/OFL.txt",
    slug: "outfit",
    version: "v15",
  },
  {
    faces: [
      {
        file: "public-sans-latin.woff2",
        url: "https://fonts.gstatic.com/s/publicsans/v21/ijwRs572Xtc6ZYQws9YVwnNGfJ7QwOk1.woff2",
      },
      {
        file: "public-sans-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/publicsans/v21/ijwRs572Xtc6ZYQws9YVwnNIfJ7QwOk1Fig.woff2",
      },
    ],
    family: "Public Sans",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/publicsans/OFL.txt",
    slug: "public-sans",
    version: "v21",
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
    slug: "schibsted-grotesk",
    version: "v7",
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
    slug: "source-serif-4",
    version: "v14",
  },
  {
    faces: [
      {
        file: "space-mono-latin.woff2",
        url: "https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYEF8RXi4EwQ.woff2",
      },
      {
        file: "space-mono-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYE98RXi4EwSsbg.woff2",
      },
      {
        file: "space-mono-700-latin.woff2",
        url: "https://fonts.gstatic.com/s/spacemono/v17/i7dMIFZifjKcF5UAWdDRaPpZUFWaHi6WZ3Q.woff2",
      },
      {
        file: "space-mono-700-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/spacemono/v17/i7dMIFZifjKcF5UAWdDRaPpZUFuaHi6WZ3S_Yg.woff2",
      },
    ],
    family: "Space Mono",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/OFL.txt",
    slug: "space-mono",
    version: "v17",
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

async function fetchFace(face: FontFace): Promise<void> {
  const body = await download(face.url)

  fs.writeFileSync(path.join(fontsDirectory, face.file), body)
  process.stdout.write(`${face.file} ${body.length}\n`)
}

async function fetchLicence(entry: FontFamily): Promise<void> {
  const licence = await download(entry.licence)
  const file = `${entry.slug}.OFL.txt`

  fs.writeFileSync(path.join(fontsDirectory, file), licence)
  process.stdout.write(`${file} ${entry.family} ${entry.version}\n`)
}

fs.mkdirSync(fontsDirectory, { recursive: true })

await Promise.all(
  families.flatMap((entry) => [
    ...entry.faces.map(fetchFace),
    fetchLicence(entry),
  ])
)
