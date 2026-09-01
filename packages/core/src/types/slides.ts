export type SlideHeaderMode = "hidden" | "visible" | "auto"
export type SlideFooterMode = "hidden" | "visible"

// "counter" named the footer that carried the counter but no navigation buttons.
// The buttons moved to the deck controls, so every visible footer is that footer now.
export type SlideFooterModeInput = SlideFooterMode | "counter"

export type SlideLayoutMode = "default" | "fullscreen"

export type SlideBackgroundMode = "default" | "none" | "spotlight" | "grid"
