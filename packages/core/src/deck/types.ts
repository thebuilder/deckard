import type { ReactNode } from "react"

import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideFooterModeInput,
  SlideHeaderMode,
  SlideLayoutMode,
} from "../types/slides"

export interface SlideMeta {
  background?: SlideBackgroundMode
  footer?: SlideFooterModeInput
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
  footer: SlideFooterModeInput
  header: SlideHeaderMode
  layout: SlideLayoutMode
}

export interface ResolvedSlide {
  // Set only when the author gave the slide a title. `title` carries the
  // generated fallback, which names a slide in chrome but must never render as
  // the slide's own heading.
  authoredTitle?: string
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
  authoredTitle?: string
  href: string
  id: string
  number: number
  stepCount: number
  title: string
}

// The logical coordinate space every slide is authored in. Crosses to client components, so it stays serializable.
export interface DeckCanvasConfig {
  fit: "contain"
  height: number
  margin: number
  mode: "fixed"
  width: number
}

export type SlideColorMode = "light" | "dark"

// Static deck styling. The class scopes the theme stylesheet to the canvas, so it never reaches the runtime UI.
export interface SlideTheme {
  className: string
  colorModes: SlideColorMode[]
  defaultColorMode: SlideColorMode | "system"
  id: string
}

export interface DeckHeaderConfig {
  brand: string
  href: string
  // One line of standing detail beside the brand, rendered as written, so a deck
  // picks what it is and how it reads: "March 2026", "Rev. C", "Internal".
  meta?: string
  mode: SlideHeaderMode
}

export interface DeckFooterConfig {
  mode: SlideFooterModeInput
}

export interface DeckConfig {
  canvas?: Partial<DeckCanvasConfig>
  description: string
  footer: DeckFooterConfig
  header: DeckHeaderConfig
  slides: SlideDefinition[]
  theme?: SlideTheme
  title: string
}

export interface Deck {
  canvas: DeckCanvasConfig
  description: string
  footer: DeckFooterConfig
  header: DeckHeaderConfig
  slides: ResolvedSlide[]
  theme: SlideTheme
  title: string
}

// Everything the shell needs from the deck. Crosses into client components, so it stays serializable.
export interface DeckPresentation {
  canvas: DeckCanvasConfig
  meta?: string
  theme: SlideTheme
  title: string
  titleHref: string
}
