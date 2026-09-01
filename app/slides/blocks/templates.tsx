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

      <div className="grid gap-4 rounded-[calc(var(--radius)*2)] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
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
    <div className="flex h-full items-center justify-center py-12 text-center">
      <div className="space-y-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mx-auto max-w-[14ch] text-balance font-semibold text-7xl leading-[1.02] tracking-tight">
          {resolvedTitle}
        </h1>
        {description ? (
          <p className="mx-auto max-w-4xl text-muted-foreground text-xl leading-8">
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
    <section className="flex h-full items-center py-12">
      <div className="max-w-4xl space-y-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl text-pretty font-semibold text-7xl leading-[0.98] tracking-tight">
          {resolvedTitle}
        </h1>
        <p className="max-w-3xl text-muted-foreground text-xl leading-8">
          {description}
        </p>
      </div>
    </section>
  )
}
