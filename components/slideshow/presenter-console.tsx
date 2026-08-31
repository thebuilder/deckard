"use client"

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  PRESENTER_CHANNEL_NAME,
  type PresenterChannelMessage,
  type PresenterSlideState,
} from "@/types/presenter"

function formatClock(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":")
}

function getFlowWindow(state: PresenterSlideState | null) {
  if (!state) {
    return []
  }

  const currentIndex = state.current - 1
  const start = Math.max(0, currentIndex - 2)
  const end = Math.min(state.slides.length - 1, currentIndex + 5)

  return state.slides.slice(start, end + 1).map((slide, offset) => {
    const index = start + offset
    return {
      href: slide.href,
      index,
      isCurrent: index === currentIndex,
      title: slide.title,
    }
  })
}

type FlowItem = ReturnType<typeof getFlowWindow>[number]

function FlowButton({
  item,
  onSelect,
}: {
  item: FlowItem
  onSelect: (href: string) => void
}) {
  const handleClick = useCallback(() => {
    onSelect(item.href)
  }, [item.href, onSelect])

  return (
    <button
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
        item.isCurrent
          ? "bg-primary/15 text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      }`}
      onClick={handleClick}
      type="button"
    >
      <span className="min-w-7 font-medium text-xs tabular-nums">
        {item.index + 1}
      </span>
      <span className="truncate text-sm">{item.title}</span>
    </button>
  )
}

const previewCanvasWidth = 1920
const previewCanvasHeight = 1080
const previewAspectRatio = previewCanvasWidth / previewCanvasHeight

