import { readFile } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"
import {
  type PreviewColorMode,
  type ThemePreviewSlide,
  themePreviewPath,
} from "../../docs/lib/slide-previews.ts"

/*
 * The landing page's share card: the brand on the left and three captures of
 * the example deck fanned out on the right, each in a different theme. It reads
 * the captures capture-doc-previews.ts writes, so it runs after that script.
 */

const docsPublic = path.resolve(import.meta.dirname, "../../docs/public")
const outputPath = path.join(docsPublic, "social/home.png")

const card = { height: 630, width: 1200 }

const fan: Array<{
  mode: PreviewColorMode
  slide: ThemePreviewSlide
  theme: string
}> = [
  { mode: "light", slide: "figures", theme: "ledger" },
  { mode: "dark", slide: "decision", theme: "blueprint" },
  { mode: "dark", slide: "opening", theme: "aurora" },
]

async function dataUrl(publicPath: string) {
  const bytes = await readFile(path.join(docsPublic, publicPath))

  return `data:image/jpeg;base64,${bytes.toString("base64")}`
}

const mark = await readFile(path.join(docsPublic, "icon.svg"), "utf8")
const slides = await Promise.all(
  fan.map((item) => dataUrl(themePreviewPath(item.theme, item.slide, item.mode)))
)

const html = `<!doctype html>
<html>
<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Orbitron:wght@500;700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: ${card.width}px;
    height: ${card.height}px;
    overflow: hidden;
    font-family: Inter, system-ui, sans-serif;
    color: #e2e8f0;
    background:
      radial-gradient(60% 80% at 78% 55%, rgb(34 211 238 / 14%), transparent 70%),
      radial-gradient(50% 60% at 10% 0%, rgb(59 130 246 / 12%), transparent 70%),
      #0f172a;
  }
  .brand { position: absolute; top: 64px; left: 72px; display: flex; gap: 16px; align-items: center; }
  .brand svg { width: 44px; height: 44px; --deckard-icon-surface: #0f172a; --deckard-icon-ink: #e2e8f0; }
  .brand span { font-family: Orbitron, sans-serif; font-size: 30px; font-weight: 500; letter-spacing: 0.04em; }
  h1 {
    position: absolute; left: 72px; top: 196px; width: 520px;
    font-family: Orbitron, sans-serif; font-size: 58px; font-weight: 500; line-height: 1.08;
  }
  p { position: absolute; left: 72px; top: 420px; width: 470px; font-size: 24px; line-height: 1.45; color: #95a6bf; }
  .site { position: absolute; left: 72px; bottom: 56px; font-size: 20px; color: #22d3ee; letter-spacing: 0.02em; }
  .fan img {
    position: absolute; width: 640px; height: 360px;
    border-radius: 14px; border: 1px solid rgb(226 232 240 / 16%);
    box-shadow: 0 40px 80px -30px rgb(0 0 0 / 80%);
  }
  .fan img:nth-child(1) { left: 700px; top: 40px; transform: rotate(6deg); }
  .fan img:nth-child(2) { left: 660px; top: 150px; transform: rotate(1deg); }
  .fan img:nth-child(3) { left: 620px; top: 262px; transform: rotate(-4deg); }
</style>
</head>
<body>
  <div class="brand">${mark}<span>Deckard</span></div>
  <h1>Slides are React components</h1>
  <p>Themes, presenter mode, and PDF export for Next.js.</p>
  <div class="site">deckard.thebuilder.dk</div>
  <div class="fan">${slides.map((src) => `<img src="${src}">`).join("")}</div>
</body>
</html>`

const browser = await chromium.launch()

try {
  const page = await browser.newPage({ viewport: card })

  await page.setContent(html, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: outputPath, type: "png" })
} finally {
  await browser.close()
}

console.log(`Wrote the share card to ${outputPath}`)
