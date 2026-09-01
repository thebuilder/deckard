import type { ReactNode } from "react"
import { canSwitchColorMode } from "../deck/theme"
import type { DeckPresentation, SlideSummary } from "../deck/types"
import { cn } from "../lib/utils"
import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "../types/slides"
import { DeckControls } from "./deck-controls"
import { SlideCanvas } from "./slide-canvas"
import { SlideCanvasFooter, SlideCanvasHeader } from "./slide-chrome"
import { SlideErrorBoundary } from "./slide-error-boundary"
import { SlidePrefetch } from "./slide-prefetch"
import { SlideShellRuntime } from "./slide-shell-runtime"
import { SlideStepAdvanceArea } from "./slide-stepper"
import { SlideViewport } from "./slide-viewport"
import { StaticMediaBoundary } from "./static-media-boundary"

interface SlideShellProps {
  background?: SlideBackgroundMode
  children: ReactNode
  controlsHidden?: boolean
  deck: DeckPresentation
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
    base: "mx-auto max-w-6xl px-[var(--slide-padding-inline)]",
    footer: {
      off: "pb-[var(--slide-padding-block)]",
      on: "pb-24",
    },
    header: {
      off: "pt-[var(--slide-padding-block)]",
      on: "pt-32",
    },
  },
  fullscreen: {
    base: "p-0",
    footer: { off: "", on: "" },
    header: { off: "", on: "" },
  },
}

const fullscreenChromeInsets = { bottom: 80, top: 96 }

function frameClassName({ isFullscreen, showFooter, showHeader }: ChromeState) {
  const frame = canvasFrames[isFullscreen ? "fullscreen" : "default"]

  return cn(
    frame.base,
    frame.header[showHeader ? "on" : "off"],
    frame.footer[showFooter ? "on" : "off"]
  )
}

// The fullscreen frame reserves nothing, so slide content that has to clear the chrome reads these instead.
function chromeInset({ isFullscreen, showFooter, showHeader }: ChromeState) {
  if (!isFullscreen) {
    return { bottom: 0, top: 0 }
  }

  return {
    bottom: showFooter ? fullscreenChromeInsets.bottom : 0,
    top: showHeader ? fullscreenChromeInsets.top : 0,
  }
}

export function SlideShell({
  background = "default",
  children,
  controlsHidden = false,
  deck,
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

  return (
    <SlideShellRuntime
      controls={
        <DeckControls
          currentNumber={slide.number}
          deckTitle={deck.title}
          next={next}
          previous={previous}
          showColorModeToggle={canSwitchColorMode(deck.theme)}
          slides={slides}
        />
      }
      controlsHidden={controlsHidden}
      initialStep={initialStep}
      next={next}
      notes={notes}
      presenterEnabled={presenterEnabled}
      previous={previous}
      readOnly={readOnly}
      slide={slide}
      slides={slides}
    >
      <SlidePrefetch slides={prefetch} />

      <SlideViewport canvas={deck.canvas}>
        <SlideCanvas
          background={background}
          canvas={deck.canvas}
          chromeInset={chromeInset(chrome)}
          footer={
            chrome.showFooter ? (
              <SlideCanvasFooter number={slide.number} total={slides.length} />
            ) : null
          }
          frameClassName={frameClassName(chrome)}
          header={
            chrome.showHeader ? (
              <SlideCanvasHeader
                brand={deck.title}
                brandHref={deck.titleHref}
                date={deck.date}
                title={slide.authoredTitle}
              />
            ) : null
          }
          theme={deck.theme}
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
    </SlideShellRuntime>
  )
}
