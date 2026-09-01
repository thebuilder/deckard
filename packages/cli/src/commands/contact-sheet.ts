import fs from "node:fs"
import path from "node:path"

import { numberFlag, type ParsedArgs } from "../args.ts"
import { launchBrowser } from "../deck/preview.ts"
import {
  readManifest,
  type ScreenshotEntry,
  type ScreenshotManifest,
  screenshotDirectory,
} from "../deck/screenshot-store.ts"
import { write } from "../output.ts"
import { projectPath } from "../project.ts"

const outputPath = projectPath("out", "contact-sheet.png")
const pagePath = path.join(screenshotDirectory, "contact-sheet.html")
const thumbnailWidth = 520

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function composeCell(slide: ScreenshotEntry) {
  return `<figure>
      <img alt="${escapeHtml(slide.title)}" src="./${encodeURIComponent(slide.file)}" />
      <figcaption><b>${slide.number}</b> ${escapeHtml(slide.title)} <span>/slides/${escapeHtml(slide.id)}</span></figcaption>
    </figure>`
}

const palettes = {
  dark: { ink: "#e8e9ed", line: "#272b35", muted: "#9aa0ad", page: "#0b0d12" },
  light: { ink: "#16181d", line: "#d9dbe0", muted: "#6b7280", page: "#f6f6f7" },
}

// Playwright is already here, so the grid is a page it renders rather than an image library it does not have.
function composeHtml(manifest: ScreenshotManifest, columns: number) {
  const palette = manifest.colorMode === "dark" ? palettes.dark : palettes.light
  const cells = manifest.slides.map(composeCell).join("\n")

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Contact sheet</title>
<style>
  :root { color-scheme: ${manifest.colorMode}; --page: ${palette.page}; --ink: ${palette.ink}; --muted: ${palette.muted}; --line: ${palette.line}; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px; background: var(--page); color: var(--ink); font: 14px/1.4 ui-sans-serif, system-ui, sans-serif; }
  h1 { margin: 0 0 24px; font-size: 18px; font-weight: 600; }
  h1 span { color: var(--muted); font-weight: 400; }
  .grid { display: grid; grid-template-columns: repeat(${columns}, ${thumbnailWidth}px); gap: 28px 24px; }
  figure { margin: 0; }
  img { display: block; width: 100%; aspect-ratio: ${manifest.canvas.width} / ${manifest.canvas.height}; border: 1px solid var(--line); border-radius: 8px; }
  figcaption { margin-top: 8px; color: var(--muted); }
  figcaption b { color: var(--ink); font-variant-numeric: tabular-nums; }
  figcaption span { font-family: ui-monospace, monospace; font-size: 12px; }
</style>
</head>
<body>
  <h1>Deckard contact sheet <span>${manifest.slides.length} slides, ${manifest.colorMode} mode, ${manifest.canvas.width}x${manifest.canvas.height}</span></h1>
  <div class="grid">
${cells}
  </div>
</body>
</html>
`
}

export async function runContactSheet(args: ParsedArgs): Promise<void> {
  const columns = numberFlag(args, "columns", 4)
  const manifest = readManifest()

  fs.writeFileSync(pagePath, composeHtml(manifest, columns))

  const browser = await launchBrowser()

  try {
    const page = await browser.newPage({
      colorScheme: manifest.colorMode === "dark" ? "dark" : "light",
      viewport: {
        height: 1200,
        width: columns * thumbnailWidth + (columns - 1) * 24 + 64,
      },
    })

    await page.goto(`file://${pagePath}`, { waitUntil: "networkidle" })

    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    await page.screenshot({ fullPage: true, path: outputPath, type: "png" })
  } finally {
    await browser.close()
    fs.rmSync(pagePath, { force: true })
  }

  write(
    `Contact sheet with ${manifest.slides.length} slides written to ${outputPath}`
  )
}
