"use client"

import { useSlideTitle } from "@deckard/core/components"
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
    <section className="flex h-full w-full flex-col justify-center py-[var(--slide-item-gap)]">
      <div className="grid min-h-0 w-full grid-cols-[minmax(0,1fr)] items-center [&_:is(img,video)]:h-auto [&_:is(img,video)]:max-h-full [&_:is(img,video)]:w-auto [&_:is(img,video)]:object-contain">
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
      className="flex h-full flex-col justify-between py-[var(--slide-item-gap)]"
      data-slide-hero=""
    >
      <Eyebrow>{eyebrow}</Eyebrow>

      <div className="space-y-8">
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
          className="flex gap-14 border-[var(--slide-surface-border)] border-t pt-7 font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-label-size)] text-muted-foreground"
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
          className="max-w-[1500px] text-pretty font-semibold text-[length:var(--slide-title-size)] leading-[1.02] tracking-tight"
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
