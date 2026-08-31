import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SlideErrorBoundary } from "./slide-error-boundary"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

function ThrowingSlide(): never {
  throw new Error("Slide data went missing")
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
})

describe("SlideErrorBoundary", () => {
  it("renders slide content while nothing throws", () => {
    act(() => {
      root.render(
        <SlideErrorBoundary slideId="intro">
          <p>Build polished slides fast</p>
        </SlideErrorBoundary>
      )
    })

    expect(container.textContent).toContain("Build polished slides fast")
    expect(container.querySelector("[role='alert']")).toBeNull()
  })

  it("shows the error card with the slide id and message when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    act(() => {
      root.render(
        <SlideErrorBoundary slideId="broken">
          <ThrowingSlide />
        </SlideErrorBoundary>
      )
    })

    const alert = container.querySelector("[role='alert']")

    expect(alert?.textContent).toContain("Slide broken threw while rendering")
    expect(alert?.textContent).toContain("Slide data went missing")
  })
})
