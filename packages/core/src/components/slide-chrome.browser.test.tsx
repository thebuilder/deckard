import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { resolveCanvas } from "../deck/canvas"
import { resolveTheme } from "../deck/theme"
import { SlideCanvas } from "./slide-canvas"
import { SlideCanvasFooter, SlideCanvasHeader } from "./slide-chrome"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()

let container: HTMLDivElement
let root: Root

function renderChrome({
  date,
  number,
  title,
  total,
}: {
  date?: string
  number: number
  title?: string
  total: number
}) {
  act(() => {
    root.render(
      <SlideCanvas
        background="none"
        canvas={canvas}
        footer={<SlideCanvasFooter number={number} total={total} />}
        header={
          <SlideCanvasHeader
            brand="Deckard"
            brandHref="/"
            date={date}
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

  it("leaves out the date and the title a deck never set", () => {
    renderChrome({ number: 3, total: 12 })

    expect(container.querySelector("[data-slide-header-date]")).toBeNull()
    expect(container.querySelector("[data-slide-header-title]")).toBeNull()
  })

  it("renders a date the deck did set", () => {
    renderChrome({ date: "March 2026", number: 3, total: 12 })

    expect(element("[data-slide-header-date]").textContent).toBe("March 2026")
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
