import type { SlideSummary } from "../deck/types"

export const PRESENTER_CHANNEL_NAME = "slideshow-presenter-sync"

export interface PresenterPreviewState {
  id: string
  step: number
  title: string
}

export interface PresenterSlideState {
  currentStep: number
  notes?: string
  preview: PresenterPreviewState | null
  sentAt: number
  slide: SlideSummary
  slides: SlideSummary[]
}

export type PresenterChannelMessage =
  | {
      type: "request-state"
    }
  | {
      type: "slide-state"
      payload: PresenterSlideState
    }
  | {
      type: "navigate-previous"
    }
  | {
      type: "navigate-next"
    }
  | {
      type: "navigate-to-slide"
      href: string
    }
