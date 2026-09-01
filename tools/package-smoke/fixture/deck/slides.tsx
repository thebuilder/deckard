import type { SlideDefinition } from "@deckard/core"
import { SlideStep } from "@deckard/core/components"
import { discoverSlides } from "@deckard/core/discovery"

import { Counter } from "./counter"

const discovered = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

async function AsyncSlide() {
  const rows = await Promise.resolve(["awaited on the server", "then rendered"])

  return (
    <ul className="space-y-2 text-[length:var(--slide-body-size)]">
      {rows.map((row) => (
        <li key={row}>{row}</li>
      ))}
    </ul>
  )
}

export const slides: SlideDefinition[] = [
  {
    body: (
      <h1 className="text-[length:var(--slide-title-size)]">
        A plain Next.js app
      </h1>
    ),
    slug: "hello",
    title: "Hello",
  },
  {
    body: <AsyncSlide />,
    title: "Async",
  },
  ...discovered,
  {
    body: (
      <div className="space-y-4">
        <SlideStep step={0}>First</SlideStep>
        <SlideStep step={1}>Second</SlideStep>
      </div>
    ),
    stepCount: 2,
    title: "Stepped",
  },
  {
    body: <Counter />,
    slug: "interactive",
    title: "Interactive",
  },
]
