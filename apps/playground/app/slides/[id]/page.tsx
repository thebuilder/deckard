import {
  getSlideById,
  isPdfExport,
  toDeckPresentation,
  toSlideSummaries,
  toSlideSummary,
} from "@deckard/core"
import { createSlideRoute } from "@deckard/core/next"
import { notFound } from "next/navigation"
import { ThemedSlideShell } from "@/components/theme-switch/themed-slide-shell"
import { deck } from "@/deck/deck"

/*
 * A deck built on Deckard re-exports createSlideRoute here and nothing else.
 * The playground is the showcase, so it renders the shell itself to hand the
 * canvas a theme the reader picked. Metadata and the static params still come
 * from core, so the route's shape cannot drift from the one `deckard init`
 * writes. Nothing below reads the request: the theme is a query the client
 * reads, so every slide still prerenders.
 */
const { generateMetadata, generateStaticParams } = createSlideRoute(deck)

export { generateMetadata, generateStaticParams }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const slide = getSlideById(deck.slides, id)

  if (!slide) {
    notFound()
  }

  const previousSlide = deck.slides[slide.index - 1]
  const nextSlide = deck.slides[slide.index + 1]
  const prefetch = [previousSlide, nextSlide, deck.slides[slide.index + 2]]
    .filter((item) => item !== undefined)
    .map(toSlideSummary)

  return (
    <ThemedSlideShell
      background={slide.background}
      controlsHidden={isPdfExport()}
      deck={toDeckPresentation(deck)}
      footerMode={slide.footer}
      headerMode={slide.header}
      layout={slide.layout}
      next={nextSlide ? toSlideSummary(nextSlide) : undefined}
      notes={slide.notes}
      prefetch={prefetch}
      previous={previousSlide ? toSlideSummary(previousSlide) : undefined}
      slide={toSlideSummary(slide)}
      slides={toSlideSummaries(deck.slides)}
      themeSwitchEnabled={!isPdfExport()}
    >
      {slide.body}
    </ThemedSlideShell>
  )
}
