import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { SlideColorMode, SlideTheme } from "../deck/types"
import { ColorModeProvider } from "./color-mode-provider"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const colorModes: SlideColorMode[] = ["light", "dark"]
const defaultColorModes: SlideTheme["defaultColorMode"][] = [
  "light",
  "dark",
  "system",
]

let container: HTMLDivElement
let root: Root

function themeDefaulting(
  defaultColorMode: SlideTheme["defaultColorMode"]
): SlideTheme {
  return {
    className: "test-theme",
    colorModes,
    defaultColorMode,
    id: `test-${defaultColorMode}`,
  }
}

function appliedColorMode(): SlideColorMode | undefined {
  return colorModes.find((mode) =>
    document.documentElement.classList.contains(mode)
  )
}

function renderProvider(
  theme: SlideTheme,
  forcedColorMode?: SlideColorMode
): SlideColorMode | undefined {
  act(() => {
    root.render(
      <ColorModeProvider forcedColorMode={forcedColorMode} theme={theme}>
        <div />
      </ColorModeProvider>
    )
  })

  return appliedColorMode()
}

beforeEach(() => {
  window.localStorage.clear()
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  document.documentElement.classList.remove(...colorModes)
  document.documentElement.style.colorScheme = ""
  window.localStorage.clear()
})

describe("ColorModeProvider", () => {
  for (const defaultColorMode of defaultColorModes) {
    for (const forcedColorMode of colorModes) {
      it(`renders ${forcedColorMode} when a theme defaulting to ${defaultColorMode} is forced to it`, () => {
        expect(
          renderProvider(themeDefaulting(defaultColorMode), forcedColorMode)
        ).toBe(forcedColorMode)
      })
    }
  }

  // The regression behind --light and the light PDF export: the theme default
  // answers before the operating system preference does, so a deck that defaults
  // to dark renders dark until something forces the mode the run asked for.
  it("lets a dark default decide when nothing forces a mode", () => {
    expect(renderProvider(themeDefaulting("dark"))).toBe("dark")
  })

  it("lets a light default decide when nothing forces a mode", () => {
    expect(renderProvider(themeDefaulting("light"))).toBe("light")
  })
})
