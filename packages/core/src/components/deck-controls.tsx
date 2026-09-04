"use client"

import { ArrowLeft, ArrowRight, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import type { RefObject } from "react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type { SlideSummary } from "../deck/types"
import { cn } from "../lib/utils"
import { Button } from "../ui/button"
import { SlideshowColorModeToggle } from "./color-mode-toggle"
import { PresenterPopoutButton } from "./presenter-controls"
import { SlideCommandCenter } from "./slide-command-center"
import { useSlideStepper } from "./slide-stepper"

// A preview and a PDF page carry the deck, not the tooling to drive it.
const controlsHiddenClass = "group-data-[slide-chrome=hidden]/shell:hidden"

// Browser pixels from the cluster, not canvas pixels: this is a hit area for a
// hand, so it stays the same size whatever the deck is scaled to.
const revealDistance = 160

// Two frames at 60Hz. Long enough that a painting page always measures on its
// frame callback instead, short enough that a hand does not outrun it.
const frameFallbackMs = 32

// A hybrid laptop has a trackpad and a touchscreen, and (pointer: coarse) names
// only the primary one. any-pointer asks per capability: a coarse pointer
// anywhere earns the handle, a fine pointer anywhere earns the proximity
// reveal, so a hybrid gets both. Either that or hover earns the reveal, because
// a headless engine can report one of them missing while still delivering
// pointermove.
const touchQuery = "(any-pointer: coarse)"
const finePointerQuery = "(any-pointer: fine)"
const hoverQuery = "(hover: hover)"

// Kept at module scope because the cluster remounts on every slide navigation.
// Without the last pointer position a reveal earned by proximity would drop
// until the hand moves again, and without the last reveal state the cluster
// would mount hidden and blink back in one frame later.
let lastPointerPosition: { x: number; y: number } | null = null
let lastIsNear = false

export function resetDeckControlsMemory() {
  lastPointerPosition = null
  lastIsNear = false
}

function useMediaQuery(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)

      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    [query]
  )

  const read = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, read, () => serverValue)
}

function distanceToBox(box: DOMRect, x: number, y: number) {
  const dx = Math.max(box.left - x, 0, x - box.right)
  const dy = Math.max(box.top - y, 0, y - box.bottom)

  return Math.hypot(dx, dy)
}

function usePointerProximity(
  anchor: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const [isNear, setIsNear] = useState(() => enabled && lastIsNear)

  useEffect(() => {
    lastIsNear = isNear
  }, [isNear])

  useEffect(() => {
    if (!enabled) {
      setIsNear(false)
      return
    }

    let frame = 0
    let timer = 0
    let point = lastPointerPosition

    function clearPending() {
      if (frame !== 0) {
        cancelAnimationFrame(frame)
        frame = 0
      }

      if (timer !== 0) {
        clearTimeout(timer)
        timer = 0
      }
    }

    function measure() {
      clearPending()

      const node = anchor.current

      if (!(node && point)) {
        return
      }

      setIsNear(
        distanceToBox(node.getBoundingClientRect(), point.x, point.y) <=
          revealDistance
      )
    }

    // A frame callback coalesces the moves, since measuring reads layout. An
    // engine that is not compositing never runs one, so a timer races it and
    // whichever lands first measures. On a page that paints, the frame always
    // wins and the timer is cancelled unused.
    function schedule() {
      if (frame !== 0 || timer !== 0) {
        return
      }

      frame = requestAnimationFrame(measure)
      timer = window.setTimeout(measure, frameFallbackMs)
    }

    function handlePointerMove(event: PointerEvent) {
      point = { x: event.clientX, y: event.clientY }
      lastPointerPosition = point
      schedule()
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })

    if (point) {
      schedule()
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      clearPending()
    }
  }, [anchor, enabled])

  return isNear
}

