import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SlideSummary } from "../deck/types"
import {
  PRESENTER_CHANNEL_NAME,
  type PresenterChannelMessage,
} from "../types/presenter"
import { PresenterConsole } from "./presenter-console"

const canvas = {
  fit: "contain",
  height: 1080,
  margin: 0,
  mode: "fixed",
  width: 1920,
} as const

function summary(number: number): SlideSummary {
  return {
    href: `/slides/${number}`,
    id: String(number),
    number,
    stepCount: 0,
    title: `Slide ${number}`,
  }
}

const slides = [summary(1), summary(2), summary(3)]

// The console renders into this page, so the previews would load the test
// server's own document. An empty one keeps them quiet.
const slidesPath = "about:blank#"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function actNow(work: () => void) {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    act(work)
  } finally {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
  }
}

let container: HTMLDivElement
let root: Root
let deck: BroadcastChannel
let received: PresenterChannelMessage["type"][]

// Stands in for the slideshow tab: answers the console's request for state and
// records the navigation it sends back.
function connectDeck() {
  deck = new BroadcastChannel(PRESENTER_CHANNEL_NAME)
  received = []

  deck.addEventListener(
    "message",
    (event: MessageEvent<PresenterChannelMessage>) => {
      if (event.data.type === "request-state") {
        deck.postMessage({
          payload: {
            currentStep: 0,
            preview: { id: "3", step: 0, title: "Slide 3" },
            sentAt: Date.now(),
            slide: slides[1],
            slides,
          },
          type: "slide-state",
        } satisfies PresenterChannelMessage)
        return
      }

      received.push(event.data.type)
    }
  )
}

function button(label: string) {
  const node = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`
  )

  if (!node) {
    throw new Error(`PresenterConsole did not render a ${label} button`)
  }

  return node
}

function elapsed() {
  return container.querySelector('[title^="Elapsed"]')?.textContent
}

function press(key: string, target: EventTarget = document.body) {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key })
  )
}

async function mountConsole() {
  actNow(() => {
    root.render(<PresenterConsole canvas={canvas} slidesPath={slidesPath} />)
  })

  await vi.waitFor(() => {
    if (!container.textContent?.includes("Slide 2")) {
      throw new Error("PresenterConsole has not heard from the deck yet")
    }
  })
}

beforeEach(() => {
  connectDeck()
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  actNow(() => root.unmount())
  container.remove()
  deck.close()
})

describe("PresenterConsole", () => {
  it("sends the arrow keys to the deck while one of its buttons has focus", async () => {
    await mountConsole()

    const reset = button("Reset timer")
    reset.focus()
    press("ArrowRight", reset)
    press("ArrowLeft", reset)

    await expect
      .poll(() => received)
      .toEqual(["navigate-next", "navigate-previous"])
  })

  it("leaves Space on a focused button to the button", async () => {
    await mountConsole()

    const reset = button("Reset timer")
    reset.focus()
    press(" ", reset)
    press(" ")

    await expect.poll(() => received).toEqual(["navigate-next"])
  })

  it("keeps the previews silent and out of the focus order", async () => {
    await mountConsole()

    const frames = [...container.querySelectorAll("iframe")]

    expect(frames.length).toBeGreaterThan(0)

    for (const frame of frames) {
      expect(frame.getAttribute("allow")).toBe("autoplay 'none'")
      expect(frame.inert).toBe(true)
    }
  })

  it("pauses, resets, and resumes the timer", async () => {
    await mountConsole()

    actNow(() => button("Pause timer").click())
    const paused = elapsed()
    await wait(1100)
    expect(elapsed()).toBe(paused)

    actNow(() => button("Reset timer").click())
    expect(elapsed()).toBe("00:00:00")

    actNow(() => button("Start timer").click())
    await expect.poll(() => elapsed(), { timeout: 2500 }).toBe("00:00:01")
  })
})
