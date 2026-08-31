import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import { SlideScrollArea } from "@/components/slideshow/slide-scroll-area"
import {
  SlideStepAdvanceArea,
  SlideStepper,
  useSlideStepper,
} from "@/components/slideshow/slide-stepper"

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({
  default: {},
  usePathname: () => "/slides/1",
  useRouter: () => ({ prefetch: push, push }),
}))

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

function StepReadout() {
  const stepper = useSlideStepper()

  return <span data-testid="step">{stepper?.currentStep ?? -1}</span>
}

function Deck() {
  return (
    <SlideStepper nextHref="/slides/2" stepCount={3}>
      <StepReadout />
      <SlideStepAdvanceArea>
        <SlideScrollArea label="Code sample" maxHeight={120}>
          <div data-testid="tall" style={{ height: "900px" }}>
            <button data-testid="inside" type="button">
              inside
            </button>
          </div>
        </SlideScrollArea>
        <p data-testid="outside">Outside the scroll area</p>
      </SlideStepAdvanceArea>
    </SlideStepper>
  )
}

let container: HTMLDivElement
let root: Root

function query<T extends HTMLElement>(testId: string) {
  const element = container.querySelector<T>(`[data-testid="${testId}"]`)

  if (!element) {
    throw new Error(`Missing test element: ${testId}`)
  }

  return element
}

function currentStep() {
  return query("step").textContent
}

function click(target: HTMLElement) {
  act(() => target.click())
}

function pressArrowDown(target: HTMLElement) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" })
    )
  })
}

beforeEach(() => {
  push.mockClear()
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)

  act(() => root.render(<Deck />))
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe("SlideScrollArea", () => {
  it("scrolls its own content instead of stepping the slide", async () => {
    const area = query("tall").parentElement as HTMLElement

    expect(area.scrollHeight).toBeGreaterThan(area.clientHeight)

    await userEvent.click(area)
    expect(document.activeElement).toBe(area)

    await userEvent.keyboard("{PageDown}")
    await expect.poll(() => area.scrollTop).toBeGreaterThan(0)

    expect(currentStep()).toBe("0")
    expect(push).not.toHaveBeenCalled()
  })

  it("keeps stepper keys inside the area", () => {
    pressArrowDown(query("inside"))

    expect(currentStep()).toBe("0")

    pressArrowDown(query("outside"))

    expect(currentStep()).toBe("1")
  })

  it("does not advance the slide when the area is clicked", () => {
    click(query("inside"))

    expect(currentStep()).toBe("0")

    click(query("outside"))

    expect(currentStep()).toBe("1")
  })
})
