import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { resolveCanvas } from "../deck/canvas"
import { resolveTheme } from "../deck/theme"
import type { SlideColorMode } from "../deck/types"
import { SlideCanvas } from "./slide-canvas"

import "../../styles.css"
import "./__fixtures__/test-theme.css"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const canvas = resolveCanvas()
const themeClassName = "test-theme"

let container: HTMLDivElement
let root: Root

function renderChromeCanvas(chromeInset?: { bottom: string; top: string }) {
  act(() => {
    root.render(
      <SlideCanvas
        background="none"
        canvas={canvas}
        chromeInset={chromeInset}
        theme={resolveTheme()}
      >
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

function renderThemedCanvas(colorModes: SlideColorMode[]) {
  act(() => {
    root.render(
      <SlideCanvas
        background="default"
        canvas={canvas}
        theme={{
          className: themeClassName,
          colorModes,
          defaultColorMode: colorModes[0],
          id: "test",
        }}
      >
        <div />
      </SlideCanvas>
    )
  })

  const element = container.querySelector<HTMLElement>("[data-slide-canvas]")

  if (!element) {
    throw new Error("SlideCanvas did not render a canvas")
  }

  return getComputedStyle(element).getPropertyValue("--background").trim()
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
  document.documentElement.classList.remove("dark")
})

describe("SlideCanvas", () => {
  it("reports no chrome inset when the frame already reserves the chrome", () => {
    const style = getComputedStyle(renderChromeCanvas())

    expect(style.paddingBottom).toBe("0px")
    expect(style.paddingTop).toBe("0px")
  })

  it("publishes the chrome inset a bleeding frame has to clear", () => {
    const style = getComputedStyle(
      renderChromeCanvas({
        bottom: "var(--slide-footer-space)",
        top: "var(--slide-header-space)",
      })
    )

    expect(style.paddingBottom).toBe("96px")
    expect(style.paddingTop).toBe("128px")
  })
})

describe("canvas theme scoping", () => {
  it("follows the app color mode when the theme supports both", () => {
    const light = renderThemedCanvas(["light", "dark"])

    document.documentElement.classList.add("dark")

    const dark = renderThemedCanvas(["light", "dark"])

    expect(light).not.toBe("")
    expect(dark).not.toBe(light)
  })

  it("pins a dark-only theme to dark inside a light app", () => {
    document.documentElement.classList.add("dark")
    const dark = renderThemedCanvas(["light", "dark"])

    document.documentElement.classList.remove("dark")

    expect(renderThemedCanvas(["dark"])).toBe(dark)
  })

  it("pins a light-only theme to light inside a dark app", () => {
    const light = renderThemedCanvas(["light", "dark"])

    document.documentElement.classList.add("dark")

    expect(renderThemedCanvas(["light"])).toBe(light)
  })
})
