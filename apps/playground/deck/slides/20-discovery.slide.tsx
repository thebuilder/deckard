import type { SlideMeta } from "@deckard/core"
import { FeatureGrid } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  order: 1,
  slug: "discovery",
  title: "Discovery",
}

export const notes = `Show the file tree next to this slide. The three slides after the spread are files in deck/slides, and the array never names them.

The glob is eager, so every module is in the bundle either way. Moving a slide into its own file changes where you edit it, not what ships.

Keep the manual point in the room. deck/slides.tsx is still a plain array, and a deck that never adds a file needs none of it.`

export default function DiscoverySlide() {
  return (
    <OpenContentSlide
      description="This slide is deck/slides/20-discovery.slide.tsx. The deck array never names it."
      eyebrow="Discovery"
      title="Slides can live in their own files"
    >
      <FeatureGrid
        items={[
          {
            description:
              "One eager glob over deck/slides hands every .slide.tsx module to discoverSlides, which sorts them and returns slide definitions.",
            title: "One glob, eager",
          },
          {
            description:
              "The spread sits between the manual cover and closing slides, so the discovered group lands exactly there and nowhere else.",
            title: "The array decides placement",
          },
          {
            description:
              "Extract a slide once it grows its own data loading, widgets, or long notes. A slide that reads fine in the array can stay in the array.",
            title: "Extraction is an editing call",
          },
        ]}
      />
    </OpenContentSlide>
  )
}
