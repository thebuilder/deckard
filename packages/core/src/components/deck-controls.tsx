"use client"

import { ArrowLeft, ArrowRight, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import type { RefObject } from "react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { isCapturing } from "../deck/capture"
import type { SlideSummary } from "../deck/types"
import { cn } from "../lib/utils"
import { Button } from "../ui/button"
import { SlideshowColorModeToggle } from "./color-mode-toggle"
import { PresenterPopoutButton } from "./presenter-controls"
import { SlideCommandCenter } from "./slide-command-center"
import { useSlideStepper } from "./slide-stepper"
import { useSlideViewParams } from "./slide-view-params"

// A preview and a PDF page carry the deck, not the tooling to drive it.
const controlsHiddenClass = "group-data-[slide-chrome=hidden]/shell:hidden"

// Browser pixels from the cluster, not canvas pixels: this is a hit area for a
// hand, so it stays the same size whatever the deck is scaled to.
const revealDistance = 160

// How long the cluster stays up after the pointer last moved anywhere in the
// window, and after the deck first mounts on a page load.
const idleHideMs = 2500

// A hybrid laptop has a trackpad and a touchscreen, and (pointer: coarse) names
// only the primary one. any-pointer asks per capability: a coarse pointer
// anywhere earns the handle, a fine pointer anywhere earns the pointer reveal,
// so a hybrid gets both. Either that or hover earns the reveal, because a
// headless engine can report one of them missing while still delivering
// pointermove.
const touchQuery = "(any-pointer: coarse)"
const finePointerQuery = "(any-pointer: fine)"
const hoverQuery = "(hover: hover)"

// Kept at module scope because the cluster remounts on every slide navigation.
// The deadline carries a reveal earned by movement across the navigation it
// caused, the last position lets a new mount see a pointer resting near the
// corner, and the intro flag keeps the first-mount reveal to one per page load.
let lastPointerPosition: { x: number; y: number } | null = null
let activeUntil = 0
let hasIntroduced = false

/** Forgets what the cluster remembers across navigations, as a page load does. */
export function resetDeckControlsMemory() {
  lastPointerPosition = null
  activeUntil = 0
  hasIntroduced = false
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

function isPointerNear(anchor: RefObject<HTMLElement | null>) {
  const node = anchor.current

  if (!(node && lastPointerPosition)) {
    return false
  }

  const box = node.getBoundingClientRect()
  const { x, y } = lastPointerPosition
  const dx = Math.max(box.left - x, 0, x - box.right)
  const dy = Math.max(box.top - y, 0, y - box.bottom)

  return Math.hypot(dx, dy) <= revealDistance
}

// Any non-touch pointer movement in the window raises the cluster until the
// pointer has been still for idleHideMs. Touch moves are left to the handle.
// When the time runs out the cluster measures the last pointer position once,
// and stays up while the pointer rests within revealDistance of it. The first
// mount on a page load raises it for the same window once the slide has read
// its URL, except while the page is captured: a screenshot of the canvas would
// photograph the controls over its corner.
function usePointerReveal(
  anchor: RefObject<HTMLElement | null>,
  enabled: boolean,
  canIntroduce: boolean
) {
  const [isRevealed, setIsRevealed] = useState(
    () => enabled && Date.now() < activeUntil
  )

  // A layout effect, so a mount that finds the pointer resting near the corner
  // paints revealed on its first frame.
  useLayoutEffect(() => {
    if (!enabled) {
      setIsRevealed(false)
      return
    }

    let timer = 0

    function expire() {
      const remaining = activeUntil - Date.now()

      if (remaining > 0) {
        timer = window.setTimeout(expire, remaining)
      } else if (isPointerNear(anchor)) {
        timer = window.setTimeout(expire, idleHideMs)
      } else {
        timer = 0
        setIsRevealed(false)
      }
    }

    function reveal() {
      setIsRevealed(true)

      if (timer === 0) {
        timer = window.setTimeout(expire, activeUntil - Date.now())
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") {
        return
      }

      lastPointerPosition = { x: event.clientX, y: event.clientY }
      activeUntil = Date.now() + idleHideMs
      reveal()
    }

    if (canIntroduce && !hasIntroduced) {
      hasIntroduced = true

      if (!isCapturing()) {
        activeUntil = Date.now() + idleHideMs
      }
    }

    if (Date.now() < activeUntil || isPointerNear(anchor)) {
      reveal()
    } else {
      setIsRevealed(false)
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      clearTimeout(timer)
    }
  }, [anchor, canIntroduce, enabled])

  return isRevealed
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
  const canPoint = hasFinePointer || canHover
  const params = useSlideViewParams()
  const isPointerRevealed = usePointerReveal(
    anchor,
    canPoint,
    params.isResolved
  )
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
  const isRevealed = isPointerRevealed || isFocused || isCommandOpen || isPinned

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
