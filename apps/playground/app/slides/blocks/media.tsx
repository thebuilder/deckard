import { SlideMediaVideo } from "@deckard/core/components"
import type { ImageProps } from "next/image"
import Image from "next/image"

export interface ImageShowcaseConfig {
  alt?: string
  blurDataURL?: string
  caption?: React.ReactNode
  credit?: React.ReactNode
  fit?: "cover" | "contain"
  placeholder?: ImageProps["placeholder"]
  priority?: boolean
  sizes?: string
  src: ImageProps["src"]
  unoptimized?: boolean
}

export interface MediaPanel {
  alt?: string
  blurDataURL?: string
  caption?: React.ReactNode
  credit?: React.ReactNode
  fit?: "cover" | "contain"
  placeholder?: ImageProps["placeholder"]
  priority?: boolean
  sizes?: string
  src: ImageProps["src"]
  unoptimized?: boolean
}

interface FullscreenImageMedia {
  alt?: string
  blurDataURL?: string
  fit?: "cover" | "contain"
  kind: "image"
  placeholder?: ImageProps["placeholder"]
  priority?: boolean
  sizes?: string
  src: ImageProps["src"]
  unoptimized?: boolean
}

interface FullscreenVideoMedia {
  autoplay?: boolean
  controls?: boolean
  fit?: "cover" | "contain"
  kind: "video"
  loop?: boolean
  muted?: boolean
  poster?: ImageProps["src"]
  src: string
}

export type FullscreenMediaConfig = FullscreenImageMedia | FullscreenVideoMedia
export type FullscreenMediaVariant = "framed" | "background"
export type FullscreenMediaOverlay = "none" | "subtle" | "medium" | "strong"

function resolveSourceBlurDataURL(src: ImageProps["src"]): string | undefined {
  if (typeof src === "string") {
    return undefined
  }

  if ("blurDataURL" in src && typeof src.blurDataURL === "string") {
    return src.blurDataURL
  }

  if (
    "default" in src &&
    src.default &&
    typeof src.default === "object" &&
    "blurDataURL" in src.default &&
    typeof src.default.blurDataURL === "string"
  ) {
    return src.default.blurDataURL
  }

  return undefined
}

function resolvePosterSrc(
  poster: FullscreenVideoMedia["poster"]
): string | undefined {
  if (!poster) {
    return undefined
  }

  if (typeof poster === "string") {
    return poster
  }

  if ("src" in poster) {
    return poster.src
  }

  return poster.default.src
}

function resolvePlaceholder(
  media: FullscreenMediaConfig,
  blurDataURL: string | undefined
): ImageProps["placeholder"] {
  if (media.kind !== "image") {
    return undefined
  }

  if (media.placeholder === "blur" && !blurDataURL) {
    return undefined
  }

  return media.placeholder
}

/*
 * A slide is one screen, so nothing on it is below the fold and lazy loading it
 * only means the room watches the picture arrive. next/image warns when
 * priority and loading are both set, so priority wins where a deck asked for it.
 */
function eagerLoading(priority: boolean | undefined) {
  return priority ? undefined : ("eager" as const)
}

const overlayClassNames: Record<FullscreenMediaOverlay, string> = {
  medium: "bg-[image:var(--slide-media-overlay-medium)]",
  none: "",
  strong: "bg-[image:var(--slide-media-overlay-strong)]",
  subtle: "bg-[image:var(--slide-media-overlay-subtle)]",
}

