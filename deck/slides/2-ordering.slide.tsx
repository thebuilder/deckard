import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"
import type { SlideMeta } from "@/lib/deck/types"

export const meta: SlideMeta = {
  slug: "ordering",
  title: "Ordering",
}

export const notes = `Point at the three filenames while you talk: 2-ordering, 10-interactive, 20-discovery.

The discovery slide is 20- and still came first, because it carries order: 1. This one and the interactive slide have no order, so they fall back to filename order, and 2 beats 10 because the compare is numeric.

Finish on the last bullet. Nothing a module writes can move the group out of the slot the array gave it.`

export default function OrderingSlide() {
  return (
    <OpenContentSlide
      description="Discovery sorts the group before the array spreads it. Three ways to decide that order."
      eyebrow="Ordering"
      title="Filenames sort, metadata overrides"
    >
      <BulletList
        items={[
          <>
            Default <code>sort: "path"</code> compares filenames naturally, so{" "}
            <code>2-ordering</code> lands before <code>10-interactive</code>{" "}
            instead of after it.
          </>,
          <>
            <code>sort: "order"</code> reads <code>meta.order</code> first. This
            deck uses it, which is how <code>20-discovery.slide.tsx</code> leads
            the group with <code>order: 1</code>.
          </>,
          <>
            A module without <code>meta.order</code> falls back to filename
            order, so you only number the slides you care about.
          </>,
          <>
            Pass your own comparator for anything else. It gets the path and the
            metadata of both slides.
          </>,
          <>
            The array still wins. <code>meta.order</code> sorts inside the
            discovered group and never moves it past a manual slide.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
