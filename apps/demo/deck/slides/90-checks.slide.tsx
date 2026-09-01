import type { SlideMeta } from "@deckard/core"
import { ContentSlideCard } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  title: "Checking a deck",
}

export const notes = `This is the slide people remember, because everyone has shipped a deck with a slide that was cut off and only found out on stage.

The contact sheet is the underrated one. Overflow is a bug and a checker can find it. Four identical slides in a row is a judgement, and the only way to make that judgement is to see them all at once.

Mention that this deck went through all four before the talk, and that two slides got shorter because of it.`

const scripts = [
  {
    body: "Loads the real deck through a throwaway Vite server, in about a second. Duplicate slugs, a missing body, a theme class the stylesheet never mentions.",
    name: "deck:validate",
    when: "After any structural change",
  },
  {
    body: "Builds, serves, and measures every slide against the canvas, then exits nonzero naming each clipped slide and by how many pixels.",
    name: "deck:check-overflow",
    when: "After changing copy",
  },
  {
    body: "Puts the whole deck in one image. The only way to notice that four slides in a row have the same shape, which is a judgement no checker can make.",
    name: "deck:contact-sheet",
    when: "Before calling it done",
  },
  {
    body: "Reuses the same harness with the chrome hidden and writes one page per slide at canvas size, so the handout cannot drift from the talk.",
    name: "export:pdf",
    when: "When someone asks for it",
  },
]

export default function ChecksSlide() {
  return (
    <ContentSlideCard
      description="A deck is code, so it gets the same gate as code. All four run from the deck's own package."
      eyebrow="The gate"
      title="Four scripts decide whether a deck is done"
    >
      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        {scripts.map((script) => (
          <div
            className="border-[var(--slide-surface-border)] border-t pt-4"
            key={script.name}
          >
            <p className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-subheading-size)] tracking-tight">
              {script.name}
            </p>
            <p className="mt-2 font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]">
              {script.when}
            </p>
            <p className="mt-3 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.6]">
              {script.body}
            </p>
          </div>
        ))}
      </div>
    </ContentSlideCard>
  )
}
