"use client"

import { MonitorUp } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"

import { useSlideStepper } from "@/components/slideshow/slide-stepper"
import { Button } from "@/components/ui/button"
import type { SlideSummary } from "@/lib/deck/types"
import {
  PRESENTER_CHANNEL_NAME,
  type PresenterChannelMessage,
  type PresenterSlideState,
} from "@/types/presenter"

interface PresenterSyncProps {
  enabled?: boolean
  next?: SlideSummary
  notes?: string
  slide: SlideSummary
  slides: SlideSummary[]
}

function resolvePreview({
  slide,
  currentStep,
  next,
}: {
  slide: SlideSummary
  currentStep: number
  next?: SlideSummary
}): PresenterSlideState["preview"] {
  if (slide.stepCount > 0 && currentStep < slide.stepCount - 1) {
    return {
      id: slide.id,
      step: currentStep + 1,
      title: slide.title,
    }
  }

  if (next) {
    return {
      id: next.id,
      step: 0,
      title: next.title,
    }
  }

  return null
}

function buildPresenterState({
  slide,
  slides,
  currentStep,
  notes,
  next,
}: PresenterSyncProps & {
  currentStep: number
}): PresenterSlideState {
  return {
    currentStep,
    notes,
    preview: resolvePreview({ currentStep, next, slide }),
    sentAt: Date.now(),
    slide,
    slides,
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