export function FullscreenMediaSlide({
  media,
  variant = "background",
  overlay = "medium",
  children,
}: {
  media: FullscreenMediaConfig
  variant?: FullscreenMediaVariant
  overlay?: FullscreenMediaOverlay
  children?: React.ReactNode
}) {
  const resolvedBlurDataURL =
    media.kind === "image"
      ? (media.blurDataURL ?? resolveSourceBlurDataURL(media.src))
      : undefined
  const resolvedPlaceholder = resolvePlaceholder(media, resolvedBlurDataURL)

  const containerClassName =
    variant === "background"
      ? "relative h-full w-full overflow-hidden"
      : "relative h-full w-full overflow-hidden rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)]"
  const overlayClassName = overlayClassNames[overlay]

  return (
    <section className={containerClassName}>
      {media.kind === "image" ? (
        <Image
          alt={media.alt ?? ""}
          blurDataURL={resolvedBlurDataURL}
          className={
            media.fit === "contain" ? "object-contain" : "object-cover"
          }
          fill
          loading={eagerLoading(media.priority)}
          placeholder={resolvedPlaceholder}
          priority={media.priority}
          sizes={media.sizes}
          src={media.src}
          unoptimized={media.unoptimized}
        />
      ) : (
        <SlideMediaVideo
          autoplay={media.autoplay}
          className={
            media.fit === "contain"
              ? "h-full w-full object-contain"
              : "h-full w-full object-cover"
          }
          controls={media.controls}
          loop={media.loop}
          muted={media.muted}
          playsInline
          poster={resolvePosterSrc(media.poster)}
          src={media.src}
        />
      )}

      {children ? (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 px-[var(--slide-padding-inline)] pt-[var(--slide-padding-block)] pb-[calc(var(--slide-padding-block)+var(--slide-chrome-bottom,0px))] ${overlayClassName}`}
          data-slide-media-overlay=""
        >
          <div className="pointer-events-auto">{children}</div>
        </div>
      ) : null}
    </section>
  )
}

function MediaFigure({ panel }: { panel: MediaPanel }) {
  const resolvedBlurDataURL =
    panel.blurDataURL ?? resolveSourceBlurDataURL(panel.src)
  const resolvedPlaceholder =
    panel.placeholder === "blur" && !resolvedBlurDataURL
      ? undefined
      : panel.placeholder

  return (
    <figure
      className="flex min-h-0 flex-col justify-center gap-5"
      data-slide-media-item=""
    >
      {/* The frame keeps its own shape and shrinks into the cell rather than
          filling it. A row of three filling a 1080 canvas would hand each
          picture a portrait box, which is not a shape a screenshot fits. */}
      <div
        className="relative aspect-[16/10] max-h-full w-full overflow-hidden rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)]"
        data-slide-media-frame=""
      >
        <Image
          alt={panel.alt ?? ""}
          blurDataURL={resolvedBlurDataURL}
          className={
            panel.fit === "contain" ? "object-contain" : "object-cover"
          }
          fill
          loading={eagerLoading(panel.priority)}
          placeholder={resolvedPlaceholder}
          priority={panel.priority}
          sizes={panel.sizes ?? "50vw"}
          src={panel.src}
          unoptimized={panel.unoptimized}
        />
      </div>
      {panel.caption ? (
        <figcaption
          className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.4]"
          data-slide-media-caption=""
        >
          {panel.caption}
        </figcaption>
      ) : null}
      {panel.credit ? (
        <p
          className="text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
          data-slide-media-credit=""
        >
          {panel.credit}
        </p>
      ) : null}
    </figure>
  )
}

/*
 * Two framed images side by side, each captioned under itself. The pair is a
 * tuple rather than an array because two is the layout: a third frame on this
 * row is a gallery, and MediaGallery puts it on a grid instead of squeezing the
 * row until none of the three reads.
 */
export function MediaPair({
  items,
}: {
  items: readonly [MediaPanel, MediaPanel]
}) {
  return (
    <section
      className="grid h-full grid-cols-2 gap-[var(--slide-content-gap)] pt-[calc(var(--slide-item-gap)+var(--slide-chrome-top,0px))] pb-[calc(var(--slide-item-gap)+var(--slide-chrome-bottom,0px))]"
      data-slide-media=""
      data-slide-surface=""
    >
      {items.map((panel, index) => (
        <MediaFigure
          // biome-ignore lint/suspicious/noArrayIndexKey: a next/image source is a module object with no identity of its own, and the row never reorders
          key={index}
          panel={panel}
        />
      ))}
    </section>
  )
}

/*
 * Captioned frames on a grid, two across by default. The count is the deck's
 * call: four frames is the 2x2 the source templates show, six still reads, and
 * the overflow check is what tells you when it has stopped reading.
 */
export function MediaGallery({
  columns = 2,
  items,
}: {
  columns?: 2 | 3
  items: readonly MediaPanel[]
}) {
  return (
    <section
      className="grid h-full auto-rows-fr gap-[var(--slide-content-gap)] pt-[calc(var(--slide-item-gap)+var(--slide-chrome-top,0px))] pb-[calc(var(--slide-item-gap)+var(--slide-chrome-bottom,0px))]"
      data-slide-media=""
      data-slide-surface=""
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((panel, index) => (
        <MediaFigure
          // biome-ignore lint/suspicious/noArrayIndexKey: a next/image source is a module object with no identity of its own, and the row never reorders
          key={index}
          panel={panel}
        />
      ))}
    </section>
  )
}

/*
 * Copy left, media right, caption under the media, centred inside the ordinary
 * frame padding. It is a padded grid rather than a fullscreen layout on
 * purpose: fullscreen strips the frame's gutters, which leaves the image flush
 * to the canvas edge and the copy hanging off the bottom of a taller frame.
 *
 * The copy carries no panel, so the media frame is the slide's one surface.
 */
export function ImageShowcaseSlide({
  image,
  children,
}: {
  image: ImageShowcaseConfig
  children?: React.ReactNode
}) {
  const {
    src,
    alt,
    fit = "cover",
    placeholder,
    blurDataURL,
    sizes,
    priority,
    caption,
    credit,
    unoptimized,
  } = image
  const resolvedBlurDataURL = blurDataURL ?? resolveSourceBlurDataURL(src)
  const resolvedPlaceholder =
    placeholder === "blur" && !resolvedBlurDataURL ? undefined : placeholder

  return (
    <section
      className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-24 py-[var(--slide-item-gap)]"
      data-slide-media=""
    >
      <div className="flex min-w-0 flex-col gap-6">{children}</div>

      <figure className="flex min-h-0 flex-col gap-6 self-stretch py-[var(--slide-content-gap)]">
        <div
          className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)]"
          data-slide-media-frame=""
        >
          <Image
            alt={alt ?? ""}
            blurDataURL={resolvedBlurDataURL}
            className={fit === "contain" ? "object-contain" : "object-cover"}
            fill
            loading={eagerLoading(priority)}
            placeholder={resolvedPlaceholder}
            priority={priority}
            /* The media column is a little over half the canvas, and without a
             * hint next/image asks the optimizer for the 3840 variant. */
            sizes={sizes ?? "55vw"}
            src={src}
            unoptimized={unoptimized}
          />
        </div>
        {caption ? (
          <figcaption
            className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.5]"
            data-slide-media-caption=""
          >
            {caption}
          </figcaption>
        ) : null}
        {credit ? (
          <p
            className="text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
            data-slide-media-credit=""
          >
            {credit}
          </p>
        ) : null}
      </figure>
    </section>
  )
}
