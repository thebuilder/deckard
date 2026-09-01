import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { SlideCanvas } from "@/components/slideshow/slide-canvas"
import { resolveCanvas } from "@/lib/deck/canvas"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()

let container: HTMLDivElement
let root: Root

function renderCanvas(chromeInset?: { bottom: number; top: number }) {
  act(() => {
    root.render(
      <SlideCanvas background="none" canvas={canvas} chromeInset={chromeInset}>
        <section
          data-testid="media"
          style={{
            paddingBottom: "var(--slide-chrome-bottom, 0px)",
            paddingTop: "var(--slide-chrome-top, 0px)",
          }}
        />
      </SlideCanvas>
    )
  })

  const media = container.querySelector<HTMLElement>("[data-testid=media]")

  if (!media) {
    throw new Error("SlideCanvas did not render its frame")
  }

  return media
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

describe("SlideCanvas", () => {
  it("reports no chrome inset when the frame already reserves the chrome", () => {
    const style = getComputedStyle(renderCanvas())

    expect(style.paddingBottom).toBe("0px")
    expect(style.paddingTop).toBe("0px")
  })

  it("publishes the chrome inset a bleeding frame has to clear", () => {
    const style = getComputedStyle(renderCanvas({ bottom: 80, top: 96 }))

    expect(style.paddingBottom).toBe("80px")
    expect(style.paddingTop).toBe("96px")
  })
})
