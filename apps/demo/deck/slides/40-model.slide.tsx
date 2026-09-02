import type { SlideMeta } from "@deckard/core"
import { FeatureGrid } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "The slide model",
}

export const notes = `Read the first card and skip the rest unless someone asks. The point of the slide is that the list is short, not that they memorize it.

If you get a question about titles becoming slugs: they never do. A title is display text and a slug is a URL, and quietly deriving one from the other is how links break when you rewrite a headline.`

export default function SlideModelSlide() {
  return (
    <OpenContentSlide
      description="One required field and five optional ones, small enough to hold in your head."
      eyebrow="The model"
      title="A slide is an object with a body"
    >
      <FeatureGrid
        items={[
          {
            description:
              "One ReactNode, sync or async. Everything else on the object is metadata the runtime reads, never renders.",
            title: "body, and only body",
          },
          {
            description:
              "A slug fixes the URL at /slides/<slug>. Without one a slide is served at its position, so a reorder moves the link.",
            title: "slug and title",
          },
          {
            description:
              "layout, header, footer, and background override the deck defaults for one slide, instead of a special case in the route.",
            title: "The frame, per slide",
          },
          {
            description:
              "stepCount plus SlideStep reveals in phases. Hidden steps keep their space, so the slide is its full height from the first click.",
            title: "stepCount",
          },
          {
            description:
              "A plain string that reaches the presenter window. It is the only field the audience never sees.",
            title: "notes",
          },
          {
            description:
              "The one field the deck writes for you, set by discovery. deck:validate fails when it stops pointing at a real file.",
            title: "sourcePath",
          },
        ]}
      />
    </OpenContentSlide>
  )
}
