import { createSlideRoute } from "@thebuilder/deckard-core/next"
import { ThemedSlidePage } from "@/components/theme-switch/themed-slide-page"
import { exampleDeck } from "@/deck/example-deck"

const { generateMetadata, generateStaticParams } = createSlideRoute(exampleDeck)

export { generateMetadata, generateStaticParams }

export default function ExampleSlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <ThemedSlidePage deck={exampleDeck} params={params} />
}
