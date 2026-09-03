/*
 * The contract between the hero and the effect drawn behind it.
 *
 * A variant is one module under ./variants exporting `effect`. The harness in
 * mount-hero.ts picks the module named by the hero's data attribute, checks
 * support, mounts it on the canvas, and drives pause, color mode, and teardown
 * from there. The variant owns everything inside the canvas: sizing to the
 * canvas's client box, the device pixel ratio cap, the render loop, and the
 * GPU resources it allocates.
 */

export type HeroColorMode = "dark" | "light"

export interface HeroEffectContext {
  /** The canvas to draw on. Its CSS box is the hero; size the drawing buffer from it. */
  canvas: HTMLCanvasElement
  /** The site's color mode when mounting. Dark is the primary look. */
  mode: HeroColorMode
  /**
   * True when the reader asked for reduced motion. Draw one designed still
   * frame and stop; the harness will not call setPaused(false) to start it.
   */
  reducedMotion: boolean
}

export interface HeroEffectHandle {
  /** Release every resource: loop, observers, contexts, GPU objects. */
  destroy: () => void
  /** The site switched color mode. Repaint in the new palette. */
  setMode: (mode: HeroColorMode) => void
  /** Stop or resume the loop. Off-screen and hidden tabs pause. */
  setPaused: (paused: boolean) => void
}

export interface HeroEffect {
  /** Create the effect. May reject, in which case the CSS fallback stays. */
  mount: (context: HeroEffectContext) => Promise<HeroEffectHandle>
  /** Synchronous capability check, run before mount. No side effects. */
  supported: () => boolean
}

export interface HeroVariantEntry {
  label: string
  load: () => Promise<{ effect: HeroEffect }>
  /** One sentence: what it draws and what it runs on. */
  summary: string
}

export const heroVariants = {
  "esper-scan": {
    label: "Esper scan",
    load: () => import("./variants/esper-scan"),
    summary:
      "An iris under analysis: concentric rings, a scan bar, phosphor grain. WebGPU through vgpu.",
  },
} satisfies Record<string, HeroVariantEntry>

export type HeroVariantId = keyof typeof heroVariants

export const heroVariantIds = Object.keys(heroVariants) as HeroVariantId[]

export function isHeroVariantId(
  value: string | undefined
): value is HeroVariantId {
  return value !== undefined && value in heroVariants
}
