import type { Deck } from "../deck/types"

/** One `{ id }` per slide: the static params of every route under `slides/[id]`. */
export function slideParams(deck: Deck) {
  return deck.slides.map((slide) => ({ id: slide.id }))
}
