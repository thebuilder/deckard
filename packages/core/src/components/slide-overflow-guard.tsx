"use client"

import { useEffect, useRef, useState } from "react"

const tolerance = 1

// The frame is the slide, and the chrome is painted inside the same canvas, so a
// header whose brand and title outrun the row clips just as silently.
const regions = [
  { label: "Slide content", selector: "[data-slide-frame]" },
  { label: "The header", selector: "[data-slide-header]" },
  { label: "The footer", selector: "[data-slide-footer]" },
]

interface Overflow {
  label: string
  x: number
  y: number
}

function measure(element: HTMLElement, label: string): Overflow | null {
  const x = element.scrollWidth - element.clientWidth
  const y = element.scrollHeight - element.clientHeight

  if (x <= tolerance && y <= tolerance) {
    return null
  }

  return { label, x: Math.max(x, 0), y: Math.max(y, 0) }
}

function describe(overflow: Overflow) {
  const parts = [
    overflow.y > tolerance ? `${Math.round(overflow.y)}px below` : "",
    overflow.x > tolerance
      ? `${Math.round(overflow.x)}px past the side of`
      : "",
  ].filter(Boolean)

  return `${overflow.label} runs ${parts.join(" and ")} the canvas and is clipped.`
}

function isSameOverflow(left: Overflow[], right: Overflow[]) {
  return (
    left.length === right.length &&
    left.every(
      (entry, index) =>
        entry.label === right[index].label &&
        entry.x === right[index].x &&
        entry.y === right[index].y
    )
  )
}

// Development-only feedback: the canvas clips silently, so authors get told the moment a slide asks for more room than it has.
export function SlideOverflowGuard() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState<Overflow[]>([])

  useEffect(() => {
    const canvas = anchorRef.current?.parentElement

    if (!canvas) {
      return
    }

    let frameRequest = 0

    const check = () => {
      cancelAnimationFrame(frameRequest)
      frameRequest = requestAnimationFrame(() => {
        const next = regions.flatMap((region) => {
          const element = canvas.querySelector<HTMLElement>(region.selector)

          return element ? (measure(element, region.label) ?? []) : []
        })

        setOverflows((current) =>
          isSameOverflow(current, next) ? current : next
        )
      })
    }

    const resizeObserver = new ResizeObserver(check)
    const mutationObserver = new MutationObserver(check)

    for (const region of regions) {
      const element = canvas.querySelector<HTMLElement>(region.selector)

      if (element) {
        resizeObserver.observe(element)
      }
    }

    mutationObserver.observe(canvas, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })
    check()

    return () => {
      cancelAnimationFrame(frameRequest)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    for (const overflow of overflows) {
      console.warn(describe(overflow))
    }
  }, [overflows])

  return (
    <div aria-hidden className="contents" ref={anchorRef}>
      {overflows.length > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 z-50 ring-2 ring-amber-500/60 ring-inset"
          data-slide-overflow=""
        >
          <div className="absolute right-3 bottom-3 space-y-1 text-right">
            {overflows.map((overflow) => (
              <p
                className="inline-block rounded-full bg-amber-500/90 px-3 py-1 font-medium text-[11px] text-amber-950"
                key={overflow.label}
              >
                {describe(overflow)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
