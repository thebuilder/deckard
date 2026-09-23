import process from "node:process"

import type { PreviewColorMode } from "./slide-previews"

/*
 * The deployed playground, which hosts the example deck and the feature deck.
 * DECKARD_PLAYGROUND_URL points the docs at another one, a local `pnpm dev` on
 * :3000 above all, so the embedded decks show work that is not deployed yet.
 */
export const playgroundUrl = (
  process.env.DECKARD_PLAYGROUND_URL ??
  "https://deckard-playground.thebuilder.dk"
).replace(/\/+$/, "")

export const playgroundOrigin = new URL(playgroundUrl).origin

export interface PlaygroundView {
  mode?: PreviewColorMode
  theme?: string
}

/** A playground path with the theme and color mode the reader should land on. */
export function playgroundHref(pathname: string, view: PlaygroundView = {}) {
  const url = new URL(pathname, `${playgroundUrl}/`)

  if (view.theme) {
    url.searchParams.set("theme", view.theme)
  }

  if (view.mode) {
    url.searchParams.set("mode", view.mode)
  }

  return url.toString()
}
