import type { Metadata, MetadataRoute } from "next"
import { notFound, redirect } from "next/navigation"
import { PresenterConsole } from "../components/presenter-console"
import { SlideShell } from "../components/slide-shell"
import { isPdfExport } from "../deck/pdf-export"
import { getSlideById } from "../deck/resolve-slides"
import { deckSiteUrl } from "../deck/site-url"
import { toSlideSummaries, toSlideSummary } from "../deck/slide-summary"
import { toDeckPresentation } from "../deck/theme"
import type { Deck } from "../deck/types"
import { renderSlideShareCard } from "./share-card"
import { shareCardAlt, shareCardSize } from "./share-card-layout"

interface SlideRouteProps {
  params: Promise<{ id: string }>
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

    // The share card beside this page links as og:image, which has to be an
    // absolute URL, so it resolves against the same origin as the sitemap.
    const shared = {
      metadataBase: new URL(deckSiteUrl()),
      twitter: { card: "summary_large_image" },
    } satisfies Metadata

    if (slide.title === deck.title) {
      return {
        ...shared,
        title: {
          absolute: slide.title,
        },
      }
    }

    return {
      ...shared,
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
    return (
      <SlideShell
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
      >
        {slide.body}
      </SlideShell>
    )
  }

  return { generateMetadata, generateStaticParams, Page }
}

/**
 * The pieces an `app/slides/[id]/opengraph-image.tsx` route re-exports: one
 * designed card per slide, prerendered at build time.
 */
export function createSlideShareCard(deck: Deck) {
  // An image route is a route handler, which takes no params from the page
  // beside it, so it lists the slide ids itself.
  function generateStaticParams() {
    return deck.slides.map((slide) => ({ id: slide.id }))
  }

  async function Image({ params }: SlideRouteProps) {
    const { id } = await params
    const response = await renderSlideShareCard(deck, id)

    return response ?? new Response("Not found", { status: 404 })
  }

  return {
    // One alt for every card: generateImageMetadata would give each its own,
    // but it moves the card under a second dynamic segment that the build does
    // not prerender.
    alt: shareCardAlt(deck),
    contentType: "image/png",
    generateStaticParams,
    Image,
    size: shareCardSize,
  }
}

export function createPresenterPage(deck: Deck) {
  function Page() {
    return (
      <PresenterConsole canvas={deck.canvas} slidesPath={deck.routes.slides} />
    )
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
  const siteUrl = deckSiteUrl(options.siteUrl)

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
