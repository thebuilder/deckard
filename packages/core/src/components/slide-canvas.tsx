import type { CSSProperties, ReactNode } from "react"
import { forcedColorMode } from "../deck/theme"
import type { DeckCanvasConfig, SlideTheme } from "../deck/types"
import { cn } from "../lib/utils"
import type { SlideBackgroundMode } from "../types/slides"
import { SlideBackground } from "./slide-background"
import { SlideOverflowGuard } from "./slide-overflow-guard"

interface SlideCanvasProps {
  background: SlideBackgroundMode
  canvas: DeckCanvasConfig
  children: ReactNode
  chromeInset?: { bottom: number; top: number }
  footer?: ReactNode
  frameClassName?: string
  header?: ReactNode
  theme: SlideTheme
}

const noChromeInset = { bottom: 0, top: 0 }

export function SlideCanvas({
  background,
  canvas,
  children,
  chromeInset = noChromeInset,
  footer,
  frameClassName,
  header,
  theme,
}: SlideCanvasProps) {
  const canvasStyle = {
    "--canvas-height": `${canvas.height}px`,
    "--canvas-width": `${canvas.width}px`,
    "--slide-chrome-bottom": `calc(${chromeInset.bottom}px * var(--slide-chrome-scale, 1))`,
    "--slide-chrome-top": `calc(${chromeInset.top}px * var(--slide-chrome-scale, 1))`,
    height: canvas.height,
    width: canvas.width,
  } as CSSProperties

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-background text-foreground",
        theme.className
      )}
      data-canvas-height={canvas.height}
      data-canvas-width={canvas.width}
      data-slide-background={background}
      data-slide-canvas=""
      data-slide-color-mode={forcedColorMode(theme)}
      data-slide-theme={theme.id}
      style={canvasStyle}
    >
      <SlideBackground variant={background} />
      {header}
      <main
        className={cn(
          "absolute inset-0 z-10 flex items-stretch",
          frameClassName
        )}
        data-slide-frame=""
      >
        {children}
      </main>
      {footer}
      {process.env.NODE_ENV === "production" ? null : <SlideOverflowGuard />}
    </div>
  )
}
