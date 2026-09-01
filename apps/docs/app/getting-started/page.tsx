import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Getting started",
}

const deckConfig = `import { defineDeck } from "@deckard/core"

import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "Beautiful React presentations with shadcn-native theming.",
  footer: { mode: "counter" },
  header: { brand: "Deckard", href: "/", mode: "auto" },
  slides,
  theme,
  title: "Deckard",
})`

const slideArray = `import type { SlideDefinition } from "@deckard/core"

export const slides: SlideDefinition[] = [
  { slug: "intro", title: "Deckard", body: <HeroSlide /> },
  { title: "Pricing", body: <PricingSlide />, background: "spotlight" },
]`

const slideModule = `// deck/slides/pricing.slide.tsx
import type { SlideMeta } from "@deckard/core"

export const meta: SlideMeta = { slug: "pricing", title: "Pricing" }
export const notes = "Speaker-only context."

export default async function PricingSlide() {
  return <PricingTable plans={await loadPlans()} />
}`

const slideRoute = `// app/slides/[id]/page.tsx
import { createSlideRoute } from "@deckard/core/next"

import { deck } from "@/deck/deck"

const { Page, generateMetadata, generateStaticParams } = createSlideRoute(deck)

export { generateMetadata, generateStaticParams }
export default Page`

const discovery = `import { discoverSlides } from "@deckard/core/discovery"

const discoveredSlides = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

export const slides: SlideDefinition[] = [
  { slug: "intro", title: "Deckard", body: <HeroSlide /> },
  ...discoveredSlides,
]`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-3xl">Getting started</h1>

      <h2 className="pt-4 text-2xl">Run the playground</h2>
      <p>
        The repository ships a reference deck. Clone it, install, and open{" "}
        <code>http://localhost:3000</code>.
      </p>
      <pre>
        <code>{"pnpm install\npnpm dev"}</code>
      </pre>

      <h2 className="pt-4 text-2xl">Add Deckard to a Next.js app</h2>
      <p>
        <code>@deckard/core</code> ships compiled, so Next consumes it like any
        other package: no <code>transpilePackages</code> entry, no Tailwind{" "}
        <code>@source</code>. One import in the app stylesheet is the whole
        wiring, because the package stylesheet registers the package&apos;s own
        output as a Tailwind source.
      </p>
      <pre>
        <code>
          {'@import "tailwindcss";\n@import "@deckard/core/styles.css";'}
        </code>
      </pre>
      <p>
        <code>styles.css</code> defines the slide token contract, the{" "}
        <code>--slide-*</code> variables every block and every theme reads. A
        deck without a theme renders with those defaults.
      </p>

      <h2 className="pt-4 text-2xl">Describe the deck</h2>
      <p>
        <code>defineDeck</code> takes the config and returns a resolved deck:
        slide ids, hrefs, numbering, and a validated theme. It throws on a
        duplicate slug, an empty slug, a slug with characters that are unsafe in
        a URL path, and a numeric slug that collides with another slide
        position.
      </p>
      <pre>
        <code>{deckConfig}</code>
      </pre>

      <h2 className="pt-4 text-2xl">Write slides</h2>
      <p>
        A slide is an object with a <code>body</code>. Everything else is
        optional: <code>slug</code>, <code>title</code>, <code>order</code>,{" "}
        <code>stepCount</code>, <code>notes</code>, <code>header</code>,{" "}
        <code>footer</code>, <code>layout</code>, <code>background</code>.
      </p>
      <pre>
        <code>{slideArray}</code>
      </pre>
      <p>
        A slide without a slug is served at its 1-based position, so the fourth
        slide is <code>/slides/4</code>. Give it a slug when you want a link
        that survives reordering.
      </p>

      <h2 className="pt-4 text-2xl">Move a slide into its own file</h2>
      <p>
        A slide module exports the component as <code>default</code>, plus{" "}
        <code>meta</code> and <code>notes</code> as plain values so the deck can
        list and order it without rendering it.
      </p>
      <pre>
        <code>{slideModule}</code>
      </pre>
      <p>
        <code>discoverSlides</code> reads a glob of those modules and returns
        definitions you spread into the array. The spread position decides where
        the group lands, and <code>sort</code> only orders slides inside it.
      </p>
      <pre>
        <code>{discovery}</code>
      </pre>
      <p>
        The glob is eager, so every matched module is in the bundle either way.
        Extracting a slide buys editing room, not loading speed.
      </p>

      <h2 className="pt-4 text-2xl">Render the routes</h2>
      <p>
        <code>@deckard/core/next</code> ships the routes, so an app owns its
        deck and nothing else. <code>createSlideRoute</code> returns the slide
        page with its metadata and static params,{" "}
        <code>createPresenterPage</code> the presenter console,{" "}
        <code>createDeckSitemap</code> the sitemap the PDF export reads, and{" "}
        <code>createFirstSlideRedirect</code> the root redirect. Every slide
        prerenders: the route reads no request, and the presenter preview flags
        are read from the URL on the client.
      </p>
      <pre>
        <code>{slideRoute}</code>
      </pre>
      <p>
        Under it, <code>SlideShell</code> from{" "}
        <code>@deckard/core/components</code> is the chrome: header, footer,
        navigation, command center, error boundary, and the canvas the slide
        body renders into. Reach for it directly when a deck needs a route the
        adapters do not cover.
      </p>

      <h2 className="pt-4 text-2xl">Export a PDF</h2>
      <p>
        The export script runs a production build with{" "}
        <code>NEXT_PUBLIC_PDF_EXPORT=1</code>, reads slide routes from{" "}
        <code>/sitemap.xml</code>, and captures one page per slide at the deck
        canvas size. Page size comes from the canvas config, so the handout
        cannot drift from what the audience saw.
      </p>
      <pre>
        <code>{"pnpm exec playwright install chromium\npnpm export:pdf"}</code>
      </pre>
    </>
  )
}
