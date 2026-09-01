export interface Stat {
  caption: React.ReactNode
  unit?: string
  value: string
}

export function StatGrid({ items }: { items: Stat[] }) {
  return (
    <div className="grid grid-cols-3 gap-10">
      {items.map((item) => (
        <div
          className="border-[var(--slide-surface-border)] border-t-2 pt-7"
          key={item.value}
        >
          <p className="font-semibold text-[length:var(--slide-title-size)] leading-[0.86] tracking-tight">
            {item.value}
            {item.unit ? (
              <span className="text-[length:var(--slide-subheading-size)] text-muted-foreground">
                {item.unit}
              </span>
            ) : null}
          </p>
          <p className="mt-5 max-w-[24ch] text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]">
            {item.caption}
          </p>
        </div>
      ))}
    </div>
  )
}
