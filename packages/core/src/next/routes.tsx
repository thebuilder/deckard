import type { Metadata, MetadataRoute } from "next"
import { notFound, redirect } from "next/navigation"
import { PresenterConsole } from "../components/presenter-console"
import { SlideShell } from "../components/slide-shell"
import { getSlideById } from "../deck/resolve-slides"
import { toSlideSummaries, toSlideSummary } from "../deck/slide-summary"
import { toDeckPresentation } from "../deck/theme"
import type { Deck } from "../deck/types"

interface SlideRouteProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    presenterPreview?: string
    step?: string
  }>
}

const defaultSiteUrl = "http://localhost:3000"

function isPdfExport() {
  return process.env.NEXT_PUBLIC_PDF_EXPORT === "1"
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

export function createSlideRoute(deck: Deck) {
  function generateStaticParams() {
    return deck.slides.map((slide) => ({ id: slide.id }))
  }

  async function generateMetadata({
    params,
  }: SlideRouteProps): Promise<Metadata> {
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

  async function Page({ params, searchParams }: SlideRouteProps) {
    const { id } = await params
    const resolvedSearchParams = await searchParams
    const slide = getSlideById(deck.slides, id)

    if (!slide) {
      notFound()
    }

    const isPresenterPreview = resolvedSearchParams.presenterPreview === "1"
    const maxStepIndex = Math.max(slide.stepCount - 1, 0)
    const previewStep = Math.min(
      parseStep(resolvedSearchParams.step),
      maxStepIndex
    )

    const previousSlide = deck.slides[slide.index - 1]
    const nextSlide = deck.slides[slide.index + 1]
    const nextNextSlide = deck.slides[slide.index + 2]
    const prefetch = [previousSlide, nextSlide, nextNextSlide]
      .filter((item) => item !== undefined)
      .map(toSlideSummary)
    const isChromeHidden = isPdfExport() || isPresenterPreview

    return (
      <SlideShell
        background={slide.background}
        deck={toDeckPresentation(deck)}
        footerMode={isChromeHidden ? "hidden" : slide.footer}
        freezeMedia={isPresenterPreview}
        headerMode={isChromeHidden ? "hidden" : slide.header}
        initialStep={previewStep}
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

  return { generateMetadata, generateStaticParams, Page }
}

export function createPresenterPage(deck: Deck) {
  function Page() {
    return <PresenterConsole canvas={deck.canvas} />
  }

  return {
    metadata: { title: "Presenter View" } satisfies Metadata,
    Page,
  }
}

export function createDeckSitemap(
  deck: Deck,
  options: { siteUrl?: string } = {}
) {
  const siteUrl =
    options.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl

  return function sitemap(): MetadataRoute.Sitemap {
    const slideEntries = deck.slides.map((slide) => ({
      url: new URL(slide.href, siteUrl).toString(),
    }))

    return [{ url: new URL("/", siteUrl).toString() }, ...slideEntries]
  }
}

export function createFirstSlideRedirect(deck: Deck) {
  return function Page() {
    redirect(deck.slides[0].href)
  }
}
