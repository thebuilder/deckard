/*
 * Mounts the hero effect and keeps it honest with the page around it.
 *
 * The harness owns what is the same for every variant: which module to load,
 * the support check, pausing when the hero is off-screen or the tab hidden,
 * following the site's light and dark toggle, honouring reduced motion, and
 * tearing down before the client router swaps the document. The variant owns
 * the pixels.
 *
 * The hero renders with data-hero-state="idle" and a CSS backdrop under the
 * canvas. The state moves to "live" once the effect has mounted, and to
 * "unsupported" when the effect declines or fails, in which case the backdrop
 * is what the reader sees.
 */

import {
  type HeroColorMode,
  type HeroEffectHandle,
  heroVariants,
  isHeroVariantId,
} from "./hero-effect"

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"
const darkSchemeQuery = "(prefers-color-scheme: dark)"

function currentMode(): HeroColorMode {
  const chosen = document.documentElement.dataset.theme

  if (chosen === "dark" || chosen === "light") {
    return chosen
  }

  return matchMedia(darkSchemeQuery).matches ? "dark" : "light"
}

interface Mounted {
  destroy: () => void
}

async function mount(root: HTMLElement): Promise<Mounted | null> {
  const canvas = root.querySelector("canvas")
  const id = root.dataset.heroVariant

  if (canvas === null || !isHeroVariantId(id)) {
    return null
  }

  const reduced = matchMedia(reducedMotionQuery)
  const cleanups: Array<() => void> = []
  let handle: HeroEffectHandle | null = null
  let cancelled = false

  const cleanup = () => {
    cancelled = true

    for (const fn of cleanups.splice(0)) {
      fn()
    }

    handle?.destroy()
    handle = null
    root.dataset.heroState = "idle"
  }

  try {
    const { effect } = await heroVariants[id].load()

    if (cancelled) {
      return null
    }

    if (!effect.supported()) {
      root.dataset.heroState = "unsupported"
      return null
    }

    handle = await effect.mount({
      canvas,
      mode: currentMode(),
      reducedMotion: reduced.matches,
    })

    if (cancelled) {
      handle.destroy()
      handle = null
      return null
    }
  } catch (error) {
    console.warn(`Hero effect "${id}" did not mount.`, error)
    root.dataset.heroState = "unsupported"
    return null
  }

  root.dataset.heroState = "live"

  /* A still frame under reduced motion: mounted, never resumed. */
  if (reduced.matches) {
    handle.setPaused(true)
  } else {
    let visible = true

    const applyPause = () => {
      handle?.setPaused(!visible || document.hidden)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting
        }

        applyPause()
      },
      { threshold: 0 }
    )

    observer.observe(root)
    document.addEventListener("visibilitychange", applyPause)

    cleanups.push(() => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", applyPause)
    })
  }

  /* The theme toggle writes data-theme on <html>. */
  const themeObserver = new MutationObserver(() => {
    handle?.setMode(currentMode())
  })

  themeObserver.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  })

  const scheme = matchMedia(darkSchemeQuery)
  const onScheme = () => handle?.setMode(currentMode())
  scheme.addEventListener("change", onScheme)

  cleanups.push(() => {
    themeObserver.disconnect()
    scheme.removeEventListener("change", onScheme)
  })

  /* Reduced motion changed under us: the effect decides what a still looks
   * like, so remount rather than guess. */
  const onReduced = () => {
    cleanup()
    run()
  }

  reduced.addEventListener("change", onReduced)
  cleanups.push(() => reduced.removeEventListener("change", onReduced))

  return { destroy: cleanup }
}

let current: Mounted | null = null
let currentRoot: HTMLElement | null = null

/* Mounts run one at a time. The client router fires astro:page-load on the
 * first load as well as after every swap, so the hero on the page may already
 * be the one mounted, in which case there is nothing to do. */
let queue: Promise<void> = Promise.resolve()

function start() {
  queue = queue.then(async () => {
    const root = document.querySelector<HTMLElement>("[data-hero-variant]")

    if (root !== null && root === currentRoot) {
      return
    }

    current?.destroy()
    current = null
    currentRoot = null

    if (root === null) {
      return
    }

    currentRoot = root
    current = await mount(root)

    if (current === null) {
      currentRoot = null
    }
  })

  return queue
}

function stop() {
  current?.destroy()
  current = null
  currentRoot = null
}

/* start() only rejects on a bug of its own: an effect that fails to mount is
 * caught inside it and leaves the hero on the CSS backdrop. */
function run() {
  start().catch((error: unknown) => {
    console.warn("The hero effect did not start.", error)
  })
}

export function installHero() {
  document.addEventListener("astro:page-load", run)
  document.addEventListener("astro:before-swap", stop)
  run()
}
