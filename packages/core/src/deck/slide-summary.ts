import type { ResolvedSlide, SlideSummary } from "./types"

export function toSlideSummary(slide: ResolvedSlide): SlideSummary {
  return {
    authoredTitle: slide.authoredTitle,
    counted: slide.counted,
    countedNumber: slide.countedNumber,
    countedTotal: slide.countedTotal,
    href: slide.href,
    id: slide.id,
    number: slide.number,
    stepCount: slide.stepCount,
    title: slide.title,
  }
}

export function toSlideSummaries(slides: ResolvedSlide[]): SlideSummary[] {
  return slides.map(toSlideSummary)
}

// What a slide list prints beside a title. An uncounted slide has no number of
// its own, and repeating its neighbour's would read as a duplicate.
export function slideCountLabel(
  slide: Pick<SlideSummary, "counted" | "countedNumber" | "number">,
  width = 1
): string {
  if (slide.counted === false) {
    return "·"
  }

  return String(slide.countedNumber ?? slide.number).padStart(width, "0")
}
