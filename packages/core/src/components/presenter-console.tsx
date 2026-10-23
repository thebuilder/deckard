"use client"

import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from "lucide-react"
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { slideCountLabel } from "../deck/slide-summary"
import type { DeckCanvasConfig, SlideSummary } from "../deck/types"
import {
  PRESENTER_CHANNEL_NAME,
  PRESENTER_PREVIEW_STEP_MESSAGE,
  type PresenterChannelMessage,
  type PresenterPreviewState,
  type PresenterPreviewStepMessage,
  type PresenterSlideState,
} from "../types/presenter"
import { Button } from "../ui/button"
import { isTypingTarget } from "./presenter-controls"
import { SlideErrorBoundary } from "./slide-error-boundary"
import {
  isIgnoredKeyEvent,
  isInteractiveTarget,
  nextKeys,
  previousKeys,
} from "./slide-stepper"
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
    label: slideCountLabel(slide),
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
      aria-current={item.isCurrent ? "step" : undefined}
      className={`flex w-full items-baseline gap-3 py-1 text-left outline-none transition-colors focus-visible:text-foreground ${
        item.isCurrent
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={handleClick}
      type="button"
    >
      <span
        className={`min-w-6 text-xs tabular-nums ${
          item.isCurrent ? "text-primary" : ""
        }`}
      >
        {item.label}
      </span>
      <span
        className={`truncate text-sm ${item.isCurrent ? "font-medium" : ""}`}
      >
        {item.title}
      </span>
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
    // A preview is a still. Inert keeps a click from moving focus into the
    // frame, where the console's keys would stop reaching the deck. Autoplay
    // is off for the frame and everything nested in it, so a slide that starts
    // its own sound, such as Web Audio in an embedded page, stays silent here
    // instead of playing alongside the deck and on after the deck moves on.
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a resource lifecycle event, not a user interaction
    <iframe
      allow="autoplay 'none'"
      className={`pointer-events-none absolute inset-0 border-0 transition-opacity duration-150 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
      inert
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

function previewSrc(slidesPath: string, id: string, step: number) {
  return `${slidesPath}/${id}?presenterPreview=1&step=${step}`
}

// The slide document is loaded once per slide and stepped from here. Putting the
// step in the src instead would refetch two whole slides on every step press.
function PreviewFrame({
  canvas,
  previewId,
  slidesPath,
  step,
  emptyLabel = "End of deck",
  titlePrefix = "Preview",
}: {
  canvas: DeckCanvasConfig
  previewId: string | null
  slidesPath: string
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
    previewId ? previewSrc(slidesPath, previewId, step) : null,
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
    nextSrcs[hiddenLayer] = previewSrc(slidesPath, previewId, stepRef.current)
    setLayerIds(nextIds)
    setLayerSrcs(nextSrcs)
  }, [activeLayer, layerIds, layerSrcs, previewId, slidesPath])

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
  slidesPath,
  state,
}: {
  canvas: DeckCanvasConfig
  slidesPath: string
  state: PresenterSlideState | null
}) {
  return (
    <SlideErrorBoundary slideId={state?.slide.id ?? "current"}>
      <PreviewFrame
        canvas={canvas}
        emptyLabel="Waiting for current slide preview"
        previewId={state?.slide.id ?? null}
        slidesPath={slidesPath}
        step={state?.currentStep ?? 0}
        titlePrefix="Current slide preview"
      />
    </SlideErrorBoundary>
  )
}

function NextStepPreview({
  canvas,
  preview,
  slidesPath,
}: {
  canvas: DeckCanvasConfig
  preview: PresenterPreviewState | null | undefined
  slidesPath: string
}) {
  return (
    <SlideErrorBoundary slideId={preview?.id ?? "next"}>
      <PreviewFrame
        canvas={canvas}
        previewId={preview?.id ?? null}
        slidesPath={slidesPath}
        step={preview?.step ?? 0}
        titlePrefix="Next step preview"
      />
    </SlideErrorBoundary>
  )
}

