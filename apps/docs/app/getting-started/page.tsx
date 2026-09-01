import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Getting started",
}

const createCommand = `npx @deckard/cli init my-talk
cd my-talk
npm run dev`

const appTree = `my-talk/
  app/
    globals.css
    layout.tsx
    not-found.tsx
    page.tsx
    presenter/page.tsx
    sitemap.ts
    slides/[id]/page.tsx
    slides/blocks/       the five block families, yours to edit
  deck/
    deck.ts
    slides.tsx
    slides/*.slide.tsx
    theme/               the theme you picked, yours to edit
  lib/utils.ts
  public/
  components.json
  next.config.mjs
  package.json`

const tarballInit = `# from the root of a Deckard checkout
pnpm cli:build
pnpm --filter @deckard/core exec pnpm pack --pack-destination /tmp/deckard
pnpm --filter @deckard/cli exec pnpm pack --pack-destination /tmp/deckard

node packages/cli/bin/deckard.mjs init ~/code/my-talk \\
  --core-tarball /tmp/deckard/deckard-core-0.0.1.tgz \\
  --cli-tarball /tmp/deckard/deckard-cli-0.0.1.tgz`

const deckConfig = `import { defineDeck } from "@deckard/core"

import { slides } from "@/deck/slides"
import { theme } from "@/deck/theme"

export const deck = defineDeck({
  canvas: { fit: "contain", height: 1080, mode: "fixed", width: 1920 },
  description: "What the talk is about.",
  footer: { mode: "visible" },
  header: { brand: "My talk", date: "March 2026", href: "/", mode: "auto" },
  slides,
  theme,
  title: "My talk",
})`

const deckChecks = `pnpm deck:validate
pnpm deck:doctor
pnpm deck:check-overflow
pnpm deck:screenshots
pnpm deck:contact-sheet`

const addCommands = `deckard add theme phosphor
deckard add block metrics`

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

const manualInstall = `pnpm create next-app my-talk --typescript --tailwind --app
cd my-talk
pnpm add @deckard/core
pnpm add -D @deckard/cli`

const registryConfig = `{
  "registries": {
    "@deckard": "http://localhost:3001/r/{name}.json"
  }
}`

