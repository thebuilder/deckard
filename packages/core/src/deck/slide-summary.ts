import type { ResolvedSlide, SlideSummary } from "./types"

export function toSlideSummary(slide: ResolvedSlide): SlideSummary {
  return {
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
