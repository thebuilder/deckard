"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ReactNode, useEffect } from "react"

import type { SlideTheme } from "../deck/types"

// Light/dark only. The deck theme is static config and never switches at runtime.
function ColorModeProvider({
  children,
  theme,
}: {
  children: ReactNode
  theme: SlideTheme
}) {
  const switchable = theme.colorModes.length > 1

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme.defaultColorMode}
      disableTransitionOnChange
      enableSystem={switchable}
    >
      {switchable ? <ColorModeHotkey /> : null}
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ColorModeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ColorModeProvider }
