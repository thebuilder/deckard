import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  SlideStepAdvanceArea,
  SlideStepper,
  useSlideStepper,
} from "./slide-stepper"

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({
  default: {},
  usePathname: () => "/slides/2",
  useRouter: () => ({ prefetch: push, push }),
}))

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

function StepReadout() {
  const stepper = useSlideStepper()

  return <span data-testid="step">{stepper?.currentStep ?? -1}</span>
}

function Deck({
  stepCount = 0,
  readOnly = false,
}: {
  stepCount?: number
  readOnly?: boolean
}) {
  return (
    <SlideStepper
      nextHref="/slides/3"
      previousHref="/slides/1"
      readOnly={readOnly}
      stepCount={stepCount}
    >
      <StepReadout />
      <SlideStepAdvanceArea>
        <div data-slide-viewport="" style={{ height: "300px", width: "100%" }}>
          <p data-testid="slide">Slide body</p>
          <button data-testid="button" type="button">
            A control
            <svg aria-hidden="true" height="10" width="10">
              <path d="M0 0h10v10H0z" data-testid="icon" />
            </svg>
          </button>
          <div
            data-testid="scroller"
            style={{ overflowX: "auto", whiteSpace: "nowrap", width: "100px" }}
          >
            <span style={{ display: "inline-block", width: "600px" }}>
              wide
            </span>
          </div>
        </div>
      </SlideStepAdvanceArea>
      <p data-testid="outside">Outside the viewport</p>
    </SlideStepper>
  )
}

let container: HTMLDivElement
let root: Root

function query(testId: string) {
  const element = container.querySelector<HTMLElement>(
    `[data-testid="${testId}"]`
  )

  if (!element) {
    throw new Error(`Missing test element: ${testId}`)
  }

  return element
}

function currentStep() {
  return Number(query("step").textContent)
}

interface Point {
  x: number
  y: number
}

// Firefox and WebKit on a desktop build no Touch objects, so the events carry
// lists shaped like TouchList: the handler reads length and item() only.
function touchList(points: Point[]) {
  const touches = points.map((point) => ({
    clientX: point.x,
    clientY: point.y,
  }))

  return {
    item: (index: number) => touches[index] ?? null,
    length: touches.length,
  }
}

function dispatchTouch(
  target: HTMLElement,
  type: string,
  touches: Point[],
  changed: Point[] = touches
) {
  const event = new Event(type, { bubbles: true })

  Object.defineProperties(event, {
    changedTouches: { value: touchList(changed) },
    touches: { value: touchList(touches) },
  })

  act(() => {
    target.dispatchEvent(event)
  })
}

function swipe(target: HTMLElement, from: Point, to: Point) {
  dispatchTouch(target, "touchstart", [from])
  dispatchTouch(target, "touchmove", [to])
  dispatchTouch(target, "touchend", [], [to])
}

// A horizontal swipe through the middle of the window, clear of the edges a
// phone keeps for its own gestures.
function sideways(direction: "left" | "right"): [Point, Point] {
  const middle = window.innerWidth / 2
  const start = { x: middle + (direction === "left" ? 80 : -80), y: 100 }
  const end = { x: middle + (direction === "left" ? -80 : 80), y: 110 }

  return [start, end]
}

function mount(stepCount?: number, readOnly?: boolean) {
  act(() => {
    root.render(<Deck readOnly={readOnly} stepCount={stepCount} />)
  })
}

function click(target: Element) {
  act(() => {
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

// A press at one point and a release at another, the click the browser
// fires at the end of a drag.
function drag(target: HTMLElement, from: Point, to: Point) {
  act(() => {
    target.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: from.x,
        clientY: from.y,
      })
    )
    target.dispatchEvent(
      new MouseEvent("click", { bubbles: true, clientX: to.x, clientY: to.y })
    )
  })
}

