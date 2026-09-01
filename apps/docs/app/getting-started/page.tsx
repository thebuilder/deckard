import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Getting started",
}

const appTree = `my-talk/
  app/
    globals.css
    layout.tsx
    page.tsx
    presenter/page.tsx
    sitemap.ts
    slides/[id]/page.tsx
    slides/blocks/       installed from the registry, yours to edit
  components/
  deck/
    deck.ts
    slides.tsx
    slides/*.slide.tsx
    theme/               installed from the registry, yours to edit
  public/
  next.config.mjs
  package.json`

const packCommand = `# from the root of a Deckard checkout
pnpm --filter @deckard/core exec pnpm pack \\
  --pack-destination ~/code/my-talk`

const tarballDependency = `{
  "dependencies": {
    "@deckard/core": "file:./deckard-core-0.0.1.tgz",
    "next": "16.3.3",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  }
}`

const registryConfig = `{
  "registries": {
    "@deckard": "http://localhost:3001/r/{name}.json"
  }
}`

const deckConfig = `import { defineDeck } from "@deckard/core"

import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "What the talk is about.",
  footer: { mode: "counter" },
  header: { brand: "My talk", href: "/", mode: "auto" },
  slides,
  theme,
  title: "My talk",
})`

const deckChecks = `pnpm deck:validate
pnpm deck:check-overflow
pnpm deck:screenshots
pnpm deck:contact-sheet`

const componentsAliases = `{
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "ui": "@/components/ui",
    "utils": "@/lib/utils"
  }
}`

