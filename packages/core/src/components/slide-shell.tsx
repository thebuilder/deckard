import type { ReactNode } from "react"
import { canSwitchColorMode } from "../deck/theme"
import type { DeckPresentation, SlideSummary } from "../deck/types"
import { cn } from "../lib/utils"
import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
  SlideMotionMode,
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
  motion?: SlideMotionMode
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
// How much the chrome takes is the theme's call, through --slide-header-space and --slide-footer-space.
// The frame is the whole canvas inside the margins: no measure cap and no centring, so a slide starts at
// the left margin and runs to the right one. Content that wants to be centred centres itself in its block.
const canvasFrames = {
  default: {
    base: "w-full px-[var(--slide-padding-inline)] text-left",
    footer: {
      off: "pb-[var(--slide-padding-block)]",
      on: "pb-[var(--slide-footer-space)]",
    },
    header: {
      off: "pt-[var(--slide-padding-block)]",
      on: "pt-[var(--slide-header-space)]",
    },
  },
  fullscreen: {
    base: "p-0",
    footer: { off: "", on: "" },
    header: { off: "", on: "" },
  },
}

const noChromeSpace = "0px"

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
    return { bottom: noChromeSpace, top: noChromeSpace }
  }

  return {
    bottom: showFooter ? "var(--slide-footer-space)" : noChromeSpace,
    top: showHeader ? "var(--slide-header-space)" : noChromeSpace,
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
  motion = "auto",
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
              <SlideCanvasFooter
                number={slide.number}
                showProgress={deck.showProgress}
                total={slides.length}
              />
            ) : null
          }
          frameClassName={frameClassName(chrome)}
          header={
            chrome.showHeader ? (
              <SlideCanvasHeader
                brand={deck.title}
                brandHref={deck.titleHref}
                meta={deck.meta}
                title={slide.authoredTitle}
              />
            ) : null
          }
          layout={layout}
          motion={motion}
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
