"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { SlideSummary } from "../deck/types"

// The neighbors used to be prefetched by the footer navigation links. The footer
// is display now, so the warm-up is its own component and does not ride on any UI.
export function SlidePrefetch({ slides = [] }: { slides?: SlideSummary[] }) {
  const router = useRouter()

  useEffect(() => {
    for (const href of new Set(slides.map((slide) => slide.href))) {
      router.prefetch(href)
    }
  }, [router, slides])

  return null
}
