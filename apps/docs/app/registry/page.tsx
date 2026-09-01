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
      "The default. Off-white paper in light mode, a blue-black sheet in dark, one teal accent on eyebrows, buttons, and focus rings. Cards are near-opaque with a hairline border, a soft shadow, and 1rem corners. Backgrounds are a top wash, a 44px grid, or a wide spotlight, each with a blurred corner glow. The deck header and footer drop their rules and let the type carry the line, with the progress bar on the canvas edge in the accent.",
    swatches: readThemeSwatches("apps/playground/deck/theme/theme.css"),
    title: "Deckard",
    when: "You want a deck that reads as a modern product presentation and you do not want to design a theme.",
  },
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/registry/themes/broadsheet/theme.css",
    modes: "Light and dark",
    name: "theme-broadsheet",
    summary:
      "Editorial print. Warm newsprint in light mode, warm ink in dark, oxblood accent turning terracotta after dark. Serif throughout, from a system stack that loads no web font. Corners are 0.125rem and there is no shadow anywhere, so a card is a panel with a rule around it. The grid variant paints horizontal rules like ruled paper; spotlight paints two column rules at the thirds. The deck header is a running head and the footer centers the folio under a rule.",
    swatches: readThemeSwatches("registry/themes/broadsheet/theme.css"),
    title: "Broadsheet",
    when: "A talk that should read as a written argument rather than a product demo. Also the worked example of a second theme on the same token contract.",
  },
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/registry/themes/ledger/theme.css",
    modes: "Light and dark",
    name: "theme-ledger",
    summary:
      "A bound report. Warm paper turning warm ink after dark, oxblood accent turning rust. Three families doing three jobs: serif headings, sans body, mono eyebrows and folio numbers. Zero radius and no shadow anywhere, so rules carry the structure and the surface border sits three steps darker than the border to pay for it. The grid variant is ledger paper with an accent margin rule down the left; default and spotlight close on a heavy folio rule. The deck header is a folio line and the footer centers mono page numbers, with no progress bar.",
    swatches: readThemeSwatches("registry/themes/ledger/theme.css"),
    title: "Ledger",
    when: "The deck is a written argument with numbers in it and you want the slides to read as pages.",
  },
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/registry/themes/meridian/theme.css",
    modes: "Light and dark",
    name: "theme-meridian",
    summary:
      "The quietest theme here. Near-white blue-gray turning cool near-black, one mid blue accent used once per slide, one system sans for everything. Flat cards with a hairline border and 0.625rem corners, no shadow in either mode. Headings carry -0.03em of tracking, which is the whole identity. Backgrounds run at half the alpha of every other theme: one head wash, a drafting grid that fades out behind the copy, one wide radial. The deck header and footer are nearly silent: no rules, no capitals, and a 1px progress hairline.",
    swatches: readThemeSwatches("registry/themes/meridian/theme.css"),
    title: "Meridian",
    when: "A product or planning review where the content should be the loudest thing on the slide.",
  },
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/registry/themes/nexus/theme.css",
    modes: "Light and dark, dark by default",
    name: "theme-nexus",
    summary:
      "A flight console. Blue-black sheet, amber accent, every heading uppercase with an amber halo behind the first two levels. Panels take a 0.125rem blueprint corner. The grid variant is the draw: a 1.75rem cell grid with every fifth line heavier, faded out behind the copy. Spotlight is an approach light off the top edge over a tube vignette. Light mode is complete and reads as the printed version of the same document. The deck header and footer are console strips in wide capitals over a tick readout of the progress.",
    swatches: readThemeSwatches("registry/themes/nexus/theme.css"),
    title: "Nexus",
    when: "An engineering or systems talk that wants instrument-panel authority.",
  },
  {
    href: "https://github.com/thebuilder/next-slideshow-template/blob/main/registry/themes/phosphor/theme.css",
    modes: "Light and dark, dark by default",
    name: "theme-phosphor",
    summary:
      "A green CRT. One monospace family sets every word on the slide, headings included, uppercase with a phosphor bloom. Scanlines are the first background layer of every variant rather than an overlay, so only background none escapes them. The grid variant draws a character cell; spotlight is the tube, bloom at the centre and falloff into the corners. Every corner is square. Light mode turns the tube off for handouts. The deck header is a command line and the footer a reverse-video status bar with the progress in character cells.",
    swatches: readThemeSwatches("registry/themes/phosphor/theme.css"),
    title: "Phosphor",
    when: "A developer talk or a build report that should look like it is running rather than presented.",
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
  {
    exports: "StatGrid",
    name: "block-metrics",
    summary:
      "Exactly three columns, typed as a tuple, marked up as a description list: a figure at --slide-title-size in the theme heading font over a caption at --slide-support-size, ruled off at the top in --slide-surface-border. The figure carries data-stat-value, which is how nexus and ledger reach it with their heading treatment.",
    when: "The one slide in the deck that is numbers. Write the comparison into the caption, because a figure with nothing to measure against is decoration.",
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
        {swatchTokens
          .filter((token) => swatches[token])
          .map((token) => (
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
        The deck theme and the slide blocks are not part of{" "}
        <code>@deckard/core</code>. They install into your presentation app
        through <code>shadcn add</code> and land as source files you own. There
        is no runtime behind them and nothing to import from a package, so once
        a theme is in <code>deck/theme/</code> it is yours to edit and the
        registry never touches it again.
      </p>
      <p>
        That is the arrangement working, not a gap. A block sized for one
        theme&apos;s font often needs retuning at another: the demo deck widened{" "}
        <code>HeroSlide</code> from <code>max-w-[14ch]</code> to{" "}
        <code>20ch</code> because a serif headline broke into four ragged lines.
        Editing the file is the supported fix.
      </p>

      <h2 className="pt-4 text-2xl">Point your app at the registry</h2>
      <p>
        The registry is built from <code>registry.json</code> in the Deckard
        repository and served as static JSON at{" "}
        <code>/r/&#123;name&#125;.json</code> by this docs site. There is no
        public host for it yet, so serve it from a local checkout: run{" "}
        <code>pnpm registry:build</code> there, then{" "}
        <code>pnpm --filter docs dev</code> to put it on port 3001.
      </p>
      <p>Then add the namespace to your app&apos;s components.json:</p>
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
        One add for a new deck: the Deckard theme and all five block families.
        It also writes the one stylesheet line you cannot guess, the{" "}
        <code>@import</code> of <code>@deckard/core/styles.css</code>. That
        sheet carries the slide token contract and registers the package&apos;s
        own Tailwind source, so the runtime classes survive tree shaking without
        a <code>@source</code> line in your app. Start here in a new app and
        swap the theme later if you want a different look.
      </p>
      <p>
        That import is the whole build wiring. <code>@deckard/core</code> ships
        compiled, so <code>next.config.ts</code> stays empty and nothing has to
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
        Blocks install to <code>app/slides/blocks/</code> in your app and import
        from <code>@deckard/core</code>. They style themselves entirely from the
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
