export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]">
      {children}
    </p>
  )
}

export function SlideHeading({
  title,
  description,
}: {
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      {title ? (
        <h1 className="max-w-5xl text-balance font-semibold text-[length:var(--slide-heading-size)] leading-[1.02] tracking-tight">
          {title}
        </h1>
      ) : null}
      {description ? (
        <p className="max-w-3xl text-[length:var(--slide-lead-size)] text-muted-foreground leading-[1.55]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
