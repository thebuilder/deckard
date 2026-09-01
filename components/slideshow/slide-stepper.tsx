"use client"

import { useRouter } from "next/navigation"
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { cn } from "@/lib/utils"
import {
  PRESENTER_CHANNEL_NAME,
  type PresenterChannelMessage,
} from "@/types/presenter"

interface SlideStepContextValue {
  advance: () => void
  canAdvance: boolean
  canRetreat: boolean
  currentStep: number
  isReadOnly: boolean
  retreat: () => void
  stepCount: number
}

const SlideStepContext = createContext<SlideStepContextValue | null>(null)

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.closest(
      "a, button, input, textarea, select, summary, details, [role='button'], [contenteditable='true'], [data-step-ignore-click='true']"
    )
  )
}

const previousKeys = ["ArrowLeft", "ArrowUp", "PageUp"]
const nextKeys = ["ArrowRight", "ArrowDown", "PageDown", " "]
const zoomKeys = ["+", "=", "-", "_"]
const zoomCodes = ["Equal", "Minus", "NumpadAdd", "NumpadSubtract"]

function isIgnoredKeyEvent(event: KeyboardEvent) {
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
    if (readOnly) {
      setCurrentStep(clampedInitialStep)
      return
    }

    setCurrentStep(0)
  }, [clampedInitialStep, readOnly])

  const maxStepIndex = Math.max(stepCount - 1, 0)
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
      retreat,
      stepCount,
    }),
    [advance, canAdvance, canRetreat, currentStep, readOnly, retreat, stepCount]
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
  const stepRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!(context && isVisible) || context.currentStep !== step) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      stepRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [context, isVisible, step])

  if (mountOnReveal && !isVisible) {
    return (
      <div
        aria-hidden
        className={cn("scroll-mt-32 scroll-mb-28 sm:scroll-mb-32", className)}
        ref={stepRef}
      />
    )
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "scroll-mt-32 scroll-mb-28 transition-opacity duration-300 ease-out sm:scroll-mb-32",
        !isVisible && "pointer-events-none opacity-0",
        className
      )}
      ref={stepRef}
    >
      {children}
    </div>
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

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!context?.canAdvance || isInteractiveTarget(event.target)) {
        return
      }

      context.advance()
    },
    [context]
  )

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click-to-advance surface wraps arbitrary slide content, so it cannot be an interactive element
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: click-to-advance surface wraps arbitrary slide content, so it cannot be an interactive element
    // biome-ignore lint/a11y/useKeyWithClickEvents: stepping is already bound to arrow, page, and space keys on the window
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  )
}
