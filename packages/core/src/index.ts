export { resolveCanvas } from "./deck/canvas"
export { defineDeck } from "./deck/define-deck"
export { getSlideById, resolveSlides } from "./deck/resolve-slides"
export { toSlideSummaries, toSlideSummary } from "./deck/slide-summary"
export {
  canSwitchColorMode,
  forcedColorMode,
  resolveTheme,
  toDeckPresentation,
} from "./deck/theme"
export type {
  Deck,
  DeckCanvasConfig,
  DeckConfig,
  DeckFooterConfig,
  DeckHeaderConfig,
  DeckPresentation,
  ResolvedSlide,
  SlideColorMode,
  SlideComponent,
  SlideDefaults,
  SlideDefinition,
  SlideMeta,
  SlideModule,
  SlideSummary,
  SlideTheme,
} from "./deck/types"
export type {
  PresenterChannelMessage,
  PresenterPreviewState,
  PresenterSlideState,
} from "./types/presenter"
export { PRESENTER_CHANNEL_NAME } from "./types/presenter"
export type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "./types/slides"
