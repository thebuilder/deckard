export type SlideHeaderMode = "hidden" | "visible" | "auto"
export type SlideFooterMode = "hidden" | "visible"

// "counter" named the footer that carried the counter but no navigation buttons.
// The buttons moved to the deck controls, so every visible footer is that footer now.
export type SlideFooterModeInput = SlideFooterMode | "counter"

export type SlideLayoutMode = "default" | "fullscreen"

// "accent" is the inverted statement slide every source template carries: the
// canvas floods with the theme accent and the ink flips, which is a paint job
// rather than a layout, so it rides here with the other background variants.
export type SlideBackgroundMode =
  | "accent"
  | "default"
  | "grid"
  | "none"
  | "spotlight"
