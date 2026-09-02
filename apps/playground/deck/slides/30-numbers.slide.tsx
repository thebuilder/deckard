import type { SlideMeta } from "@deckard/core"
import { StatGrid } from "@/app/slides/blocks/metrics"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  order: 30,
  slug: "numbers",
  title: "Numbers",
}

export const notes = `Three figures, and every one of them says what it is measured against. A number on a slide with no comparison is decoration.

The meters under the first and the last figure are proportions, not a chart. Say what each one is a proportion of, or drop it.

The block only sets the rule, the figure size, the meter, and the caption size. Everything else is the theme, which is why this slide looks like newsprint under broadsheet and like a console under nexus.`

export default function NumbersSlide() {
  return (
    <OpenContentSlide
      description="Two to four columns, each with an optional unit and meter."
      eyebrow="Metrics"
      title="Three figures, each with its comparison"
    >
      <StatGrid
        items={[
          {
            caption: "Slide routes prerendered, from one deck definition",
            meter: 0.54,
            value: "29",
          },
          {
            caption: "Awaited on the server before any HTML was sent",
            unit: "ms",
            value: "40",
          },
          {
            caption: "Registry items, seven block families and a preset",
            meter: 0.46,
            value: "8",
          },
        ]}
      />
    </OpenContentSlide>
  )
}
