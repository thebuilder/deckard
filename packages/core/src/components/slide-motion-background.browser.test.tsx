import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { resolveCanvas } from "../deck/canvas"
import type { SlideTheme } from "../deck/types"
import type { SlideMotionMode } from "../types/slides"
import { SlideCanvas } from "./slide-canvas"
import { SlideViewParamsBoundary } from "./slide-view-params"

import "../../styles.css"
import "./__fixtures__/test-theme.css"
import "./__fixtures__/canvas-layout.css"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()

// The theme is what decides a variant is painted in a canvas. "hero" is a name
// this theme made up, which is the whole point of the map.
const theme: SlideTheme = {
  className: "test-theme",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "test",
  motion: { hero: "aurora" },
}

const frozenTime = 8

let container: HTMLDivElement
let root: Root

interface RenderOptions {
  background?: string
  motion?: SlideMotionMode
}

function render({ background = "hero", motion = "auto" }: RenderOptions = {}) {
  act(() => {
    root.render(
      <>
        <SlideViewParamsBoundary />
        <SlideCanvas
          background={background}
          canvas={canvas}
          motion={motion}
          theme={theme}
        >
          <div />
        </SlideCanvas>
      </>
    )
  })
}

function fieldCanvas() {
  return container.querySelector<HTMLCanvasElement>("[data-slide-motion]")
}

function requireFieldCanvas() {
  const element = fieldCanvas()

  if (!element) {
    throw new Error("No motion canvas rendered")
  }

  return element
}

// The runtime is fetched on mount, so the state it reports lands a tick later.
async function settledState() {
  const element = requireFieldCanvas()

  await vi.waitUntil(() => element.getAttribute("data-slide-motion-state"))

  return element.getAttribute("data-slide-motion-state")
}

async function waitForState(expected: string) {
  const element = requireFieldCanvas()

  await vi.waitUntil(
    () => element.getAttribute("data-slide-motion-state") === expected
  )

  return expected
}

function reportReducedMotion(matches: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    addEventListener: (_: string, listener: () => void) => {
      listeners.add(listener)
    },
    matches,
    removeEventListener: (_: string, listener: () => void) => {
      listeners.delete(listener)
    },
  }

  vi.spyOn(window, "matchMedia").mockReturnValue(
    query as unknown as MediaQueryList
  )

  return {
    change(next: boolean) {
      query.matches = next

      act(() => {
        for (const listener of listeners) {
          listener()
        }
      })
    },
  }
}

function withoutWebgl() {
  const original = HTMLCanvasElement.prototype.getContext

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function getContextWithoutWebgl(
      this: HTMLCanvasElement,
      id: string,
      ...rest: unknown[]
    ) {
      if (id === "webgl" || id === "webgl2") {
        return null
      }

      return Reflect.apply(original, this, [id, ...rest])
    } as typeof HTMLCanvasElement.prototype.getContext
  )
}

const hasWebgl = (() => {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl"))
  } catch {
    return false
  }
})()

function countDraws() {
  return vi.spyOn(WebGLRenderingContext.prototype, "drawArrays")
}

function countTimes() {
  return vi.spyOn(WebGLRenderingContext.prototype, "uniform1f")
}

// Three frames is enough for a running field to have drawn more than once and
// for a frozen one to have proved it is not going to.
function afterAFewFrames() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
  })
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
  document.documentElement.removeAttribute("data-deck-capture")
  window.history.replaceState(null, "", window.location.pathname)
  vi.restoreAllMocks()
})

describe("a theme's motion background", () => {
  it("paints nothing for a variant the theme does not name", () => {
    render({ background: "default" })

    expect(fieldCanvas()).toBeNull()
  })

  it("paints a canvas inside the background layer for one it does", () => {
    render()

    const element = requireFieldCanvas()

    expect(element.dataset.slideMotion).toBe("aurora")
    expect(element.closest(".slide-background")).not.toBeNull()
  })

  it("keeps the canvas out of the frame the layout checks measure", () => {
    render()

    const frame = container.querySelector("[data-slide-frame]")

    expect(frame).not.toBeNull()
    expect(frame?.contains(requireFieldCanvas())).toBe(false)
  })

  it("leaves the painted background alone when there is no WebGL", async () => {
    withoutWebgl()
    render()

    expect(await settledState()).toBe("unavailable")
    expect(
      container.querySelector<HTMLElement>(".slide-background")?.dataset
        .slideBackground
    ).toBe("hero")
  })
})

describe.skipIf(!hasWebgl)("freezing a motion background", () => {
  it("runs a loop when nothing asks it to hold still", async () => {
    const draws = countDraws()

    render()

    expect(await settledState()).toBe("running")

    await afterAFewFrames()

    expect(draws.mock.calls.length).toBeGreaterThan(1)
  })

  it("draws one fixed frame when the deck asks for a still slide", async () => {
    const draws = countDraws()
    const times = countTimes()

    render({ motion: "frozen" })

    expect(await settledState()).toBe("frozen")

    await afterAFewFrames()

    expect(draws).toHaveBeenCalledTimes(1)
    expect(times).toHaveBeenCalledWith(expect.anything(), frozenTime)
  })

  it("draws one fixed frame under prefers-reduced-motion", async () => {
    reportReducedMotion(true)

    const draws = countDraws()
    const times = countTimes()

    render()

    expect(await settledState()).toBe("frozen")

    await afterAFewFrames()

    expect(draws).toHaveBeenCalledTimes(1)
    expect(times).toHaveBeenCalledWith(expect.anything(), frozenTime)
  })

  it("starts running when the reduced motion preference is dropped", async () => {
    const preference = reportReducedMotion(true)

    render()

    expect(await settledState()).toBe("frozen")

    preference.change(false)

    expect(await waitForState("running")).toBe("running")
  })

  it("draws one fixed frame while the page is being captured", async () => {
    document.documentElement.setAttribute("data-deck-capture", "")

    const draws = countDraws()

    render()

    expect(await settledState()).toBe("frozen")

    await afterAFewFrames()

    expect(draws).toHaveBeenCalledTimes(1)
  })

  it("draws one fixed frame in a presenter preview", async () => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?presenterPreview=1`
    )

    const draws = countDraws()

    render()

    expect(await settledState()).toBe("frozen")

    await afterAFewFrames()

    expect(draws).toHaveBeenCalledTimes(1)
  })

  it("releases the context and stops drawing on unmount", async () => {
    const contexts: WebGLRenderingContext[] = []
    const original = HTMLCanvasElement.prototype.getContext

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      function trackWebglContexts(
        this: HTMLCanvasElement,
        id: string,
        ...rest: unknown[]
      ) {
        const context = Reflect.apply(original, this, [id, ...rest])

        if (id === "webgl" && context) {
          contexts.push(context as WebGLRenderingContext)
        }

        return context
      } as typeof HTMLCanvasElement.prototype.getContext
    )

    const draws = countDraws()

    render()

    expect(await settledState()).toBe("running")

    act(() => root.render(<div />))

    await vi.waitUntil(() => contexts[0]?.isContextLost())

    const drawn = draws.mock.calls.length

    await afterAFewFrames()

    expect(draws.mock.calls.length).toBe(drawn)
  })
})
