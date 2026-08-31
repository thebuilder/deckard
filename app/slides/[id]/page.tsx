import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SlideShell } from "@/components/slideshow/slide-shell"
import { deck } from "@/deck/deck"
import { getSlideById } from "@/lib/deck/resolve-slides"

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
  const slideOptions = deck.slides.map((item) => ({
    href: item.href,
    id: item.id,
    index: item.number,
    title: item.title,
  }))
  const prefetchHrefs = [previousSlide, nextSlide, nextNextSlide]
    .filter((item) => item !== undefined)
    .map((item) => item.href)
  const maxStepIndex = Math.max(slide.stepCount - 1, 0)
  const previewStepClamped = Math.min(previewStep, maxStepIndex)
  const isChromeHidden = isPdfExport || isPresenterPreview

  return (
    <SlideShell
      background={slide.background}
      current={slide.number}
      currentId={slide.id}
      deckTitle={deck.header.brand}
      deckTitleHref={deck.header.href}
      footerMode={isChromeHidden ? "hidden" : slide.footer}
      freezeMedia={isPresenterPreview}
      headerMode={isChromeHidden ? "hidden" : slide.header}
      initialStep={previewStepClamped}
      layout={slide.layout}
      nextHref={nextSlide?.href}
      nextSlide={
        nextSlide
          ? {
              id: nextSlide.id,
              title: nextSlide.title,
            }
          : undefined
      }
      notes={slide.notes}
      prefetchHrefs={prefetchHrefs}
      presenterEnabled={!isPresenterPreview}
      previousHref={previousSlide?.href}
      readOnly={isPresenterPreview}
      slideOptions={slideOptions}
      slideTitle={slide.title}
      stepCount={slide.stepCount}
      total={deck.slides.length}
    >
      {slide.body}
    </SlideShell>
  )
}
