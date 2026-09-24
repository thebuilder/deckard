import { playgroundHref } from "./playground"
import type { SlidePreviewRoute } from "./slide-previews"

export type PatternGroup =
  | "Open and divide"
  | "Explain and argue"
  | "Show numbers and plans"
  | "Show evidence"

export interface SlidePattern {
  /* What the author writes, frame first. */
  component: string
  group: PatternGroup
  href: string
  name: string
  previewRoute: SlidePreviewRoute & `/slides/${string}`
  use: string
}

function pattern(item: Omit<SlidePattern, "href">): SlidePattern {
  return { ...item, href: playgroundHref(item.previewRoute) }
}

/*
 * The patterns the docs show as pictures. The intent table on the slide
 * patterns page covers every block; this is the set with a slide in the
 * feature deck to photograph.
 */
export const slidePatterns: SlidePattern[] = [
  pattern({
    component: "HeroSlide",
    group: "Open and divide",
    name: "Opener",
    previewRoute: "/slides/intro",
    use: "One title and one line that need the whole room.",
  }),
  pattern({
    component: "BreakerSlide",
    group: "Open and divide",
    name: "Section break",
    previewRoute: "/slides/canvas",
    use: "Reset the room before the next part of the argument.",
  }),
  pattern({
    component: "OpenContentSlide + BulletList",
    group: "Explain and argue",
    name: "Numbered argument",
    previewRoute: "/slides/presenter",
    use: "Ordered points, each worth a full sentence.",
  }),
  pattern({
    component: "ContentSlideCard",
    group: "Explain and argue",
    name: "Framed explanation",
    previewRoute: "/slides/content-card",
    use: "Flat prose or a definition in one clear frame.",
  }),
  pattern({
    component: "OpenContentSlide + CardGrid",
    group: "Explain and argue",
    name: "Option comparison",
    previewRoute: "/slides/one-surface",
    use: "Alternatives, each with a name and a short explanation.",
  }),
  pattern({
    component: "OpenContentSlide + StatGrid",
    group: "Show numbers and plans",
    name: "Key figures",
    previewRoute: "/slides/numbers",
    use: "A small set of numbers that carries the argument.",
  }),
  pattern({
    component: "OpenContentSlide + Timeline",
    group: "Show numbers and plans",
    name: "Roadmap",
    previewRoute: "/slides/roadmap",
    use: "Dates and sequence, when order matters more than duration.",
  }),
  pattern({
    component: "QuoteSlide",
    group: "Show evidence",
    name: "Pull quote",
    previewRoute: "/slides/quote",
    use: "Someone else's sentence is the evidence.",
  }),
  pattern({
    component: "ImageShowcaseSlide",
    group: "Show evidence",
    name: "Image and context",
    previewRoute: "/slides/image",
    use: "An image that needs context beside it, not text on top.",
  }),
]

export const patternGroups = [
  ...new Set(slidePatterns.map((item) => item.group)),
] as PatternGroup[]
