import { createSlideRoute } from "@thebuilder/deckard-core/next"
import { ThemedSlidePage } from "@/components/theme-switch/themed-slide-page"
import { deck } from "@/deck/deck"

const { generateMetadata, generateStaticParams } = createSlideRoute(deck)

export { generateMetadata, generateStaticParams }

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ThemedSlidePage deck={deck} params={params} />
}
