import { createSlideShareCard } from "@thebuilder/deckard-core/share-card"
import { deck } from "@/deck/deck"

const { Image, alt, contentType, generateStaticParams, size } =
  createSlideShareCard(deck)

export { alt, contentType, generateStaticParams, size }
export default Image
