"use client"

import { useEffect, useRef, useState } from "react"

import {
  describeSlideLayoutFinding,
  measureSlideLayout,
  type SlideLayoutFinding,
} from "../lib/slide-layout"

// The frame is the slide, the chrome is painted inside the same canvas, and a
// box that hides its own overflow says nothing at all. All three are measured by
// measureSlideLayout, which is the same function deckard check-overflow
// evaluates in CI, so the ring and the gate can never disagree.
const observed = [
  "[data-slide-frame]",
  "[data-slide-header]",
  "[data-slide-footer]",
]

function key(finding: SlideLayoutFinding) {
  return `${finding.check}:${finding.band ?? ""}:${finding.part}:${finding.x}:${finding.y}`
}

function isSameReport(left: SlideLayoutFinding[], right: SlideLayoutFinding[]) {
  return (
    left.length === right.length &&
    left.every((finding, index) => key(finding) === key(right[index]))
  )
}

function describe(finding: SlideLayoutFinding) {
  const phrase = describeSlideLayoutFinding(finding)

  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`
}

// Development-only feedback: the canvas clips silently, so authors get told the moment a slide asks for more room than it has.
export function SlideOverflowGuard() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [findings, setFindings] = useState<SlideLayoutFinding[]>([])

  useEffect(() => {
    const canvas = anchorRef.current?.parentElement

    if (!canvas) {
      return
    }

    let frameRequest = 0

    const check = () => {
      cancelAnimationFrame(frameRequest)
      frameRequest = requestAnimationFrame(() => {
        const next = measureSlideLayout(canvas).findings

        setFindings((current) => (isSameReport(current, next) ? current : next))
      })
    }

    const resizeObserver = new ResizeObserver(check)
    const mutationObserver = new MutationObserver(check)

    for (const selector of observed) {
      const element = canvas.querySelector<HTMLElement>(selector)

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
    for (const finding of findings) {
      console.warn(describe(finding))
    }
  }, [findings])

  return (
    <div aria-hidden className="contents" ref={anchorRef}>
      {findings.length > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 z-50 ring-2 ring-amber-500/60 ring-inset"
          data-slide-overflow=""
        >
          <div className="absolute right-3 bottom-3 space-y-1 text-right">
            {findings.map((finding) => (
              <p
                className="inline-block rounded-full bg-amber-500/90 px-3 py-1 font-medium text-[11px] text-amber-950"
                key={key(finding)}
              >
                {describe(finding)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
