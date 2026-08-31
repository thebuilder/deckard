"use client"

import { Eyebrow, SlideHeading } from "@/app/slides/blocks/typography"
import { useSlideTitle } from "@/components/slideshow/slide-context"

function useResolvedSlideTitle(title?: React.ReactNode) {
  const contextTitle = useSlideTitle()
  return title ?? contextTitle ?? null
}

export function ContentSlideCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
}) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SlideHeading description={description} title={resolvedTitle} />
      </div>

      <div className="grid gap-4 rounded-[calc(var(--radius)*2)] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
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
}: {
  eyebrow: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
}) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SlideHeading description={description} title={resolvedTitle} />
      </div>
      <div>{children}</div>
    </div>
  )
}

export function HeroSlide({
  eyebrow,
  title,
  description,
}: {
  eyebrow: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
}) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <div className="flex min-h-[calc(100svh-16rem)] items-center justify-center py-8 text-center sm:py-12">
      <div className="space-y-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mx-auto max-w-[14ch] text-balance font-semibold text-5xl leading-[1.06] tracking-tight sm:text-6xl sm:leading-[1.04] lg:text-7xl lg:leading-[1.02]">
          {resolvedTitle}
        </h1>
        {description ? (
          <p className="mx-auto max-w-4xl text-lg text-muted-foreground leading-8 sm:text-xl">
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
}: {
  eyebrow: React.ReactNode
  title?: React.ReactNode
  description: React.ReactNode
}) {
  const resolvedTitle = useResolvedSlideTitle(title)

  return (
    <section className="flex min-h-[calc(100svh-16rem)] items-center py-8 sm:py-12">
      <div className="max-w-4xl space-y-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl text-pretty font-semibold text-4xl tracking-tight sm:text-5xl lg:text-7xl lg:leading-[0.98]">
          {resolvedTitle}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground leading-8 sm:text-xl">
          {description}
        </p>
      </div>
    </section>
  )
}
