import Link from "next/link"
import {
  PresenterKeyboardShortcut,
  PresenterPopoutButton,
  PresenterSync,
} from "@/components/slideshow/presenter-controls"
import { SlideBackground } from "@/components/slideshow/slide-background"
import { SlideCommandCenter } from "@/components/slideshow/slide-command-center"
import { SlideContextProvider } from "@/components/slideshow/slide-context"
import { SlideNavigation } from "@/components/slideshow/slide-navigation"
import {
  SlideStepAdvanceArea,
  SlideStepper,
} from "@/components/slideshow/slide-stepper"
import { StaticMediaBoundary } from "@/components/slideshow/static-media-boundary"
import { SlideshowThemeToggle } from "@/components/slideshow/theme-toggle"
import { cn } from "@/lib/utils"
import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "@/types/slides"

interface SlideShellProps {
  background?: SlideBackgroundMode
  children: React.ReactNode
  current: number
  currentSlug: string
  deckTitle: string
  deckTitleHref?: string
  footerMode?: SlideFooterMode
  freezeMedia?: boolean
  headerMode?: SlideHeaderMode
  initialStep?: number
  layout?: SlideLayoutMode
  nextHref?: string
  nextSlide?: {
    slug: string
    title: string
  }
  notes?: string
  prefetchHrefs?: string[]
  presenterEnabled?: boolean
  previousHref?: string
  readOnly?: boolean
  slideOptions: Array<{
    index: number
    title: string
    slug: string
    href: string
  }>
  slideTitle?: string
  stepCount?: number
  total: number
}

export function SlideShell({
  children,
  current,
  total,
  stepCount = 0,
  previousHref,
  nextHref,
  prefetchHrefs = [],
  deckTitle,
  deckTitleHref = "/",
  slideTitle,
  headerMode = "auto",
  footerMode = "visible",
  layout = "default",
  background = "default",
  slideOptions,
  notes,
  currentSlug,
  nextSlide,
  readOnly = false,
  initialStep = 0,
  presenterEnabled = true,
  freezeMedia = false,
}: SlideShellProps) {
  const isFullscreen = layout === "fullscreen"
  const showHeader =
    headerMode === "visible" || (headerMode === "auto" && !isFullscreen)
  const showFooter = footerMode !== "hidden"

  return (
    <SlideStepper
      initialStep={initialStep}
      nextHref={nextHref}
      previousHref={previousHref}
      readOnly={readOnly}
      stepCount={stepCount}
    >
      <SlideContextProvider isPresenterPreview={readOnly} title={slideTitle}>
        <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
          <PresenterSync
            current={current}
            currentSlug={currentSlug}
            currentTitle={
              slideOptions[current - 1]?.title ?? slideTitle ?? deckTitle
            }
            enabled={presenterEnabled && !readOnly}
            nextSlide={nextSlide}
            notes={notes}
            slides={slideOptions.map((slide) => ({
              href: slide.href,
              title: slide.title,
            }))}
            stepCount={stepCount}
            total={total}
          />
          <PresenterKeyboardShortcut enabled={presenterEnabled && !readOnly} />
          <SlideBackground variant={background} />

          {showHeader ? (
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
                    current={current}
                    slideOptions={slideOptions}
                    title={deckTitle}
                  />
                  <PresenterPopoutButton />
                  <SlideshowThemeToggle />
                </div>
              </div>
            </header>
          ) : null}

          <main
            className={cn(
              "relative z-10 flex w-full",
              isFullscreen
                ? "box-border h-svh items-stretch p-0"
                : "mx-auto min-h-svh max-w-6xl items-start px-4 sm:px-6",
              isFullscreen && showHeader && "pt-20 sm:pt-24",
              isFullscreen && showFooter && "pb-16 sm:pb-20",
              !isFullscreen &&
                (showHeader ? "pt-28 sm:pt-32" : "pt-8 sm:pt-10"),
              !isFullscreen && (showFooter ? "pb-24 sm:pb-28" : "pb-4 sm:pb-6")
            )}
          >
            <SlideStepAdvanceArea
              className={cn("w-full", isFullscreen && "h-full")}
            >
              <StaticMediaBoundary
                activePath={`/slides/${currentSlug}`}
                className={cn(isFullscreen && "h-full")}
                enabled={freezeMedia}
              >
                <div className={cn("w-full", isFullscreen && "h-full")}>
                  {children}
                </div>
              </StaticMediaBoundary>
            </SlideStepAdvanceArea>
          </main>

          {showFooter ? (
            <SlideNavigation
              current={current}
              mode={footerMode === "counter" ? "counter" : "visible"}
              nextHref={nextHref}
              prefetchHrefs={prefetchHrefs}
              previousHref={previousHref}
              total={total}
            />
          ) : null}
        </div>
      </SlideContextProvider>
    </SlideStepper>
  )
}
