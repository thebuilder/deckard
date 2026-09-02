import type { CSSProperties, ReactNode } from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { SlideCanvas } from "../components/slide-canvas"
import {
  SlideCanvasFooter,
  SlideCanvasHeader,
} from "../components/slide-chrome"
import { SlideScrollArea } from "../components/slide-scroll-area"
import { resolveCanvas } from "../deck/canvas"
import { resolveTheme } from "../deck/theme"
import type { SlideLayoutMode } from "../types/slides"
import { measureSlideLayout, type SlideLayoutFinding } from "./slide-layout"

import "../../styles.css"
import "../components/__fixtures__/canvas-layout.css"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()

let container: HTMLDivElement
let root: Root

function renderSlide(children: ReactNode, layout: SlideLayoutMode = "default") {
  act(() => {
    root.render(
      <SlideCanvas
        background="none"
        canvas={canvas}
        footer={<SlideCanvasFooter number={3} total={12} />}
        header={
          <SlideCanvasHeader brand="Deckard" brandHref="/" title="A slide" />
        }
        layout={layout}
        theme={resolveTheme()}
      >
        <div>{children}</div>
      </SlideCanvas>
    )
  })
}

function element(selector: string) {
  const found = container.querySelector<HTMLElement>(selector)

  if (!found) {
    throw new Error(`The slide did not render ${selector}`)
  }

  return found
}

function measure() {
  return measureSlideLayout(element("[data-slide-canvas]"))
}

function findings(check: SlideLayoutFinding["check"]) {
  return measure().findings.filter((finding) => finding.check === check)
}

const flat: CSSProperties = { margin: 0 }

// Tall enough to run out of the frame and into the footer below it.
function TallList({ height }: { height: number }) {
  return (
    <div data-slide-list="" style={{ ...flat, height }}>
      <div data-slide-list-item="" style={{ ...flat, height }}>
        Content
      </div>
    </div>
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

describe("measureSlideLayout, the chrome band", () => {
  it("says nothing about content that clears the footer", () => {
    renderSlide(<TallList height={200} />)

    expect(findings("band")).toEqual([])
  })

  it("names the part that runs into the footer, and by how far", () => {
    renderSlide(<TallList height={1000} />)

    const band = findings("band")

    expect(band).toHaveLength(1)
    expect(band[0].band).toBe("footer")
    expect(band[0].part).toBe("[data-slide-list]")
    expect(band[0].y).toBeGreaterThan(1)
  })

  it("names the outermost part, not the rows it drags with it", () => {
    renderSlide(<TallList height={1000} />)

    expect(findings("band").map((finding) => finding.part)).toEqual([
      "[data-slide-list]",
    ])
  })

  it("catches content that runs up into the header", () => {
    renderSlide(
      <div data-slide-list="" style={{ height: 200, marginTop: -400 }}>
        Above the header rule
      </div>
    )

    const band = findings("band")

    expect(band).toHaveLength(1)
    expect(band[0].band).toBe("header")
  })

  it("leaves an absolutely positioned part alone", () => {
    renderSlide(
      <div data-slide-media="" style={{ inset: 0, position: "absolute" }}>
        Full bleed
      </div>
    )

    expect(findings("band")).toEqual([])
  })

  it("leaves what a scroll area scrolls alone", () => {
    renderSlide(
      <SlideScrollArea label="Code sample" maxHeight={200}>
        <div data-slide-list="" style={{ ...flat, height: 1600 }}>
          Long enough to scroll
        </div>
      </SlideScrollArea>
    )

    expect(findings("band")).toEqual([])
  })

  it("leaves a fullscreen slide alone under the chrome", () => {
    renderSlide(<TallList height={1000} />, "fullscreen")

    expect(findings("band")).toEqual([])
  })

  it("reports canvas pixels while the stage is scaled to fit the window", () => {
    renderSlide(<TallList height={1000} />)

    const unscaled = findings("band")[0].y

    container.style.transformOrigin = "top left"
    container.style.transform = "scale(0.25)"

    expect(Math.abs(findings("band")[0].y - unscaled)).toBeLessThan(1)
  })
})

describe("measureSlideLayout, clipping", () => {
  it("says nothing about a box whose content fits", () => {
    renderSlide(
      <div data-slide-card="" style={{ height: 300, overflow: "hidden" }}>
        <div style={{ ...flat, height: 100 }}>Short</div>
      </div>
    )

    expect(findings("clipping")).toEqual([])
  })

  it("names a box that hides its own overflow, and by how much", () => {
    renderSlide(
      <div data-slide-card="" style={{ height: 200, overflow: "hidden" }}>
        <div style={{ ...flat, height: 260 }}>Too tall for the card</div>
      </div>
    )

    const clipping = findings("clipping")

    expect(clipping).toHaveLength(1)
    expect(clipping[0].part).toBe("[data-slide-card]")
    expect(Math.round(clipping[0].y)).toBe(60)
    expect(clipping[0].x).toBe(0)
  })

  it("catches a box that hides its overflow sideways", () => {
    renderSlide(
      <div data-slide-card="" style={{ overflow: "hidden", width: 200 }}>
        <div style={{ ...flat, width: 320 }}>Too wide</div>
      </div>
    )

    const clipping = findings("clipping")

    expect(clipping).toHaveLength(1)
    expect(Math.round(clipping[0].x)).toBe(120)
  })

  it("leaves a scroll area, which outgrows its box on purpose, alone", () => {
    renderSlide(
      <SlideScrollArea label="Code sample" maxHeight={200}>
        <div style={{ ...flat, height: 900 }}>Long enough to scroll</div>
      </SlideScrollArea>
    )

    expect(findings("clipping")).toEqual([])
  })

  it("leaves the header alone, which truncates its own row on purpose", () => {
    renderSlide(<TallList height={200} />)

    const title = element("[data-slide-header-title]")

    title.textContent = "A slide title nobody would keep, ".repeat(30)

    expect(title.scrollWidth - title.clientWidth).toBeGreaterThan(1)
    expect(findings("clipping")).toEqual([])
  })
})

describe("measureSlideLayout, the canvas edge", () => {
  it("still reports the frame that outgrows the canvas", () => {
    renderSlide(<TallList height={2400} />)

    const frame = findings("canvas").find(
      (finding) => finding.part === "slide content"
    )

    expect(frame?.y).toBeGreaterThan(1)
  })

  it("reports a shell with no frame as unframed", () => {
    renderSlide(<TallList height={200} />)

    element("[data-slide-frame]").removeAttribute("data-slide-frame")

    expect(measure().framed).toBe(false)
  })
})