const slideArray = `import type { SlideDefinition } from "@deckard/core"

export const slides: SlideDefinition[] = [
  { slug: "intro", title: "My talk", body: <HeroSlide /> },
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
  { slug: "intro", title: "My talk", body: <HeroSlide /> },
  ...discoveredSlides,
]`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-3xl">Getting started</h1>
      <p>
        A Deckard presentation is a Next.js app you own. You write{" "}
        <code>app/</code>, <code>components/</code>, <code>deck/</code>,{" "}
        <code>public/</code>, and <code>package.json</code> the way you would in
        any other Next project. <code>@deckard/core</code> is a dependency
        inside it. The theme and the slide blocks are source files in your
        repository, installed once through the shadcn registry and edited from
        then on.
      </p>
      <p>
        You do not clone the Deckard repository to build a deck, and you do not
        write slides in its playground. That repository is where the framework
        itself gets built, which is the last section on this page.
      </p>
      <pre>
        <code>{appTree}</code>
      </pre>

      <h2 className="pt-4 text-2xl">Where the package stands today</h2>
      <p>
        <code>@deckard/core</code> is designed for npm and is not published to
        npm yet. Publishing it is the plan before the API is called stable, so
        the install step below is temporary and nothing else on this page
        depends on it.
      </p>
      <p>Two paths work right now.</p>
      <ol className="list-decimal space-y-1 pl-6">
        <li>
          Pack a tarball out of the Deckard repository and install the file.{" "}
          <code>pnpm smoke:package</code> runs that exact path into a scratch
          app on every check, so it is the one with a test behind it.
        </li>
        <li>
          Build your deck inside the Deckard workspace as a second app, the way{" "}
          <code>apps/demo</code> does, and move it out when the package
          publishes.
        </li>
      </ol>
      <p>
        The deck check scripts have the same caveat.{" "}
        <code>@deckard/deck-scripts</code> is workspace-only today, so a
        standalone app gets <code>deck-validate</code> and the rest once both
        packages publish. Until then, run them against a deck that lives in the
        workspace.
      </p>

      <h2 className="pt-4 text-2xl">Create the app</h2>
      <p>
        Start a Next.js app with Tailwind and the App Router, or skip this and
        use an app you already have. Deckard adds routes under{" "}
        <code>/slides</code> and touches nothing else.
      </p>
      <pre>
        <code>
          {
            "pnpm create next-app my-talk --typescript --tailwind --app\ncd my-talk"
          }
        </code>
      </pre>

      <h2 className="pt-4 text-2xl">Install @deckard/core</h2>
      <p>Pack the package into your app directory:</p>
      <pre>
        <code>{packCommand}</code>
      </pre>
      <p>
        Then point the dependency at the file and install. The version in the
        filename is whatever <code>packages/core/package.json</code> says.
      </p>
      <pre>
        <code>{tarballDependency}</code>
      </pre>
      <p>
        Once the package is on npm this whole step becomes{" "}
        <code>pnpm add @deckard/core</code>. The import paths, the config, and
        the deck code are already written against that name.
      </p>

      <h2 className="pt-4 text-2xl">Wire the stylesheet</h2>
      <p>
        <code>@deckard/core</code> ships compiled, so Next consumes it like any
        other package: no <code>transpilePackages</code> entry, no Tailwind{" "}
        <code>@source</code>. One import in the app stylesheet is the whole
        wiring, because the package stylesheet registers the package&apos;s own
        output as a Tailwind source.
      </p>
      <pre>
        <code>
          {
            '/* app/globals.css */\n@import "tailwindcss";\n@import "@deckard/core/styles.css";'
          }
        </code>
      </pre>
      <p>
        <code>styles.css</code> defines the slide token contract, the{" "}
        <code>--slide-*</code> variables every block and every theme reads. A
        deck with no theme installed renders on those defaults.
      </p>
      <p>
        Point the <code>utils</code> alias in <code>components.json</code> at{" "}
        <code>@/lib/utils</code>. shadcn resolves that alias against your
        tsconfig paths, so a package subpath such as{" "}
        <code>@deckard/core/utils</code> only resolves inside the Deckard
        workspace and makes <code>shadcn add</code> fail in your app.
      </p>
      <pre>
        <code>{componentsAliases}</code>
      </pre>

      <h2 className="pt-4 text-2xl">Install the theme and the blocks</h2>
      <p>
        The deck theme and the slide blocks are not in the package. They install
        into your app as files you own, through the shadcn registry. Add the
        namespace to <code>components.json</code>:
      </p>
      <pre>
        <code>{registryConfig}</code>
      </pre>
      <pre>
        <code>pnpm dlx shadcn@latest add @deckard/preset-deckard</code>
      </pre>
      <p>
        That writes <code>deck/theme/</code> and <code>app/slides/blocks/</code>{" "}
        into your app, plus the two stylesheet lines above. It leaves{" "}
        <code>next.config.mjs</code> alone, and there is nothing to add there:
        the package ships compiled, so the config stays empty. The registry has
        no public host yet, so the URL points at this docs site running locally.{" "}
        <Link href="/registry">Registry</Link> covers what each item contains
        and how to run the server.
      </p>

      <h2 className="pt-4 text-2xl">Describe the deck</h2>
      <p>
        <code>defineDeck</code> takes the config and returns a resolved deck:
        slide ids, hrefs, numbering, and a validated theme. It throws on a
        duplicate slug, an empty slug, a slug with characters that are unsafe in
        a URL path, and a slug made only of digits. Ids are matched exactly, so
        a slugged slide has no numeric URL.
      </p>
      <pre>
        <code>{deckConfig}</code>
      </pre>

      <h2 className="pt-4 text-2xl">Write slides</h2>
      <p>
        A slide is an object with a <code>body</code>. Everything else is
        optional: <code>slug</code>, <code>title</code>, <code>stepCount</code>,{" "}
        <code>notes</code>, <code>header</code>, <code>footer</code>,{" "}
        <code>layout</code>, <code>background</code>.
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

      <h2 className="pt-4 text-2xl">Wire the routes</h2>
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

      <h2 className="pt-4 text-2xl">Check the deck</h2>
      <p>
        <code>pnpm deck:validate</code> loads the real deck in about a second
        and reports whether it resolves at all, whether the theme class and its
        color blocks match the stylesheet, and whether every registry file path
        still exists. It exits nonzero with the offending slug, token, or path.
        Run it after a structural change.
      </p>
      <p>
        <code>pnpm deck:check-overflow</code> builds the deck, serves it, and
        measures each slide against the canvas with the same arithmetic the
        development overflow guard uses. It exits nonzero listing the slides
        whose content is clipped, so it works as a CI gate.
      </p>
      <p>
        <code>pnpm deck:screenshots</code> writes one PNG per slide at canvas
        size into <code>out/screenshots</code>, dark by default and light with{" "}
        <code>--light</code>. <code>pnpm deck:contact-sheet</code> composes them
        into a single grid at <code>out/contact-sheet.png</code>, which is the
        fastest way to look at a whole deck at once.
      </p>
      <pre>
        <code>{deckChecks}</code>
      </pre>
      <p>
        These come from <code>@deckard/deck-scripts</code>, which each app wires
        up as bins in its own <code>package.json</code>. That package is
        workspace-only until it publishes.
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

      <h2 className="pt-4 text-2xl">Working on the framework itself</h2>
      <p>
        Everything above is about your app. Cloning the Deckard repository is a
        different job: changing the runtime, the blocks, the registry, or these
        docs. It is a pnpm workspace run by Turborepo, and it holds three apps
        with three distinct jobs.
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <code>apps/playground</code> is the reference deck, and the app the
          visual checks run against. It exercises every feature on purpose, so
          it is a test surface, not a template.
        </li>
        <li>
          <code>apps/demo</code> is a 19-slide conference talk shaped exactly
          like a consumer app, with its own theme and its own copies of the
          blocks. Read it when you want to see what a real deck looks like.
        </li>
        <li>
          <code>apps/docs</code> is this site, and it also serves the registry
          JSON at <code>/r/&#123;name&#125;.json</code>.
        </li>
      </ul>
      <pre>
        <code>
          {
            "pnpm install\npnpm dev                 # playground on :3000\npnpm demo                # the demo talk on :3002\npnpm --filter docs dev   # these docs and the registry on :3001"
          }
        </code>
      </pre>
      <p>
        Slides you add to the playground demonstrate the framework. They are not
        your presentation, and they ship to nobody. Your presentation lives in
        your own app.
      </p>
    </>
  )
}
