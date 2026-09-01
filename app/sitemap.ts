import type { MetadataRoute } from "next"

import { deck } from "@/deck/deck"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  const slideEntries = deck.slides.map((slide) => ({
    url: new URL(slide.href, siteUrl).toString(),
  }))

  return [
    {
      url: new URL("/", siteUrl).toString(),
    },
    ...slideEntries,
  ]
}
