"use client"

import type { CSSProperties, ReactNode } from "react"
import { useLayoutEffect, useState } from "react"

import type { DeckCanvasConfig } from "@/lib/deck/types"

interface SlideViewportProps {
  canvas: DeckCanvasConfig
  children: ReactNode
}

// A stage that collapses to zero would take the slide with it, so the fit never goes below this.
const minimumScale = 0.0001

// Firefox has no typed CSS arithmetic before 155, so a length over a length can only be divided here.
function fitScale(
  canvas: Pick<DeckCanvasConfig, "height" | "margin" | "width">,
  width: number,
  height: number
) {
  const gutter = canvas.margin > 0 ? canvas.margin * 2 : 0
  const scale = Math.min(
    (width - gutter) / canvas.width,
    (height - gutter) / canvas.height
  )

  if (!Number.isFinite(scale) || scale < minimumScale) {
    return minimumScale
  }

  return scale
}

// Geometry stays in inline styles: the fit has to hold wherever this renders, with or without the deck stylesheet.
const viewportStyle: CSSProperties = {
  containerType: "size",
  inset: 0,
  overflow: "hidden",
  position: "absolute",
}

export function SlideViewport({ canvas, children }: SlideViewportProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null)
  const [scale, setScale] = useState<number | null>(null)
  const { height, margin, width } = canvas

  useLayoutEffect(() => {
    if (viewport === null) {
      return
    }

    const measure = () => {
      setScale(
        fitScale(
          { height, margin, width },
          viewport.clientWidth,
          viewport.clientHeight
        )
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [height, margin, viewport, width])

  const wrapperStyle = {
    ...viewportStyle,
    "--deckard-scale": scale ?? 1,
  } as CSSProperties

  const stageStyle: CSSProperties = {
    height: canvas.height,
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%) scale(var(--deckard-scale))",
    transformOrigin: "center center",
    // The measured scale only lands after hydration, so the stage stays out of sight rather than flashing unscaled.
    visibility: scale === null ? "hidden" : undefined,
    width: canvas.width,
  }

  return (
    <div
      data-canvas-margin={canvas.margin}
      data-slide-viewport=""
      ref={setViewport}
      style={wrapperStyle}
    >
      <div style={stageStyle}>{children}</div>
    </div>
  )
}
