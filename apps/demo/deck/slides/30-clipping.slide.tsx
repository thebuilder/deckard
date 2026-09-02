import type { SlideMeta } from "@deckard/core"
import { SlideStep } from "@deckard/core/components"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  stepCount: 3,
  title: "When it does not fit",
}

export const notes = `Three clicks, and the third one is the argument.

First click: the amber outline. Development only, and it is the thing you notice while writing.

Second click: the CI gate. Same element, same arithmetic, so the warning and the failure can never disagree.

Third click: hold here. The temptation is to shrink the font, and shrinking the font is how a deck ends up unreadable from row eight. Cut the sentence.`

function Phase({
  body,
  isFinal,
  label,
  title,
}: {
  body: string
  isFinal?: boolean
  label: string
  title: string
}) {
  return (
    <div
      className={
        isFinal
          ? "border border-primary/45 bg-primary/8 p-5"
          : "border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-5"
      }
      data-slide-surface=""
    >
      <p
        className={`font-semibold text-[length:var(--slide-label-size)] uppercase tracking-[var(--slide-label-tracking)] ${
          isFinal ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <h3 className="mt-2 font-semibold text-[length:var(--slide-subheading-size)] tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.6]">
        {body}
      </p>
    </div>
  )
}

export default function ClippingSlide() {
  return (
    <OpenContentSlide
      description="Overflow is clipped, so it has to be loud in both places you would notice it."
      eyebrow="Clipping"
      title="The canvas clips, and CI fails on it"
    >
      <div className="grid gap-3">
        <SlideStep step={0}>
          <Phase
            body="An amber outline and one console line naming the slide and the overflow in pixels. Development only."
            label="While you write"
            title="The dev server draws the overflow"
          />
        </SlideStep>

        <SlideStep step={1}>
          <Phase
            body="deck:check-overflow measures the same element with the same arithmetic, and exits nonzero listing each clipped slide."
            label="On the way in"
            title="The same measurement, as a gate"
          />
        </SlideStep>

        <SlideStep step={2}>
          <Phase
            body="Cut a bullet, or wrap the scrolling part in SlideScrollArea. Shrinking the type is not a fix."
            isFinal
            label="The fix"
            title="Change the content, not the checker"
          />
        </SlideStep>
      </div>
    </OpenContentSlide>
  )
}
