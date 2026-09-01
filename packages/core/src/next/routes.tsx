import type { Metadata, MetadataRoute } from "next"
import { notFound, redirect } from "next/navigation"
import { PresenterConsole } from "../components/presenter-console"
import { SlideShell } from "../components/slide-shell"
import { isPdfExport } from "../deck/pdf-export"
import { getSlideById } from "../deck/resolve-slides"
import { toSlideSummaries, toSlideSummary } from "../deck/slide-summary"
import { toDeckPresentation } from "../deck/theme"
import type { Deck } from "../deck/types"

interface SlideRouteProps {
  params: Promise<{ id: string }>
}

const defaultSiteUrl = "http://localhost:3000"

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

  // Nothing here reads the request. Presenter preview and step live in the URL
  // query, and SlideShell picks them up on the client, so every slide prerenders.
  async function Page({ params }: SlideRouteProps) {
    const { id } = await params
    const slide = getSlideById(deck.slides, id)

    if (!slide) {
      notFound()
    }

    const previousSlide = deck.slides[slide.index - 1]
    const nextSlide = deck.slides[slide.index + 1]
    const nextNextSlide = deck.slides[slide.index + 2]
    const prefetch = [previousSlide, nextSlide, nextNextSlide]
      .filter((item) => item !== undefined)
      .map(toSlideSummary)
    const isChromeHidden = isPdfExport()

    return (
      <SlideShell
        background={slide.background}
        deck={toDeckPresentation(deck)}
        footerMode={isChromeHidden ? "hidden" : slide.footer}
        headerMode={isChromeHidden ? "hidden" : slide.header}
        layout={slide.layout}
        next={nextSlide ? toSlideSummary(nextSlide) : undefined}
        notes={slide.notes}
        prefetch={prefetch}
        previous={previousSlide ? toSlideSummary(previousSlide) : undefined}
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
