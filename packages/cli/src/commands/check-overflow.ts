import { pathToFileURL } from "node:url"

import type { SlideLayoutFinding } from "@deckard/core/layout"
import type { Page } from "playwright"

import { booleanFlag, numberFlag, type ParsedArgs } from "../args.ts"
import {
  type CanvasSession,
  openSlide,
  previewProfile,
  withCanvasSession,
} from "../deck/preview.ts"
import { type ColorMode, write } from "../output.ts"
import { resolveFromProject } from "../project.ts"

interface SlideFinding extends SlideLayoutFinding {
  id: string
}

type LayoutModule = typeof import("@deckard/core/layout")

// Resolved against the deck rather than bundled here. The measurement this gate
// runs is the deck's own copy of @deckard/core, which is the same file
// SlideOverflowGuard draws its amber ring from, so CI fails on exactly what an
// author sees in next dev and neither can drift from the other.
async function loadLayout(): Promise<LayoutModule> {
  const resolved = resolveFromProject("@deckard/core/layout")

  if (!resolved) {
    throw new Error(
      "This deck's @deckard/core does not export the layout measurement this check runs. Update @deckard/core, then run deckard doctor if it still does not resolve."
    )
  }

  return (await import(pathToFileURL(resolved).href)) as LayoutModule
}

async function checkSlide(
  page: Page,
  baseUrl: string,
  id: string,
  colorMode: ColorMode,
  layout: LayoutModule
): Promise<SlideFinding[]> {
  await openSlide(page, baseUrl, id, colorMode)

  // No canvas handed in: the route serves one slide, so the measurement finds
  // the canvas itself, exactly as the guard does when it runs in the page.
  const report = await page.evaluate(layout.measureSlideLayout, null)

  if (!report.framed) {
    throw new Error(
      `Slide ${id} rendered no [data-slide-frame] element. Check that the route still renders SlideShell.`
    )
  }

  return report.findings.map((finding) => ({ ...finding, id }))
}

export function runCheckOverflow(args: ParsedArgs): Promise<void> {
  const colorMode: ColorMode = booleanFlag(args, "light") ? "light" : "dark"
  const port = numberFlag(args, "port", 3412)
  const skipBuild = booleanFlag(args, "skip-build")

  async function checkSlides({ baseUrl, canvas, ids, page }: CanvasSession) {
    const layout = await loadLayout()
    const found: SlideFinding[] = []

    for (const id of ids) {
      // biome-ignore lint/performance/noAwaitInLoops: slides are measured one at a time on a single page
      found.push(...(await checkSlide(page, baseUrl, id, colorMode, layout)))
    }

    if (found.length === 0) {
      write(
        `${ids.length} slides fit the ${canvas.width}x${canvas.height} canvas in ${colorMode} mode, clear of the chrome and clipping nothing.`
      )
      return
    }

    const slides = new Set(found.map((finding) => finding.id))

    throw new Error(
      [
        ...found.map(
          (finding) =>
            `/slides/${finding.id}  ${layout.describeSlideLayoutFinding(finding)}`
        ),
        `${slides.size} of ${ids.length} slides lose content to the canvas edge, the chrome, or a box that hides it. Trim the content, or wrap the part that has to scroll in SlideScrollArea.`,
      ].join("\n")
    )
  }

  return withCanvasSession(
    { colorMode, port, profile: previewProfile, skipBuild },
    checkSlides
  )
}
