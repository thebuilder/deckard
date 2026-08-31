import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "Presenter view",
}

export const notes = `Open the presenter window here. Press P, drag it to the second screen, and let the room watch the two stay in sync while you arrow through.

The notes you are reading right now are the demo. Say that.

If the room is a single screen, skip the demo and describe it. Nothing is worse than a live demo of the thing that shows the audience your notes.`

export default function PresenterSlide() {
  return (
    <OpenContentSlide
      description="A deck you cannot present from is a document. The second window is where a presentation framework earns the name."
      eyebrow="Presenting"
      title="The second window is the whole point"
    >
      <BulletList
        items={[
          <>
            <code>P</code> opens <code>/presenter</code> in a second window. A{" "}
            <code>BroadcastChannel</code> keeps it on the same slide and the
            same reveal step as the deck, in both directions.
          </>,
          <>
            Notes are a plain string on the slide. The console renders them at a
            size you can change from the lectern, next to a timer and a clock.
          </>,
          <>
            The next-slide preview is the real route with{" "}
            <code>?presenterPreview=1</code>, so you rehearse against the slide
            rather than against a thumbnail of it.
          </>,
          <>
            Media freezes in that preview so a video does not play twice.{" "}
            <code>useIsPresenterPreview()</code> lets your own widgets do the
            same.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
