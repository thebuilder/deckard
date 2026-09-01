export interface Stat {
  caption: React.ReactNode
  unit?: string
  value: string
}

// Three columns, exactly. A fourth figure does not fit the canvas at the title
// size, and two leave a hole, so the capacity is the type rather than a note.
export type StatGridItems = readonly [Stat, Stat, Stat]

export function StatGrid({ items }: { items: StatGridItems }) {
  return (
    <dl className="grid grid-cols-3 gap-10" data-slide-surface="">
      {items.map((item, index) => (
        <div
          className="flex flex-col-reverse border-[var(--slide-surface-border)] border-t-2 pt-7"
          // biome-ignore lint/suspicious/noArrayIndexKey: the tuple is fixed and its content is static, and figures repeat
          key={index}
        >
          <dt className="mt-5 max-w-[24ch] text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]">
            {item.caption}
          </dt>
          <dd
            className="font-[family-name:var(--slide-font-heading)] font-semibold text-[length:var(--slide-title-size)] leading-[0.86] tracking-tight"
            data-stat-value=""
          >
            {item.value}
            {item.unit ? (
              <span className="text-[length:var(--slide-subheading-size)] text-muted-foreground">
                {item.unit}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}