beforeEach(() => {
  push.mockClear()
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe("click navigation", () => {
  it("walks the steps, then pages on to the next slide", () => {
    mount(2)

    click(query("slide"))
    expect(currentStep()).toBe(1)
    expect(push).not.toHaveBeenCalled()

    click(query("slide"))
    expect(push).toHaveBeenLastCalledWith("/slides/3")
  })

  it("pages a slide that has no steps", () => {
    mount()

    click(query("slide"))
    expect(push).toHaveBeenLastCalledWith("/slides/3")
  })

  it("leaves a click on a control to the control", () => {
    mount()

    click(query("button"))
    expect(push).not.toHaveBeenCalled()
  })

  it("leaves a click on a control's icon to the control", () => {
    mount()

    click(query("icon"))
    expect(push).not.toHaveBeenCalled()
  })

  it("ignores the click that ends a drag", () => {
    mount()

    drag(query("slide"), { x: 10, y: 10 }, { x: 80, y: 40 })
    expect(push).not.toHaveBeenCalled()

    drag(query("slide"), { x: 10, y: 10 }, { x: 12, y: 11 })
    expect(push).toHaveBeenLastCalledWith("/slides/3")
  })

  it("ignores a click that leaves text selected", () => {
    mount()

    window.getSelection()?.selectAllChildren(query("slide"))
    click(query("slide"))
    expect(push).not.toHaveBeenCalled()

    window.getSelection()?.removeAllRanges()
    click(query("slide"))
    expect(push).toHaveBeenLastCalledWith("/slides/3")
  })

  it("does nothing in a read-only deck", () => {
    mount(2, true)

    click(query("slide"))
    expect(currentStep()).toBe(0)
    expect(push).not.toHaveBeenCalled()
  })
})

describe("swipe navigation", () => {
  it("pages forward on a swipe left and back on a swipe right", () => {
    mount()

    swipe(query("slide"), ...sideways("left"))
    expect(push).toHaveBeenLastCalledWith("/slides/3")

    swipe(query("slide"), ...sideways("right"))
    expect(push).toHaveBeenLastCalledWith("/slides/1")
  })

  it("walks the steps before the slides, the way the arrow keys do", () => {
    mount(3)

    swipe(query("slide"), ...sideways("left"))
    expect(currentStep()).toBe(1)

    swipe(query("slide"), ...sideways("right"))
    expect(currentStep()).toBe(0)
    expect(push).not.toHaveBeenCalled()
  })

  it("ignores a swipe that starts on a control", () => {
    mount()

    swipe(query("button"), ...sideways("left"))
    expect(push).not.toHaveBeenCalled()
  })

  it("leaves a sideways scroller its own swipe", () => {
    mount()

    swipe(query("scroller"), ...sideways("left"))
    expect(push).not.toHaveBeenCalled()
  })

  it("ignores a swipe outside the slide viewport", () => {
    mount()

    swipe(query("outside"), ...sideways("left"))
    expect(push).not.toHaveBeenCalled()
  })

  it("ignores a drag that is mostly vertical or too short", () => {
    mount()
    const middle = window.innerWidth / 2

    swipe(query("slide"), { x: middle, y: 20 }, { x: middle - 60, y: 200 })
    swipe(query("slide"), { x: middle, y: 100 }, { x: middle - 20, y: 100 })
    expect(push).not.toHaveBeenCalled()
  })

  it("leaves a swipe from the screen edge to the system", () => {
    mount()

    swipe(query("slide"), { x: 4, y: 100 }, { x: 200, y: 100 })
    expect(push).not.toHaveBeenCalled()
  })

  it("drops a gesture that grows a second finger", () => {
    mount()
    const [start, end] = sideways("left")

    dispatchTouch(query("slide"), "touchstart", [start])
    dispatchTouch(query("slide"), "touchmove", [end, { x: 40, y: 40 }])
    dispatchTouch(query("slide"), "touchend", [], [end])
    expect(push).not.toHaveBeenCalled()
  })
})
