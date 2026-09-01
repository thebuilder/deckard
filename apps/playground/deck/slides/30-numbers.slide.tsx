import type { SlideMeta } from "@deckard/core"
import { StatGrid } from "@/app/slides/blocks/metrics"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  order: 30,
  slug: "numbers",
  title: "Numbers",
}

export const notes = `Three figures, and every one of them says what it is measured against. A number on a slide with no comparison is decoration.

The block only sets the rule, the figure size, and the caption size. Everything else is the theme, which is why this slide looks like newsprint under broadsheet and like a console under nexus.`

export default function NumbersSlide() {
  return (
    <OpenContentSlide
      description="StatGrid sets a figure at the title size over a caption at the support size, ruled off at the top."
      eyebrow="Metrics"
      title="Three figures, each with its comparison"
    >
      <StatGrid
        items={[
          {
            caption: "Slide routes prerendered, from one deck definition",
            value: "14",
          },
          {
            caption: "Awaited on the server before any HTML was sent",
            unit: "ms",
            value: "40",
          },
          {
            caption: "Registry items, five block families and six themes",
            value: "12",
          },
        ]}
      />
    </OpenContentSlide>
  )
}
