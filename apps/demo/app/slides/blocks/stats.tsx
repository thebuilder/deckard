export interface Stat {
  label: string
  note: string
  value: string
}

/*
 * Not the registry StatGrid. This deck reads its numbers off disk while it
 * renders, so each figure carries a label as well as a caption, and four of
 * them go two across rather than three in a row.
 */
export function StatGrid({ items }: { items: Stat[] }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-20 gap-y-12"
      data-slide-surface=""
      data-stat-grid=""
    >
      {items.map((item) => (
        <div
          className="border-[var(--slide-surface-border)] border-t-2 pt-8"
          data-stat-item=""
          key={item.label}
        >
          <p
            className="font-[family-name:var(--slide-font-heading)] font-semibold text-[length:var(--slide-figure-size)] tabular-nums leading-[0.86] tracking-tight"
            data-stat-value=""
          >
            {item.value}
          </p>
          <p
            className="mt-6 font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
            data-stat-label=""
          >
            {item.label}
          </p>
          <p
            className="mt-3 max-w-[42ch] text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]"
            data-stat-caption=""
          >
            {item.note}
          </p>
        </div>
      ))}
    </div>
  )
}
