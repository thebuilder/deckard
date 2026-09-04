import type { ReactNode } from "react"

import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideFooterModeInput,
  SlideHeaderMode,
  SlideLayoutMode,
  SlideMotionField,
  SlideMotionMode,
} from "../types/slides"

export interface SlideMeta {
  background?: SlideBackgroundMode
  footer?: SlideFooterModeInput
  header?: SlideHeaderMode
  layout?: SlideLayoutMode
  // "frozen" holds a motion background on its still frame. A slide with no
  // motion background is unaffected either way.
  motion?: SlideMotionMode
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
  motion: SlideMotionMode
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
  motion: SlideMotionMode
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
// Crosses to client components, so it stays serializable: the motion map names
// shader fields rather than carrying one.
export interface SlideTheme {
  className: string
  colorModes: SlideColorMode[]
  defaultColorMode: SlideColorMode | "system"
  id: string
  // The background variants this theme paints in a canvas, keyed by the name a
  // deck writes as `background`. Everything else the theme paints in CSS.
  motion?: Record<string, SlideMotionField>
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
  // The bar across the footer edge showing how far into the deck a slide sits.
  // On unless a deck turns it off, and gone entirely rather than transparent, so
  // a theme cannot paint over the decision.
  progress?: boolean
}

export interface DeckRoutesConfig {
  presenter?: false | string
  slides?: string
}

export interface DeckRoutes {
  presenter: false | string
  slides: string
}

export interface DeckConfig {
  canvas?: Partial<DeckCanvasConfig>
  description: string
  footer: DeckFooterConfig
  header: DeckHeaderConfig
  // The deck-wide default a slide overrides. "frozen" holds every motion
  // background in the deck on its still frame.
  motion?: SlideMotionMode
  routes?: DeckRoutesConfig
  slides: SlideDefinition[]
  theme?: SlideTheme
  title: string
}

export interface Deck {
  canvas: DeckCanvasConfig
  description: string
  footer: DeckFooterConfig
  header: DeckHeaderConfig
  routes: DeckRoutes
  slides: ResolvedSlide[]
  theme: SlideTheme
  title: string
}

// Everything the shell needs from the deck. Crosses into client components, so it stays serializable.
export interface DeckPresentation {
  canvas: DeckCanvasConfig
  meta?: string
  presenterHref?: string
  showProgress: boolean
  theme: SlideTheme
  title: string
  titleHref: string
}
