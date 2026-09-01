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

const coarsePointerQuery = "(pointer: coarse)"

// Module scope on purpose: the cluster remounts on every slide navigation, and
// without the last pointer position a reveal earned by proximity would drop
// until the hand moves again.
let lastPointerPosition: { x: number; y: number } | null = null

function subscribeToPointer(onChange: () => void) {
  const media = window.matchMedia(coarsePointerQuery)

  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function readCoarsePointer() {
  return window.matchMedia(coarsePointerQuery).matches
}

// Touch has no hover to reveal anything, so those decks get a handle instead.
function useCoarsePointer() {
  return useSyncExternalStore(
    subscribeToPointer,
    readCoarsePointer,
    () => false
  )
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
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsNear(false)
      return
    }

    let frame = 0
    let point = lastPointerPosition

    function measure() {
      frame = 0

      const node = anchor.current

      if (!(node && point)) {
        return
      }

      setIsNear(
        distanceToBox(node.getBoundingClientRect(), point.x, point.y) <=
          revealDistance
      )
    }

    function handlePointerMove(event: PointerEvent) {
      point = { x: event.clientX, y: event.clientY }
      lastPointerPosition = point

      if (frame === 0) {
        frame = requestAnimationFrame(measure)
      }
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })

    if (point) {
      frame = requestAnimationFrame(measure)
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)

      if (frame !== 0) {
        cancelAnimationFrame(frame)
      }
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
  previous?: SlideSummary
  showColorModeToggle: boolean
  slides: SlideSummary[]
}

export function DeckControls({
  currentNumber,
  deckTitle,
  next,
  previous,
  showColorModeToggle,
  slides,
}: DeckControlsProps) {
  const router = useRouter()
  const stepper = useSlideStepper()
  const anchor = useRef<HTMLElement | null>(null)
  const isCoarsePointer = useCoarsePointer()
  const isNear = usePointerProximity(anchor, !isCoarsePointer)
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
      {isCoarsePointer ? (
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
        <PresenterPopoutButton />
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
