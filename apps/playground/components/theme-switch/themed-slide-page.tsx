import {
  type Deck,
  getSlideById,
  isPdfExport,
  toDeckPresentation,
  toSlideSummaries,
  toSlideSummary,
} from "@thebuilder/deckard-core"
import { notFound } from "next/navigation"
import { ThemedSlideShell } from "./themed-slide-shell"

/*
 * A deck built on Deckard re-exports createSlideRoute from its slide route and
 * nothing else. The playground is the showcase, so its two decks render the
 * shell themselves to hand the canvas a theme the reader picked. Each route
 * still takes its metadata and static params from createSlideRoute, so its
 * shape cannot drift from the one `deckard init` writes. Nothing below reads
 * the request: the theme is a query the client reads, so every slide still
 * prerenders.
 */
export async function ThemedSlidePage({
  deck,
  params,
}: {
  deck: Deck
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
      motion={slide.motion}
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
