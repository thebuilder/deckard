import type { CSSProperties, ReactNode } from "react"

import { SlideBackground } from "@/components/slideshow/slide-background"
import { SlideOverflowGuard } from "@/components/slideshow/slide-overflow-guard"
import type { DeckCanvasConfig } from "@/lib/deck/types"
import { cn } from "@/lib/utils"
import type { SlideBackgroundMode } from "@/types/slides"

interface SlideCanvasProps {
  background: SlideBackgroundMode
  canvas: DeckCanvasConfig
  children: ReactNode
  footer?: ReactNode
  frameClassName?: string
  header?: ReactNode
}

export function SlideCanvas({
  background,
  canvas,
  children,
  footer,
  frameClassName,
  header,
}: SlideCanvasProps) {
  const canvasStyle = {
    "--canvas-height": `${canvas.height}px`,
    "--canvas-width": `${canvas.width}px`,
    height: canvas.height,
    width: canvas.width,
  } as CSSProperties

  return (
    <div
      className="relative overflow-hidden bg-background text-foreground"
      data-canvas-height={canvas.height}
      data-canvas-width={canvas.width}
      data-slide-canvas=""
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
