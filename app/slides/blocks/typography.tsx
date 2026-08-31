export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-primary text-sm uppercase tracking-[0.3em]">
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
      <h1 className="max-w-5xl text-balance font-semibold text-[3.5rem] leading-[1.02] tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-lg text-muted-foreground leading-7">
          {description}
        </p>
      ) : null}
    </div>
  )
}
