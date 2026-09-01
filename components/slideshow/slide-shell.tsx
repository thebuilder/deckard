import Link from "next/link"
import type { ReactNode } from "react"
import {
  PresenterKeyboardShortcut,
  PresenterPopoutButton,
  PresenterSync,
} from "@/components/slideshow/presenter-controls"
import { SlideBackground } from "@/components/slideshow/slide-background"
import { SlideCommandCenter } from "@/components/slideshow/slide-command-center"
import { SlideContextProvider } from "@/components/slideshow/slide-context"
import { SlideErrorBoundary } from "@/components/slideshow/slide-error-boundary"
import { SlideNavigation } from "@/components/slideshow/slide-navigation"
import {
  SlideStepAdvanceArea,
  SlideStepper,
} from "@/components/slideshow/slide-stepper"
import { StaticMediaBoundary } from "@/components/slideshow/static-media-boundary"
import { SlideshowThemeToggle } from "@/components/slideshow/theme-toggle"
import type { SlideSummary } from "@/lib/deck/types"
import { cn } from "@/lib/utils"
import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "@/types/slides"

interface SlideShellProps {
  background?: SlideBackgroundMode
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

const mainFrames = {
  default: {
    base: "mx-auto min-h-svh max-w-6xl items-start px-4 sm:px-6",
    footer: { off: "pb-4 sm:pb-6", on: "pb-24 sm:pb-28" },
    header: { off: "pt-8 sm:pt-10", on: "pt-28 sm:pt-32" },
  },
  fullscreen: {
    base: "box-border h-svh items-stretch p-0",
    footer: { off: "", on: "pb-16 sm:pb-20" },
    header: { off: "", on: "pt-20 sm:pt-24" },
  },
}

function mainClassName({ isFullscreen, showFooter, showHeader }: ChromeState) {
  const frame = mainFrames[isFullscreen ? "fullscreen" : "default"]

  return cn(
    frame.base,
    frame.header[showHeader ? "on" : "off"],
    frame.footer[showFooter ? "on" : "off"]
  )
}

function SlideShellHeader({
  currentNumber,
  deckTitle,
  deckTitleHref,
  slides,
}: {
  currentNumber: number
  deckTitle: string
  deckTitleHref: string
  slides: SlideSummary[]
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-transparent border-b bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          className="font-semibold text-sm tracking-tight"
          href={deckTitleHref}
        >
          {deckTitle}
        </Link>
        <div className="flex items-center gap-2">
          <SlideCommandCenter
            currentNumber={currentNumber}
            deckTitle={deckTitle}
            slides={slides}
          />
          <PresenterPopoutButton />
          <SlideshowThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function SlideShell({
  background = "default",
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
        <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
          <PresenterSync
            enabled={isPresenterLive}
            next={next}
            notes={notes}
            slide={slide}
            slides={slides}
          />
          <PresenterKeyboardShortcut enabled={isPresenterLive} />
          <SlideBackground variant={background} />

          {chrome.showHeader ? (
            <SlideShellHeader
              currentNumber={slide.number}
              deckTitle={deckTitle}
              deckTitleHref={deckTitleHref}
              slides={slides}
            />
          ) : null}

          <main
            className={cn("relative z-10 flex w-full", mainClassName(chrome))}
          >
            <SlideStepAdvanceArea
              className={cn("w-full", chrome.isFullscreen && "h-full")}
            >
              <StaticMediaBoundary
                activePath={slide.href}
                className={cn(chrome.isFullscreen && "h-full")}
                enabled={freezeMedia}
              >
                <div className={cn("w-full", chrome.isFullscreen && "h-full")}>
                  <SlideErrorBoundary slideId={slide.id}>
                    {children}
                  </SlideErrorBoundary>
                </div>
              </StaticMediaBoundary>
            </SlideStepAdvanceArea>
          </main>

          {chrome.showFooter ? (
            <SlideNavigation
              mode={footerMode === "counter" ? "counter" : "visible"}
              next={next}
              prefetch={prefetch}
              previous={previous}
              slide={slide}
              total={slides.length}
            />
          ) : null}
        </div>
      </SlideContextProvider>
    </SlideStepper>
  )
}
