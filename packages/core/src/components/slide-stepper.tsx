"use client"

import { useRouter } from "next/navigation"
import {
  createContext,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { cn } from "../lib/utils"
import {
  PRESENTER_CHANNEL_NAME,
  PRESENTER_PREVIEW_STEP_MESSAGE,
  type PresenterChannelMessage,
  type PresenterPreviewStepMessage,
} from "../types/presenter"

interface SlideStepContextValue {
  advance: () => void
  canAdvance: boolean
  canRetreat: boolean
  currentStep: number
  isReadOnly: boolean
  /** The next step, or the next slide once the steps run out. */
  next: () => boolean
  retreat: () => void
  stepCount: number
}

const SlideStepContext = createContext<SlideStepContextValue | null>(null)

// Element rather than HTMLElement, so the icon inside a button counts: a click
// on it lands on an SVG path.
export function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false
  }

  return Boolean(
    target.closest(
      "a, button, input, textarea, select, summary, details, [role='button'], [contenteditable='true'], [data-step-ignore-click='true']"
    )
  )
}

// A swipe is a horizontal flick, in browser pixels: long enough not to be a
// tap, mostly sideways so a vertical drag never pages, and quick enough not to
// be a slow drag over the slide.
const swipeDistance = 50
const swipeRatio = 1.5
const swipeMaxMs = 800

// Phones run their own back and forward gestures from the screen edges, so a
// touch that starts there is left to the system rather than paging twice.
const systemEdgeGutter = 24

// Content that scrolls sideways keeps the swipe, the way a link keeps the tap.
function isInsideHorizontalScroller(target: EventTarget | null) {
  let node = target instanceof Element ? target : null

  while (node && node !== document.documentElement) {
    if (node.scrollWidth > node.clientWidth) {
      const { overflowX } = window.getComputedStyle(node)

      if (overflowX === "auto" || overflowX === "scroll") {
        return true
      }
    }

    node = node.parentElement
  }

  return false
}

function isIgnoredSwipeStart(event: TouchEvent) {
  const touch = event.touches.item(0)

  return (
    event.touches.length !== 1 ||
    !touch ||
    touch.clientX < systemEdgeGutter ||
    touch.clientX > window.innerWidth - systemEdgeGutter ||
    // A pinch-zoomed page pans sideways under the finger.
    (window.visualViewport?.scale ?? 1) > 1 ||
    // The slide, not a dialog or the controls laid over it.
    !(
      event.target instanceof Element &&
      event.target.closest("[data-slide-viewport]")
    ) ||
    isInteractiveTarget(event.target) ||
    isInsideHorizontalScroller(event.target)
  )
}

export const previousKeys = ["ArrowLeft", "ArrowUp", "PageUp"]
export const nextKeys = ["ArrowRight", "ArrowDown", "PageDown", " "]
const zoomKeys = ["+", "=", "-", "_"]
const zoomCodes = ["Equal", "Minus", "NumpadAdd", "NumpadSubtract"]

export function isIgnoredKeyEvent(event: KeyboardEvent) {
  return (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    zoomKeys.includes(event.key) ||
    zoomCodes.includes(event.code)
  )
}

export function useSlideStepper() {
  return useContext(SlideStepContext)
}

