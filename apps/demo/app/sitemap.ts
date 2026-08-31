import type { MetadataRoute } from "next"

import { deck } from "@/deck/deck"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL("/", siteUrl).toString() },
    ...deck.slides.map((slide) => ({
      url: new URL(slide.href, siteUrl).toString(),
    })),
  ]
}
