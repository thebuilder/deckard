import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "The server boundary",
}

export const notes = `The reason to care: a slide that fetches its own data is a slide you can leave alone. No build step that regenerates JSON, no stale numbers in a deck you gave last quarter.

Point at the last bullet if anyone has hit it. The error message names the file, so it is a two minute problem the first time and a zero minute problem after that.

Two slides from now there is a slide that reads this repository at build time. Set that up here.`

export default function ServerBoundarySlide() {
  return (
    <OpenContentSlide
      description="One rule, three consequences, and the third one bites once."
      eyebrow="The boundary"
      title="The slide runs on the server. The widget does not."
    >
      <BulletList
        items={[
          <>
            A slide body can be <code>async</code>. Await the query, return the
            markup, and the audience never watches a slide fill itself in.
          </>,
          <>
            Interactivity goes one level down. The slide stays a Server
            Component and renders a client component, so the JavaScript on the
            page is the widget rather than the deck.
          </>,
          <>
            <code>"use client"</code> at the top of a slide module turns the
            whole deck into a client bundle. A test walks every entry module and
            fails the build on it.
          </>,
          <>
            A discovered module has to be synchronous. Top-level await anywhere
            in its imports makes the eager glob hand back a promise, and
            discovery throws naming the file.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
