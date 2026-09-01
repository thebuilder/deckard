import type { Metadata } from "next"
import Link from "next/link"

import type { Swatches } from "@/lib/theme-tokens"
import { readThemeSwatches, swatchTokens } from "@/lib/theme-tokens"

export const metadata: Metadata = {
  title: "Registry",
}

const registryConfig = `{
  "registries": {
    "@deckard": "http://localhost:3001/r/{name}.json"
  }
}`

const themes = [
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/apps/playground/deck/theme/theme.css",
    modes: "Light and dark",
    name: "theme-deckard",
    summary:
      "The default. Off-white paper in light mode, a blue-black sheet in dark, one teal accent on eyebrows, buttons, and focus rings. Cards are near-opaque with a hairline border, a soft shadow, and 1rem corners. Backgrounds are a top wash, a 44px grid, or a wide spotlight, each with a blurred corner glow.",
    swatches: readThemeSwatches("apps/playground/deck/theme/theme.css"),
    title: "Deckard",
    when: "You want a deck that reads as a modern product presentation and you do not want to design a theme.",
  },
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/registry/themes/broadsheet/theme.css",
    modes: "Light and dark",
    name: "theme-broadsheet",
    summary:
      "Editorial print. Warm newsprint in light mode, warm ink in dark, oxblood accent turning terracotta after dark. Serif throughout, from a system stack that loads no web font. Corners are 0.125rem and there is no shadow anywhere, so a card is a panel with a rule around it. The grid variant paints horizontal rules like ruled paper; spotlight paints two column rules at the thirds.",
    swatches: readThemeSwatches("registry/themes/broadsheet/theme.css"),
    title: "Broadsheet",
    when: "A talk that should read as a written argument rather than a product demo. Also the worked example of a second theme on the same token contract.",
  },
]

const blocks = [
  {
    exports: "Eyebrow, SlideHeading",
    name: "block-typography",
    summary:
      "The two primitives every other block builds on. An uppercase accent label at --slide-label-size, and an h1 at --slide-heading-size with an optional lead paragraph. Both read the theme size tokens instead of Tailwind text sizes, so retuning the scale moves them.",
    when: "You are writing your own slide layouts and want the deck heading rhythm without copying class strings.",
  },
  {
    exports: "HeroSlide, BreakerSlide, ContentSlideCard, OpenContentSlide",
    name: "block-slide-layouts",
    summary:
      "Four whole-slide frames. A centered opener, a left-aligned section divider at the same type size, an intro above a bordered surface panel, and the same intro with no panel. All four fall back to useSlideTitle() when you do not pass a title, so a slide names itself once.",
    when: "Almost every slide. Start here and drop to OpenContentSlide when the body brings its own frame.",
  },
  {
    exports: "BulletList, FeatureGrid",
    name: "block-collections",
    summary:
      "A numbered list that rules each row off with a border, and a three-across card grid on --slide-surface-muted. Both take plain arrays, so a server component can await the data and pass it straight in.",
    when: "BulletList for four to six sequential points, FeatureGrid for three parallel ones. Neither scrolls, so cut copy rather than adding a seventh item.",
  },
  {
    exports: "FullscreenMediaSlide, ImageShowcaseSlide",
    name: "block-media",
    summary:
      "Photo and video slides sized for the 1920x1080 canvas. One bleeds to every edge with an optional scrim under the copy, the other splits the canvas 1.2fr to 0.8fr with a caption panel. Both forward blurDataURL from static imports and pad against --slide-chrome-top and --slide-chrome-bottom.",
    when: "Any slide with an image or a video. Dropping a bare img on a slide will not fit the canvas and will sit under the header.",
  },
]

