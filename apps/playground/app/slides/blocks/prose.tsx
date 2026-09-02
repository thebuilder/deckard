import type { ImageProps } from "next/image"
import Image from "next/image"
import { Eyebrow } from "@/app/slides/blocks/typography"

/*
 * A pull quote at heading size with the attribution on a rule under it. No
 * quotation marks in the markup: the themes that want them hang them off
 * data-slide-quote-text, the way phosphor hangs a [x] off a list marker, and
 * the themes that do not stay clean.
 */
export function QuoteSlide({
  attribution,
  portrait,
  quote,
  source,
}: {
  attribution: string
  portrait?: { alt?: string; src: ImageProps["src"] }
  quote: React.ReactNode
  source?: React.ReactNode
}) {
  return (
    <figure
      className="flex h-full flex-col justify-center gap-12"
      data-slide-quote=""
    >
      <blockquote
        className="max-w-[1560px] text-balance font-medium text-[length:var(--slide-heading-size)] leading-[1.18]"
        data-slide-quote-text=""
      >
        {quote}
      </blockquote>

      <figcaption
        className="flex items-center gap-7 border-[var(--slide-surface-border)] border-t-2 pt-8"
        data-slide-quote-attribution=""
      >
        {portrait ? (
          <Image
            alt={portrait.alt ?? ""}
            className="size-[5.5rem] shrink-0 rounded-[var(--slide-radius)] object-cover"
            data-slide-quote-portrait=""
            height={88}
            src={portrait.src}
            width={88}
          />
        ) : null}
        <div>
          <p
            className="font-semibold text-[length:var(--slide-support-size)] text-foreground"
            data-slide-quote-name=""
          >
            {attribution}
          </p>
          {source ? (
            <p
              className="mt-1 font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-label-size)] text-muted-foreground"
              data-slide-quote-source=""
            >
              {source}
            </p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  )
}

/*
 * Running copy with a label rail beside it. The rail is a fixed column at
 * --slide-rail-size and the paragraphs take the rest, which is the one place in
 * the catalogue a measure is capped, because a paragraph running the full 1920
 * is unreadable in a way a headline is not.
 */
export function ProseSlide({
  eyebrow,
  label,
  paragraphs,
  support,
  title,
}: {
  eyebrow?: React.ReactNode
  label: string
  paragraphs: readonly string[]
  support?: readonly string[]
  title: React.ReactNode
}) {
  return (
    <section
      className="grid h-full grid-cols-[var(--slide-rail-size)_minmax(0,1fr)] content-center gap-[var(--slide-content-gap)] py-[var(--slide-item-gap)]"
      data-slide-prose=""
    >
      <div
        className="min-w-0 border-[var(--slide-surface-border)] border-t-2 pt-8"
        data-slide-rail=""
      >
        <p
          className="font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
          data-slide-rail-term=""
        >
          {label}
        </p>
        {support?.map((line) => (
          <p
            className="mt-4 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.4]"
            data-slide-rail-detail=""
            key={line}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="min-w-0" data-slide-prose-body="">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1
          className="mt-4 max-w-[1200px] text-balance font-semibold text-[length:var(--slide-heading-size)] leading-[1.08] tracking-tight"
          data-slide-title=""
        >
          {title}
        </h1>
        <div className="mt-9 space-y-6">
          {paragraphs.map((paragraph) => (
            <p
              className="max-w-[1100px] text-pretty text-[length:var(--slide-body-size)] text-muted-foreground leading-[1.45]"
              data-slide-prose-paragraph=""
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
