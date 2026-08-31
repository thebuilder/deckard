import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page } from "vitest/browser"

import { SlideViewport } from "@/components/slideshow/slide-viewport"
import { resolveCanvas } from "@/lib/deck/canvas"
import type { DeckCanvasConfig } from "@/lib/deck/types"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()

let container: HTMLDivElement
let root: Root

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

async function renderViewport(
  width: number,
  height: number,
  config: DeckCanvasConfig = canvas
) {
  await page.viewport(width, height)

  act(() => {
    root.render(
      <SlideViewport canvas={config}>
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

function expectedScale(
  width: number,
  height: number,
  config: DeckCanvasConfig = canvas
) {
  return Math.min(
    (width - config.margin * 2) / config.width,
    (height - config.margin * 2) / config.height
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
  it("fills an exact canvas-ratio viewport edge to edge", async () => {
    const rect = await renderViewport(canvas.width, canvas.height)

    expect(canvas.margin).toBe(0)
    expect(rect.width).toBeCloseTo(canvas.width, 0)
    expect(rect.height).toBeCloseTo(canvas.height, 0)
    expect(rect.left).toBeCloseTo(0, 0)
    expect(rect.top).toBeCloseTo(0, 0)
  })

  it("contains the canvas in a 1280x720 viewport and centers it", async () => {
    const rect = await renderViewport(1280, 720)
    const scale = expectedScale(1280, 720)

    expect(rect.width).toBeCloseTo(canvas.width * scale, 0)
    expect(rect.height).toBeCloseTo(canvas.height * scale, 0)
    expect(rect.left + rect.width / 2).toBeCloseTo(640, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(360, 0)
  })

  it("letterboxes a viewport that is taller than the canvas ratio", async () => {
    const rect = await renderViewport(390, 844)
    const scale = expectedScale(390, 844)

    expect(rect.width).toBeCloseTo(canvas.width * scale, 0)
    expect(rect.left).toBeCloseTo(0, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(422, 0)
    expect(rect.width / rect.height).toBeCloseTo(
      canvas.width / canvas.height,
      2
    )
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

  it("keeps a gutter for a deck that asks for a margin", async () => {
    const margined = resolveCanvas({ margin: 24 })
    const rect = await renderViewport(1920, 1080, margined)

    expect(rect.width).toBeCloseTo(
      margined.width * expectedScale(1920, 1080, margined),
      0
    )
    expect(rect.left + rect.width / 2).toBeCloseTo(960, 0)
    expect(rect.top).toBeCloseTo(24, 0)
  })
})