const componentsAliases = `{
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "ui": "@/components/ui",
    "utils": "@/lib/utils"
  }
}`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-3xl">Getting started</h1>
      <pre>
        <code>{createCommand}</code>
      </pre>
      <p>
        One command writes the app, installs it, makes the first commit, and
        typechecks it. It asks nothing. What you get is a Next.js app you own,
        with a five-slide deck in it that you delete.
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <code>--theme &lt;name&gt;</code> picks the look: deckard, broadsheet,
          ledger, meridian, nexus, or phosphor. The default is deckard.
        </li>
        <li>
          <code>--empty</code> writes two slides instead of the sample deck.
        </li>
        <li>
          <code>--package-manager npm|pnpm|yarn|bun</code> overrides the
          detected installer. By default <code>init</code> uses the package
          manager that ran it, and records it in the generated{" "}
          <code>package.json</code> so later commands use the same one.
        </li>
        <li>
          <code>--no-install</code> and <code>--no-git</code> skip those steps.
        </li>
      </ul>

      <h2 className="pt-4 text-2xl">What it writes</h2>
      <pre>
        <code>{appTree}</code>
      </pre>
      <p>
        <code>@deckard/core</code> is a dependency inside it. The theme and the
        slide blocks are source files in your repository from the first commit,
        and you edit them from then on. You do not clone the Deckard repository
        to build a deck, and you do not write slides in its playground. That
        repository is where the framework itself gets built, which is the last
        section on this page.
      </p>

      <h2 className="pt-4 text-2xl">Where the packages stand today</h2>
      <p>
        <code>@deckard/core</code> and <code>@deckard/cli</code> are built for
        npm and are not published there yet. Publishing them is the plan before
        the API is called stable, so the <code>npx</code> line above does not
        work from a clean machine yet. Until it does, pack both out of a
        checkout and point the init at the tarballs.
      </p>
      <pre>
        <code>{tarballInit}</code>
      </pre>
      <p>
        That is the in-repo path, and it runs the working copy of the binary.{" "}
        <code>pnpm smoke:cli</code> proves the published one on every check: it
        installs the CLI tarball outside the workspace and runs{" "}
        <code>init</code> through that installed copy, once under pnpm and once
        under npm, then builds and validates what came out. So the tarball route
        is the one with a test behind it. The other option is to build your deck
        inside the Deckard workspace as a second app, the way{" "}
        <code>apps/demo</code> does, and move it out when the packages publish.
      </p>

      <h2 className="pt-4 text-2xl">The commands</h2>
      <p>
        <code>deckard</code> is the only binary. Every command except{" "}
        <code>init</code> runs against the deck in the current directory, and{" "}
        <code>init</code> wires them into your <code>package.json</code> as{" "}
        <code>deck:validate</code>, <code>deck:screenshots</code>, and the rest.
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <code>deckard validate</code> loads the real deck in about a second
          and reports whether it resolves at all, and whether the theme class
          and its color blocks match the stylesheet. It exits nonzero with the
          offending slug, token, or path. Run it after a structural change.
        </li>
        <li>
          <code>deckard doctor</code> checks the shape of the app instead of the
          content of the deck: the node version, that <code>@deckard/core</code>{" "}
          resolves, that the stylesheet import is there, that{" "}
          <code>deck/deck.ts</code> loads, and that the four route files still
          re-export their adapters.
        </li>
        <li>
          <code>deckard check-overflow</code> builds the deck, serves it, and
          measures each slide against the canvas with the same arithmetic the
          development overflow guard uses. It exits nonzero listing the slides
          whose content is clipped, so it works as a CI gate.
        </li>
        <li>
          <code>deckard screenshots</code> writes one PNG per slide at canvas
          size into <code>out/screenshots</code>, dark by default and light with{" "}
          <code>--light</code>. <code>--max 1</code> stops after the first
          slide. <code>deckard contact-sheet</code> composes them into a single
          grid at <code>out/contact-sheet.png</code>, which is the fastest way
          to look at a whole deck at once.
        </li>
        <li>
          <code>deckard export pdf</code> runs a production build with{" "}
          <code>NEXT_PUBLIC_PDF_EXPORT=1</code>, reads slide routes from{" "}
          <code>/sitemap.xml</code>, and captures one page per slide at the deck
          canvas size. Page size comes from the canvas config, so the handout
          cannot drift from what the audience saw.
        </li>
      </ul>
      <pre>
        <code>{deckChecks}</code>
      </pre>
      <p>
        The four commands that need a browser build the app and serve it on a
        spare port. Install Chromium once with{" "}
        <code>pnpm exec playwright install chromium</code>. They take{" "}
        <code>--port &lt;n&gt;</code> and <code>--skip-build</code>, and every
        one but the PDF export takes <code>--light</code>.
      </p>

      <h2 className="pt-4 text-2xl">Install another theme or block</h2>
      <p>
        Themes and slide blocks are not in the package. They install into your
        app as files you own, through the shadcn registry.{" "}
        <code>deckard add</code> is a wrapper around <code>shadcn add</code>{" "}
        that reads the registry URL from <code>components.json</code>, or takes{" "}
        <code>--registry</code>.
      </p>
      <pre>
        <code>{addCommands}</code>
      </pre>
      <p>
        A theme lands in <code>deck/theme/</code> and replaces whatever theme
        was there, because a deck has exactly one. shadcn asks before it does,
        and <code>--yes</code> answers for it. Blocks land in{" "}
        <code>app/slides/blocks/</code>. The registry has no public host yet, so{" "}
        <code>init</code> points <code>components.json</code> at this docs site
        running locally on port 3001, and <code>deckard add</code> says so when
        nothing answers there. <Link href="/registry">Registry</Link> covers
        what each item contains and how to run the server.
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

      <h2 className="pt-4 text-2xl">Wiring a deck by hand</h2>
      <p>
        Everything above assumes <code>deckard init</code> wrote the app. Do it
        by hand when the deck has to live inside an app you already have. This
        is the same wiring, written out.
      </p>
      <pre>
        <code>{manualInstall}</code>
      </pre>
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
        <code>@/lib/utils</code>, and add the registry namespace. shadcn
        resolves that alias against your tsconfig paths, so a package subpath
        such as <code>@deckard/core/utils</code> only resolves inside the
        Deckard workspace and makes <code>shadcn add</code> fail in your app.
      </p>
      <pre>
        <code>{componentsAliases}</code>
      </pre>
      <pre>
        <code>{registryConfig}</code>
      </pre>
      <pre>
        <code>pnpm dlx shadcn@latest add @deckard/preset-deckard</code>
      </pre>
      <p>
        That writes <code>deck/theme/</code> and <code>app/slides/blocks/</code>{" "}
        into your app, plus the stylesheet import above. It leaves{" "}
        <code>next.config.mjs</code> alone, and there is nothing to add there.
      </p>
      <p>
        Then the routes. <code>@deckard/core/next</code> ships them, so an app
        owns its deck and nothing else. <code>createSlideRoute</code> returns
        the slide page with its metadata and static params,{" "}
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
      <p>
        Finish with <code>deckard doctor</code>, which checks every step on this
        list and names the one you missed.
      </p>

      <h2 className="pt-4 text-2xl">Working on the framework itself</h2>
      <p>
        Everything above is about your app. Cloning the Deckard repository is a
        different job: changing the runtime, the CLI, the blocks, the registry,
        or these docs. It is a pnpm workspace run by Turborepo, and it holds
        three apps with three distinct jobs.
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <code>apps/playground</code> is the reference deck, and the app the
          visual checks run against. It exercises every feature on purpose, so
          it is a test surface, not a template. Its blocks and its theme are
          also the source the <code>init</code> template is copied from.
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
