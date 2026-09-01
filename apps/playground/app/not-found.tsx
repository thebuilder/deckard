import {
  type SlideSummary,
  toDeckPresentation,
  toSlideSummaries,
} from "@deckard/core"
import { SlideShell } from "@deckard/core/components"
import Link from "next/link"
import { Eyebrow } from "@/app/slides/blocks/typography"
import { deck } from "@/deck/deck"

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
      deck={toDeckPresentation(deck)}
      footerMode="hidden"
      headerMode={deck.header.mode}
      layout="default"
      presenterEnabled={false}
      slide={notFoundSlide}
      slides={toSlideSummaries(deck.slides)}
    >
      <section className="flex h-full items-center py-12">
        <div className="space-y-[var(--slide-content-gap)]">
          <Eyebrow>Page not found</Eyebrow>
          <h1 className="max-w-4xl text-pretty font-semibold text-[length:var(--slide-heading-size)] tracking-tight">
            We couldn&apos;t find that slide.
          </h1>
          <p className="max-w-2xl text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.6]">
            The link may be old, or the URL may be incorrect. Start from the
            first slide and navigate from there.
          </p>
          <div>
            <Link
              className="inline-flex rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface)] px-4 py-2 font-medium text-[length:var(--slide-support-size)] hover:bg-muted"
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
