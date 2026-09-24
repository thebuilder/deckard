import { createSlideShareCard } from "@thebuilder/deckard-core/next"
import { deck } from "@/deck/deck"

const { Image, alt, contentType, generateStaticParams, size } =
  createSlideShareCard(deck)

export { alt, contentType, generateStaticParams, size }
export default Image
