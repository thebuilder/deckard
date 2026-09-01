import type { SlideMeta } from "@deckard/core"
import { FeatureGrid } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "Discovery",
}

export const notes = `Show the editor if you have it. This slide is deck/slides/60-discovery.slide.tsx, and the array it appears in never mentions the filename.

The number to say out loud is nine: nine of the slides in this deck are files, and the array has one spread where they land.

Kill the performance question before it arrives. The glob is eager. Extraction buys editing room, never bytes.`

export default function DiscoverySlide() {
  return (
    <OpenContentSlide
      description="This slide is deck/slides/60-discovery.slide.tsx. The array it lands in never names the file."
      eyebrow="Discovery"
      title="Nine slides the deck array never mentions"
    >
      <FeatureGrid
        items={[
          {
            description:
              "One import.meta.glob over deck/slides hands every .slide.tsx module to discoverSlides, which sorts the group and returns slide definitions.",
            title: "One eager glob",
          },
          {
            description:
              "The spread sits between the manual opening and the manual close, so the group lands exactly there. meta.order sorts inside the group and can never leave it.",
            title: "The array decides placement",
          },
          {
            description:
              "Both forms ship the same bundle. Move a slide into a file once it grows its own data, a client widget, or notes longer than the slide itself.",
            title: "Extraction is an editing call",
          },
        ]}
      />
    </OpenContentSlide>
  )
}
