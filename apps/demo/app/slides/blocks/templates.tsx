"use client"

import { useSlideTitle } from "@deckard/core/components"
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
    <div className="space-y-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <SlideHeading description={description} title={resolvedTitle} />
    </div>
  )
}

export function ContentSlideCard({
  eyebrow,
  title,
  description,
  children,
}: SlideIntroProps & { children: React.ReactNode }) {
  return (
    <div className="space-y-[var(--slide-content-gap)]">
      <SlideIntro description={description} eyebrow={eyebrow} title={title} />

      <div
        className="grid gap-4 rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface)] p-5 shadow-[var(--slide-surface-shadow)] backdrop-blur-sm"
        data-slide-panel=""
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
    <div className="space-y-[var(--slide-content-gap)]">
      <SlideIntro description={description} eyebrow={eyebrow} title={title} />
      <div>{children}</div>
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
    <section className="flex h-full w-full flex-col items-center justify-center py-8">
      <div className="grid min-h-0 w-full flex-1 grid-cols-[minmax(0,1fr)] items-center [&_:is(img,video)]:mx-auto [&_:is(img,video)]:h-auto [&_:is(img,video)]:max-h-full [&_:is(img,video)]:w-auto [&_:is(img,video)]:object-contain">
        {children}
      </div>
      {kicker ? (
        <p className="mt-10 shrink-0 text-center font-semibold text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]">
          {kicker}
        </p>
      ) : null}
    </section>
  )
}

export function HeroSlide({ eyebrow, title, description }: SlideIntroProps) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div className="flex h-full items-center justify-center py-12 text-center">
      <div className="space-y-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        {resolvedTitle ? (
          <h1 className="mx-auto max-w-[20ch] text-balance font-semibold text-[length:var(--slide-title-size)] leading-[1.02] tracking-tight">
            {resolvedTitle}
          </h1>
        ) : null}
        {description ? (
          <p className="mx-auto max-w-4xl text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.6]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function BreakerSlide({
  eyebrow,
  title,
  description,
}: SlideIntroProps & { description: React.ReactNode }) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <section className="flex h-full items-center py-12">
      <div className="max-w-4xl space-y-[var(--slide-content-gap)]">
        <Eyebrow>{eyebrow}</Eyebrow>
        {resolvedTitle ? (
          <h1 className="max-w-4xl text-pretty font-semibold text-[length:var(--slide-title-size)] leading-[0.98] tracking-tight">
            {resolvedTitle}
          </h1>
        ) : null}
        <p className="max-w-3xl text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.6]">
          {description}
        </p>
      </div>
    </section>
  )
}
