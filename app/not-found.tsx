import Link from "next/link"
import { SlideShell } from "@/components/slideshow/slide-shell"
import { deck } from "@/deck/deck"
import { toSlideSummaries } from "@/lib/deck/slide-summary"
import type { SlideSummary } from "@/lib/deck/types"

const notFoundSlide: SlideSummary = {
  href: "/slides/not-found",
  id: "not-found",
  number: 1,
  stepCount: 0,
  title: "Page not found",
}

export default function SlidesNotFoundPage() {
  return (
    <SlideShell
      deckTitle={deck.header.brand}
      deckTitleHref={deck.header.href}
      footerMode="hidden"
      headerMode={deck.header.mode}
      layout="default"
      presenterEnabled={false}
      slide={notFoundSlide}
      slides={toSlideSummaries(deck.slides)}
    >
      <section className="flex min-h-[calc(100svh-16rem)] items-center py-8 sm:py-12">
        <div className="space-y-6">
          <p className="font-semibold text-primary text-sm uppercase tracking-[0.3em]">
            Page not found
          </p>
          <h1 className="max-w-4xl text-pretty font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            We couldn&apos;t find that slide.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg">
            The link may be old, or the URL may be incorrect. Start from the
            first slide and navigate from there.
          </p>
          <div>
            <Link
              className="inline-flex rounded-md border border-border/70 bg-card px-4 py-2 font-medium text-sm hover:bg-muted"
              href="/"
            >
              Go to first slide
            </Link>
          </div>
        </div>
      </section>
    </SlideShell>
  )
}
