import type { CSSProperties, ReactNode } from "react"

import type { DeckCanvasConfig } from "@/lib/deck/types"

interface SlideViewportProps {
  canvas: DeckCanvasConfig
  children: ReactNode
}

// Container query units keep the fit correct on the first paint, so the canvas never lands at the wrong scale before hydration.
function fitTransform(canvas: DeckCanvasConfig) {
  const gutter = canvas.margin * 2
  const widthScale = `calc((100cqw - ${gutter}px) / ${canvas.width}px)`
  const heightScale = `calc((100cqh - ${gutter}px) / ${canvas.height}px)`

  return `translate(-50%, -50%) scale(min(${widthScale}, ${heightScale}))`
}

export function SlideViewport({ canvas, children }: SlideViewportProps) {
  const stageStyle: CSSProperties = {
    height: canvas.height,
    transform: fitTransform(canvas),
    transformOrigin: "center center",
    width: canvas.width,
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      data-canvas-margin={canvas.margin}
      data-slide-viewport=""
      style={{ containerType: "size" }}
    >
      <div className="absolute top-1/2 left-1/2" style={stageStyle}>
        {children}
      </div>
    </div>
  )
}
