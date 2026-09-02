export type SlideHeaderMode = "hidden" | "visible" | "auto"
export type SlideFooterMode = "hidden" | "visible"

// "counter" named the footer that carried the counter but no navigation buttons.
// The buttons moved to the deck controls, so every visible footer is that footer now.
export type SlideFooterModeInput = SlideFooterMode | "counter"

export type SlideLayoutMode = "default" | "fullscreen"

// "accent" is the inverted statement slide every source template carries: the
// canvas floods with the theme accent and the ink flips, which is a paint job
// rather than a layout, so it rides here with the other background variants.
export const slideBackgroundModes = [
  "accent",
  "default",
  "grid",
  "none",
  "spotlight",
] as const

export type BuiltInSlideBackgroundMode = (typeof slideBackgroundModes)[number]

// A theme may name backgrounds of its own and paint them from its stylesheet or
// with a motion field, so a deck is not held to the list above. `deckard
// validate` is what catches the misspelling this widening allows through.
export type SlideBackgroundMode =
  | BuiltInSlideBackgroundMode
  | (string & NonNullable<unknown>)

// A deck that asks for a still frame gets the same still frame every time, not
// whatever the last frame happened to be.
export type SlideMotionMode = "auto" | "frozen"

// The three programs the motion background paints: banded curtains over noise,
// an undulating horizontal band, and a soft noise wash.
export const slideMotionFields = ["aurora", "waves", "wash"] as const

export type SlideMotionField = (typeof slideMotionFields)[number]
