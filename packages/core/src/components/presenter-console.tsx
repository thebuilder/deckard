"use client"

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { DeckCanvasConfig } from "../deck/types"
import {
  PRESENTER_CHANNEL_NAME,
  PRESENTER_PREVIEW_STEP_MESSAGE,
  type PresenterChannelMessage,
  type PresenterPreviewState,
  type PresenterPreviewStepMessage,
  type PresenterSlideState,
} from "../types/presenter"
import { Button } from "../ui/button"
import { SlideErrorBoundary } from "./slide-error-boundary"
import { SlideViewport } from "./slide-viewport"

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

  const currentIndex = state.slide.number - 1
  const start = Math.max(0, currentIndex - 2)
  const end = Math.min(state.slides.length - 1, currentIndex + 5)

  return state.slides.slice(start, end + 1).map((slide) => ({
    href: slide.href,
    isCurrent: slide.number === state.slide.number,
    number: slide.number,
    title: slide.title,
  }))
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
        {item.number}
      </span>
      <span className="truncate text-sm">{item.title}</span>
    </button>
  )
}

// The preview iframe renders a slide route at canvas size, so the deck canvas is the only place these numbers come from.
function toPreviewCanvas(canvas: DeckCanvasConfig): DeckCanvasConfig {
  return { ...canvas, margin: 0 }
}

