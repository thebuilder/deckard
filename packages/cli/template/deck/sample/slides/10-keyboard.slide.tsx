import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  order: 10,
  slug: "keyboard",
  title: "Presenting",
}

export const notes =
  "This slide is its own file under deck/slides. The deck picked it up from a glob, in the position the array spreads it."

export default function KeyboardSlide() {
  return (
    <OpenContentSlide
      description="This slide lives in deck/slides/10-keyboard.slide.tsx. Nothing imported it by name."
      eyebrow="Presenting"
    >
      <BulletList
        items={[
          <>
            <code>Arrow Left</code> and <code>Arrow Right</code> move between
            slides and through steps.
          </>,
          <>
            <code>Cmd/Ctrl + K</code> opens the command center to jump anywhere
            in the deck.
          </>,
          <>
            <code>P</code> opens the presenter window with notes, a timer, and
            the next step.
          </>,
          <>
            A slide file exports <code>default</code>, plus <code>meta</code>{" "}
            and <code>notes</code> as plain values.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
