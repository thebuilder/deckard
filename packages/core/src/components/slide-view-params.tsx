"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useSyncExternalStore } from "react"

export interface SlideViewParams {
  isPresenterPreview: boolean
  isResolved: boolean
  step: number
}

const unresolvedParams: SlideViewParams = {
  isPresenterPreview: false,
  isResolved: false,
  step: 0,
}

let currentParams = unresolvedParams
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentParams
}

function getServerSnapshot() {
  return unresolvedParams
}

function publish(next: SlideViewParams) {
  if (
    next.isPresenterPreview === currentParams.isPresenterPreview &&
    next.isResolved === currentParams.isResolved &&
    next.step === currentParams.step
  ) {
    return
  }

  currentParams = next

  for (const listener of listeners) {
    listener()
  }
}

function parseStep(value: string | null) {
  if (!value) {
    return 0
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

// A store rather than context: everything that reads the URL has to sit beside the
// slide, not above it, or the Suspense bail-out would take the slide out of the
// prerendered shell with it.
export function useSlideViewParams() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function SlideViewParamsReader() {
  const searchParams = useSearchParams()
  const isPresenterPreview = searchParams.get("presenterPreview") === "1"
  const step = parseStep(searchParams.get("step"))

  useEffect(() => {
    publish({ isPresenterPreview, isResolved: true, step })
  }, [isPresenterPreview, step])

  return null
}

export function SlideViewParamsBoundary() {
  return (
    <Suspense fallback={null}>
      <SlideViewParamsReader />
    </Suspense>
  )
}