function SwatchRow({ label, swatches }: { label: string; swatches: Swatches }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-muted text-xs uppercase tracking-widest">
        {label}
      </span>
      <div
        className="flex gap-1 rounded border border-black/10 p-1"
        style={{ backgroundColor: swatches.background }}
      >
        {swatchTokens.map((token) => (
          <span
            aria-label={`${label} ${token}`}
            className="size-7 rounded-sm"
            key={token}
            role="img"
            style={{ backgroundColor: swatches[token] }}
            title={`--${token}: ${swatches[token]}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function RegistryPage() {
  return (
    <>
      <h1 className="text-3xl">Registry</h1>
      <p>
        The themes and blocks in this repository install through{" "}
        <code>shadcn add</code>. Everything lands as source files in your app.
        There is no runtime and nothing to import from a package, so once a
        theme is in <code>deck/theme/</code> it is yours to edit and the
        registry never touches it again.
      </p>

      <h2 className="pt-4 text-2xl">Point at the registry</h2>
      <p>
        The registry is built from <code>registry.json</code> at the repository
        root and served as static JSON from this docs site at{" "}
        <code>/r/&#123;name&#125;.json</code>. Build it with{" "}
        <code>pnpm registry:build</code>, then run the docs site with{" "}
        <code>pnpm --filter docs dev</code> to serve it on port 3001.
      </p>
      <p>Add it to the consuming app&apos;s components.json:</p>
      <pre className="overflow-x-auto rounded bg-black/5 p-4 text-sm">
        <code>{registryConfig}</code>
      </pre>
      <p>
        Then <code>pnpm dlx shadcn@latest add @deckard/preset-deckard</code>. If
        you would rather not edit components.json, pass the URL instead:{" "}
        <code>
          pnpm dlx shadcn@latest add http://localhost:3001/r/preset-deckard.json
        </code>
        . The namespaced form is the one to use, because items reference each
        other by <code>@deckard/&#123;name&#125;</code> and that only resolves
        when the namespace is configured.
      </p>

      <h2 className="pt-4 text-2xl">preset-deckard</h2>
      <p>
        One add for a new deck: the Deckard theme and all four block families.
        It also writes the one stylesheet line you cannot guess, the{" "}
        <code>@import</code> of <code>@deckard/core/styles.css</code>. That
        sheet carries the slide token contract and registers the package&apos;s
        own Tailwind source, so the runtime classes survive tree shaking without
        a <code>@source</code> line in your app.
      </p>
      <p>
        That import is the whole build wiring. <code>@deckard/core</code> ships
        compiled, so <code>next.config.mjs</code> stays empty and nothing has to
        be transpiled. What is left is deck code. See{" "}
        <Link href="/getting-started">Getting started</Link> for the rest of the
        setup.
      </p>

      <h2 className="pt-4 text-2xl">Themes</h2>
      <p>
        A deck has exactly one theme, and every theme installs to the same three
        paths. Adding a second theme replaces the first, so commit before you
        try one on.
      </p>

      {themes.map((theme) => (
        <section
          className="space-y-3 border-black/10 border-t pt-6"
          key={theme.name}
        >
          <h3 className="text-xl">{theme.title}</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <SwatchRow label="Light" swatches={theme.swatches.light} />
            <SwatchRow label="Dark" swatches={theme.swatches.dark} />
          </div>
          <p>{theme.summary}</p>
          <p>
            <strong className="font-semibold">Reach for it when.</strong>{" "}
            {theme.when}
          </p>
          <p className="text-sm">
            {theme.modes}. Installs <code>deck/theme/theme.css</code>,{" "}
            <code>deck/theme/index.ts</code>, and{" "}
            <code>deck/theme/THEME.md</code>, which documents every token.{" "}
            <Link href={theme.href}>Read the stylesheet</Link>.
          </p>
          <pre className="overflow-x-auto rounded bg-black/5 p-4 text-sm">
            <code>pnpm dlx shadcn@latest add @deckard/{theme.name}</code>
          </pre>
        </section>
      ))}

      <h2 className="pt-4 text-2xl">Blocks</h2>
      <p>
        Blocks install to <code>app/slides/blocks/</code> and depend on{" "}
        <code>@deckard/core</code>. They style themselves entirely from the
        slide tokens, so swapping the theme restyles them with no edits. None of
        them pull in a shadcn primitive.
      </p>

      {blocks.map((block) => (
        <section
          className="space-y-3 border-black/10 border-t pt-6"
          key={block.name}
        >
          <h3 className="text-xl">
            <code>{block.name}</code>
          </h3>
          <p className="text-sm">Exports {block.exports}.</p>
          <p>{block.summary}</p>
          <p>
            <strong className="font-semibold">Reach for it when.</strong>{" "}
            {block.when}
          </p>
          <pre className="overflow-x-auto rounded bg-black/5 p-4 text-sm">
            <code>pnpm dlx shadcn@latest add @deckard/{block.name}</code>
          </pre>
        </section>
      ))}
    </>
  )
}
