import Link from "next/link"
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
import { SlideshowColorModeToggle } from "./color-mode-toggle"
import { PresenterPopoutButton } from "./presenter-controls"
import { SlideCanvas } from "./slide-canvas"
import { SlideCommandCenter } from "./slide-command-center"
import { SlideErrorBoundary } from "./slide-error-boundary"
import { SlideNavigation } from "./slide-navigation"
import { SlideShellRuntime } from "./slide-shell-runtime"
import { SlideStepAdvanceArea } from "./slide-stepper"
import { SlideViewport } from "./slide-viewport"
import { StaticMediaBoundary } from "./static-media-boundary"

// A preview hides the chrome from the URL, which only the client knows, so the
// server renders the chrome either way and this drops it after hydration.
const chromeHiddenClass = "group-data-[slide-chrome=hidden]/shell:hidden"

interface SlideShellProps {
  background?: SlideBackgroundMode
  children: ReactNode
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
  showUtilities: boolean
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
    showUtilities: headerMode !== "hidden",
  }
}

// Canvas coordinates, not browser viewport coordinates. Every value below is a slice of the 1080px-tall canvas.
const canvasFrames = {
  default: {
    base: "mx-auto max-w-6xl px-[var(--slide-padding-inline)]",
    footer: {
      off: "pb-[var(--slide-padding-block)]",
      on: "pb-28 group-data-[slide-chrome=hidden]/shell:pb-[var(--slide-padding-block)]",
    },
    header: {
      off: "pt-[var(--slide-padding-block)]",
      on: "pt-32 group-data-[slide-chrome=hidden]/shell:pt-[var(--slide-padding-block)]",
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

function SlideCanvasHeader({
  deckTitle,
  deckTitleHref,
}: {
  deckTitle: string
  deckTitleHref: string
}) {
  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-40 border-transparent border-b bg-background/50 backdrop-blur-sm",
        chromeHiddenClass
      )}
    >
      <div className="flex min-h-16 items-center px-[var(--slide-padding-inline)] py-4">
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

// Presenter tooling, not slide content, so it sits outside the scaled canvas and keeps the app tokens.
function SlideUtilityBar({
  currentNumber,
  deckTitle,
  showColorModeToggle,
  slides,
}: {
  currentNumber: number
  deckTitle: string
  showColorModeToggle: boolean
  slides: SlideSummary[]
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-end px-4 py-4 sm:px-6",
        chromeHiddenClass
      )}
    >
      <div className="pointer-events-auto flex items-center gap-2">
        <SlideCommandCenter
          currentNumber={currentNumber}
          deckTitle={deckTitle}
          slides={slides}
        />
        <PresenterPopoutButton />
        {showColorModeToggle ? <SlideshowColorModeToggle /> : null}
      </div>
    </div>
  )
}

export function SlideShell({
  background = "default",
  children,
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
      initialStep={initialStep}
      next={next}
      notes={notes}
      presenterEnabled={presenterEnabled}
      previous={previous}
      readOnly={readOnly}
      slide={slide}
      slides={slides}
      utilityBar={
        chrome.showUtilities ? (
          <SlideUtilityBar
            currentNumber={slide.number}
            deckTitle={deck.title}
            showColorModeToggle={canSwitchColorMode(deck.theme)}
            slides={slides}
          />
        ) : null
      }
    >
      <SlideViewport canvas={deck.canvas}>
        <SlideCanvas
          background={background}
          canvas={deck.canvas}
          chromeInset={chromeInset(chrome)}
          footer={
            chrome.showFooter ? (
              <div className={chromeHiddenClass}>
                <SlideNavigation
                  mode={footerMode === "counter" ? "counter" : "visible"}
                  next={next}
                  prefetch={prefetch}
                  previous={previous}
                  slide={slide}
                  total={slides.length}
                />
              </div>
            ) : null
          }
          frameClassName={frameClassName(chrome)}
          header={
            chrome.showHeader ? (
              <SlideCanvasHeader
                deckTitle={deck.title}
                deckTitleHref={deck.titleHref}
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
