export const PRESENTER_CHANNEL_NAME = "slideshow-presenter-sync"

export interface PresenterPreviewState {
  id: string
  step: number
  title: string
}

export interface PresenterSlideListItem {
  href: string
  title: string
}

export interface PresenterSlideState {
  current: number
  currentStep: number
  id: string
  notes?: string
  preview: PresenterPreviewState | null
  sentAt: number
  slides: PresenterSlideListItem[]
  stepCount: number
  title: string
  total: number
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
