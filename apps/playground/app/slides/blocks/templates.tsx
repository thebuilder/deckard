"use client"

import { useSlideTitle } from "@thebuilder/deckard-core/components"
import { type RefObject, useEffect, useRef } from "react"
import { Eyebrow, SlideHeading } from "@/app/slides/blocks/typography"

interface SlideIntroProps {
  description?: React.ReactNode
  eyebrow: React.ReactNode
  title?: React.ReactNode
}

function useResolvedSlideTitle(title?: React.ReactNode) {
  const contextTitle = useSlideTitle()
  return title ?? contextTitle ?? null
}

function SlideIntro({ description, eyebrow, title }: SlideIntroProps) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div className="space-y-4" data-slide-intro="">
      <Eyebrow>{eyebrow}</Eyebrow>
      <SlideHeading description={description} title={resolvedTitle} />
    </div>
  )
}

/*
 * One surface per slide is a convention, not a stylesheet trick. The card always
 * renders, so a block that paints its own frame inside it looks like what it is:
 * a frame in a frame. This says so in development, the way SlideOverflowGuard
 * says a slide is clipped, and names the two layouts that compose it right.
 */
const nestedSurfaceAdvice = [
  "A ContentSlideCard panel holds a block carrying data-slide-surface, so a framed block sits inside a framed panel.",
  "One surface per slide: put the block in OpenContentSlide, or give it the whole frame with FocusSlide.",
].join(" ")

function useNestedSurfaceWarning(panel: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = panel.current

    if (process.env.NODE_ENV === "production" || !node) {
      return
    }

    let warned = false

    const check = () => {
      if (warned || !node.querySelector("[data-slide-surface]")) {
        return
      }

      warned = true
      console.warn(nestedSurfaceAdvice)
    }

    // A step reveals its block after the panel mounts, so the check outlives it.
    const observer = new MutationObserver(check)

    observer.observe(node, { childList: true, subtree: true })
    check()

    return () => observer.disconnect()
  }, [panel])
}

export function ContentSlideCard({
  eyebrow,
  title,
  description,
  children,
}: SlideIntroProps & { children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)

  useNestedSurfaceWarning(panel)

  return (
    <div className="flex h-full flex-col justify-center gap-[var(--slide-content-gap)]">
      <SlideIntro description={description} eyebrow={eyebrow} title={title} />

      <div
        className="grid gap-[var(--slide-item-gap)] rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface)] p-11 shadow-[var(--slide-surface-shadow)] backdrop-blur-sm"
        data-slide-panel=""
        ref={panel}
      >
        {children}
      </div>
    </div>
  )
}

