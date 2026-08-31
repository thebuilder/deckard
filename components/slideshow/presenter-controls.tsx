"use client"

import { MonitorUp } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"

import { useSlideStepper } from "@/components/slideshow/slide-stepper"
import { Button } from "@/components/ui/button"
import {
  PRESENTER_CHANNEL_NAME,
  type PresenterChannelMessage,
  type PresenterSlideState,
} from "@/types/presenter"

interface PresenterSyncProps {
  current: number
  currentSlug: string
  currentTitle: string
  enabled?: boolean
  nextSlide?: {
    slug: string
    title: string
  }
  notes?: string
  slides: Array<{
    title: string
    href: string
  }>
  stepCount: number
  total: number
}

function resolvePreview({
  currentSlug,
  currentTitle,
  currentStep,
  stepCount,
  nextSlide,
}: {
  currentSlug: string
  currentTitle: string
  currentStep: number
  stepCount: number
  nextSlide?: { slug: string; title: string }
}): PresenterSlideState["preview"] {
  if (stepCount > 0 && currentStep < stepCount - 1) {
    return {
      slug: currentSlug,
      step: currentStep + 1,
      title: currentTitle,
    }
  }

  if (nextSlide) {
    return {
      slug: nextSlide.slug,
      step: 0,
      title: nextSlide.title,
    }
  }

  return null
}

function buildPresenterState({
  current,
  total,
  slides,
  currentSlug,
  currentTitle,
  stepCount,
  currentStep,
  notes,
  nextSlide,
}: PresenterSyncProps & {
  currentStep: number
}): PresenterSlideState {
  const preview = resolvePreview({
    currentSlug,
    currentStep,
    currentTitle,
    nextSlide,
    stepCount,
  })

  return {
    current,
    currentStep,
    notes,
    preview,
    sentAt: Date.now(),
    slides,
    slug: currentSlug,
    stepCount,
    title: currentTitle,
    total,
  }
}

export function PresenterSync(props: PresenterSyncProps) {
  const stepper = useSlideStepper()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const currentStep = stepper?.currentStep ?? 0
  const state = useMemo(
    () =>
      buildPresenterState({
        ...props,
        currentStep,
      }),
    [currentStep, props]
  )
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!props.enabled) {
      return
    }

    if (
      typeof window === "undefined" ||
      typeof BroadcastChannel === "undefined"
    ) {
      return
    }

    const channel = new BroadcastChannel(PRESENTER_CHANNEL_NAME)
    channelRef.current = channel

    function handleMessage(event: MessageEvent<PresenterChannelMessage>) {
      if (event.data?.type !== "request-state") {
        return
      }

      channel.postMessage({
        payload: stateRef.current,
        type: "slide-state",
      } satisfies PresenterChannelMessage)
    }

    channel.addEventListener("message", handleMessage)

    return () => {
      channel.removeEventListener("message", handleMessage)
      channel.close()
      channelRef.current = null
    }
  }, [props.enabled])

  useEffect(() => {
    if (!(props.enabled && channelRef.current)) {
      return
    }

    channelRef.current.postMessage({
      payload: state,
      type: "slide-state",
    } satisfies PresenterChannelMessage)
  }, [props.enabled, state])

  return null
}

function openPresenterWindow() {
  const presenterWindow = window.open(
    "/presenter",
    "slideshow-presenter",
    "popup=yes,width=1420,height=920,left=80,top=60"
  )

  presenterWindow?.focus()
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

export function PresenterKeyboardShortcut({
  enabled = true,
}: {
  enabled?: boolean
}) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== "p" ||
        isTypingTarget(event.target)
      ) {
        return
      }

      event.preventDefault()
      openPresenterWindow()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled])

  return null
}

export function PresenterPopoutButton() {
  return (
    <Button
      aria-label="Open presenter view"
      className="border-border/70 bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-accent/70 hover:text-foreground"
      onClick={openPresenterWindow}
      size="icon-sm"
      title="Open presenter view"
      type="button"
      variant="outline"
    >
      <MonitorUp />
    </Button>
  )
}
