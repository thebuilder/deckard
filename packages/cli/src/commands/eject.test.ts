import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { planFonts } from "./eject.ts"

const themesSource = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../themes/src"
)

describe("planFonts", () => {
  it("leaves a theme that self-hosts nothing alone", () => {
    const css = ".deckard-theme { --slide-font-body: var(--font-sans); }"

    expect(planFonts(css)).toEqual({ css, files: [] })
  })

  it("repoints the shared directory at the ejected copy", () => {
    const plan = planFonts(
      'src: url("../fonts/orbitron-latin.woff2") format("woff2");'
    )

    expect(plan.css).toContain('url("./fonts/orbitron-latin.woff2")')
    expect(plan.css).not.toContain("../fonts/")
  })

  it("names one licence per family beside the faces", () => {
    const plan = planFonts(`
      src: url("../fonts/source-serif-4-latin.woff2") format("woff2");
      src: url("../fonts/source-serif-4-italic-latin.woff2") format("woff2");
      src: url("../fonts/ibm-plex-mono-500-latin-ext.woff2") format("woff2");
    `)

    expect(plan.files).toEqual([
      "ibm-plex-mono-500-latin-ext.woff2",
      "ibm-plex-mono.OFL.txt",
      "source-serif-4-italic-latin.woff2",
      "source-serif-4-latin.woff2",
      "source-serif-4.OFL.txt",
    ])
  })

  it("plans files that exist for every built-in theme", () => {
    for (const theme of fs
      .readdirSync(themesSource, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "fonts")
      .map((entry) => entry.name)) {
      const plan = planFonts(
        fs.readFileSync(path.join(themesSource, theme, "theme.css"), "utf8")
      )

      for (const file of plan.files) {
        expect(
          fs.existsSync(path.join(themesSource, "fonts", file)),
          `${theme} names fonts/${file}, which is not in the package`
        ).toBe(true)
      }
    }
  })
})
