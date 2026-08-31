import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SlideShell } from "@/components/slideshow/slide-shell"
import { deck } from "@/deck/deck"
import { getSlideById } from "@/lib/deck/resolve-slides"
import { toSlideSummaries, toSlideSummary } from "@/lib/deck/slide-summary"
import { toDeckPresentation } from "@/lib/deck/theme"

interface SlidePageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    presenterPreview?: string
    step?: string
  }>
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

  if (slide.title === deck.title) {
    return {
      title: {
        absolute: slide.title,
      },
    }
  }

  return {
    title: slide.title,
  }
}

function parseStep(value: string | undefined) {
  if (!value) {
    return 0
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export default async function SlidePage({
  params,
  searchParams,
}: SlidePageProps) {
  const isPdfExport = process.env.NEXT_PUBLIC_PDF_EXPORT === "1"
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const slide = getSlideById(deck.slides, id)

  if (!slide) {
    notFound()
  }

  const isPresenterPreview = resolvedSearchParams.presenterPreview === "1"
  const previewStep = parseStep(resolvedSearchParams.step)

  const previousSlide = deck.slides[slide.index - 1]
  const nextSlide = deck.slides[slide.index + 1]
  const nextNextSlide = deck.slides[slide.index + 2]
  const prefetch = [previousSlide, nextSlide, nextNextSlide]
    .filter((item) => item !== undefined)
    .map(toSlideSummary)
  const maxStepIndex = Math.max(slide.stepCount - 1, 0)
  const previewStepClamped = Math.min(previewStep, maxStepIndex)
  const isChromeHidden = isPdfExport || isPresenterPreview

  return (
    <SlideShell
      background={slide.background}
      deck={toDeckPresentation(deck)}
      footerMode={isChromeHidden ? "hidden" : slide.footer}
      freezeMedia={isPresenterPreview}
      headerMode={isChromeHidden ? "hidden" : slide.header}
      initialStep={previewStepClamped}
      layout={slide.layout}
      next={nextSlide ? toSlideSummary(nextSlide) : undefined}
      notes={slide.notes}
      prefetch={prefetch}
      presenterEnabled={!isPresenterPreview}
      previous={previousSlide ? toSlideSummary(previousSlide) : undefined}
      readOnly={isPresenterPreview}
      slide={toSlideSummary(slide)}
      slides={toSlideSummaries(deck.slides)}
    >
      {slide.body}
    </SlideShell>
  )
}
