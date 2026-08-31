"use client"

import type { CSSProperties, ReactNode } from "react"
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
  initialStep?: number
  next?: SlideSummary
  notes?: string
  presenterEnabled?: boolean
  previous?: SlideSummary
  readOnly?: boolean
  slide: SlideSummary
  slides: SlideSummary[]
  utilityBar?: ReactNode
}

// Chrome hidden in a preview reserves nothing, so the insets a bleeding frame reads collapse with it.
const previewStyle = { "--slide-chrome-scale": 0 } as CSSProperties

export function SlideShellRuntime({
  children,
  initialStep = 0,
  next,
  notes,
  presenterEnabled = true,
  previous,
  readOnly = false,
  slide,
  slides,
  utilityBar,
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
          data-slide-chrome={isPreview ? "hidden" : undefined}
          style={isPreview ? previewStyle : undefined}
        >
          <SlideViewParamsBoundary />
          <PresenterSync
            enabled={isPresenterLive}
            next={next}
            notes={notes}
            slide={slide}
            slides={slides}
          />
          <PresenterKeyboardShortcut enabled={isPresenterLive} />

          {children}

          {utilityBar}
        </div>
      </SlideContextProvider>
    </SlideStepper>
  )
}
