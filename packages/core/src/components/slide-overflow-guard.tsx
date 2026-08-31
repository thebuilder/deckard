"use client"

import { useEffect, useRef, useState } from "react"

const tolerance = 1

interface Overflow {
  x: number
  y: number
}

function measure(frame: HTMLElement): Overflow | null {
  const x = frame.scrollWidth - frame.clientWidth
  const y = frame.scrollHeight - frame.clientHeight

  if (x <= tolerance && y <= tolerance) {
    return null
  }

  return { x: Math.max(x, 0), y: Math.max(y, 0) }
}

function describe(overflow: Overflow) {
  const parts = [
    overflow.y > tolerance ? `${Math.round(overflow.y)}px below` : "",
    overflow.x > tolerance
      ? `${Math.round(overflow.x)}px past the side of`
      : "",
  ].filter(Boolean)

  return `Slide content runs ${parts.join(" and ")} the canvas and is clipped.`
}

function isSameOverflow(left: Overflow | null, right: Overflow | null) {
  if (!(left && right)) {
    return left === right
  }

  return left.x === right.x && left.y === right.y
}

// Development-only feedback: the canvas clips silently, so authors get told the moment a slide asks for more room than it has.
export function SlideOverflowGuard() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState<Overflow | null>(null)

  useEffect(() => {
    const frame =
      anchorRef.current?.parentElement?.querySelector<HTMLElement>(
        "[data-slide-frame]"
      )

    if (!frame) {
      return
    }

    let frameRequest = 0

    const check = () => {
      cancelAnimationFrame(frameRequest)
      frameRequest = requestAnimationFrame(() => {
        const next = measure(frame)

        setOverflow((current) =>
          isSameOverflow(current, next) ? current : next
        )
      })
    }

    const resizeObserver = new ResizeObserver(check)
    const mutationObserver = new MutationObserver(check)

    resizeObserver.observe(frame)
    mutationObserver.observe(frame, {
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
    if (overflow) {
      console.warn(describe(overflow))
    }
  }, [overflow])

  return (
    <div aria-hidden className="contents" ref={anchorRef}>
      {overflow ? (
        <div
          className="pointer-events-none absolute inset-0 z-50 ring-2 ring-amber-500/60 ring-inset"
          data-slide-overflow=""
        >
          <p className="absolute right-3 bottom-3 rounded-full bg-amber-500/90 px-3 py-1 font-medium text-[11px] text-amber-950">
            {describe(overflow)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
