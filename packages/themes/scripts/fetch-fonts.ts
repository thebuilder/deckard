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
// One directory for every family, because several themes share a family and a
// deck should download one copy either way. Only the faces a theme's stylesheet
// names are ever fetched by a browser.
//
// Re-run this after bumping a version, then commit the woff2 files. Nothing
// calls a font host at render time.
const families: FontFamily[] = [
  {
    faces: [
      {
        file: "azeret-mono-latin.woff2",
        url: "https://fonts.gstatic.com/s/azeretmono/v21/3XFuErsiyJsY9O_Gepph-HHhZfn23vRK.woff2",
      },
      {
        file: "azeret-mono-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/azeretmono/v21/3XFuErsiyJsY9O_Gepph-HHvZfn23vRKV0U.woff2",
      },
    ],
    family: "Azeret Mono",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/azeretmono/OFL.txt",
    slug: "azeret-mono",
    version: "v21",
  },
  {
    faces: [
      {
        file: "chivo-latin.woff2",
        url: "https://fonts.gstatic.com/s/chivo/v21/va9I4kzIxd1KFrBoQeNVkqDO.woff2",
      },
      {
        file: "chivo-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/chivo/v21/va9I4kzIxd1KFrBmQeNVkqDOeTY.woff2",
      },
    ],
    family: "Chivo",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/chivo/OFL.txt",
    slug: "chivo",
    version: "v21",
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
        file: "ibm-plex-serif-latin.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexserif/v20/jizDREVNn1dOx-zrZ2X3pZvkTiUf2zcZiVbJ.woff2",
      },
      {
        file: "ibm-plex-serif-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexserif/v20/jizDREVNn1dOx-zrZ2X3pZvkTiUR2zcZiVbJsNo.woff2",
      },
      {
        file: "ibm-plex-serif-600-latin.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexserif/v20/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI0q1vjitOh.woff2",
      },
      {
        file: "ibm-plex-serif-600-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/ibmplexserif/v20/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI6q1vjitOh3oc.woff2",
      },
    ],
    family: "IBM Plex Serif",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexserif/OFL.txt",
    slug: "ibm-plex-serif",
    version: "v20",
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
        file: "manrope-latin.woff2",
        url: "https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSvfedN4.woff2",
      },
      {
        file: "manrope-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggmxSvfedN62Zw.woff2",
      },
    ],
    family: "Manrope",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt",
    slug: "manrope",
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
        file: "space-grotesk-latin.woff2",
        url: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2",
      },
      {
        file: "space-grotesk-latin-ext.woff2",
        url: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPb94C_k3HqUtEw.woff2",
      },
    ],
    family: "Space Grotesk",
    licence:
      "https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt",
    slug: "space-grotesk",
    version: "v22",
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
