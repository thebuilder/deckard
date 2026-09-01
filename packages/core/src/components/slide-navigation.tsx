"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import type { SlideSummary } from "../deck/types"
import { cn } from "../lib/utils"
import { Button, buttonVariants } from "../ui/button"
import { useSlideStepper } from "./slide-stepper"

interface SlideNavigationProps {
  mode?: "visible" | "counter"
  next?: SlideSummary
  prefetch?: SlideSummary[]
  previous?: SlideSummary
  slide: SlideSummary
  total: number
}

export function SlideNavigation({
  slide,
  total,
  previous,
  next,
  mode = "visible",
  prefetch = [],
}: SlideNavigationProps) {
  const router = useRouter()
  const stepper = useSlideStepper()
  const previousHref = previous?.href
  const nextHref = next?.href

  const handlePrevious = useCallback(() => {
    if (stepper?.canRetreat) {
      stepper.retreat()
      return
    }

    if (previousHref) {
      router.push(previousHref)
    }
  }, [previousHref, router, stepper])

  const handleNext = useCallback(() => {
    if (stepper?.canAdvance) {
      stepper.advance()
      return
    }

    if (nextHref) {
      router.push(nextHref)
    }
  }, [nextHref, router, stepper])

  const hasPrevious = Boolean(previousHref || stepper?.canRetreat)
  const hasNext = Boolean(nextHref || stepper?.canAdvance)
  const isCounterOnly = mode === "counter"

  useEffect(() => {
    const uniqueHrefs = new Set(prefetch.map((item) => item.href))

    for (const href of uniqueHrefs) {
      router.prefetch(href)
    }
  }, [prefetch, router])

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 border-border/70 border-t bg-background/75 backdrop-blur-xl">
      <div
        className={cn(
          "px-6 py-3",
          isCounterOnly
            ? "flex items-center justify-center"
            : "flex items-center justify-between gap-3"
        )}
      >
        {isCounterOnly ? null : (
          <Button
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              !hasPrevious && "pointer-events-none opacity-50"
            )}
            disabled={!hasPrevious}
            onClick={handlePrevious}
            size="sm"
            type="button"
            variant="outline"
          >
            <ArrowLeft />
            Previous
          </Button>
        )}

        <div className="min-w-0 text-center">
          <p className="font-medium text-muted-foreground text-xs uppercase tabular-nums tracking-[0.2em]">
            Slide {slide.number} of {total}
          </p>
        </div>

        {isCounterOnly ? null : (
          <Button
            className={cn(
              buttonVariants({ size: "sm", variant: "default" }),
              !hasNext && "pointer-events-none opacity-50"
            )}
            disabled={!hasNext}
            onClick={handleNext}
            size="sm"
            type="button"
            variant="default"
          >
            Next
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  )
}
