import { mkdir } from "node:fs/promises"
import path from "node:path"
import { themeIds } from "@thebuilder/deckard-themes/ids"
import { type Browser, chromium } from "playwright"
import {
  type PreviewColorMode,
  slidePreviewPath,
  slidePreviewRoutes,
  themePreviewPath,
  themePreviewSlides,
} from "../../docs/lib/slide-previews.ts"
import { canvasConfig } from "../deck/canvas-config.ts"

const origin = process.argv[2] ?? "http://localhost:3000"
const outputRoot = path.resolve(import.meta.dirname, "../../docs/public")

// The theme captures are 2/3 of the canvas: sharp at the width the docs show
// them, and a third of the bytes of a full-size frame.
const themeScale = 2 / 3

const colorModes: PreviewColorMode[] = ["light", "dark"]

interface Capture {
  mode?: PreviewColorMode
  output: string
  scale: number
  url: string
}

const captures: Capture[] = [
  ...slidePreviewRoutes.map((route) => ({
    output: slidePreviewPath(route),
    scale: 1,
    url: `${origin}${route}`,
  })),
  // Both modes for every theme. A theme that carries one mode pins the canvas
  // to it, so the other capture repeats it rather than failing.
  ...themeIds.flatMap((theme) =>
    colorModes.flatMap((mode) =>
      themePreviewSlides.map((slide) => ({
        mode,
        output: themePreviewPath(theme, slide, mode),
        scale: themeScale,
        url: `${origin}/example/${slide}?theme=${theme}&mode=${mode}`,
      }))
    )
  ),
]

async function capture(chromeBrowser: Browser, item: Capture) {
  const context = await chromeBrowser.newContext({
    colorScheme: item.mode,
    deviceScaleFactor: item.scale,
    viewport: canvasConfig,
  })

  // The same mark the CLI puts on a capture: the runtime holds anything that
  // moves on its one deterministic frame and keeps the deck controls down.
  await context.addInitScript(() => {
    const mark = () => {
      document.documentElement?.setAttribute("data-deck-capture", "")
    }

    mark()
    document.addEventListener("readystatechange", mark)
  })

  const page = await context.newPage()
  const outputPath = path.join(outputRoot, item.output)

  try {
    await mkdir(path.dirname(outputPath), { recursive: true })
    await page.goto(item.url, { waitUntil: "networkidle" })
    // `next dev` parks its indicator over the canvas corner.
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    await page.locator("[data-slide-canvas]").screenshot({
      path: outputPath,
      quality: item.scale === 1 ? 86 : 80,
      type: "jpeg",
    })
  } finally {
    await context.close()
  }
}

const browser = await chromium.launch()
const concurrency = 6

try {
  // A few pages at a time: each one is a full deck render, and a hundred at
  // once starve the dev server.
  for (let start = 0; start < captures.length; start += concurrency) {
    // biome-ignore lint/performance/noAwaitInLoops: the batches are the throttle
    await Promise.all(
      captures
        .slice(start, start + concurrency)
        .map((item) => capture(browser, item))
    )
  }
} finally {
  await browser.close()
}

console.log(`Wrote ${captures.length} previews to ${outputRoot}/previews`)