// Null until the deck first connects, which starts it. After that only the
// presenter starts, pauses, or zeroes it.
interface TimerState {
  accumulatedMs: number
  runningSince: number | null
}

function timerElapsed(timer: TimerState, now: number) {
  return timer.runningSince === null
    ? timer.accumulatedMs
    : timer.accumulatedMs + now - timer.runningSince
}

function slidePosition(slide: SlideSummary | undefined, total: number) {
  if (!slide) {
    return null
  }

  if (slide.counted === false) {
    return "Not counted"
  }

  return `${slide.countedNumber ?? slide.number} / ${slide.countedTotal ?? total}`
}

export function PresenterConsole({
  canvas,
  slidesPath = "/slides",
}: {
  canvas: DeckCanvasConfig
  slidesPath?: string
}) {
  const previewAspectRatio = canvas.width / canvas.height
  const [state, setState] = useState<PresenterSlideState | null>(null)
  const [clock, setClock] = useState(() => new Date())
  const [timer, setTimer] = useState<TimerState | null>(null)
  const [notesFontSize, setNotesFontSize] = useState(1.5)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock(new Date())
    }, 1000)

    return () => window.clearInterval(interval)
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

      setState(event.data.payload)

      setTimer(
        (value) => value ?? { accumulatedMs: 0, runningSince: Date.now() }
      )
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

  const isTimerRunning = Boolean(timer?.runningSince)
  const elapsed = formatElapsed(
    timer ? timerElapsed(timer, clock.getTime()) : 0
  )
  const notesLineHeight = Number((notesFontSize * 1.45).toFixed(2))
  const flowItems = getFlowWindow(state)
  const position = slidePosition(state?.slide, state?.slides.length ?? 0)
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

  // The deck's own keys, sent on to the deck. Space on a focused button is
  // left to press the button, so one press never moves twice.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isIgnoredKeyEvent(event) || isTypingTarget(event.target)) {
        return
      }

      if (event.key === " " && isInteractiveTarget(event.target)) {
        return
      }

      if (previousKeys.includes(event.key)) {
        event.preventDefault()
        goToPreviousStep()
        return
      }

      if (nextKeys.includes(event.key)) {
        event.preventDefault()
        goToNextStep()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goToNextStep, goToPreviousStep])

  const toggleTimer = useCallback(() => {
    const now = Date.now()
    setClock(new Date(now))
    setTimer((value) =>
      value?.runningSince
        ? { accumulatedMs: timerElapsed(value, now), runningSince: null }
        : { accumulatedMs: value?.accumulatedMs ?? 0, runningSince: now }
    )
  }, [])

  const resetTimer = useCallback(() => {
    const now = Date.now()
    setClock(new Date(now))
    setTimer(
      (value) =>
        value && {
          accumulatedMs: 0,
          runningSince: value.runningSince === null ? null : now,
        }
    )
  }, [])

  const decreaseNotesFontSize = useCallback(() => {
    setNotesFontSize((value) => Number(Math.max(1, value - 0.125).toFixed(3)))
  }, [])

  const increaseNotesFontSize = useCallback(() => {
    setNotesFontSize((value) => Number(Math.min(4, value + 0.125).toFixed(3)))
  }, [])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground lg:h-svh lg:overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-border/60 border-b px-5 py-3 sm:px-6">
        <div className="flex min-w-40 flex-1 items-center">
          {state ? (
            <p className="flex min-w-0 items-baseline gap-3">
              <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
                {position}
              </span>
              <span className="truncate font-medium">{state.slide.title}</span>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Waiting for connection from the slideshow tab.
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <p
            className={`mr-2 font-medium text-2xl tabular-nums tracking-tight transition-colors ${
              isTimerRunning ? "text-foreground" : "text-muted-foreground"
            }`}
            title={isTimerRunning ? "Elapsed" : "Elapsed, paused"}
          >
            {elapsed}
          </p>
          <Button
            aria-label={isTimerRunning ? "Pause timer" : "Start timer"}
            onClick={toggleTimer}
            size="icon-sm"
            title={isTimerRunning ? "Pause timer" : "Start timer"}
            type="button"
            variant="ghost"
          >
            {isTimerRunning ? <Pause /> : <Play />}
          </Button>
          <Button
            aria-label="Reset timer"
            onClick={resetTimer}
            size="icon-sm"
            title="Reset timer"
            type="button"
            variant="ghost"
          >
            <RotateCcw />
          </Button>
        </div>

        <p
          className="text-muted-foreground text-sm tabular-nums"
          title="Current time"
        >
          {formatClock(clock)}
        </p>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Button
            aria-label="Decrease presenter notes font size"
            onClick={decreaseNotesFontSize}
            size="icon-sm"
            title={`Notes at ${notesFontSize.toFixed(2)}rem`}
            type="button"
            variant="ghost"
          >
            <Minus />
          </Button>
          <span aria-hidden className="text-xs">
            Notes
          </span>
          <Button
            aria-label="Increase presenter notes font size"
            onClick={increaseNotesFontSize}
            size="icon-sm"
            title={`Notes at ${notesFontSize.toFixed(2)}rem`}
            type="button"
            variant="ghost"
          >
            <Plus />
          </Button>
        </div>
      </header>

      {/* Two columns on a wide screen. Narrower than that they stack into one
          the page scrolls, because a phone cannot hold both. */}
      <div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[1fr_22rem]">
        <section className="flex flex-col lg:min-h-0">
          {/* On a wide screen the slide fits whatever the notes leave, measured
              off this box as a size container. */}
          <div className="flex justify-center p-5 sm:p-6 lg:min-h-0 lg:flex-1 lg:[container-type:size]">
            <div
              className="relative w-full overflow-hidden bg-muted ring-1 ring-border/60 lg:w-[min(100cqw,calc(100cqh*var(--preview-aspect-ratio)))]"
              style={
                {
                  "--preview-aspect-ratio": previewAspectRatio,
                  aspectRatio: previewAspectRatio,
                } as CSSProperties
              }
            >
              <CurrentSlidePreview
                canvas={canvas}
                slidesPath={slidesPath}
                state={state}
              />
            </div>
          </div>

          <div className="min-h-48 border-border/60 border-t px-5 py-5 sm:px-6 lg:min-h-56 lg:basis-[30%] lg:overflow-y-auto">
            <p
              className="max-w-[70ch] whitespace-pre-wrap text-foreground"
              style={{
                fontSize: `${notesFontSize}rem`,
                lineHeight: `${notesLineHeight}rem`,
              }}
            >
              {state?.notes?.trim().length ? state.notes : ""}
            </p>
          </div>
        </section>

        <aside className="flex flex-col gap-8 border-border/60 border-t p-5 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div>
            <p className="text-muted-foreground text-xs">Next</p>
            <div
              className="relative mt-2 w-full overflow-hidden bg-muted ring-1 ring-border/60"
              style={{ aspectRatio: previewAspectRatio }}
            >
              <NextStepPreview
                canvas={canvas}
                preview={state?.preview}
                slidesPath={slidesPath}
              />
            </div>
            {state?.preview ? (
              <p className="mt-2 truncate text-muted-foreground text-sm">
                {state.preview.id === state.slide.id
                  ? `Step ${state.preview.step + 1} of ${state.slide.stepCount}`
                  : state.preview.title}
              </p>
            ) : null}
          </div>

          <nav aria-label="Slides">
            <p className="text-muted-foreground text-xs">Slides</p>
            <div className="mt-2">
              {flowItems.map((item) => (
                <FlowButton item={item} key={item.href} onSelect={goToSlide} />
              ))}
            </div>
          </nav>

          <div className="order-first flex items-center justify-between gap-3 lg:order-none lg:mt-auto">
            <Button
              className="gap-2"
              disabled={!canNavigatePrevious}
              onClick={goToPreviousStep}
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="size-4" data-icon="inline-start" />
              Previous
            </Button>
            <Button
              className="gap-2"
              disabled={!canNavigateNext}
              onClick={goToNextStep}
              type="button"
              variant="outline"
            >
              Next
              <ChevronRight className="size-4" data-icon="inline-end" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
