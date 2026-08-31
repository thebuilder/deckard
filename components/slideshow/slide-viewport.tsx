import type { CSSProperties, ReactNode } from "react"

import type { DeckCanvasConfig } from "@/lib/deck/types"

interface SlideViewportProps {
  canvas: DeckCanvasConfig
  children: ReactNode
}

// A margin of zero has to stay a plain division, so an exact 16:9 window puts the canvas edges on the window edges.
function fitScale(axis: "w" | "h", side: number, gutter: number) {
  const available =
    gutter === 0 ? `100cq${axis}` : `(100cq${axis} - ${gutter}px)`

  return `calc(${available} / ${side}px)`
}

// Container query units keep the fit correct on the first paint, so the canvas never lands at the wrong scale before hydration.
function fitTransform(canvas: DeckCanvasConfig) {
  const gutter = canvas.margin * 2
  const widthScale = fitScale("w", canvas.width, gutter)
  const heightScale = fitScale("h", canvas.height, gutter)

  return `translate(-50%, -50%) scale(min(${widthScale}, ${heightScale}))`
}

// Geometry stays in inline styles: the fit has to hold wherever this renders, with or without the deck stylesheet.
const viewportStyle: CSSProperties = {
  containerType: "size",
  inset: 0,
  overflow: "hidden",
  position: "absolute",
}

export function SlideViewport({ canvas, children }: SlideViewportProps) {
  const stageStyle: CSSProperties = {
    height: canvas.height,
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: fitTransform(canvas),
    transformOrigin: "center center",
    width: canvas.width,
  }

  return (
    <div
      data-canvas-margin={canvas.margin}
      data-slide-viewport=""
      style={viewportStyle}
    >
      <div style={stageStyle}>{children}</div>
    </div>
  )
}
