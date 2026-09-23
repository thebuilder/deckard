"use client"

import type { SlideTheme } from "@thebuilder/deckard-core"
import { usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Suspense, useEffect, useRef, useSyncExternalStore } from "react"
import {
  findSwitchableTheme,
  modeSearchParam,
  resolveSwitchableTheme,
  themeSearchParam,
} from "./deck-themes"
import {
  getServerThemeSwitchState,
  getThemeSwitchState,
  publishThemeSwitch,
  resolveThemeId,
  selectThemeId,
  subscribeToThemeSwitch,
  writeStoredThemeId,
} from "./theme-store"

export function useThemeSwitch() {
  return useSyncExternalStore(
    subscribeToThemeSwitch,
    getThemeSwitchState,
    getServerThemeSwitchState
  )
}

/** The theme the canvas renders: the chosen one, or the one deck.ts names. */
export function useDeckTheme(deckTheme: SlideTheme): SlideTheme {
  return resolveSwitchableTheme(useThemeSwitch().themeId, deckTheme)
}

function readColorMode(value: unknown) {
  return value === "light" || value === "dark" ? value : null
}

/*
 * The docs site frames the deck and drives it from outside: a theme and a color
 * mode, posted as `{ type: "deckard:view", theme?, mode? }`. Both are choices a
 * reader can already make inside the deck, so any origin may send them, and a
 * value nothing ships is ignored.
 */
function useViewMessages(setColorMode: (mode: string) => void) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data: unknown = event.data

      if (
        typeof data !== "object" ||
        data === null ||
        !("type" in data) ||
        data.type !== "deckard:view"
      ) {
        return
      }

      const theme =
        "theme" in data ? findSwitchableTheme(String(data.theme)) : undefined
      const mode = "mode" in data ? readColorMode(data.mode) : null

      if (theme) {
        selectThemeId(theme.id)
      }

      if (mode) {
        setColorMode(mode)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [setColorMode])
}

function ThemeSwitchReader() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const requested = searchParams.get(themeSearchParam)
  const requestedMode = readColorMode(searchParams.get(modeSearchParam))
  const { isFramed, themeId } = useThemeSwitch()
  const { setTheme: setColorMode } = useTheme()

  useViewMessages(setColorMode)

  useEffect(() => {
    publishThemeSwitch({
      // Read from the window rather than the URL, so a shared link to a slide
      // still shows the picker.
      isFramed: window.self !== window.top,
      isResolved: true,
      themeId: resolveThemeId(requested),
    })
  }, [requested])

  // `?mode=dark` opens the deck in that mode. It goes through next-themes like
  // the toggle does, so the choice carries on to the next slide. It applies
  // once per value, so a later toggle is not put back by the address bar.
  const appliedMode = useRef<string | null>(null)

  useEffect(() => {
    if (requestedMode && appliedMode.current !== requestedMode) {
      appliedMode.current = requestedMode
      setColorMode(requestedMode)
    }
  }, [requestedMode, setColorMode])

  useEffect(() => {
    if (themeId === null) {
      return
    }

    writeStoredThemeId(themeId)
  }, [themeId])

  // Navigating to the next slide drops the query, so the address bar stops
  // saying what the window is showing. Put it back, without a navigation: a
  // shared link has to work from whichever slide the sender was on. A framed
  // deck has no address bar to keep, so it skips this.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the stamp has to run again on the slide the reader walked to
  useEffect(() => {
    if (themeId === null || isFramed) {
      return
    }

    const url = new URL(window.location.href)

    if (url.searchParams.get(themeSearchParam) === themeId) {
      return
    }

    url.searchParams.set(themeSearchParam, themeId)
    window.history.replaceState(null, "", url)
  }, [isFramed, pathname, themeId])

  return null
}

/*
 * useSearchParams suspends, and the slide route prerenders. The boundary keeps
 * the bail-out here instead of taking the slide out of the static shell with it.
 */
export function ThemeSwitchBoundary() {
  return (
    <Suspense fallback={null}>
      <ThemeSwitchReader />
    </Suspense>
  )
}
