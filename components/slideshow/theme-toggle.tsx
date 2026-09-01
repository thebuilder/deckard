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

function getToggleLabel(hasHydrated: boolean, isDark: boolean) {
  if (!hasHydrated) {
    return "Toggle theme"
  }

  return isDark ? "Switch to light mode" : "Switch to dark mode"
}

export function SlideshowThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hasHydrated = useHasHydrated()
  const isDark = resolvedTheme === "dark"

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <Button
      aria-label={getToggleLabel(hasHydrated, isDark)}
      className="border-border/70 bg-background/80 backdrop-blur-sm"
      onClick={toggleTheme}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}
