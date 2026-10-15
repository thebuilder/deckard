"use client"

import type { SlideTheme } from "@thebuilder/deckard-core"
import { Button } from "@thebuilder/deckard-core/ui"
import { cn } from "@thebuilder/deckard-core/utils"
import { useCallback } from "react"
import { useDeckTheme, useThemeSwitch } from "./deck-theme"
import { switchableThemes } from "./deck-themes"
import { selectThemeId } from "./theme-store"

function ThemeButton({
  isCurrent,
  theme,
}: {
  isCurrent: boolean
  theme: SlideTheme
}) {
  const select = useCallback(() => {
    selectThemeId(theme.id)
  }, [theme.id])

  return (
    <Button
      aria-pressed={isCurrent}
      className={cn(
        "font-medium text-xs",
        !isCurrent && "border-border/70 bg-background/80 backdrop-blur-sm"
      )}
      onClick={select}
      size="sm"
      type="button"
      variant={isCurrent ? "default" : "outline"}
    >
      {theme.id}
    </Button>
  )
}

/*
 * Outside the canvas, so it never lands on a slide, in a screenshot, or in the
 * PDF. Bottom left, opposite the deck controls, and revealed with them: the
 * canvas fills the window at 16:9, so a bar parked in the corner would sit on
 * the slide's own counter. app/globals.css holds the reveal. On a touchscreen
 * the controls dock under the slide and stay up, so the picker keeps to one
 * scrolling row that stops short of them.
 */
export function DeckThemePicker({ deckTheme }: { deckTheme: SlideTheme }) {
  const { isFramed, isResolved } = useThemeSwitch()
  const current = useDeckTheme(deckTheme)

  if (!isResolved || isFramed) {
    return null
  }

  return (
    <fieldset
      className="fixed bottom-0 left-0 z-50 flex pointer-coarse:min-w-0 pointer-coarse:max-w-[calc(100%-14rem)] flex-wrap pointer-coarse:flex-nowrap items-center gap-1.5 pointer-coarse:overflow-x-auto p-3 sm:p-4"
      data-deck-theme-picker=""
    >
      <legend className="sr-only">Deck theme</legend>

      {switchableThemes.map((theme) => (
        <ThemeButton
          isCurrent={theme.id === current.id}
          key={theme.id}
          theme={theme}
        />
      ))}
    </fieldset>
  )
}