function PreviewLayer({
  layer,
  src,
  isActive,
  title,
  onLoad,
}: {
  layer: 0 | 1
  src: string
  isActive: boolean
  title: string
  onLoad: (layer: 0 | 1) => void
}) {
  const handleLoad = useCallback(() => {
    onLoad(layer)
  }, [layer, onLoad])

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a resource lifecycle event, not a user interaction
    <iframe
      className={`absolute inset-0 border-0 transition-opacity duration-150 ${
        isActive ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onLoad={handleLoad}
      src={src}
      style={{
        height: previewCanvasHeight,
        width: previewCanvasWidth,
      }}
      title={title}
    />
  )
}

function PreviewFrame({
  previewUrl,
  emptyLabel = "End of deck",
  titlePrefix = "Preview",
}: {
  previewUrl: string | null
  emptyLabel?: string
  titlePrefix?: string
}) {
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0)
  const [layerUrls, setLayerUrls] = useState<[string | null, string | null]>([
    previewUrl,
    null,
  ])

  useEffect(() => {
    if (!previewUrl) {
      setLayerUrls((previous) => {
        if (previous[0] === null && previous[1] === null) {
          return previous
        }

        return [null, null]
      })
      return
    }

    setLayerUrls((previous) => {
      const currentActiveUrl = previous[activeLayer]

      if (currentActiveUrl === previewUrl) {
        return previous
      }

      const hiddenLayer = activeLayer === 0 ? 1 : 0

      if (previous[hiddenLayer] === previewUrl) {
        return previous
      }

      const nextUrls: [string | null, string | null] = [...previous]
      nextUrls[hiddenLayer] = previewUrl
      return nextUrls
    })
  }, [activeLayer, previewUrl])

  const handleLoad = useCallback(
    (layer: 0 | 1) => {
      if (layerUrls[layer] !== previewUrl || !previewUrl) {
        return
      }

      setActiveLayer(layer)
    },
    [layerUrls, previewUrl]
  )

  if (!previewUrl) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground text-sm">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-card/40"
      style={{ containerType: "size" }}
    >
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          height: previewCanvasHeight,
          transform:
            "translate(-50%, -50%) scale(min(calc(100cqw / 1920px), calc(100cqh / 1080px)))",
          transformOrigin: "center center",
          width: previewCanvasWidth,
        }}
      >
        {([0, 1] as const).map((layer) => {
          const src = layerUrls[layer]

          if (!src) {
            return null
          }

          return (
            <PreviewLayer
              isActive={activeLayer === layer}
              key={`${layer}-${src}`}
              layer={layer}
              onLoad={handleLoad}
              src={src}
              title={`${titlePrefix} ${layer + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export function PresenterConsole() {
  const [state, setState] = useState<PresenterSlideState | null>(null)
  const [connected, setConnected] = useState(false)
  const [clock, setClock] = useState(() => new Date())
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [notesFontSize, setNotesFontSize] = useState(1.5)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") {
      return
    }

    const channel = new BroadcastChannel(PRESENTER_CHANNEL_NAME)
    channelRef.current = channel

    function handleMessage(event: MessageEvent<PresenterChannelMessage>) {
      if (event.data?.type !== "slide-state") {
        return
      }

      setConnected(true)
      setState(event.data.payload)
      setStartedAt((value) => value ?? Date.now())
    }

    channel.addEventListener("message", handleMessage)
    channel.postMessage({
      type: "request-state",
    } satisfies PresenterChannelMessage)

    return () => {
      channel.removeEventListener("message", handleMessage)
      channel.close()
      channelRef.current = null
    }
  }, [])

  const elapsed = startedAt ? formatElapsed(Date.now() - startedAt) : "00:00:00"
  const currentSlideUrl = state
    ? `/slides/${state.slug}?presenterPreview=1&step=${state.currentStep}`
    : null
  const nextStepPreviewUrl = state?.preview
    ? `/slides/${state.preview.slug}?presenterPreview=1&step=${state.preview.step}`
    : null
  const notesLineHeight = Number((notesFontSize * 1.45).toFixed(2))
  const flowItems = getFlowWindow(state)
  const canNavigatePrevious = Boolean(
    state && (state.current > 1 || state.currentStep > 0)
  )
  const canNavigateNext = Boolean(state?.preview)

  const sendNavigationMessage = useCallback(
    (
      message: Extract<
        PresenterChannelMessage,
        | { type: "navigate-previous" }
        | { type: "navigate-next" }
        | { type: "navigate-to-slide" }
      >
    ) => {
      channelRef.current?.postMessage(message)
    },
    []
  )

  const goToPreviousStep = useCallback(() => {
    sendNavigationMessage({ type: "navigate-previous" })
  }, [sendNavigationMessage])

  const goToNextStep = useCallback(() => {
    sendNavigationMessage({ type: "navigate-next" })
  }, [sendNavigationMessage])

  const goToSlide = useCallback(
    (href: string) => {
      sendNavigationMessage({ href, type: "navigate-to-slide" })
    },
    [sendNavigationMessage]
  )

  const decreaseNotesFontSize = useCallback(() => {
    setNotesFontSize((value) => Number(Math.max(1, value - 0.125).toFixed(3)))
  }, [])

  const increaseNotesFontSize = useCallback(() => {
    setNotesFontSize((value) => Number(Math.min(4, value + 0.125).toFixed(3)))
  }, [])

  return (
    <div className="grid h-svh grid-cols-1 overflow-hidden bg-background text-foreground lg:grid-cols-[22rem_1fr]">
      <aside className="flex min-h-0 flex-col overflow-hidden border-border/70 border-b p-6 lg:border-r lg:border-b-0">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
          Presenter View
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
              Timer
            </p>
            <p className="mt-2 font-semibold text-xl tabular-nums">{elapsed}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
              Current Time
            </p>
            <p className="mt-2 font-semibold text-xl tabular-nums">
              {formatClock(clock)}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
            Next Step Preview
          </p>
          <div
            className="relative mt-3 w-full overflow-hidden rounded-xl border border-border/70 bg-card/40"
            style={{ aspectRatio: previewAspectRatio }}
          >
            <PreviewFrame
              previewUrl={nextStepPreviewUrl}
              titlePrefix="Next step preview"
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-card/60 p-3">
          <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
            Flow
          </p>
          <div className="mt-2 space-y-1">
            {flowItems.length ? (
              flowItems.map((item) => (
                <FlowButton
                  item={item}
                  key={`${item.index}-${item.title}`}
                  onSelect={goToSlide}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Waiting for slideshow flow...
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            className="gap-2"
            disabled={!canNavigatePrevious}
            onClick={goToPreviousStep}
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            className="gap-2"
            disabled={!canNavigateNext}
            onClick={goToNextStep}
            type="button"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <p className="mt-auto pt-4 text-muted-foreground text-xs">
          {connected
            ? "Connected via BroadcastChannel."
            : "Waiting for connection from the slideshow tab."}
        </p>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
              Current Slide
            </p>
            <h2 className="mt-1 font-semibold text-lg tracking-tight">
              {state?.title ?? "Waiting for slideshow"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span className="rounded-full border border-border/70 bg-card/60 px-3 py-1 font-medium">
              {state
                ? `Slide ${state.current} of ${state.total}`
                : "Open a slide tab and start presenting"}
            </span>
            {state ? (
              <span className="rounded-full border border-border/70 bg-card/60 px-3 py-1 font-medium">
                Step {state.currentStep + 1} of {Math.max(state.stepCount, 1)}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/40"
          style={{ aspectRatio: previewAspectRatio }}
        >
          <PreviewFrame
            emptyLabel="Waiting for current slide preview"
            previewUrl={currentSlideUrl}
            titlePrefix="Current slide preview"
          />
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <p
              className="whitespace-pre-wrap text-foreground"
              style={{
                fontSize: `${notesFontSize}rem`,
                lineHeight: `${notesLineHeight}rem`,
              }}
            >
              {state?.notes?.trim().length ? state.notes : ""}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 border-border/70 border-t px-4 py-3">
            <p className="mr-1 font-medium text-muted-foreground text-sm tabular-nums">
              {notesFontSize.toFixed(2)}rem
            </p>
            <Button
              aria-label="Decrease presenter notes font size"
              onClick={decreaseNotesFontSize}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <Minus />
            </Button>
            <Button
              aria-label="Increase presenter notes font size"
              onClick={increaseNotesFontSize}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <Plus />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
