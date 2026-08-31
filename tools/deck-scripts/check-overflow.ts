#!/usr/bin/env node
import process from "node:process"

import type { Page } from "playwright"

import { fail, readColorMode, readNumberFlag, write } from "./lib/cli.ts"
import {
  type CanvasSession,
  openSlide,
  previewProfile,
  withCanvasSession,
} from "./lib/preview.ts"

interface Overflow {
  id: string
  x: number
  y: number
}

const colorMode = readColorMode(process.argv)
const port = readNumberFlag(process.argv, "port", 3412)
const skipBuild = process.argv.includes("--skip-build")

// Same element and same arithmetic as SlideOverflowGuard, so CI fails on exactly what the dev warning draws.
const tolerance = 1

function measure(page: Page) {
  return page.evaluate(() => {
    const frame = document.querySelector<HTMLElement>("[data-slide-frame]")

    if (!frame) {
      return null
    }

    return {
      x: frame.scrollWidth - frame.clientWidth,
      y: frame.scrollHeight - frame.clientHeight,
    }
  })
}

function describe(overflow: Overflow) {
  const parts: string[] = []

  if (overflow.y > tolerance) {
    parts.push(`${Math.round(overflow.y)}px below the canvas`)
  }

  if (overflow.x > tolerance) {
    parts.push(`${Math.round(overflow.x)}px past its right edge`)
  }

  return `/slides/${overflow.id}  ${parts.join(", ")}`
}

async function checkSlide(
  page: Page,
  baseUrl: string,
  id: string
): Promise<Overflow | null> {
  await openSlide(page, baseUrl, id)

  const overflow = await measure(page)

  if (!overflow) {
    throw new Error(
      `Slide ${id} rendered no [data-slide-frame] element. Check that the route still renders SlideShell.`
    )
  }

  if (overflow.x <= tolerance && overflow.y <= tolerance) {
    return null
  }

  return { id, x: Math.max(overflow.x, 0), y: Math.max(overflow.y, 0) }
}

async function checkSlides({ baseUrl, canvas, ids, page }: CanvasSession) {
  const overflowing: Overflow[] = []

  for (const id of ids) {
    // biome-ignore lint/performance/noAwaitInLoops: slides are measured one at a time on a single page
    const overflow = await checkSlide(page, baseUrl, id)

    if (overflow) {
      overflowing.push(overflow)
    }
  }

  if (overflowing.length === 0) {
    write(
      `${ids.length} slides fit the ${canvas.width}x${canvas.height} canvas in ${colorMode} mode.`
    )
    return
  }

  throw new Error(
    [
      ...overflowing.map(describe),
      `${overflowing.length} of ${ids.length} slides overflow the canvas and are clipped. Trim the content, or wrap the part that has to scroll in SlideScrollArea.`,
    ].join("\n")
  )
}

withCanvasSession(
  { colorMode, port, profile: previewProfile, skipBuild },
  checkSlides
).catch(fail)
