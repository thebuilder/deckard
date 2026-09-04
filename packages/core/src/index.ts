export { resolveCanvas } from "./deck/canvas"
export { captureAttribute, isCapturing } from "./deck/capture"
export { defineDeck } from "./deck/define-deck"
export { isPdfExport, pdfExportColorMode } from "./deck/pdf-export"
export {
  getSlideById,
  normalizeFooterMode,
  resolveSlides,
} from "./deck/resolve-slides"
export { toSlideSummaries, toSlideSummary } from "./deck/slide-summary"
export {
  canSwitchColorMode,
  forcedColorMode,
  motionField,
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
  DeckRoutes,
  DeckRoutesConfig,
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
  BuiltInSlideBackgroundMode,
  SlideBackgroundMode,
  SlideFooterMode,
  SlideFooterModeInput,
  SlideHeaderMode,
  SlideLayoutMode,
  SlideMotionField,
  SlideMotionMode,
} from "./types/slides"
export {
  slideBackgroundModes,
  slideMotionFields,
} from "./types/slides"
