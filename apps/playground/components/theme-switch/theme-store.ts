"use client"

import { findSwitchableTheme, themeStorageKey } from "./deck-themes"

export interface ThemeSwitchState {
  /** Set inside a presenter preview iframe, which carries the deck and no chrome. */
  isPresenterPreview: boolean
  /** True once the URL has been read, so the picker can wait rather than guess. */
  isResolved: boolean
  /** Null until something chooses. The deck's own theme answers for it. */
  themeId: string | null
}

// A module store rather than context, the way @deckard/core reads step and
// presenterPreview: the reader has to sit under a Suspense boundary, and
// everything that reads the choice sits above one.
const initialState: ThemeSwitchState = {
  isPresenterPreview: false,
  isResolved: false,
  themeId: null,
}

let state = initialState
const listeners = new Set<() => void>()

export function subscribeToThemeSwitch(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getThemeSwitchState() {
  return state
}

export function getServerThemeSwitchState() {
  return initialState
}

export function publishThemeSwitch(next: ThemeSwitchState) {
  if (
    next.isPresenterPreview === state.isPresenterPreview &&
    next.isResolved === state.isResolved &&
    next.themeId === state.themeId
  ) {
    return
  }

  state = next

  for (const listener of listeners) {
    listener()
  }
}

export function selectThemeId(themeId: string) {
  publishThemeSwitch({ ...state, themeId })
}

/*
 * A second window on the same deck reads this, which is how the presenter
 * previews follow the theme without a message of their own. Private browsing
 * and a blocked store both throw, and a deck that cannot remember the choice
 * still switches.
 */
export function readStoredThemeId(): string | null {
  try {
    const stored = window.localStorage.getItem(themeStorageKey)

    return findSwitchableTheme(stored)?.id ?? null
  } catch {
    return null
  }
}

/*
 * The URL wins over the store, so a link shows the reader what the sender saw,
 * and the store answers every slide the reader walks to afterwards. An id
 * nothing ships is not a choice, so it falls through to the stored one.
 */
export function resolveThemeId(requested: string | null): string | null {
  return findSwitchableTheme(requested)?.id ?? readStoredThemeId()
}

export function writeStoredThemeId(themeId: string) {
  try {
    window.localStorage.setItem(themeStorageKey, themeId)
  } catch {
    // Nothing to do. The choice still holds for this window.
  }
}
