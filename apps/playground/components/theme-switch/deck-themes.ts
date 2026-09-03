import type { SlideTheme } from "@thebuilder/deckard-core"
import { themes } from "@thebuilder/deckard-themes"

/*
 * The playground renders one deck under any built-in, so a reader can answer
 * "what does this look like in ledger" without a second deployment. It is a
 * showcase affordance and it lives here: deck/deck.ts still names one theme,
 * every command the CLI runs still measures that one, and a deck scaffolded
 * with `deckard init` gets none of this.
 *
 * The list is @thebuilder/deckard-themes' own, so a built-in that ships reaches the picker
 * with nothing here to edit. Importing it is also what puts every built-in
 * stylesheet in the bundle: a theme's rules are scoped to its class, so the
 * ones a reader is not looking at cost their CSS and paint nothing.
 *
 * The color mode is the reader's and a theme change leaves it alone. Comparing
 * themes means moving one thing at a time, and every theme and mode stays
 * linkable: `?theme=nexus` in light is a page a reader can reach and send. A
 * theme's own defaultColorMode still decides where the deck opens, which is the
 * theme deck.ts names. A theme listing one color mode pins its canvas to that
 * mode and takes the light/dark toggle away with it, so the reader's mode is
 * untouched underneath and comes back when they switch away.
 */
export const switchableThemes: readonly SlideTheme[] = themes

/** The linkable half. `?theme=<id>` on any slide URL. */
export const themeSearchParam = "theme"

/*
 * The remembered half. Not "theme": next-themes owns that key for light and
 * dark, and the CLI seeds it to pin a capture's color mode.
 */
export const themeStorageKey = "deckard-playground-theme"

export function findSwitchableTheme(id: string | null): SlideTheme | undefined {
  if (id === null) {
    return undefined
  }

  return switchableThemes.find((theme) => theme.id === id)
}

/** An id nothing ships resolves to the theme deck.ts names. */
export function resolveSwitchableTheme(
  id: string | null,
  deckTheme: SlideTheme
): SlideTheme {
  return findSwitchableTheme(id) ?? deckTheme
}
