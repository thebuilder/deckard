import {
  getSlideById,
  toDeckPresentation,
  toSlideSummaries,
  toSlideSummary,
} from "@deckard/core"
import { SlideShell } from "@deckard/core/components"
import { notFound } from "next/navigation"

import { deck } from "../../../deck/deck"

export function generateStaticParams() {
  return deck.slides.map((slide) => ({ id: slide.id }))
}

export default async function SlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const slide = getSlideById(deck.slides, id)

  if (!slide) {
    notFound()
  }

  const previous = deck.slides[slide.index - 1]
  const next = deck.slides[slide.index + 1]

  return (
    <SlideShell
      background={slide.background}
      deck={toDeckPresentation(deck)}
      footerMode={slide.footer}
      headerMode={slide.header}
      layout={slide.layout}
      next={next ? toSlideSummary(next) : undefined}
      notes={slide.notes}
      previous={previous ? toSlideSummary(previous) : undefined}
      slide={toSlideSummary(slide)}
      slides={toSlideSummaries(deck.slides)}
    >
      {slide.body}
    </SlideShell>
  )
}
