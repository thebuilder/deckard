import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SlideSummary } from "../deck/types"
import { pushed } from "./__fixtures__/next-navigation"
import { DeckControls, resetDeckControlsMemory } from "./deck-controls"

// Pointer proximity and focus land outside any act() scope, the way they do in a
// browser, so the flag is only raised around the renders this test drives itself.
function actNow(work: () => void) {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    act(work)
  } finally {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
  }
}

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

let container: HTMLDivElement
let root: Root

function mountControls(
  { presenterHref }: { presenterHref?: string } = {
    presenterHref: "/presenter",
  }
) {
  actNow(() => {
    root.render(
      <DeckControls
        currentNumber={2}
        deckTitle="Test deck"
        next={slides[2]}
        presenterHref={presenterHref}
        previous={slides[0]}
        showColorModeToggle={true}
        slides={slides}
      />
    )
  })
}

function controls() {
  const nav = container.querySelector<HTMLElement>("[data-deck-controls]")

  if (!nav) {
    throw new Error("DeckControls did not render its landmark")
  }

  return nav
}

function cluster() {
  const node = container.querySelector<HTMLElement>(
    "[data-deck-controls-cluster]"
  )

  if (!node) {
    throw new Error("DeckControls did not render its cluster")
  }

  return node
}

function isRevealed() {
  return controls().hasAttribute("data-deck-controls-revealed")
}

function button(label: string) {
  const node = container.querySelector<HTMLButtonElement>(
    `[data-deck-controls] button[aria-label="${label}"]`
  )

  if (!node) {
    throw new Error(`DeckControls did not render a ${label} button`)
  }

  return node
}

function handle() {
  return container.querySelector<HTMLButtonElement>(
    '[data-deck-controls] button[aria-label$="deck controls"]'
  )
}

// A headless browser reports one machine. These tests are about the other kinds,
// so the two queries the cluster asks are answered for them.
function stubMediaQueries(matching: Record<string, boolean>) {
  const original = window.matchMedia

  window.matchMedia = ((query: string) => ({
    addEventListener: () => undefined,
    matches: matching[query] ?? false,
    media: query,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia

  return () => {
    window.matchMedia = original
  }
}

function movePointerTo(x: number, y: number) {
  window.dispatchEvent(
    new PointerEvent("pointermove", { clientX: x, clientY: y })
  )
}

beforeEach(() => {
  resetDeckControlsMemory()
  pushed.length = 0
  container = document.createElement("div")
  container.style.position = "fixed"
  container.style.inset = "0"
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  actNow(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
})

describe("DeckControls", () => {
  it("labels itself as a landmark and starts hidden at rest", () => {
    mountControls()

    expect(controls().getAttribute("aria-label")).toBe("Deck controls")
    expect(isRevealed()).toBe(false)
    expect(cluster().className).toContain("opacity-0")
    expect(cluster().className).toContain("pointer-events-none")
  })

  it("keeps every control in the accessibility tree while it is hidden", () => {
    mountControls()

    expect(isRevealed()).toBe(false)
    expect(controls().hasAttribute("hidden")).toBe(false)
    expect(controls().getAttribute("aria-hidden")).toBeNull()
    expect(button("Next slide").offsetParent).not.toBeNull()
  })

  it("omits presenter controls when the route has no presenter page", () => {
    mountControls({ presenterHref: undefined })

    expect(
      container.querySelector('[aria-label="Open presenter view"]')
    ).toBeNull()
  })

  it("opens the presenter route owned by the deck", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    mountControls({ presenterHref: "/review/presenter" })

    button("Open presenter view").click()

    expect(open).toHaveBeenCalledWith(
      "/review/presenter",
      "slideshow-presenter",
      expect.any(String)
    )
  })

  it("reveals the cluster when a control takes focus", async () => {
    mountControls()

    button("Open slide command center").focus()

    await vi.waitUntil(isRevealed)

    expect(cluster().className).toContain("opacity-100")
    expect(cluster().className).toContain("pointer-events-auto")
  })

  it("hides the cluster again when focus leaves it", async () => {
    mountControls()

    button("Next slide").focus()
    await vi.waitUntil(isRevealed)

    button("Next slide").blur()
    await vi.waitUntil(() => !isRevealed())

    expect(cluster().className).toContain("opacity-0")
  })

  it("reveals the cluster when the pointer comes near it", async () => {
    const restore = stubMediaQueries({ "(any-pointer: fine)": true })

    try {
      mountControls()

      const box = controls().getBoundingClientRect()

      movePointerTo(box.left + box.width / 2, box.top + box.height / 2)
      await vi.waitUntil(isRevealed)

      movePointerTo(box.right + 900, box.bottom + 900)
      await vi.waitUntil(() => !isRevealed())
    } finally {
      restore()
    }
  })

  it("still answers the command shortcut while it is hidden", async () => {
    mountControls()

    expect(isRevealed()).toBe(false)

    window.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "k", metaKey: true })
    )

    await vi.waitUntil(isRevealed)
  })

  it("gives a hybrid machine the handle and the proximity reveal", async () => {
    const restore = stubMediaQueries({
      "(any-pointer: coarse)": true,
      "(any-pointer: fine)": true,
    })

    try {
      mountControls()

      expect(handle()).not.toBeNull()

      const box = controls().getBoundingClientRect()

      movePointerTo(box.left + box.width / 2, box.top + box.height / 2)
      await vi.waitUntil(isRevealed)
    } finally {
      restore()
    }
  })

  it("gives a touch-only machine the handle and nothing to hover with", async () => {
    const restore = stubMediaQueries({ "(any-pointer: coarse)": true })

    try {
      mountControls()

      expect(handle()).not.toBeNull()

      const box = controls().getBoundingClientRect()

      movePointerTo(box.left + box.width / 2, box.top + box.height / 2)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(isRevealed()).toBe(false)

      handle()?.click()
      await vi.waitUntil(isRevealed)
    } finally {
      restore()
    }
  })

  it("navigates from the revealed buttons", async () => {
    mountControls()

    button("Next slide").focus()
    await vi.waitUntil(isRevealed)

    button("Next slide").click()

    expect(pushed).toEqual(["/slides/3"])
  })
})
