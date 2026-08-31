import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { resolveCanvas } from "../deck/canvas"
import type { DeckCanvasConfig } from "../deck/types"
import { SlideViewport } from "./slide-viewport"

// The resize observer updates state outside any act() scope, so the flag is only raised around renders.
function actNow(work: () => void) {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    act(work)
  } finally {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
  }
}

const canvas = resolveCanvas()

let container: HTMLDivElement
let root: Root

function expectedScale(
  width: number,
  height: number,
  config: DeckCanvasConfig = canvas
) {
  const gutter = config.margin > 0 ? config.margin * 2 : 0

  return Math.min(
    (width - gutter) / config.width,
    (height - gutter) / config.height
  )
}

function stageElement() {
  const stage = container.querySelector<HTMLElement>(
    "[data-slide-viewport] > div"
  )

  if (!stage) {
    throw new Error("SlideViewport did not render a stage")
  }

  return stage
}

function mountViewport(config: DeckCanvasConfig = canvas) {
  actNow(() => {
    root.render(
      <SlideViewport canvas={config}>
        <div data-testid="slide" style={{ height: "100%", width: "100%" }} />
      </SlideViewport>
    )
  })
}

// The scale is measured, so every assertion has to wait for the resize observer to report the new box.
async function settledRect(
  boxWidth: number,
  boxHeight: number,
  config: DeckCanvasConfig = canvas
) {
  const stage = stageElement()
  const fitted = config.width * expectedScale(boxWidth, boxHeight, config)

  await vi.waitUntil(
    () => Math.abs(stage.getBoundingClientRect().width - fitted) < 0.5
  )

  return stage.getBoundingClientRect()
}

async function renderViewport(
  width: number,
  height: number,
  config: DeckCanvasConfig = canvas
) {
  await page.viewport(width, height)
  mountViewport(config)

  return await settledRect(width, height, config)
}

beforeEach(() => {
  container = document.createElement("div")
  container.style.position = "fixed"
  container.style.inset = "0"
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  actNow(() => root.unmount())
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

describe("SlideViewport resizing", () => {
  it("refits the canvas when its own container resizes", async () => {
    await page.viewport(1280, 720)
    mountViewport()

    container.style.height = "450px"
    container.style.width = "800px"

    const fitted = await settledRect(800, 450)

    expect(fitted.width).toBeCloseTo(800, 0)
    expect(fitted.height).toBeCloseTo(450, 0)
    expect(fitted.left + fitted.width / 2).toBeCloseTo(400, 0)
    expect(fitted.top + fitted.height / 2).toBeCloseTo(225, 0)

    container.style.height = "400px"
    container.style.width = "1200px"

    const reflowed = await settledRect(1200, 400)
    const scale = expectedScale(1200, 400)

    expect(reflowed.width).toBeCloseTo(canvas.width * scale, 0)
    expect(reflowed.height).toBeCloseTo(canvas.height * scale, 0)
    expect(reflowed.left + reflowed.width / 2).toBeCloseTo(600, 0)
    expect(reflowed.top + reflowed.height / 2).toBeCloseTo(200, 0)
  })
})
