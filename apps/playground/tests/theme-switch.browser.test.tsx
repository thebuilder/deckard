import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { DeckThemePicker } from "@/components/theme-switch/deck-theme-picker"
import {
  switchableThemes,
  themeStorageKey,
} from "@/components/theme-switch/deck-themes"
import {
  getThemeSwitchState,
  publishThemeSwitch,
  resolveThemeId,
} from "@/components/theme-switch/theme-store"

import "@/app/globals.css"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

// The deck's own theme, standing in for what deck.ts names. The picker is
// handed it as a prop, so the test does not have to load the deck.
const [deckTheme] = switchableThemes
const otherTheme = switchableThemes.at(-1) ?? deckTheme

let container: HTMLDivElement
let root: Root

function resolved(state: Partial<ReturnType<typeof getThemeSwitchState>> = {}) {
  act(() => {
    publishThemeSwitch({
      isPresenterPreview: false,
      isResolved: true,
      themeId: null,
      ...state,
    })
  })
}

function renderPicker() {
  act(() => {
    root.render(<DeckThemePicker deckTheme={deckTheme} />)
  })
}

function themeButtons() {
  return [
    ...container.querySelectorAll<HTMLButtonElement>(
      "[data-deck-theme-picker] button"
    ),
  ]
}

beforeEach(() => {
  window.localStorage.removeItem(themeStorageKey)
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)

  act(() => {
    publishThemeSwitch({
      isPresenterPreview: false,
      isResolved: false,
      themeId: null,
    })
  })
})

afterEach(() => {
  act(() => {
    root.unmount()
  })

  container.remove()
})

describe("resolveThemeId", () => {
  it("prefers the URL, so a shared link shows what the sender saw", () => {
    window.localStorage.setItem(themeStorageKey, otherTheme.id)

    expect(resolveThemeId(deckTheme.id)).toBe(deckTheme.id)
  })

  it("falls back to the stored choice when the URL names none", () => {
    window.localStorage.setItem(themeStorageKey, otherTheme.id)

    expect(resolveThemeId(null)).toBe(otherTheme.id)
  })

  it("ignores an id nothing ships", () => {
    expect(resolveThemeId("not-a-theme")).toBeNull()
  })
})

describe("DeckThemePicker", () => {
  it("waits for the URL rather than guessing a theme", () => {
    renderPicker()

    expect(container.querySelector("[data-deck-theme-picker]")).toBeNull()
  })

  it("offers every built-in and names the group", () => {
    resolved()
    renderPicker()

    const group = container.querySelector("[data-deck-theme-picker]")

    expect(group?.querySelector("legend")?.textContent).toBe("Deck theme")
    expect(themeButtons().map((button) => button.textContent)).toEqual(
      switchableThemes.map((theme) => theme.id)
    )
  })

  it("marks the deck's own theme until something else is chosen", () => {
    resolved()
    renderPicker()

    const pressed = themeButtons().filter(
      (button) => button.getAttribute("aria-pressed") === "true"
    )

    expect(pressed.map((button) => button.textContent)).toEqual([deckTheme.id])
  })

  it("publishes the theme it was asked for", () => {
    resolved()
    renderPicker()

    const button = themeButtons().find(
      (candidate) => candidate.textContent === otherTheme.id
    )

    act(() => {
      button?.click()
    })

    expect(getThemeSwitchState().themeId).toBe(otherTheme.id)
    expect(button?.getAttribute("aria-pressed")).toBe("true")
  })

  it("stays out of a presenter preview, which carries the deck and no chrome", () => {
    resolved({ isPresenterPreview: true })
    renderPicker()

    expect(container.querySelector("[data-deck-theme-picker]")).toBeNull()
  })
})
