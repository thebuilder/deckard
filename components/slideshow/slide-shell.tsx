import Link from "next/link"
import type { ReactNode } from "react"
import {
  PresenterKeyboardShortcut,
  PresenterPopoutButton,
  PresenterSync,
} from "@/components/slideshow/presenter-controls"
import { SlideCanvas } from "@/components/slideshow/slide-canvas"
import { SlideCommandCenter } from "@/components/slideshow/slide-command-center"
import { SlideContextProvider } from "@/components/slideshow/slide-context"
import { SlideErrorBoundary } from "@/components/slideshow/slide-error-boundary"
import { SlideNavigation } from "@/components/slideshow/slide-navigation"
import {
  SlideStepAdvanceArea,
  SlideStepper,
} from "@/components/slideshow/slide-stepper"
import { SlideViewport } from "@/components/slideshow/slide-viewport"
import { StaticMediaBoundary } from "@/components/slideshow/static-media-boundary"
import { SlideshowThemeToggle } from "@/components/slideshow/theme-toggle"
import type { DeckCanvasConfig, SlideSummary } from "@/lib/deck/types"
import { cn } from "@/lib/utils"
import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "@/types/slides"

interface SlideShellProps {
  background?: SlideBackgroundMode
  canvas: DeckCanvasConfig
  children: ReactNode
  deckTitle: string
  deckTitleHref?: string
  footerMode?: SlideFooterMode
  freezeMedia?: boolean
  headerMode?: SlideHeaderMode
  initialStep?: number
  layout?: SlideLayoutMode
  next?: SlideSummary
  notes?: string
  prefetch?: SlideSummary[]
  presenterEnabled?: boolean
  previous?: SlideSummary
  readOnly?: boolean
  slide: SlideSummary
  slides: SlideSummary[]
}

interface ChromeState {
  isFullscreen: boolean
  showFooter: boolean
  showHeader: boolean
}

function resolveChrome({
  footerMode,
  headerMode,
  layout,
}: {
  footerMode: SlideFooterMode
  headerMode: SlideHeaderMode
  layout: SlideLayoutMode
}): ChromeState {
  const isFullscreen = layout === "fullscreen"

  return {
    isFullscreen,
    showFooter: footerMode !== "hidden",
    showHeader:
      headerMode === "visible" || (headerMode === "auto" && !isFullscreen),
  }
}

// Canvas coordinates, not browser viewport coordinates. Every value below is a slice of the 1080px-tall canvas.
const canvasFrames = {
  default: {
    base: "mx-auto max-w-6xl px-6",
    footer: { off: "pb-6", on: "pb-28" },
    header: { off: "pt-10", on: "pt-32" },
  },
  fullscreen: {
    base: "p-0",
    footer: { off: "", on: "pb-20" },
    header: { off: "", on: "pt-24" },
  },
}

function frameClassName({ isFullscreen, showFooter, showHeader }: ChromeState) {
  const frame = canvasFrames[isFullscreen ? "fullscreen" : "default"]

  return cn(
    frame.base,
    frame.header[showHeader ? "on" : "off"],
    frame.footer[showFooter ? "on" : "off"]
  )
}

function SlideCanvasHeader({
  deckTitle,
  deckTitleHref,
}: {
  deckTitle: string
  deckTitleHref: string
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 border-transparent border-b bg-background/50 backdrop-blur-sm">
      <div className="flex min-h-16 items-center px-6 py-4">
        <Link
          className="font-semibold text-sm tracking-tight"
          href={deckTitleHref}
        >
          {deckTitle}
        </Link>
      </div>
    </header>
  )
}

// Presenter tooling, not slide content, so it sits outside the scaled canvas and keeps its own hit targets.
function SlideUtilityBar({
  currentNumber,
  deckTitle,
  slides,
}: {
  currentNumber: number
  deckTitle: string
  slides: SlideSummary[]
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-end px-4 py-4 sm:px-6">
      <div className="pointer-events-auto flex items-center gap-2">
        <SlideCommandCenter
          currentNumber={currentNumber}
          deckTitle={deckTitle}
          slides={slides}
        />
        <PresenterPopoutButton />
        <SlideshowThemeToggle />
      </div>
    </div>
  )
}

export function SlideShell({
  background = "default",
  canvas,
  children,
  deckTitle,
  deckTitleHref = "/",
  footerMode = "visible",
  freezeMedia = false,
  headerMode = "auto",
  initialStep = 0,
  layout = "default",
  next,
  notes,
  prefetch,
  presenterEnabled = true,
  previous,
  readOnly = false,
  slide,
  slides,
}: SlideShellProps) {
  const chrome = resolveChrome({ footerMode, headerMode, layout })
  const isPresenterLive = presenterEnabled && !readOnly

  return (
    <SlideStepper
      initialStep={initialStep}
      nextHref={next?.href}
      previousHref={previous?.href}
      readOnly={readOnly}
      stepCount={slide.stepCount}
    >
      <SlideContextProvider isPresenterPreview={readOnly} title={slide.title}>
        <div className="relative h-svh w-full overflow-hidden bg-background text-foreground">
          <PresenterSync
            enabled={isPresenterLive}
            next={next}
            notes={notes}
            slide={slide}
            slides={slides}
          />
          <PresenterKeyboardShortcut enabled={isPresenterLive} />

          <SlideViewport canvas={canvas}>
            <SlideCanvas
              background={background}
              canvas={canvas}
              footer={
                chrome.showFooter ? (
                  <SlideNavigation
                    mode={footerMode === "counter" ? "counter" : "visible"}
                    next={next}
                    prefetch={prefetch}
                    previous={previous}
                    slide={slide}
                    total={slides.length}
                  />
                ) : null
              }
              frameClassName={frameClassName(chrome)}
              header={
                chrome.showHeader ? (
                  <SlideCanvasHeader
                    deckTitle={deckTitle}
                    deckTitleHref={deckTitleHref}
                  />
                ) : null
              }
            >
              <SlideStepAdvanceArea className="h-full w-full">
                <StaticMediaBoundary
                  activePath={slide.href}
                  className="h-full w-full"
                  enabled={freezeMedia}
                >
                  <div className="h-full w-full">
                    <SlideErrorBoundary slideId={slide.id}>
                      {children}
                    </SlideErrorBoundary>
                  </div>
                </StaticMediaBoundary>
              </SlideStepAdvanceArea>
            </SlideCanvas>
          </SlideViewport>

          {chrome.showHeader ? (
            <SlideUtilityBar
              currentNumber={slide.number}
              deckTitle={deckTitle}
              slides={slides}
            />
          ) : null}
        </div>
      </SlideContextProvider>
    </SlideStepper>
  )
}
