"use client"

import type { SlideTheme } from "@thebuilder/deckard-core"
import { Button } from "@thebuilder/deckard-core/ui"
import { cn } from "@thebuilder/deckard-core/utils"
import { ChevronDown } from "lucide-react"
import { type ChangeEvent, useCallback } from "react"
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
 * the slide's own counter. app/globals.css holds the reveal. A phone or a
 * tablet docks the deck controls under the slide, and DeckThemeSelect stands in
 * for this row there.
 */
export function DeckThemePicker({ deckTheme }: { deckTheme: SlideTheme }) {
  const { isFramed, isResolved } = useThemeSwitch()
  const current = useDeckTheme(deckTheme)

  if (!isResolved || isFramed) {
    return null
  }

  return (
    <fieldset
      className="fixed bottom-0 left-0 z-50 flex pointer-coarse:hidden flex-wrap items-center gap-1.5 p-3 sm:p-4"
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

/*
 * The picker for a phone or a tablet, handed to the shell as the controls
 * accessory so it docks in the same row as the deck controls. A native select
 * opens the platform's own list, and its 16px text keeps iOS from zooming the
 * page when it takes focus.
 */
export function DeckThemeSelect({ deckTheme }: { deckTheme: SlideTheme }) {
  const { isFramed, isResolved } = useThemeSwitch()
  const current = useDeckTheme(deckTheme)

  const select = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    selectThemeId(event.target.value)
  }, [])

  if (!isResolved || isFramed) {
    return null
  }

  return (
    <div className="relative pointer-coarse:block hidden">
      <select
        aria-label="Deck theme"
        className="h-7 appearance-none rounded-[min(var(--radius-md),12px)] border border-border/70 bg-background/80 py-0 pr-7 pl-2.5 font-medium text-base text-foreground backdrop-blur-sm"
        onChange={select}
        value={current.id}
      >
        {switchableThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.id}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
