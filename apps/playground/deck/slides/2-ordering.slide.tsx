import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  slug: "ordering",
  title: "Ordering",
}

export const notes = `Point at the three filenames while you talk: 2-ordering, 10-interactive, 20-discovery.

The discovery slide is 20- and still came first, because it carries order: 1. This one and the interactive slide have no order, so they fall back to filename order, and 2 beats 10 because the compare is numeric.

The fourth option is not on the slide: pass your own comparator and it gets the path and the metadata of both slides. Mention it only if someone asks.

Finish on the last bullet. Nothing a module writes can move the group out of the slot the array gave it.`

export default function OrderingSlide() {
  return (
    <OpenContentSlide
      description="Discovery sorts the group before the array spreads it."
      eyebrow="Ordering"
      title="Filenames sort, metadata overrides"
    >
      <BulletList
        items={[
          <>
            <code>sort: "path"</code> compares filenames naturally, so{" "}
            <code>2-ordering</code> lands before <code>10-interactive</code>
          </>,
          <>
            <code>sort: "order"</code> reads <code>meta.order</code> first,
            which is how <code>20-discovery</code> leads this group
          </>,
          <>
            A module with no <code>meta.order</code> falls back to filename
            order
          </>,
          <>
            The array still wins: <code>meta.order</code> never moves the group
            past a manual slide
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
