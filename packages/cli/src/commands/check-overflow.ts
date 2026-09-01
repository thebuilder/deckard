import type { Page } from "playwright"

import { booleanFlag, numberFlag, type ParsedArgs } from "../args.ts"
import {
  type CanvasSession,
  openSlide,
  previewProfile,
  withCanvasSession,
} from "../deck/preview.ts"
import { type ColorMode, write } from "../output.ts"

interface Overflow {
  id: string
  x: number
  y: number
}

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

export function runCheckOverflow(args: ParsedArgs): Promise<void> {
  const colorMode: ColorMode = booleanFlag(args, "light") ? "light" : "dark"
  const port = numberFlag(args, "port", 3412)
  const skipBuild = booleanFlag(args, "skip-build")

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

  return withCanvasSession(
    { colorMode, port, profile: previewProfile, skipBuild },
    checkSlides
  )
}
