import { mkdir } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"
import {
  slidePreviewPath,
  slidePreviewRoutes,
} from "../../docs/lib/slide-previews.ts"
import { canvasConfig } from "../deck/canvas-config.ts"

const origin = process.argv[2] ?? "http://localhost:3000"
const outputRoot = path.resolve(import.meta.dirname, "../../docs/public")
const browser = await chromium.launch()

try {
  await Promise.all(
    slidePreviewRoutes.map(async (route) => {
      const page = await browser.newPage({ viewport: canvasConfig })
      const outputPath = path.join(outputRoot, slidePreviewPath(route))

      try {
        await mkdir(path.dirname(outputPath), { recursive: true })
        await page.goto(`${origin}${route}?presenterPreview=1`)
        await page.locator("[data-slide-canvas]").screenshot({
          path: outputPath,
          quality: 86,
          type: "jpeg",
        })
      } finally {
        await page.close()
      }
    })
  )
} finally {
  await browser.close()
}
