import Link from "next/link"
import type { CSSProperties } from "react"

// Structure only. The row itself, the look, and the containment are the token
// contract in styles.css, plus whatever the deck theme paints on these
// attributes, the way SlideBackground works.

export function SlideCanvasHeader({
  brand,
  brandHref,
  meta,
  title,
}: {
  brand: string
  brandHref: string
  meta?: string
  title?: string
}) {
  // A title slide is usually named after the deck, and a header that says the
  // same thing twice is worse than one that says it once.
  const showTitle = Boolean(title) && title !== brand

  return (
    <header
      className="absolute inset-x-0 top-0 z-40 min-h-16"
      data-slide-header=""
    >
      <Link data-slide-header-brand="" href={brandHref}>
        {brand}
      </Link>
      {showTitle ? <span data-slide-header-title="">{title}</span> : null}
      {meta ? <span data-slide-header-meta="">{meta}</span> : null}
    </header>
  )
}

export function SlideCanvasFooter({
  number,
  total,
}: {
  number: number
  total: number
}) {
  const progress = total > 0 ? number / total : 0

  return (
    <footer
      className="absolute inset-x-0 bottom-0 z-40 min-h-14"
      data-slide-footer=""
    >
      <div
        aria-hidden="true"
        data-slide-progress=""
        style={{ "--slide-progress": progress } as CSSProperties}
      />
      <p data-slide-counter="">
        <span data-slide-counter-current="">{number}</span>
        <span data-slide-counter-separator=""> of </span>
        <span data-slide-counter-total="">{total}</span>
      </p>
    </footer>
  )
}
