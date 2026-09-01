import { slideFromModule } from "./slide-from-module"
import type { SlideDefinition, SlideMeta, SlideModule } from "./types"

export interface DiscoveredSlide {
  meta: SlideMeta
  module: SlideModule
  path: string
}

export type SlideComparator = (
  left: DiscoveredSlide,
  right: DiscoveredSlide
) => number

export type SlideSort = "order" | "path" | SlideComparator

export interface DiscoverSlidesOptions {
  sort?: SlideSort
}

const relativePrefix = /^(?:\.\/)+/
const naturalCollator = new Intl.Collator("en", { numeric: true })

function normalizePath(key: string) {
  return key.replace(relativePrefix, "")
}

function toSlideModule(value: unknown, path: string): SlideModule {
  const candidate = value as
    | (Partial<SlideModule> & PromiseLike<unknown>)
    | null

  // An async module (top-level await, or a WebAssembly dependency such as a
  // syntax highlighter) comes back as a promise even from an eager glob.
  if (typeof candidate?.then === "function") {
    throw new Error(
      `Discovered slide "${path}" is an async module, so the glob handed back a promise instead of its exports. Import it in the deck array with slideFromModule, or drop the dependency that uses top-level await.`
    )
  }

  if (typeof candidate?.default !== "function") {
    throw new Error(
      `Discovered slide "${path}" has no default export. A slide module exports its component as the default, plus optional meta and notes.`
    )
  }

  return candidate as SlideModule
}

function byPath(left: DiscoveredSlide, right: DiscoveredSlide) {
  const leftSegments = left.path.split("/")
  const rightSegments = right.path.split("/")
  const shared = Math.min(leftSegments.length, rightSegments.length)

  for (let index = 0; index < shared; index += 1) {
    const compared = naturalCollator.compare(
      leftSegments[index],
      rightSegments[index]
    )

    if (compared !== 0) {
      return compared
    }
  }

  return leftSegments.length - rightSegments.length
}

function byOrder(left: DiscoveredSlide, right: DiscoveredSlide) {
  const leftOrder = left.meta.order ?? Number.POSITIVE_INFINITY
  const rightOrder = right.meta.order ?? Number.POSITIVE_INFINITY

  return leftOrder === rightOrder ? byPath(left, right) : leftOrder - rightOrder
}

function comparatorFor(sort: SlideSort): SlideComparator {
  if (sort === "path") {
    return byPath
  }

  return sort === "order" ? byOrder : sort
}

// meta.order sorts the discovered group and stops there. slideFromModule drops
// it, so a module can never reorder the deck array it was spread into.
function toDefinition(slide: DiscoveredSlide): SlideDefinition {
  return slideFromModule(slide.module, slide.path)
}

export function discoverSlides(
  modules: Record<string, unknown>,
  options: DiscoverSlidesOptions = {}
): SlideDefinition[] {
  const discovered = Object.entries(modules)
    .map(([key, value]) => {
      const path = normalizePath(key)
      const slideModule = toSlideModule(value, path)

      return { meta: slideModule.meta ?? {}, module: slideModule, path }
    })
    .sort(byPath)

  return discovered
    .sort(comparatorFor(options.sort ?? "path"))
    .map(toDefinition)
}
