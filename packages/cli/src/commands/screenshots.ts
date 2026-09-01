import path from "node:path"

import type { Page } from "playwright"

import { booleanFlag, numberFlag, type ParsedArgs } from "../args.ts"
import {
  type CanvasSession,
  openSlide,
  previewProfile,
  withCanvasSession,
} from "../deck/preview.ts"
import {
  resetScreenshotDirectory,
  type ScreenshotEntry,
  screenshotDirectory,
  writeManifest,
} from "../deck/screenshot-store.ts"
import { type ColorMode, write } from "../output.ts"

// The route title is the slide title, run through the metadata template.
function slideTitle(documentTitle: string) {
  return documentTitle.split(" · ")[0]?.trim() || documentTitle
}

async function captureSlide(
  page: Page,
  baseUrl: string,
  id: string,
  number: number,
  colorMode: ColorMode
): Promise<ScreenshotEntry> {
  await openSlide(page, baseUrl, id, colorMode)

  const file = `${id}.png`

  await page.locator("[data-slide-canvas]").screenshot({
    animations: "disabled",
    path: path.join(screenshotDirectory, file),
    type: "png",
  })

  return { file, id, number, title: slideTitle(await page.title()) }
}

export function runScreenshots(args: ParsedArgs): Promise<void> {
  const colorMode: ColorMode = booleanFlag(args, "light") ? "light" : "dark"
  const port = numberFlag(args, "port", 3411)
  const skipBuild = booleanFlag(args, "skip-build")
  const max = numberFlag(args, "max", Number.POSITIVE_INFINITY)

  async function captureSlides({ baseUrl, canvas, ids, page }: CanvasSession) {
    resetScreenshotDirectory()

    const slides: ScreenshotEntry[] = []

    for (const [index, id] of ids.slice(0, max).entries()) {
      // biome-ignore lint/performance/noAwaitInLoops: slides are captured one at a time on a single page
      const entry = await captureSlide(page, baseUrl, id, index + 1, colorMode)

      slides.push(entry)
      write(`Captured ${entry.file}`)
    }

    writeManifest({
      canvas: { height: canvas.height, width: canvas.width },
      colorMode,
      slides,
    })

    write(
      `${slides.length} slides at ${canvas.width}x${canvas.height} in ${screenshotDirectory}`
    )
  }

  return withCanvasSession(
    { colorMode, port, profile: previewProfile, skipBuild },
    captureSlides
  )
}
