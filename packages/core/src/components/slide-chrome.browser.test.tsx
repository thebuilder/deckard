import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { resolveCanvas } from "../deck/canvas"
import { resolveTheme } from "../deck/theme"
import { SlideCanvas } from "./slide-canvas"
import { SlideCanvasFooter, SlideCanvasHeader } from "./slide-chrome"

import "../../styles.css"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()

let container: HTMLDivElement
let root: Root

function renderChrome({
  brand = "Deckard",
  meta,
  number,
  showProgress,
  title,
  total,
}: {
  brand?: string
  meta?: string
  number: number
  showProgress?: boolean
  title?: string
  total: number
}) {
  act(() => {
    root.render(
      <SlideCanvas
        background="none"
        canvas={canvas}
        footer={
          <SlideCanvasFooter
            number={number}
            showProgress={showProgress}
            total={total}
          />
        }
        header={
          <SlideCanvasHeader
            brand={brand}
            brandHref="/"
            meta={meta}
            title={title}
          />
        }
        theme={resolveTheme()}
      >
        <div />
      </SlideCanvas>
    )
  })
}

function overflowsSideways(node: HTMLElement) {
  return node.scrollWidth - node.clientWidth > 1
}

function element(selector: string) {
  const found = container.querySelector<HTMLElement>(selector)

  if (!found) {
    throw new Error(`The canvas chrome did not render ${selector}`)
  }

  return found
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

describe("canvas chrome", () => {
  it("renders the header and footer inside the canvas", () => {
    renderChrome({ number: 3, total: 12 })

    const canvasElement = element("[data-slide-canvas]")

    expect(canvasElement.contains(element("[data-slide-header]"))).toBe(true)
    expect(canvasElement.contains(element("[data-slide-footer]"))).toBe(true)
  })

  it("carries the brand, its link, and the slide title", () => {
    renderChrome({ number: 3, title: "Themed chrome", total: 12 })

    const brand = element("[data-slide-header-brand]")

    expect(brand.textContent).toBe("Deckard")
    expect(brand.getAttribute("href")).toBe("/")
    expect(element("[data-slide-header-title]").textContent).toBe(
      "Themed chrome"
    )
  })

  it("leaves out the meta and the title a deck never set", () => {
    renderChrome({ number: 3, total: 12 })

    expect(container.querySelector("[data-slide-header-meta]")).toBeNull()
    expect(container.querySelector("[data-slide-header-title]")).toBeNull()
  })

  it("drops a slide title that only repeats the deck name", () => {
    renderChrome({ number: 1, title: "Deckard", total: 12 })

    expect(container.querySelector("[data-slide-header-title]")).toBeNull()
  })

  it("renders the meta line the deck did set", () => {
    renderChrome({ meta: "March 2026", number: 3, total: 12 })

    expect(element("[data-slide-header-meta]").textContent).toBe("March 2026")
  })

  it("counts the slide out of the deck", () => {
    renderChrome({ number: 3, total: 12 })

    expect(element("[data-slide-counter]").textContent).toBe("3 of 12")
  })

  it("publishes the position in the deck as a fraction themes can paint", () => {
    renderChrome({ number: 3, total: 12 })

    const progress = element("[data-slide-progress]")

    expect(
      Number(getComputedStyle(progress).getPropertyValue("--slide-progress"))
    ).toBeCloseTo(0.25, 5)
  })

  it("leaves the progress bar out when the deck turns it off", () => {
    renderChrome({ number: 3, showProgress: false, total: 12 })

    expect(container.querySelector("[data-slide-progress]")).toBeNull()
    expect(element("[data-slide-counter]")).not.toBeNull()
  })

  it("reaches a full fraction on the last slide", () => {
    renderChrome({ number: 12, total: 12 })

    expect(
      Number(
        getComputedStyle(element("[data-slide-progress]")).getPropertyValue(
          "--slide-progress"
        )
      )
    ).toBe(1)
  })
})

describe("canvas chrome containment", () => {
  const absurd =
    "A deck brand nobody would ever type into a config file and then keep, on and on, well past the width of the canvas it has to sit inside, ".repeat(
      6
    )

  it("keeps an absurd brand, title, and meta inside the canvas", () => {
    renderChrome({
      brand: absurd,
      meta: absurd,
      number: 3,
      title: absurd,
      total: 12,
    })

    expect(overflowsSideways(element("[data-slide-header]"))).toBe(false)
    expect(overflowsSideways(element("[data-slide-canvas]"))).toBe(false)
  })

  it("truncates the title before the brand gives up any of itself", () => {
    renderChrome({
      meta: "March 2026",
      number: 3,
      title: absurd,
      total: 12,
    })

    expect(overflowsSideways(element("[data-slide-header-title]"))).toBe(true)
    expect(overflowsSideways(element("[data-slide-header-brand]"))).toBe(false)
    expect(overflowsSideways(element("[data-slide-header-meta]"))).toBe(false)
  })
})
