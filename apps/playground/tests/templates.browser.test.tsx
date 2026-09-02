import { SlideStep } from "@deckard/core/components"
import type { ReactNode } from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ContentSlideCard } from "@/app/slides/blocks/templates"

import "@/app/globals.css"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const surfaceClassName = "border bg-[var(--slide-surface-muted)] p-4"

let container: HTMLDivElement
let root: Root
let warnings: string[]

// Inside a canvas, because that is the only place a deck theme or the token
// contract can reach a panel, and the point of these four is what does and does
// not reach it.
function renderCard(children: ReactNode) {
  act(() => {
    root.render(
      <div data-slide-canvas="">
        <ContentSlideCard eyebrow="Eyebrow" title="A slide">
          {children}
        </ContentSlideCard>
      </div>
    )
  })

  const panel = container.querySelector<HTMLElement>("[data-slide-panel]")

  if (!panel) {
    throw new Error("ContentSlideCard rendered no panel")
  }

  return panel
}

function paints(node: HTMLElement) {
  const style = getComputedStyle(node)

  return {
    background: style.backgroundColor,
    border: style.borderTopWidth,
    padding: style.paddingTop,
  }
}

beforeEach(() => {
  warnings = []
  vi.spyOn(console, "warn").mockImplementation((...parts: unknown[]) => {
    warnings.push(parts.map(String).join(" "))
  })
  container = document.createElement("div")
  container.style.position = "fixed"
  container.style.inset = "0"
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
})

describe("ContentSlideCard", () => {
  it("paints its card around flat content", () => {
    const painted = paints(
      renderCard(<p>Body copy with no frame of its own.</p>)
    )

    expect(painted.padding).toBe("44px")
    expect(painted.border).toBe("1px")
    expect(painted.background).not.toBe("rgba(0, 0, 0, 0)")
    expect(warnings).toEqual([])
  })

  it("keeps the card around a surfaced block and says so in development", () => {
    const painted = paints(
      renderCard(
        <div className={surfaceClassName} data-slide-surface="">
          A block that paints its own frame
        </div>
      )
    )

    expect(painted.padding).toBe("44px")
    expect(painted.border).toBe("1px")
    expect(
      warnings.filter(
        (warning) =>
          warning.includes("OpenContentSlide") && warning.includes("FocusSlide")
      )
    ).toHaveLength(1)
  })

  it("keeps the padding the flat half of a mixed panel needs", () => {
    const panel = renderCard(
      <>
        <p data-testid="flat">Body copy with no frame of its own.</p>
        <div className={surfaceClassName} data-slide-surface="">
          A block that paints its own frame
        </div>
      </>
    )
    const flat = container.querySelector<HTMLElement>("[data-testid=flat]")

    if (!flat) {
      throw new Error("the mixed panel rendered no flat content")
    }

    const { border, padding } = paints(panel)

    expect(padding).toBe("44px")
    expect(
      flat.getBoundingClientRect().left - panel.getBoundingClientRect().left
    ).toBeCloseTo(Number.parseFloat(padding) + Number.parseFloat(border), 1)
  })

  it("leaves a surfaced block inside a SlideStep painting its own frame", () => {
    renderCard(
      <SlideStep step={0}>
        <div className={surfaceClassName} data-slide-surface="">
          A revealed block that paints its own frame
        </div>
      </SlideStep>
    )

    const surface = container.querySelector<HTMLElement>("[data-slide-surface]")

    if (!surface) {
      throw new Error("the step rendered no surfaced block")
    }

    const painted = paints(surface)

    expect(painted.padding).toBe("16px")
    expect(painted.border).toBe("1px")
    expect(painted.background).not.toBe("rgba(0, 0, 0, 0)")
  })
})
