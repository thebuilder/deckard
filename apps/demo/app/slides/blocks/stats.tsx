export interface Stat {
  label: string
  note: string
  value: string
}

export function StatGrid({ items }: { items: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
      {items.map((item) => (
        <div
          className="border-[var(--slide-surface-border)] border-t pt-5"
          key={item.label}
        >
          <p className="font-[family-name:var(--slide-font-heading)] text-8xl tabular-nums leading-[0.9] tracking-tight">
            {item.value}
          </p>
          <p className="mt-4 font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]">
            {item.label}
          </p>
          <p className="mt-2 max-w-[40ch] text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.55]">
            {item.note}
          </p>
        </div>
      ))}
    </div>
  )
}
