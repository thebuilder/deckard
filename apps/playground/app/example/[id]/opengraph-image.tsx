import { createSlideShareCard } from "@thebuilder/deckard-core/share-card"
import { exampleDeck } from "@/deck/example-deck"

const { Image, alt, contentType, generateStaticParams, size } =
  createSlideShareCard(exampleDeck)

export { alt, contentType, generateStaticParams, size }
export default Image
