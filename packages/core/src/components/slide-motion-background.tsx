"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import { isCapturing } from "../deck/capture"
import type { MotionFieldHandle } from "../lib/motion-field"
import type { SlideMotionField } from "../types/slides"
import { useSlideViewParams } from "./slide-view-params"

interface SlideMotionBackgroundProps {
  field: SlideMotionField
  /** What a deck or a slide asked for, before the automatic reasons. */
  frozen?: boolean
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery)

  query.addEventListener("change", onChange)

  return () => query.removeEventListener("change", onChange)
}

function readReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

function subscribeToNothing() {
  return () => undefined
}

// Frozen is what the server renders and what hydration agrees on, so a field
// starts still and takes a commit to decide it may move.
function frozenOnTheServer() {
  return true
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    readReducedMotion,
    frozenOnTheServer
  )
}

function useCapturing() {
  return useSyncExternalStore(
    subscribeToNothing,
    isCapturing,
    frozenOnTheServer
  )
}

/**
 * The canvas a theme paints a slide background in. It sits over whatever the
 * theme painted on `.slide-background`, which is what a viewer sees while the
 * runtime loads, when WebGL is unavailable, and when the context is lost.
 *
 * The runtime is fetched on mount rather than imported, so a deck whose theme
 * declares no motion background never loads it.
 */
export function SlideMotionBackground({
  field,
  frozen = false,
}: SlideMotionBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const handleRef = useRef<MotionFieldHandle | null>(null)
  const reducedMotion = useReducedMotion()
  const capturing = useCapturing()
  const params = useSlideViewParams()
  const isFrozen =
    frozen ||
    reducedMotion ||
    capturing ||
    // A presenter preview is a still of the deck, and a slide only knows it is
    // one once the URL resolves, so it holds still until then.
    params.isPresenterPreview ||
    !params.isResolved

  const optionsRef = useRef({ field, frozen: isFrozen })

  // Declared before the effect that starts the runtime, so the options it reads
  // when the chunk lands are the current ones rather than the mounting ones.
  useEffect(() => {
    optionsRef.current = { field, frozen: isFrozen }
    handleRef.current?.refresh(optionsRef.current)
  }, [field, isFrozen])

  useEffect(() => {
    const canvas = canvasRef.current
    let cancelled = false

    // biome-ignore lint/suspicious/noUnnecessaryConditions: TypeScript types ref.current as nullable, so the guard is required to compile
    if (!canvas) {
      return
    }

    import("../lib/motion-field")
      .then(({ startMotionField }) => {
        if (cancelled) {
          return
        }

        handleRef.current = startMotionField(canvas, optionsRef.current)
      })
      .catch(() => {
        // The chunk never arrived. The painted background is the slide.
      })

    return () => {
      cancelled = true
      handleRef.current?.stop()
      handleRef.current = null
    }
  }, [])

  // The background layer above it already carries aria-hidden, and the canvas
  // is focusable, so it must not carry one of its own.
  return <canvas data-slide-motion={field} ref={canvasRef} />
}
