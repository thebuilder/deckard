"use client"

import { Eyebrow, SlideHeading } from "@/app/slides/blocks/typography"
import { useSlideTitle } from "@/components/slideshow/slide-context"

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

      <div className="grid gap-4 rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface)] p-5 shadow-[var(--slide-surface-shadow)] backdrop-blur-sm">
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

export function HeroSlide({ eyebrow, title, description }: SlideIntroProps) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div className="flex h-full items-center justify-center py-12 text-center">
      <div className="space-y-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mx-auto max-w-[14ch] text-balance font-semibold text-[length:var(--slide-title-size)] leading-[1.02] tracking-tight">
          {resolvedTitle}
        </h1>
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
        <h1 className="max-w-4xl text-pretty font-semibold text-[length:var(--slide-title-size)] leading-[0.98] tracking-tight">
          {resolvedTitle}
        </h1>
        <p className="max-w-3xl text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.6]">
          {description}
        </p>
      </div>
    </section>
  )
}
