import { resolveCanvas } from "./canvas"
import { resolveSlides } from "./resolve-slides"
import { resolveTheme } from "./theme"
import type { Deck, DeckConfig, DeckRoutes, SlideDefaults } from "./types"

const trailingSlash = /\/$/

function routePath(path: string, field: string) {
  if (!(path.startsWith("/") && path !== "/")) {
    throw new Error(`Deck ${field} route must start with "/" and name a path.`)
  }

  return path.replace(trailingSlash, "")
}

function resolveRoutes(config: DeckConfig["routes"]): DeckRoutes {
  return {
    presenter:
      config?.presenter === false
        ? false
        : routePath(config?.presenter ?? "/presenter", "presenter"),
    slides: routePath(config?.slides ?? "/slides", "slides"),
  }
}

export function defineDeck(config: DeckConfig): Deck {
  const { canvas, motion, routes: routeConfig, slides, theme, ...deck } = config
  const routes = resolveRoutes(routeConfig)
  const slideDefaults: Partial<SlideDefaults> = {
    footer: config.footer.mode,
    header: config.header.mode,
  }

  // Assigned rather than spread: a key set to undefined would win over the
  // fallback and leave every slide with no motion mode at all.
  if (motion) {
    slideDefaults.motion = motion
  }

  return {
    ...deck,
    canvas: resolveCanvas(canvas),
    routes,
    slides: resolveSlides(slides, slideDefaults, routes.slides),
    theme: resolveTheme(theme),
  }
}
