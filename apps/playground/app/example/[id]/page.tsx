import { createSlideRoute } from "@thebuilder/deckard-core/next"
import { exampleDeck } from "@/deck/example-deck"

const {
  generateMetadata,
  generateStaticParams,
  Page: ExampleSlidePage,
} = createSlideRoute(exampleDeck)

export { generateMetadata, generateStaticParams }
export default ExampleSlidePage
