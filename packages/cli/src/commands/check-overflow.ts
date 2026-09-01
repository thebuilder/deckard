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
  region: string
  x: number
  y: number
}

// Same elements and same arithmetic as SlideOverflowGuard, so CI fails on exactly what the dev warning draws.
const tolerance = 1

function measure(page: Page) {
  return page.evaluate(() => {
    const regions = [
      { label: "slide content", selector: "[data-slide-frame]" },
      { label: "the header", selector: "[data-slide-header]" },
      { label: "the footer", selector: "[data-slide-footer]" },
    ]

    return regions.flatMap((region) => {
      const element = document.querySelector<HTMLElement>(region.selector)

      if (!element) {
        return []
      }

      return [
        {
          label: region.label,
          x: element.scrollWidth - element.clientWidth,
          y: element.scrollHeight - element.clientHeight,
        },
      ]
    })
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

  return `/slides/${overflow.id}  ${overflow.region} runs ${parts.join(", ")}`
}

async function checkSlide(
  page: Page,
  baseUrl: string,
  id: string,
  colorMode: ColorMode
): Promise<Overflow[]> {
  await openSlide(page, baseUrl, id, colorMode)

  const measured = await measure(page)

  if (!measured.some((region) => region.label === "slide content")) {
    throw new Error(
      `Slide ${id} rendered no [data-slide-frame] element. Check that the route still renders SlideShell.`
    )
  }

  return measured
    .filter((region) => region.x > tolerance || region.y > tolerance)
    .map((region) => ({
      id,
      region: region.label,
      x: Math.max(region.x, 0),
      y: Math.max(region.y, 0),
    }))
}

export function runCheckOverflow(args: ParsedArgs): Promise<void> {
  const colorMode: ColorMode = booleanFlag(args, "light") ? "light" : "dark"
  const port = numberFlag(args, "port", 3412)
  const skipBuild = booleanFlag(args, "skip-build")

  async function checkSlides({ baseUrl, canvas, ids, page }: CanvasSession) {
    const overflowing: Overflow[] = []

    for (const id of ids) {
      // biome-ignore lint/performance/noAwaitInLoops: slides are measured one at a time on a single page
      overflowing.push(...(await checkSlide(page, baseUrl, id, colorMode)))
    }

    if (overflowing.length === 0) {
      write(
        `${ids.length} slides fit the ${canvas.width}x${canvas.height} canvas in ${colorMode} mode, chrome included.`
      )
      return
    }

    const slides = new Set(overflowing.map((overflow) => overflow.id))

    throw new Error(
      [
        ...overflowing.map(describe),
        `${slides.size} of ${ids.length} slides overflow the canvas and are clipped. Trim the content, or wrap the part that has to scroll in SlideScrollArea.`,
      ].join("\n")
    )
  }

  return withCanvasSession(
    { colorMode, port, profile: previewProfile, skipBuild },
    checkSlides
  )
}