export function OpenContentSlide({
  eyebrow,
  title,
  description,
  children,
}: SlideIntroProps & { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-[var(--slide-content-gap)] py-[var(--slide-item-gap)]">
      <SlideIntro description={description} eyebrow={eyebrow} title={title} />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}

/*
 * The content is the slide. No heading, no lead, no panel: one block gets the
 * whole frame to show more of itself at the normal type scale, with an
 * optional kicker under it for orientation.
 */
export function FocusSlide({
  children,
  kicker,
}: {
  children: React.ReactNode
  kicker?: string
}) {
  return (
    <section className="flex h-full w-full flex-col py-[var(--slide-item-gap)]">
      {/* flex-1 rather than a centred auto height: an auto row hands the
          kicker's margin back to the content, which then paints over it. */}
      <div className="grid min-h-0 w-full flex-1 grid-cols-[minmax(0,1fr)] items-center overflow-hidden [&_:is(img,video)]:h-auto [&_:is(img,video)]:max-h-full [&_:is(img,video)]:w-auto [&_:is(img,video)]:object-contain">
        {children}
      </div>
      {kicker ? (
        <p
          className="mt-12 shrink-0 font-semibold text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
          data-slide-kicker=""
        >
          {kicker}
        </p>
      ) : null}
    </section>
  )
}

/*
 * The opener runs the height of the frame: the eyebrow rides the top edge and
 * the title block sits on the bottom one, which is the composition three of the
 * four source templates use. The meta row is the credit line under it.
 *
 * The free height goes above the title rather than either side of it. Spread
 * three ways, a two-line headline floats in a band with 300 canvas pixels of
 * nothing over and under it, which is not what the source openers do.
 */
export function HeroSlide({
  eyebrow,
  title,
  description,
  meta,
}: SlideIntroProps & { meta?: readonly string[] }) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div
      className="flex h-full flex-col py-[var(--slide-item-gap)]"
      data-slide-hero=""
    >
      <Eyebrow>{eyebrow}</Eyebrow>

      <div className="mt-auto space-y-8">
        {resolvedTitle ? (
          <h1
            className="max-w-[1500px] text-balance font-bold text-[length:var(--slide-title-size)] leading-[1.02] tracking-[-0.025em]"
            data-slide-title=""
          >
            {resolvedTitle}
          </h1>
        ) : null}
        {description ? (
          <p
            className="max-w-[1100px] text-pretty text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.35]"
            data-slide-lead=""
          >
            {description}
          </p>
        ) : null}
      </div>

      {meta && meta.length > 0 ? (
        <div
          className="mt-[var(--slide-content-gap)] flex gap-14 border-[var(--slide-surface-border)] border-t pt-7 font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-label-size)] text-muted-foreground"
          data-slide-hero-meta=""
        >
          {meta.map((entry) => (
            <span key={entry}>{entry}</span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export interface RailEntry {
  detail: React.ReactNode
  term: string
}

/*
 * The opener with its credit line stood up as a rail instead of laid along the
 * bottom. Same composition as HeroSlide, but the facts get a column of their
 * own, which is where a title that runs three lines wants them.
 */
export function HeroSplitSlide({
  eyebrow,
  title,
  description,
  rail,
}: SlideIntroProps & { rail: readonly RailEntry[] }) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div
      className="grid h-full grid-cols-[minmax(0,1fr)_var(--slide-rail-size)] gap-[var(--slide-content-gap)] py-[var(--slide-item-gap)]"
      data-slide-hero=""
    >
      <div className="flex min-w-0 flex-col">
        <Eyebrow>{eyebrow}</Eyebrow>

        <div className="mt-auto space-y-8">
          {resolvedTitle ? (
            <h1
              className="text-balance font-bold text-[length:var(--slide-title-size)] leading-[1.02] tracking-[-0.025em]"
              data-slide-title=""
            >
              {resolvedTitle}
            </h1>
          ) : null}
          {description ? (
            <p
              className="text-pretty text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.35]"
              data-slide-lead=""
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <dl
        className="mt-auto grid min-w-0 content-end gap-7 border-[var(--slide-surface-border)] border-t-2 pt-9 font-[family-name:var(--slide-font-mono)]"
        data-slide-rail=""
      >
        {/* min-w-0 because a grid item's automatic minimum is its longest
            unbroken word, and a rail carries URLs and install commands. Without
            it the row keeps its intrinsic width and runs past the frame. */}
        {rail.map((entry) => (
          <div className="min-w-0" key={entry.term}>
            <dt
              className="text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
              data-slide-rail-term=""
            >
              {entry.term}
            </dt>
            <dd
              className="mt-2 break-words text-[length:var(--slide-support-size)] text-foreground"
              data-slide-rail-detail=""
            >
              {entry.detail}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/*
 * One of the two layouts in the catalogue that centres anything, and its own
 * component rather than a prop on HeroSlide, because a centred opener is a
 * different slide and not a setting on this one.
 */
export function HeroCenteredSlide({
  badge,
  title,
  description,
  meta,
}: {
  badge?: React.ReactNode
  description?: React.ReactNode
  meta?: readonly string[]
  title?: React.ReactNode
}) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-9 text-center"
      data-slide-hero=""
    >
      {badge ? (
        <span
          className="rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] px-7 py-2 font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
          data-slide-badge=""
        >
          {badge}
        </span>
      ) : null}
      {resolvedTitle ? (
        <h1
          className="max-w-[1500px] text-balance font-bold text-[length:var(--slide-title-size)] leading-[1.02] tracking-[-0.025em]"
          data-slide-title=""
        >
          {resolvedTitle}
        </h1>
      ) : null}
      {description ? (
        <p
          className="max-w-[1100px] text-pretty text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.35]"
          data-slide-lead=""
        >
          {description}
        </p>
      ) : null}
      {meta && meta.length > 0 ? (
        <div
          className="mt-4 flex gap-14 font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-label-size)] text-muted-foreground"
          data-slide-hero-meta=""
        >
          {meta.map((entry) => (
            <span key={entry}>{entry}</span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/*
 * The index is the section number the source templates set oversized above the
 * rule. It is content, not decoration, so the deck passes it and the theme
 * decides how loud it gets.
 */
export function BreakerSlide({
  eyebrow,
  index,
  title,
  description,
}: SlideIntroProps & { description: React.ReactNode; index?: string }) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <section
      className="flex h-full flex-col justify-center gap-8"
      data-slide-breaker=""
    >
      {index ? (
        <p
          className="font-[family-name:var(--slide-font-heading)] font-bold text-[length:var(--slide-title-size)] text-primary leading-[0.82] tracking-tight"
          data-slide-breaker-index=""
        >
          {index}
        </p>
      ) : null}
      <Eyebrow>{eyebrow}</Eyebrow>
      {resolvedTitle ? (
        <h1
          className="max-w-[1500px] text-balance font-semibold text-[length:var(--slide-title-size)] leading-[1.02] tracking-tight"
          data-slide-title=""
        >
          {resolvedTitle}
        </h1>
      ) : null}
      <p
        className="max-w-[1100px] text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.35]"
        data-slide-lead=""
      >
        {description}
      </p>
    </section>
  )
}

/*
 * The other centred layout. A rule and a title, with no eyebrow, lead, or
 * index. Reach for BreakerSlide when the section needs explaining and this one
 * when the room only needs to know the subject changed.
 */
export function MinimalBreakerSlide({ title }: { title?: React.ReactNode }) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <section
      className="flex h-full flex-col items-center justify-center gap-11 text-center"
      data-slide-breaker=""
    >
      <span
        className="block h-[3px] w-[120px] bg-primary"
        data-slide-accent-rule=""
      />
      {resolvedTitle ? (
        <h1
          className="max-w-[1400px] text-balance font-semibold text-[length:var(--slide-title-size)] leading-[1.02] tracking-tight"
          data-slide-title=""
        >
          {resolvedTitle}
        </h1>
      ) : null}
    </section>
  )
}

/*
 * One sentence at display size with a rule over it and a mono attribution
 * under. The sentence is a paragraph rather than an h1 because the themes that
 * set headings in capitals would shout a whole sentence, and because a claim is
 * not the slide's title. Pair it with background: "accent" for the one sentence
 * a deck is built around.
 */
export function StatementSlide({
  source,
  statement,
}: {
  source?: React.ReactNode
  statement: React.ReactNode
}) {
  return (
    <section
      className="flex h-full flex-col justify-center gap-10"
      data-slide-statement=""
    >
      <span
        className="block h-[3px] w-[120px] bg-primary"
        data-slide-accent-rule=""
      />
      <p
        className="max-w-[1560px] text-balance font-semibold text-[length:var(--slide-title-size)] leading-[1.06] tracking-[-0.02em]"
        data-slide-statement-text=""
      >
        {statement}
      </p>
      {source ? (
        <p
          className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
          data-slide-statement-source=""
        >
          {source}
        </p>
      ) : null}
    </section>
  )
}

/*
 * A block on the left and a numbered rail of notes on the right. The left slot
 * is a child rather than a code string, so the same frame holds a CodeBlock, a
 * diagram, or a props table without this file importing any of them.
 */
export function CodeSplitSlide({
  children,
  kicker,
  notes,
}: {
  children: React.ReactNode
  kicker?: string
  notes: readonly React.ReactNode[]
}) {
  return (
    <section
      className="flex h-full flex-col py-[var(--slide-item-gap)]"
      data-slide-split=""
    >
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-[var(--slide-content-gap)] overflow-hidden">
        <div className="min-w-0 self-center" data-slide-split-main="">
          {children}
        </div>

        <ol className="grid content-center gap-6" data-slide-split-aside="">
          {notes.map((note, index) => (
            <li
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-6 border-[var(--slide-surface-border)] border-t pt-6"
              data-slide-note=""
              // biome-ignore lint/suspicious/noArrayIndexKey: authored note nodes have no stable identity and the rail never reorders
              key={index}
            >
              <span
                className="font-semibold text-[length:var(--slide-support-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
                data-slide-note-index=""
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p
                className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]"
                data-slide-note-text=""
              >
                {note}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {kicker ? (
        <p
          className="mt-10 shrink-0 font-semibold text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
          data-slide-kicker=""
        >
          {kicker}
        </p>
      ) : null}
    </section>
  )
}
