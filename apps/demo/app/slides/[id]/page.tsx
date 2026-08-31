import {
  getSlideById,
  toDeckPresentation,
  toSlideSummaries,
  toSlideSummary,
} from "@deckard/core"
import { SlideShell } from "@deckard/core/components"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { deck } from "@/deck/deck"

interface SlidePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ presenterPreview?: string; step?: string }>
}

export function generateStaticParams() {
  return deck.slides.map((slide) => ({ id: slide.id }))
}

export async function generateMetadata({
  params,
}: SlidePageProps): Promise<Metadata> {
  const { id } = await params
  const slide = getSlideById(deck.slides, id)

  if (!slide) {
    return {}
  }

  return slide.title === deck.title
    ? { title: { absolute: slide.title } }
    : { title: slide.title }
}

function parseStep(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10)

  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed
}

export default async function SlidePage({
  params,
  searchParams,
}: SlidePageProps) {
  const isPdfExport = process.env.NEXT_PUBLIC_PDF_EXPORT === "1"
  const { id } = await params
  const query = await searchParams
  const slide = getSlideById(deck.slides, id)

  if (!slide) {
    notFound()
  }

  const isPresenterPreview = query.presenterPreview === "1"
  const isChromeHidden = isPdfExport || isPresenterPreview
  const previous = deck.slides[slide.index - 1]
  const next = deck.slides[slide.index + 1]
  const prefetch = [previous, next, deck.slides[slide.index + 2]]
    .filter((item) => item !== undefined)
    .map(toSlideSummary)

  return (
    <SlideShell
      background={slide.background}
      deck={toDeckPresentation(deck)}
      footerMode={isChromeHidden ? "hidden" : slide.footer}
      freezeMedia={isPresenterPreview}
      headerMode={isChromeHidden ? "hidden" : slide.header}
      initialStep={Math.min(
        parseStep(query.step),
        Math.max(slide.stepCount - 1, 0)
      )}
      layout={slide.layout}
      next={next ? toSlideSummary(next) : undefined}
      notes={slide.notes}
      prefetch={prefetch}
      presenterEnabled={!isPresenterPreview}
      previous={previous ? toSlideSummary(previous) : undefined}
      readOnly={isPresenterPreview}
      slide={toSlideSummary(slide)}
      slides={toSlideSummaries(deck.slides)}
    >
      {slide.body}
    </SlideShell>
  )
}
