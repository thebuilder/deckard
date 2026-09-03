"use client"

import type { SlideTheme } from "@thebuilder/deckard-core"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useSyncExternalStore } from "react"
import { resolveSwitchableTheme, themeSearchParam } from "./deck-themes"
import {
  getServerThemeSwitchState,
  getThemeSwitchState,
  publishThemeSwitch,
  resolveThemeId,
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

function ThemeSwitchReader() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const requested = searchParams.get(themeSearchParam)
  const isPresenterPreview = searchParams.get("presenterPreview") === "1"
  const { themeId } = useThemeSwitch()

  useEffect(() => {
    publishThemeSwitch({
      isPresenterPreview,
      isResolved: true,
      themeId: resolveThemeId(requested),
    })
  }, [isPresenterPreview, requested])

  useEffect(() => {
    if (themeId === null) {
      return
    }

    writeStoredThemeId(themeId)
  }, [themeId])

  // Navigating to the next slide drops the query, so the address bar stops
  // saying what the window is showing. Put it back, without a navigation: a
  // shared link has to work from whichever slide the sender was on. The
  // presenter previews are iframes nobody copies a URL out of, so they skip it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the stamp has to run again on the slide the reader walked to
  useEffect(() => {
    if (themeId === null || isPresenterPreview) {
      return
    }

    const url = new URL(window.location.href)

    if (url.searchParams.get(themeSearchParam) === themeId) {
      return
    }

    url.searchParams.set(themeSearchParam, themeId)
    window.history.replaceState(null, "", url)
  }, [isPresenterPreview, pathname, themeId])

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
