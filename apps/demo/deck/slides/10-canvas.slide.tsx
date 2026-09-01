import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "The canvas",
}

export const notes = `This is the decision everything else hangs off, so slow down here.

Say it as a trade: you give up reflow, and you get a layout you can trust. Nobody has ever opened a deck on a projector and been pleased that the third bullet wrapped differently.

If someone asks about phones, the answer is that a phone gets the same slide at 20 percent. It is small, and it is correct.`

export default function CanvasSlide() {
  return (
    <OpenContentSlide
      description="Every slide in this deck is authored at 1920 by 1080. The viewport scales that rectangle to fit the window and centers it."
      eyebrow="The canvas"
      title="One rectangle, decided once"
    >
      <BulletList
        items={[
          <>
            Size against the canvas: <code>h-full</code>, percentages, fixed
            pixels. <code>vh</code> and <code>sm:</code> answer to the browser
            window, and the browser window is not the slide.
          </>,
          <>
            A projector, a laptop, a phone, and the exported PDF all get this
            layout. Only the multiplier changes, and nothing rewraps on the way.
          </>,
          <>
            The default frame reserves room for the header and the footer.{" "}
            <code>layout: "fullscreen"</code> hands the whole rectangle to the
            slide so media can bleed to every edge.
          </>,
          <>
            What does not fit is clipped, not shrunk. That constraint has teeth,
            and the next slide is about the two places it bites.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
