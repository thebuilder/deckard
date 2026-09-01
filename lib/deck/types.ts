import type { ReactNode } from "react"

import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "@/types/slides"

export interface SlideMeta {
  background?: SlideBackgroundMode
  footer?: SlideFooterMode
  header?: SlideHeaderMode
  layout?: SlideLayoutMode
  notes?: string
  order?: number
  slug?: string
  stepCount?: number
  title?: string
}

export type SlideDefinition = Omit<SlideMeta, "order"> & {
  body: ReactNode
  sourcePath?: string
}

export type SlideComponent = () => ReactNode | Promise<ReactNode>

export interface SlideModule {
  default: SlideComponent
  meta?: SlideMeta
  notes?: string
}

export interface SlideDefaults {
  background: SlideBackgroundMode
  footer: SlideFooterMode
  header: SlideHeaderMode
  layout: SlideLayoutMode
}

export interface ResolvedSlide {
  background: SlideBackgroundMode
  body: ReactNode
  footer: SlideFooterMode
  header: SlideHeaderMode
  href: string
  id: string
  index: number
  layout: SlideLayoutMode
  notes?: string
  number: number
  slug?: string
  sourcePath?: string
  stepCount: number
  title: string
}

// Crosses the server/client boundary and BroadcastChannel, so every field has to stay serializable.
export interface SlideSummary {
  href: string
  id: string
  number: number
  stepCount: number
  title: string
}

export interface DeckHeaderConfig {
  brand: string
  href: string
  mode: SlideHeaderMode
}

export interface DeckFooterConfig {
  mode: SlideFooterMode
}

export interface DeckConfig {
  description: string
  footer: DeckFooterConfig
  header: DeckHeaderConfig
  slides: SlideDefinition[]
  title: string
}

export interface Deck {
  description: string
  footer: DeckFooterConfig
  header: DeckHeaderConfig
  slides: ResolvedSlide[]
  title: string
}