export function SlideStepper({
  children,
  stepCount = 0,
  initialStep = 0,
  readOnly = false,
  previousHref,
  nextHref,
}: {
  children: ReactNode
  stepCount?: number
  initialStep?: number
  readOnly?: boolean
  previousHref?: string
  nextHref?: string
}) {
  const router = useRouter()
  const clampedInitialStep = Math.max(0, Math.min(initialStep, stepCount - 1))
  const [currentStep, setCurrentStep] = useState(clampedInitialStep)

  useEffect(() => {
    setCurrentStep(clampedInitialStep)
  }, [clampedInitialStep])

  const maxStepIndex = Math.max(stepCount - 1, 0)

  // A presenter preview is an iframe the console owns. It steps the frame in
  // place rather than reloading the slide document on every step press.
  useEffect(() => {
    if (!readOnly) {
      return
    }

    function onMessage(event: MessageEvent<PresenterPreviewStepMessage>) {
      if (
        event.origin !== window.location.origin ||
        event.data?.type !== PRESENTER_PREVIEW_STEP_MESSAGE ||
        typeof event.data.step !== "number"
      ) {
        return
      }

      setCurrentStep(Math.max(0, Math.min(event.data.step, maxStepIndex)))
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [maxStepIndex, readOnly])

  const canAdvance = !readOnly && stepCount > 0 && currentStep < maxStepIndex
  const canRetreat = !readOnly && stepCount > 0 && currentStep > 0

  const advance = useCallback(() => {
    if (readOnly) {
      return
    }

    setCurrentStep((step) => Math.min(step + 1, maxStepIndex))
  }, [maxStepIndex, readOnly])

  const retreat = useCallback(() => {
    if (readOnly) {
      return
    }

    setCurrentStep((step) => Math.max(step - 1, 0))
  }, [readOnly])

  const goPrevious = useCallback(() => {
    if (canRetreat) {
      retreat()
      return true
    }

    if (previousHref) {
      router.push(previousHref)
      return true
    }

    return false
  }, [canRetreat, previousHref, retreat, router])

  const goNext = useCallback(() => {
    if (canAdvance) {
      advance()
      return true
    }

    if (nextHref) {
      router.push(nextHref)
      return true
    }

    return false
  }, [advance, canAdvance, nextHref, router])

  const value = useMemo(
    () => ({
      advance,
      canAdvance,
      canRetreat,
      currentStep,
      isReadOnly: readOnly,
      next: goNext,
      retreat,
      stepCount,
    }),
    [
      advance,
      canAdvance,
      canRetreat,
      currentStep,
      goNext,
      readOnly,
      retreat,
      stepCount,
    ]
  )

  useEffect(() => {
    if (readOnly) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isIgnoredKeyEvent(event) || isInteractiveTarget(event.target)) {
        return
      }

      if (previousKeys.includes(event.key) && goPrevious()) {
        event.preventDefault()
        return
      }

      if (nextKeys.includes(event.key) && goNext()) {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goNext, goPrevious, readOnly])

  // Passive and observe-only: the browser keeps its own scrolling and zooming,
  // and a finished horizontal swipe pages the deck the way an arrow key does.
  useEffect(() => {
    if (readOnly) {
      return
    }

    let start: { time: number; x: number; y: number } | null = null

    function onTouchStart(event: TouchEvent) {
      const touch = event.touches.item(0)

      start =
        touch && !isIgnoredSwipeStart(event)
          ? { time: event.timeStamp, x: touch.clientX, y: touch.clientY }
          : null
    }

    function onTouchMove(event: TouchEvent) {
      if (event.touches.length > 1) {
        start = null
      }
    }

    function onTouchCancel() {
      start = null
    }

    function onTouchEnd(event: TouchEvent) {
      const touch = event.changedTouches.item(0)
      const origin = start
      start = null

      if (!(origin && touch) || event.timeStamp - origin.time > swipeMaxMs) {
        return
      }

      const dx = touch.clientX - origin.x
      const dy = touch.clientY - origin.y

      if (
        Math.abs(dx) < swipeDistance ||
        Math.abs(dx) < Math.abs(dy) * swipeRatio
      ) {
        return
      }

      if (dx < 0) {
        goNext()
      } else {
        goPrevious()
      }
    }

    const options = { passive: true }

    window.addEventListener("touchstart", onTouchStart, options)
    window.addEventListener("touchmove", onTouchMove, options)
    window.addEventListener("touchend", onTouchEnd, options)
    window.addEventListener("touchcancel", onTouchCancel, options)

    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchCancel)
    }
  }, [goNext, goPrevious, readOnly])

  useEffect(() => {
    if (readOnly || typeof BroadcastChannel === "undefined") {
      return
    }

    const channel = new BroadcastChannel(PRESENTER_CHANNEL_NAME)

    function handleMessage(event: MessageEvent<PresenterChannelMessage>) {
      if (event.data?.type === "navigate-previous") {
        goPrevious()
        return
      }

      if (event.data?.type === "navigate-next") {
        goNext()
        return
      }

      if (event.data?.type === "navigate-to-slide") {
        router.push(event.data.href)
      }
    }

    channel.addEventListener("message", handleMessage)

    return () => {
      channel.removeEventListener("message", handleMessage)
      channel.close()
    }
  }, [goNext, goPrevious, readOnly, router])

  return (
    <SlideStepContext.Provider value={value}>
      {children}
    </SlideStepContext.Provider>
  )
}

export function SlideStep({
  step,
  children,
  className,
  mountOnReveal = false,
}: {
  step: number
  children: ReactNode
  className?: string
  mountOnReveal?: boolean
}) {
  const context = useSlideStepper()
  const isVisible = context ? step <= context.currentStep : true

  if (mountOnReveal && !isVisible) {
    return <div aria-hidden className={className} />
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "transition-opacity duration-300 ease-out",
        !isVisible && "pointer-events-none opacity-0",
        className
      )}
      inert={isVisible ? undefined : true}
    >
      {children}
    </div>
  )
}

// Now that a click can leave the slide, a click that ends a drag must not: a
// drag across a 3D scene or a chart, or over text to select it, still fires
// one on release.
const dragTolerance = 6

function isDragOrSelection(
  event: MouseEvent,
  pressedAt: { x: number; y: number } | null
) {
  if (window.getSelection()?.isCollapsed === false) {
    return true
  }

  return (
    pressedAt !== null &&
    Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y) >
      dragTolerance
  )
}

export function SlideStepAdvanceArea({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const context = useSlideStepper()
  const pressedAt = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      pressedAt.current = { x: event.clientX, y: event.clientY }
    },
    []
  )

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // A click moves on the way the arrow keys do: through the steps, then
      // to the next slide. Stopping at the last step left a presenter with a
      // clicker stuck on any slide that had steps, and on every slide that
      // had none.
      if (
        !context ||
        context.isReadOnly ||
        isInteractiveTarget(event.target) ||
        isDragOrSelection(event, pressedAt.current)
      ) {
        return
      }

      context.next()
    },
    [context]
  )

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click-to-advance surface wraps arbitrary slide content, so it cannot be an interactive element
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: click-to-advance surface wraps arbitrary slide content, so it cannot be an interactive element
    // biome-ignore lint/a11y/useKeyWithClickEvents: stepping is already bound to arrow, page, and space keys on the window
    <div
      className={className}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  )
}
