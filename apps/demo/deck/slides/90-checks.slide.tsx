import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "Checking a deck",
}

export const notes = `This is the slide people remember, because everyone has shipped a deck with a slide that was cut off and only found out on stage.

The contact sheet is the underrated one. Overflow is a bug and a checker can find it. Four identical slides in a row is a judgement, and the only way to make that judgement is to see them all at once.

Mention that this deck went through all four before the talk, and that two slides got shorter because of it.`

export default function ChecksSlide() {
  return (
    <OpenContentSlide
      description="A deck is code, so it gets the same gate as code. These run from the deck's own package."
      eyebrow="The gate"
      title="Four scripts decide whether a deck is done"
    >
      <BulletList
        items={[
          <>
            <code>deck:validate</code> loads the real deck through a throwaway
            Vite server in about a second: duplicate slugs, a missing body, a
            theme class the stylesheet never mentions.
          </>,
          <>
            <code>deck:check-overflow</code> builds, serves, and measures every
            slide against the canvas, then exits nonzero naming each clipped
            slide and by how many pixels.
          </>,
          <>
            <code>deck:contact-sheet</code> puts the whole deck in one image.
            That is the only way to notice that four slides in a row have the
            same shape.
          </>,
          <>
            <code>export:pdf</code> reuses the same harness with the chrome
            hidden and writes one page per slide at canvas size, so the handout
            cannot drift from the talk.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