// Focus rather than :focus-visible: a control that has taken focus has to be
// visible, whether the focus came from Tab, a script, or assistive tech.
function useFocusWithin(anchor: RefObject<HTMLElement | null>) {
  const [hasFocus, setHasFocus] = useState(false)

  useEffect(() => {
    const node = anchor.current

    if (!node) {
      return
    }

    function handleFocusIn() {
      setHasFocus(true)
    }

    function handleFocusOut(event: FocusEvent) {
      const nextTarget = event.relatedTarget

      if (nextTarget instanceof Node && anchor.current?.contains(nextTarget)) {
        return
      }

      setHasFocus(false)
    }

    node.addEventListener("focusin", handleFocusIn)
    node.addEventListener("focusout", handleFocusOut)

    return () => {
      node.removeEventListener("focusin", handleFocusIn)
      node.removeEventListener("focusout", handleFocusOut)
    }
  }, [anchor])

  return hasFocus
}

interface DeckControlsProps {
  currentNumber: number
  deckTitle: string
  next?: SlideSummary
  presenterHref?: string
  previous?: SlideSummary
  showColorModeToggle: boolean
  slides: SlideSummary[]
}

export function DeckControls({
  currentNumber,
  deckTitle,
  next,
  presenterHref,
  previous,
  showColorModeToggle,
  slides,
}: DeckControlsProps) {
  const router = useRouter()
  const stepper = useSlideStepper()
  const anchor = useRef<HTMLElement | null>(null)
  const hasTouch = useMediaQuery(touchQuery, false)
  const hasFinePointer = useMediaQuery(finePointerQuery, true)
  const canHover = useMediaQuery(hoverQuery, true)
  const isNear = usePointerProximity(anchor, hasFinePointer || canHover)
  const isFocused = useFocusWithin(anchor)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const previousHref = previous?.href
  const nextHref = next?.href

  const goPrevious = useCallback(() => {
    if (stepper?.canRetreat) {
      stepper.retreat()
      return
    }

    if (previousHref) {
      router.push(previousHref)
    }
  }, [previousHref, router, stepper])

  const goNext = useCallback(() => {
    if (stepper?.canAdvance) {
      stepper.advance()
      return
    }

    if (nextHref) {
      router.push(nextHref)
    }
  }, [nextHref, router, stepper])

  const togglePinned = useCallback(() => {
    setIsPinned((pinned) => !pinned)
  }, [])

  const hasPrevious = Boolean(previousHref || stepper?.canRetreat)
  const hasNext = Boolean(nextHref || stepper?.canAdvance)
  const isRevealed = isNear || isFocused || isCommandOpen || isPinned

  return (
    <nav
      aria-label="Deck controls"
      className={cn(
        "pointer-events-none absolute right-0 bottom-0 z-50 flex items-center gap-2 p-3 sm:p-4",
        controlsHiddenClass
      )}
      data-deck-controls=""
      data-deck-controls-revealed={isRevealed ? "" : undefined}
      ref={anchor}
    >
      {hasTouch ? (
        <Button
          aria-expanded={isRevealed}
          aria-label={isRevealed ? "Hide deck controls" : "Show deck controls"}
          className="pointer-events-auto border-border/70 bg-background/80 text-muted-foreground backdrop-blur-sm"
          onClick={togglePinned}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronUp
            className={cn(
              "transition-transform motion-reduce:transition-none",
              isRevealed && "rotate-180"
            )}
          />
        </Button>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-2 transition-[opacity,transform] duration-150 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none",
          isRevealed
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
        data-deck-controls-cluster=""
      >
        <SlideCommandCenter
          currentNumber={currentNumber}
          deckTitle={deckTitle}
          onOpenChange={setIsCommandOpen}
          slides={slides}
        />
        {presenterHref ? <PresenterPopoutButton href={presenterHref} /> : null}
        {showColorModeToggle ? <SlideshowColorModeToggle /> : null}

        <Button
          aria-label="Previous slide"
          className="border-border/70 bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-accent/70 hover:text-foreground"
          disabled={!hasPrevious}
          onClick={goPrevious}
          size="icon-sm"
          title="Previous slide"
          type="button"
          variant="outline"
        >
          <ArrowLeft />
        </Button>

        <Button
          aria-label="Next slide"
          className="backdrop-blur-sm"
          disabled={!hasNext}
          onClick={goNext}
          size="icon-sm"
          title="Next slide"
          type="button"
          variant="default"
        >
          <ArrowRight />
        </Button>
      </div>
    </nav>
  )
}
