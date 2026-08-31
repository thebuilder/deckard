"use client"

import type {
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
  TouchEvent,
  WheelEvent,
} from "react"
import { useCallback } from "react"

import { cn } from "@/lib/utils"

const scrollKeys = new Set([
  " ",
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
])

interface SlideScrollAreaProps {
  children: ReactNode
  className?: string
  label: string
  maxHeight?: number
}

// Scrolling inside a slide has to stay inside the slide: the same wheel, touch, and keys otherwise step the deck.
export function SlideScrollArea({
  children,
  className,
  label,
  maxHeight,
}: SlideScrollAreaProps) {
  const stopEvent = useCallback(
    (event: SyntheticEvent | WheelEvent | TouchEvent) => {
      event.stopPropagation()
    },
    []
  )

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (scrollKeys.has(event.key)) {
      event.stopPropagation()
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: the handlers keep scroll input out of the deck stepper, they do not add an interaction
    <section
      aria-label={label}
      className={cn(
        "min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-none",
        className
      )}
      data-slide-scroll-area=""
      data-step-ignore-click="true"
      onKeyDown={handleKeyDown}
      onTouchMove={stopEvent}
      onWheel={stopEvent}
      style={maxHeight ? { maxHeight } : undefined}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a region that only scrolls still has to be reachable by keyboard
      tabIndex={0}
    >
      {children}
    </section>
  )
}
