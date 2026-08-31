"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"

const noop = () => undefined
const emptySubscribe = () => noop

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

function getColorModeLabel(hasHydrated: boolean, isDark: boolean) {
  if (!hasHydrated) {
    return "Toggle color mode"
  }

  return isDark ? "Switch to light mode" : "Switch to dark mode"
}

export function SlideshowColorModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hasHydrated = useHasHydrated()
  const isDark = resolvedTheme === "dark"

  const toggleColorMode = useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <Button
      aria-label={getColorModeLabel(hasHydrated, isDark)}
      className="border-border/70 bg-background/80 backdrop-blur-sm"
      onClick={toggleColorMode}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}
