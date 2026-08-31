import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page } from "vitest/browser"

import { SlideViewport } from "@/components/slideshow/slide-viewport"
import type { DeckCanvasConfig } from "@/lib/deck/types"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas: DeckCanvasConfig = {
  fit: "contain",
  height: 1080,
  margin: 24,
  mode: "fixed",
  width: 1920,
}

let container: HTMLDivElement
let root: Root

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

async function renderViewport(width: number, height: number) {
  await page.viewport(width, height)

  act(() => {
    root.render(
      <SlideViewport canvas={canvas}>
        <div data-testid="slide" style={{ height: "100%", width: "100%" }} />
      </SlideViewport>
    )
  })

  await nextFrame()

  const stage = container.querySelector<HTMLElement>(
    "[data-slide-viewport] > div"
  )

  if (!stage) {
    throw new Error("SlideViewport did not render a stage")
  }

  return stage.getBoundingClientRect()
}

function expectedScale(width: number, height: number) {
  return Math.min(
    (width - canvas.margin * 2) / canvas.width,
    (height - canvas.margin * 2) / canvas.height
  )
}

beforeEach(() => {
  container = document.createElement("div")
  container.style.position = "fixed"
  container.style.inset = "0"
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe("SlideViewport", () => {
  it("contains the canvas in a 1280x720 viewport and centers it", async () => {
    const rect = await renderViewport(1280, 720)
    const scale = expectedScale(1280, 720)

    expect(rect.width).toBeCloseTo(canvas.width * scale, 0)
    expect(rect.height).toBeCloseTo(canvas.height * scale, 0)
    expect(rect.left + rect.width / 2).toBeCloseTo(640, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(360, 0)
  })

  it("scales the canvas up on a taller, wider viewport", async () => {
    const small = await renderViewport(800, 600)
    const large = await renderViewport(1920, 1080)

    expect(small.width).toBeCloseTo(canvas.width * expectedScale(800, 600), 0)
    expect(large.width).toBeCloseTo(canvas.width * expectedScale(1920, 1080), 0)
    expect(large.width).toBeGreaterThan(small.width)
    expect(large.left + large.width / 2).toBeCloseTo(960, 0)
    expect(large.top + large.height / 2).toBeCloseTo(540, 0)
    expect(large.width / large.height).toBeCloseTo(
      canvas.width / canvas.height,
      2
    )
  })
})
