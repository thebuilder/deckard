import type { SlideBackgroundMode, SlideMotionField } from "../types/slides"
import { slideBackgroundRoles, slideMotionFields } from "../types/slides"
import type {
  Deck,
  DeckPresentation,
  SlideColorMode,
  SlideTheme,
  SlideThemeCard,
} from "./types"

// A deck without a theme falls back to the app tokens. No class, no deck stylesheet, both color modes.
const baseTheme: SlideTheme = {
  className: "",
  colorModes: ["light", "dark"],
  defaultColorMode: "system",
  id: "base",
}

function assertColorModes(theme: SlideTheme) {
  if (theme.colorModes.length === 0) {
    throw new Error(
      `Slide theme "${theme.id}" has to support at least one color mode.`
    )
  }

  if (new Set(theme.colorModes).size !== theme.colorModes.length) {
    throw new Error(
      `Slide theme "${theme.id}" lists the same color mode twice: ${theme.colorModes.join(", ")}.`
    )
  }
}

function assertDefaultColorMode(theme: SlideTheme) {
  if (theme.defaultColorMode === "system") {
    if (theme.colorModes.length < 2) {
      throw new Error(
        `Slide theme "${theme.id}" defaults to "system" but only supports ${theme.colorModes.join(", ")}. Support both color modes or pick one as the default.`
      )
    }

    return
  }

  if (!theme.colorModes.includes(theme.defaultColorMode)) {
    throw new Error(
      `Slide theme "${theme.id}" defaults to "${theme.defaultColorMode}" but only supports ${theme.colorModes.join(", ")}.`
    )
  }
}

function assertMotion(theme: SlideTheme) {
  for (const [variant, field] of Object.entries(theme.motion ?? {})) {
    if (variant.trim().length === 0) {
      throw new Error(
        `Slide theme "${theme.id}" paints a motion background for a variant with no name. Key it by the name a deck writes as \`background\`.`
      )
    }

    if (variant === "none") {
      throw new Error(
        `Slide theme "${theme.id}" paints a motion background for "none", which is the variant that renders no background at all. Give it a name of its own.`
      )
    }

    if (!slideMotionFields.includes(field)) {
      throw new Error(
        `Slide theme "${theme.id}" paints "${variant}" with the field "${field}". The fields are ${slideMotionFields.join(", ")}.`
      )
    }
  }
}

const hexColor = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i
const rgbColor = /^rgba?\([^()]*\)$/i
const cardColorFields = ["accent", "background", "foreground", "muted"] as const
const cardFontWeights: readonly number[] = [
  100, 200, 300, 400, 500, 600, 700, 800, 900,
]

// The card renderer parses hex and rgb() and nothing else: an oklch() or a
// var() there fails the image, not the theme, so it is caught here instead.
function assertCard(theme: SlideTheme) {
  const { card } = theme

  if (!card) {
    return
  }

  for (const field of cardColorFields) {
    const value = card[field]

    if (
      typeof value !== "string" ||
      !(hexColor.test(value.trim()) || rgbColor.test(value.trim()))
    ) {
      throw new Error(
        `Slide theme "${theme.id}" sets card.${field} to ${JSON.stringify(value)}. The share card reads hex or rgb() colors only, so convert it: oklch() and var() do not render.`
      )
    }
  }

  // A theme can be plain JavaScript, so the face is checked rather than trusted.
  const font: Partial<SlideThemeCard["font"]> | undefined = card.font

  if (typeof font?.family !== "string" || !font.family.trim()) {
    throw new Error(
      `Slide theme "${theme.id}" needs card.font.family, the display face the share card fetches.`
    )
  }

  if (!cardFontWeights.includes(font.weight as number)) {
    throw new Error(
      `Slide theme "${theme.id}" sets card.font.weight to ${font.weight}. The card fetches a static instance, so use a hundred from 100 to 900.`
    )
  }
}

export function resolveTheme(theme: SlideTheme = baseTheme): SlideTheme {
  if (theme.id.trim().length === 0) {
    throw new Error("Slide theme needs a non-empty id.")
  }

  assertColorModes(theme)
  assertDefaultColorMode(theme)
  assertMotion(theme)
  assertCard(theme)

  return { ...theme, colorModes: [...theme.colorModes] }
}

/** The field a theme paints a background variant with, or nothing. */
export function motionField(
  theme: SlideTheme,
  background: string
): SlideMotionField | undefined {
  const { motion } = theme

  return motion && Object.hasOwn(motion, background)
    ? motion[background]
    : undefined
}

export interface ResolvedBackground {
  /** Set when the theme paints this variant in a canvas rather than in CSS. */
  field?: SlideMotionField
  /** The name the canvas and the background layer carry. */
  variant: SlideBackgroundMode
}

function isBackgroundRole(
  background: string
): background is keyof typeof slideBackgroundRoles {
  return Object.hasOwn(slideBackgroundRoles, background)
}

/**
 * What a slide's `background` renders as under a theme. A variant the theme
 * paints in `motion` keeps its name and gets its field. A role the theme does
 * not paint in `motion` renders as the variant it falls back to. Anything else
 * passes through for the theme stylesheet to paint.
 */
export function resolveBackground(
  theme: SlideTheme,
  background: SlideBackgroundMode
): ResolvedBackground {
  const field = motionField(theme, background)

  if (field) {
    return { field, variant: background }
  }

  if (isBackgroundRole(background)) {
    return { variant: slideBackgroundRoles[background] }
  }

  return { variant: background }
}

// A single-mode theme pins the canvas to that mode, whatever the app chrome is doing.
export function forcedColorMode(theme: SlideTheme): SlideColorMode | undefined {
  return theme.colorModes.length === 1 ? theme.colorModes[0] : undefined
}

export function canSwitchColorMode(theme: SlideTheme): boolean {
  return theme.colorModes.length > 1
}

export function toDeckPresentation(deck: Deck): DeckPresentation {
  return {
    canvas: deck.canvas,
    meta: deck.header.meta,
    presenterHref: deck.routes.presenter || undefined,
    showProgress: deck.footer.progress ?? true,
    theme: deck.theme,
    title: deck.header.brand,
    titleHref: deck.header.href,
  }
}
