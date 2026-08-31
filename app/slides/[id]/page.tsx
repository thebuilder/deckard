import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { slideshowConfig } from "@/app/slideshow-config"
import { SlideShell } from "@/components/slideshow/slide-shell"
import { getAllSlideSlugs, getSlideBySlug, slides } from "../../slides"

interface SlidePageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    presenterPreview?: string
    step?: string
  }>
}

export function generateStaticParams() {
  return getAllSlideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: SlidePageProps): Promise<Metadata> {
  const { slug } = await params
  const slide = getSlideBySlug(slug)

  if (!slide) {
    return {}
  }

  if (slide.title === slideshowConfig.title) {
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
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const slide = getSlideBySlug(slug)

  if (!slide) {
    notFound()
  }

  const isPresenterPreview = resolvedSearchParams.presenterPreview === "1"
  const previewStep = parseStep(resolvedSearchParams.step)

  const index = slides.findIndex((item) => item.slug === slide.slug)
  const previousSlide = slides[index - 1]
  const nextSlide = slides[index + 1]
  const nextNextSlide = slides[index + 2]
  const slideOptions = slides.map((item, itemIndex) => ({
    href: `/slides/${item.slug}`,
    index: itemIndex + 1,
    slug: item.slug,
    title: item.title,
  }))
  const prefetchHrefs = [
    previousSlide ? `/slides/${previousSlide.slug}` : undefined,
    nextSlide ? `/slides/${nextSlide.slug}` : undefined,
    nextNextSlide ? `/slides/${nextNextSlide.slug}` : undefined,
  ].filter((href): href is string => Boolean(href))
  const maxStepIndex = Math.max((slide.stepCount ?? 0) - 1, 0)
  const previewStepClamped = Math.min(previewStep, maxStepIndex)

  return (
    <SlideShell
      background={slide.background}
      current={index + 1}
      currentSlug={slide.slug}
      deckTitle={slideshowConfig.header.brand}
      deckTitleHref={slideshowConfig.header.href}
      footerMode={
        isPdfExport || isPresenterPreview
          ? "hidden"
          : (slide.footer ?? slideshowConfig.footer.mode)
      }
      freezeMedia={isPresenterPreview}
      headerMode={
        isPdfExport || isPresenterPreview
          ? "hidden"
          : (slide.header ?? slideshowConfig.header.mode)
      }
      initialStep={previewStepClamped}
      layout={slide.layout}
      nextHref={nextSlide ? `/slides/${nextSlide.slug}` : undefined}
      nextSlide={
        nextSlide
          ? {
              slug: nextSlide.slug,
              title: nextSlide.title,
            }
          : undefined
      }
      notes={slide.notes}
      prefetchHrefs={prefetchHrefs}
      presenterEnabled={!isPresenterPreview}
      previousHref={previousSlide ? `/slides/${previousSlide.slug}` : undefined}
      readOnly={isPresenterPreview}
      slideOptions={slideOptions}
      slideTitle={slide.title}
      stepCount={slide.stepCount}
      total={slides.length}
    >
      {slide.body}
    </SlideShell>
  )
}
