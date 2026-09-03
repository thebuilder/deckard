"use client"

import { SlideShell } from "@thebuilder/deckard-core/components"
import { type ComponentProps, useMemo } from "react"
import { ThemeSwitchBoundary, useDeckTheme } from "./deck-theme"
import { DeckThemePicker } from "./deck-theme-picker"

type ThemedSlideShellProps = ComponentProps<typeof SlideShell> & {
  /** Off for a PDF build, which renders the theme deck.ts names and no chrome. */
  themeSwitchEnabled: boolean
}

/*
 * A deck has one theme and this does not change that: deck.ts hands the shell
 * its theme, and the playground swaps the value on the way in so a reader can
 * see the same deck under another built-in. Nothing here reaches the deck
 * model, the CLI, or a scaffolded app.
 */
export function ThemedSlideShell({
  children,
  themeSwitchEnabled,
  ...props
}: ThemedSlideShellProps) {
  const deckTheme = props.deck.theme
  const theme = useDeckTheme(deckTheme)
  const deck = useMemo(() => ({ ...props.deck, theme }), [props.deck, theme])

  return (
    <>
      <SlideShell {...props} deck={deck}>
        {children}
      </SlideShell>

      {themeSwitchEnabled ? (
        <>
          <ThemeSwitchBoundary />
          <DeckThemePicker deckTheme={deckTheme} />
        </>
      ) : null}
    </>
  )
}
