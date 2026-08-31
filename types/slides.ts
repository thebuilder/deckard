import type { ReactNode } from "react"

export type SlideHeaderMode = "hidden" | "visible" | "auto"
export type SlideFooterMode = "hidden" | "visible" | "counter"

export type SlideLayoutMode = "default" | "fullscreen"

export type SlideBackgroundMode = "default" | "none" | "spotlight" | "grid"

interface BaseSlideDefinition {
  background?: SlideBackgroundMode
  body: ReactNode
  footer?: SlideFooterMode
  header?: SlideHeaderMode
  layout?: SlideLayoutMode
  notes?: string
  slug: string
  stepCount?: number
  title: string
}
export type SlideDefinition = BaseSlideDefinition

export interface SlideshowConfig {
  description: string
  footer: {
    mode: SlideFooterMode
  }
  header: {
    mode: SlideHeaderMode
    brand: string
    href: string
  }
  title: string
}
