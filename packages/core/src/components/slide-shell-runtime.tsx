"use client"

import type { ReactNode } from "react"
import type { SlideSummary } from "../deck/types"
import { PresenterKeyboardShortcut, PresenterSync } from "./presenter-controls"
import { SlideContextProvider } from "./slide-context"
import { SlideStepper } from "./slide-stepper"
import {
  SlideViewParamsBoundary,
  useSlideViewParams,
} from "./slide-view-params"

interface SlideShellRuntimeProps {
  children: ReactNode
  controls?: ReactNode
  controlsHidden?: boolean
  initialStep?: number
  next?: SlideSummary
  notes?: string
  presenterEnabled?: boolean
  presenterHref?: string
  previous?: SlideSummary
  readOnly?: boolean
  slide: SlideSummary
  slides: SlideSummary[]
}

export function SlideShellRuntime({
  children,
  controls,
  controlsHidden = false,
  initialStep = 0,
  next,
  notes,
  presenterEnabled = true,
  presenterHref = "/presenter",
  previous,
  readOnly = false,
  slide,
  slides,
}: SlideShellRuntimeProps) {
  const params = useSlideViewParams()
  const isPreview = params.isPresenterPreview
  const isReadOnly = readOnly || isPreview || !params.isResolved
  const isPresenterLive = presenterEnabled && !isReadOnly

  return (
    <SlideStepper
      initialStep={isPreview ? params.step : initialStep}
      nextHref={next?.href}
      previousHref={previous?.href}
      readOnly={isReadOnly}
      stepCount={slide.stepCount}
    >
      <SlideContextProvider
        isPresenterPreview={isPreview}
        title={slide.authoredTitle}
      >
        <div
          className="group/shell relative h-svh w-full overflow-hidden bg-background text-foreground"
          data-slide-chrome={isPreview || controlsHidden ? "hidden" : undefined}
        >
          <SlideViewParamsBoundary />
          <PresenterSync
            enabled={isPresenterLive}
            next={next}
            notes={notes}
            slide={slide}
            slides={slides}
          />
          <PresenterKeyboardShortcut
            enabled={isPresenterLive}
            href={presenterHref}
          />

          {children}

          {controls}
        </div>
      </SlideContextProvider>
    </SlideStepper>
  )
}
