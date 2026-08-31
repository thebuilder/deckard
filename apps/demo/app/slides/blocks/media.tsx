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
          placeholder={resolvedPlaceholder}
          priority={media.priority}
          sizes={media.sizes}
          src={media.src}
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
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 px-12 pt-12 pb-[calc(3rem+var(--slide-chrome-bottom,0px))] ${overlayClassName}`}
        >
          <div className="pointer-events-auto">{children}</div>
        </div>
      ) : null}
    </section>
  )
}

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
  } = image
  const resolvedBlurDataURL = blurDataURL ?? resolveSourceBlurDataURL(src)
  const resolvedPlaceholder =
    placeholder === "blur" && !resolvedBlurDataURL ? undefined : placeholder

  return (
    <section className="grid h-full grid-cols-[1.2fr_0.8fr] gap-6 px-6 pt-[calc(1.5rem+var(--slide-chrome-top,0px))] pb-[calc(1.5rem+var(--slide-chrome-bottom,0px))]">
      <div className="relative overflow-hidden rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)]">
        <Image
          alt={alt ?? ""}
          blurDataURL={resolvedBlurDataURL}
          className={fit === "contain" ? "object-contain" : "object-cover"}
          fill
          placeholder={resolvedPlaceholder}
          priority={priority}
          sizes={sizes}
          src={src}
        />
      </div>

      <div className="flex flex-col justify-end gap-4 rounded-[var(--slide-radius-lg)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface)] p-6 shadow-[var(--slide-surface-shadow)] backdrop-blur-sm">
        {children}
        {caption ? (
          <p className="text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.7]">
            {caption}
          </p>
        ) : null}
        {credit ? (
          <p className="text-[length:var(--slide-support-size)] text-muted-foreground uppercase tracking-[0.2em]">
            {credit}
          </p>
        ) : null}
      </div>
    </section>
  )
}
