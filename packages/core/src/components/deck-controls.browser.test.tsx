import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SlideSummary } from "../deck/types"
import { pushed } from "./__fixtures__/next-navigation"
import { DeckControls, resetDeckControlsMemory } from "./deck-controls"
import { SlideShellRuntime } from "./slide-shell-runtime"
import { SlideViewParamsBoundary } from "./slide-view-params"

// The cluster stays up this long after the pointer last moved.
const idleHideMs = 2500
const pastIdle = { interval: 50, timeout: idleHideMs + 1500 }

// Pointer moves and focus land outside any act() scope, the way they do in a
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

function deckControls(presenterHref: string | undefined) {
  return (
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
}

function mountControls(
  { presenterHref }: { presenterHref?: string } = {
    presenterHref: "/presenter",
  }
) {
  actNow(() => {
    root.render(
      <>
        <SlideViewParamsBoundary />
        {deckControls(presenterHref)}
      </>
    )
  })
}

// A slide navigation unmounts the cluster and mounts a new one.
function remountControls() {
  actNow(() => root.unmount())
  root = createRoot(container)
  mountControls()
}

// The URL store is module state, so a test that needs a particular URL has the
// boundary publish it before the cluster mounts and reads it.
function readUrl(search: string) {
  window.history.replaceState(null, "", `${window.location.pathname}${search}`)
  actNow(() => root.render(<SlideViewParamsBoundary />))
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

// The viewport corner farthest from the cluster, well past revealDistance.
function moveAwayFromControls() {
  const box = controls().getBoundingClientRect()
  const x = box.left > window.innerWidth - box.right ? 0 : window.innerWidth - 1
  const y =
    box.top > window.innerHeight - box.bottom ? 0 : window.innerHeight - 1

  movePointerTo(x, y)
}

function movePointerTo(x: number, y: number, pointerType = "mouse") {
  window.dispatchEvent(
    new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType })
  )
}

function movePointerOntoControls(pointerType?: string) {
  const box = controls().getBoundingClientRect()

  movePointerTo(box.left + box.width / 2, box.top + box.height / 2, pointerType)
}

beforeEach(() => {
  // A captured page skips the first-mount reveal, so every test starts with the
  // cluster at rest. The intro tests clear the marker.
  resetDeckControlsMemory()
  document.documentElement.setAttribute("data-deck-capture", "")
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
  document.documentElement.removeAttribute("data-deck-capture")
  window.history.replaceState(null, "", window.location.pathname)
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

  it("reveals the cluster when the pointer moves anywhere and hides it once the pointer rests", async () => {
    const restore = stubMediaQueries({ "(any-pointer: fine)": true })

    try {
      mountControls()

      moveAwayFromControls()
      await vi.waitUntil(isRevealed)

      const movedAt = Date.now()

      await vi.waitUntil(() => !isRevealed(), pastIdle)

      expect(Date.now() - movedAt).toBeGreaterThanOrEqual(idleHideMs - 100)
    } finally {
      restore()
    }
  })

  it("keeps the cluster up while the pointer rests near it, across a slide navigation", async () => {
    const restore = stubMediaQueries({ "(any-pointer: fine)": true })

    try {
      mountControls()

      movePointerOntoControls()
      await vi.waitUntil(isRevealed)
      await wait(idleHideMs + 300)

      expect(isRevealed()).toBe(true)

      remountControls()

      expect(isRevealed()).toBe(true)

      moveAwayFromControls()
      await vi.waitUntil(() => !isRevealed(), pastIdle)
    } finally {
      restore()
    }
  }, 15_000)

  it("keeps a reveal earned by movement across a slide navigation", async () => {
    const restore = stubMediaQueries({ "(any-pointer: fine)": true })

    try {
      mountControls()
      moveAwayFromControls()
      await vi.waitUntil(isRevealed)

      remountControls()

      expect(isRevealed()).toBe(true)
    } finally {
      restore()
    }
  })

  it("reveals the cluster once when the deck first mounts, and not on later mounts", async () => {
    document.documentElement.removeAttribute("data-deck-capture")
    mountControls()

    await vi.waitUntil(isRevealed)
    await vi.waitUntil(() => !isRevealed(), pastIdle)

    remountControls()
    await wait(100)

    expect(isRevealed()).toBe(false)
  }, 10_000)

  it("skips the first-mount reveal while the page is captured", async () => {
    document.documentElement.setAttribute("data-deck-capture", "")
    mountControls()
    await wait(100)

    expect(isRevealed()).toBe(false)
  })

  it("ignores touch movement", async () => {
    const restore = stubMediaQueries({ "(any-pointer: fine)": true })

    try {
      mountControls()
      movePointerOntoControls("touch")
      await wait(100)

      expect(isRevealed()).toBe(false)
    } finally {
      restore()
    }
  })

  it("sits in a shell that drops it from a presenter preview", () => {
    readUrl("?presenterPreview=1")
    actNow(() =>
      root.render(
        <SlideShellRuntime
          controls={deckControls("/presenter")}
          slide={slides[1]}
          slides={slides}
        >
          <div />
        </SlideShellRuntime>
      )
    )

    const shell = controls().closest("[data-slide-chrome]")

    expect(shell?.getAttribute("data-slide-chrome")).toBe("hidden")
    expect(controls().className).toContain(
      "group-data-[slide-chrome=hidden]/shell:hidden"
    )
  })

  it("still answers the command shortcut while it is hidden", async () => {
    mountControls()

    expect(isRevealed()).toBe(false)

    window.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "k", metaKey: true })
    )

    await vi.waitUntil(isRevealed)
  })

  it("gives a hybrid machine the handle and the pointer reveal", async () => {
    const restore = stubMediaQueries({
      "(any-pointer: coarse)": true,
      "(any-pointer: fine)": true,
    })

    try {
      mountControls()

      expect(handle()).not.toBeNull()

      movePointerOntoControls()
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

      movePointerOntoControls()
      await wait(50)

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