function PreviewLayer({
  canvas,
  layer,
  src,
  isActive,
  title,
  onLoad,
  onMount,
}: {
  canvas: DeckCanvasConfig
  layer: 0 | 1
  src: string
  isActive: boolean
  title: string
  onLoad: (layer: 0 | 1) => void
  onMount: (layer: 0 | 1, frame: HTMLIFrameElement | null) => void
}) {
  const handleLoad = useCallback(() => {
    onLoad(layer)
  }, [layer, onLoad])

  const handleMount = useCallback(
    (frame: HTMLIFrameElement | null) => {
      onMount(layer, frame)
    },
    [layer, onMount]
  )

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a resource lifecycle event, not a user interaction
    <iframe
      className={`absolute inset-0 border-0 transition-opacity duration-150 ${
        isActive ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onLoad={handleLoad}
      ref={handleMount}
      src={src}
      style={{
        height: canvas.height,
        width: canvas.width,
      }}
      title={title}
    />
  )
}

function previewSrc(id: string, step: number) {
  return `/slides/${id}?presenterPreview=1&step=${step}`
}

// The slide document is loaded once per slide and stepped from here. Putting the
// step in the src instead would refetch two whole slides on every step press.
function PreviewFrame({
  canvas,
  previewId,
  step,
  emptyLabel = "End of deck",
  titlePrefix = "Preview",
}: {
  canvas: DeckCanvasConfig
  previewId: string | null
  step: number
  emptyLabel?: string
  titlePrefix?: string
}) {
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0)
  const [layerIds, setLayerIds] = useState<[string | null, string | null]>([
    previewId,
    null,
  ])
  const [layerSrcs, setLayerSrcs] = useState<[string | null, string | null]>([
    previewId ? previewSrc(previewId, step) : null,
    null,
  ])
  // The iframe key is layer plus src, so a layer that already holds the wanted
  // document never fires onLoad again. Reveal it from here instead.
  const loadedIdsRef = useRef<[string | null, string | null]>([null, null])
  const framesRef = useRef<
    [HTMLIFrameElement | null, HTMLIFrameElement | null]
  >([null, null])
  const stepRef = useRef(step)

  stepRef.current = step

  const handleMount = useCallback(
    (layer: 0 | 1, frame: HTMLIFrameElement | null) => {
      framesRef.current[layer] = frame
    },
    []
  )

  useEffect(() => {
    if (!previewId) {
      loadedIdsRef.current = [null, null]
      setLayerIds((previous) =>
        previous[0] === null && previous[1] === null ? previous : [null, null]
      )
      setLayerSrcs((previous) =>
        previous[0] === null && previous[1] === null ? previous : [null, null]
      )
      return
    }

    if (layerIds[activeLayer] === previewId) {
      return
    }

    const hiddenLayer = activeLayer === 0 ? 1 : 0

    if (layerIds[hiddenLayer] === previewId) {
      if (loadedIdsRef.current[hiddenLayer] === previewId) {
        setActiveLayer(hiddenLayer)
      }

      return
    }

    const nextIds: [string | null, string | null] = [...layerIds]
    const nextSrcs: [string | null, string | null] = [...layerSrcs]
    nextIds[hiddenLayer] = previewId
    nextSrcs[hiddenLayer] = previewSrc(previewId, stepRef.current)
    setLayerIds(nextIds)
    setLayerSrcs(nextSrcs)
  }, [activeLayer, layerIds, layerSrcs, previewId])

  useEffect(() => {
    if (!previewId) {
      return
    }

    for (const layer of [0, 1] as const) {
      if (
        layerIds[layer] !== previewId ||
        loadedIdsRef.current[layer] !== previewId
      ) {
        continue
      }

      framesRef.current[layer]?.contentWindow?.postMessage(
        {
          step,
          type: PRESENTER_PREVIEW_STEP_MESSAGE,
        } satisfies PresenterPreviewStepMessage,
        window.location.origin
      )
    }
  }, [layerIds, previewId, step])

  const handleLoad = useCallback(
    (layer: 0 | 1) => {
      loadedIdsRef.current[layer] = layerIds[layer]

      if (layerIds[layer] !== previewId || !previewId) {
        return
      }

      setActiveLayer(layer)
    },
    [layerIds, previewId]
  )

  if (!previewId) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground text-sm">
        {emptyLabel}
      </div>
    )
  }

  return (
    <SlideViewport canvas={toPreviewCanvas(canvas)}>
      {([0, 1] as const).map((layer) => {
        const src = layerSrcs[layer]

        if (!src) {
          return null
        }

        return (
          <PreviewLayer
            canvas={canvas}
            isActive={activeLayer === layer}
            key={`${layer}-${src}`}
            layer={layer}
            onLoad={handleLoad}
            onMount={handleMount}
            src={src}
            title={`${titlePrefix} ${layer + 1}`}
          />
        )
      })}
    </SlideViewport>
  )
}

function CurrentSlidePreview({
  canvas,
  state,
}: {
  canvas: DeckCanvasConfig
  state: PresenterSlideState | null
}) {
  return (
    <SlideErrorBoundary slideId={state?.slide.id ?? "current"}>
      <PreviewFrame
        canvas={canvas}
        emptyLabel="Waiting for current slide preview"
        previewId={state?.slide.id ?? null}
        step={state?.currentStep ?? 0}
        titlePrefix="Current slide preview"
      />
    </SlideErrorBoundary>
  )
}

function NextStepPreview({
  canvas,
  preview,
}: {
  canvas: DeckCanvasConfig
  preview: PresenterPreviewState | null | undefined
}) {
  return (
    <SlideErrorBoundary slideId={preview?.id ?? "next"}>
      <PreviewFrame
        canvas={canvas}
        previewId={preview?.id ?? null}
        step={preview?.step ?? 0}
        titlePrefix="Next step preview"
      />
    </SlideErrorBoundary>
  )
}

export function PresenterConsole({ canvas }: { canvas: DeckCanvasConfig }) {
  const previewAspectRatio = canvas.width / canvas.height
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
  const notesLineHeight = Number((notesFontSize * 1.45).toFixed(2))
  const flowItems = getFlowWindow(state)
  const canNavigatePrevious = Boolean(
    state && (state.slide.number > 1 || state.currentStep > 0)
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
    // Two panes side by side on a wide screen. Narrower than that they become
    // one column the page scrolls, because a phone cannot hold two panes.
    <div className="flex min-h-svh flex-col bg-background text-foreground lg:grid lg:h-svh lg:grid-cols-[22rem_1fr] lg:overflow-hidden">
      <aside className="order-2 flex flex-col border-border/70 border-t p-6 lg:order-none lg:min-h-0 lg:overflow-hidden lg:border-t-0 lg:border-r">
        <p className="order-1 text-muted-foreground text-xs uppercase tracking-[0.22em] lg:order-none">
          Presenter View
        </p>

        <div className="order-4 mt-5 grid grid-cols-2 gap-3 lg:order-none">
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

        <div className="order-3 mt-5 rounded-xl border border-border/70 bg-card/60 p-4 lg:order-none">
          <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
            Next Step Preview
          </p>
          <div
            className="relative mt-3 w-full overflow-hidden rounded-xl border border-border/70 bg-card/40"
            style={{ aspectRatio: previewAspectRatio }}
          >
            <NextStepPreview canvas={canvas} preview={state?.preview} />
          </div>
        </div>

        <div className="order-5 mt-4 rounded-xl border border-border/70 bg-card/60 p-3 lg:order-none">
          <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
            Flow
          </p>
          <div className="mt-2 space-y-1">
            {flowItems.length ? (
              flowItems.map((item) => (
                <FlowButton item={item} key={item.href} onSelect={goToSlide} />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Waiting for slideshow flow...
              </p>
            )}
          </div>
        </div>

        <div className="order-2 mt-4 flex items-center justify-between gap-3 lg:order-none">
          <Button
            className="gap-2"
            disabled={!canNavigatePrevious}
            onClick={goToPreviousStep}
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" data-icon="inline-start" />
            Previous
          </Button>
          <Button
            className="gap-2"
            disabled={!canNavigateNext}
            onClick={goToNextStep}
            type="button"
          >
            Next
            <ChevronRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>

        <p className="order-6 pt-4 text-muted-foreground text-xs lg:order-none lg:mt-auto">
          {connected
            ? "Connected via BroadcastChannel."
            : "Waiting for connection from the slideshow tab."}
        </p>
      </aside>

      <section className="order-1 flex flex-col p-5 sm:p-6 lg:order-none lg:min-h-0 lg:overflow-hidden">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
              Current Slide
            </p>
            <h2 className="mt-1 font-semibold text-lg tracking-tight">
              {state?.slide.title ?? "Waiting for slideshow"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span className="rounded-full border border-border/70 bg-card/60 px-3 py-1 font-medium">
              {state
                ? `Slide ${state.slide.number} of ${state.slides.length}`
                : "Open a slide tab and start presenting"}
            </span>
            {state ? (
              <span className="rounded-full border border-border/70 bg-card/60 px-3 py-1 font-medium">
                Step {state.currentStep + 1} of{" "}
                {Math.max(state.slide.stepCount, 1)}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/40"
          style={{ aspectRatio: previewAspectRatio }}
        >
          <CurrentSlidePreview canvas={canvas} state={state} />
        </div>

        <div className="mt-5 flex flex-col rounded-2xl border border-border/80 bg-card/80 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <div className="p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
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
