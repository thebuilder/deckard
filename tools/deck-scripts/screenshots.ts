#!/usr/bin/env node
import path from "node:path"
import process from "node:process"

import type { Page } from "playwright"

import { fail, readColorMode, readNumberFlag, write } from "./lib/cli.ts"
import {
  type CanvasSession,
  openSlide,
  previewProfile,
  withCanvasSession,
} from "./lib/preview.ts"
import {
  resetScreenshotDirectory,
  type ScreenshotEntry,
  screenshotDirectory,
  writeManifest,
} from "./lib/screenshot-store.ts"

const colorMode = readColorMode(process.argv)
const port = readNumberFlag(process.argv, "port", 3411)
const skipBuild = process.argv.includes("--skip-build")

// The route title is the slide title, run through the metadata template.
function slideTitle(documentTitle: string) {
  return documentTitle.split(" · ")[0]?.trim() || documentTitle
}

async function captureSlide(
  page: Page,
  baseUrl: string,
  id: string,
  number: number
): Promise<ScreenshotEntry> {
  await openSlide(page, baseUrl, id)

  const file = `${id}.png`

  await page.locator("[data-slide-canvas]").screenshot({
    animations: "disabled",
    path: path.join(screenshotDirectory, file),
    type: "png",
  })

  return { file, id, number, title: slideTitle(await page.title()) }
}

async function captureSlides({ baseUrl, canvas, ids, page }: CanvasSession) {
  resetScreenshotDirectory()

  const slides: ScreenshotEntry[] = []

  for (const [index, id] of ids.entries()) {
    // biome-ignore lint/performance/noAwaitInLoops: slides are captured one at a time on a single page
    const entry = await captureSlide(page, baseUrl, id, index + 1)

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

withCanvasSession(
  { colorMode, port, profile: previewProfile, skipBuild },
  captureSlides
).catch(fail)
