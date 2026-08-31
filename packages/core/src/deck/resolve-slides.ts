import type { ResolvedSlide, SlideDefaults, SlideDefinition } from "./types"

const slugPattern = /^[a-z0-9-]+$/
const numericPattern = /^\d+$/

const fallbackDefaults: SlideDefaults = {
  background: "default",
  footer: "visible",
  header: "auto",
  layout: "default",
}

function assertValidSlug(slug: string, number: number) {
  if (slug.trim().length === 0) {
    throw new Error(
      `Slide ${number} has an empty slug. Give it a value or drop the slug so the slide is served at /slides/${number}.`
    )
  }

  if (!slugPattern.test(slug)) {
    throw new Error(
      `Slide ${number} has the slug "${slug}", which is not safe in a URL path. Use lowercase letters, digits, and hyphens.`
    )
  }

  if (numericPattern.test(slug)) {
    throw new Error(
      `Slide ${number} has the numeric slug "${slug}". A numeric slug adds nothing over /slides/${number} and breaks when slides move, so use letters or drop the slug.`
    )
  }
}

function claimSlug(slug: string, number: number, claimed: Map<string, number>) {
  const owner = claimed.get(slug)

  if (owner !== undefined) {
    throw new Error(
      `Slides ${owner} and ${number} both use the slug "${slug}". Slide ids must be unique.`
    )
  }

  claimed.set(slug, number)
}

export function resolveSlides(
  slides: SlideDefinition[],
  defaults: Partial<SlideDefaults> = {}
): ResolvedSlide[] {
  const resolvedDefaults = { ...fallbackDefaults, ...defaults }
  const claimedSlugs = new Map<string, number>()

  return slides.map((slide, index) => {
    const number = index + 1

    if (slide.slug !== undefined) {
      assertValidSlug(slide.slug, number)
      claimSlug(slide.slug, number, claimedSlugs)
    }

    const id = slide.slug ?? String(number)

    return {
      background: slide.background ?? resolvedDefaults.background,
      body: slide.body,
      footer: slide.footer ?? resolvedDefaults.footer,
      header: slide.header ?? resolvedDefaults.header,
      href: `/slides/${id}`,
      id,
      index,
      layout: slide.layout ?? resolvedDefaults.layout,
      notes: slide.notes,
      number,
      slug: slide.slug,
      sourcePath: slide.sourcePath,
      stepCount: slide.stepCount ?? 0,
      title: slide.title ?? `Slide ${number}`,
    }
  })
}

export function getSlideById(slides: ResolvedSlide[], id: string) {
  return slides.find((slide) => slide.id === id)
}
