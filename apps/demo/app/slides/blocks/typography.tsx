export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
      data-slide-eyebrow=""
    >
      {children}
    </p>
  )
}

/*
 * The measures are canvas pixels, not a ch count. The canvas is 1920 wide and
 * never changes, so the line a title breaks on is a fixed decision, and a ch
 * measure would move it every time a theme swapped the heading face.
 */
export function SlideHeading({
  title,
  description,
}: {
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="space-y-5">
      {title ? (
        <h1
          className="max-w-[1500px] text-balance font-semibold text-[length:var(--slide-heading-size)] leading-[1.06] tracking-tight"
          data-slide-title=""
        >
          {title}
        </h1>
      ) : null}
      {description ? (
        <p
          className="max-w-[1100px] text-pretty text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.35]"
          data-slide-lead=""
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
