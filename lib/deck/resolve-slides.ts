import type {
  ResolvedSlide,
  SlideDefaults,
  SlideDefinition,
} from "@/lib/deck/types"

const slugPattern = /^[a-z0-9-]+$/
const numericPattern = /^\d+$/

const fallbackDefaults: SlideDefaults = {
  background: "default",
  footer: "visible",
  header: "auto",
  layout: "default",
}

interface IdOwner {
  isExplicit: boolean
  number: number
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
}

function assertUnclaimedId(id: string, owner: IdOwner, claimed: IdOwner) {
  if (claimed.isExplicit && owner.isExplicit) {
    throw new Error(
      `Slides ${claimed.number} and ${owner.number} both use the slug "${id}". Slide ids must be unique.`
    )
  }

  if (owner.isExplicit) {
    throw new Error(
      `Slide ${owner.number} uses the slug "${id}", which is already the generated id of slide ${claimed.number}.`
    )
  }

  throw new Error(
    `Slide ${owner.number} is served at /slides/${id}, which is already claimed by the slug on slide ${claimed.number}.`
  )
}

function sortByOrder(slides: SlideDefinition[]) {
  return slides
    .map((slide, index) => ({ index, slide }))
    .sort((left, right) => {
      const leftKey = left.slide.order ?? left.index
      const rightKey = right.slide.order ?? right.index

      return leftKey === rightKey
        ? left.index - right.index
        : leftKey - rightKey
    })
    .map((entry) => entry.slide)
}

export function resolveSlides(
  slides: SlideDefinition[],
  defaults: Partial<SlideDefaults> = {}
): ResolvedSlide[] {
  const resolvedDefaults = { ...fallbackDefaults, ...defaults }
  const claimedIds = new Map<string, IdOwner>()

  return sortByOrder(slides).map((slide, index) => {
    const number = index + 1

    if (slide.slug !== undefined) {
      assertValidSlug(slide.slug, number)
    }

    const id = slide.slug ?? String(number)
    const owner: IdOwner = { isExplicit: slide.slug !== undefined, number }
    const claimed = claimedIds.get(id)

    if (claimed) {
      assertUnclaimedId(id, owner, claimed)
    }

    claimedIds.set(id, owner)

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
  const bySlug = slides.find((slide) => slide.id === id)

  if (bySlug || !numericPattern.test(id)) {
    return bySlug
  }

  return slides.find((slide) => slide.number === Number(id))
}
