export interface Stat {
  caption: React.ReactNode
  /* A rough proportion of the column, 0 to 1. It is a meter, not a chart. */
  meter?: number
  unit?: string
  value: string
}

/*
 * Two to four figures. The range is the type rather than a note, because a
 * fifth column stops being a figure and starts being a table, and one column
 * is a sentence with a number in it.
 */
export type StatGridItems =
  | readonly [Stat, Stat]
  | readonly [Stat, Stat, Stat]
  | readonly [Stat, Stat, Stat, Stat]

function meterWidth(meter: number) {
  return `${Math.round(Math.min(Math.max(meter, 0), 1) * 100)}%`
}

export function StatGrid({ items }: { items: StatGridItems }) {
  return (
    <dl
      className="grid gap-14"
      data-slide-surface=""
      data-stat-grid=""
      style={{
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <div
          // col-reverse keeps dt before dd in the DOM; justify-end then anchors
          // the stack at the top, so figures line up across a row where only
          // some of the columns carry a meter.
          className="flex flex-col-reverse justify-end border-[var(--slide-surface-border)] border-t-2 pt-9"
          data-stat-item=""
          // biome-ignore lint/suspicious/noArrayIndexKey: figures repeat, so the value is not an identity, and the list never reorders
          key={index}
        >
          <dt
            className="mt-5 max-w-[26ch] text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.4]"
            data-stat-caption=""
          >
            {item.caption}
          </dt>
          <dd
            className="font-[family-name:var(--slide-font-heading)] font-semibold text-[length:var(--slide-figure-size)] leading-[0.86] tracking-tight"
            data-stat-value=""
          >
            {item.value}
            {item.unit ? (
              <span
                className="text-[length:var(--slide-figure-unit-size)] text-muted-foreground"
                data-stat-unit=""
              >
                {item.unit}
              </span>
            ) : null}
            {typeof item.meter === "number" ? (
              <div
                className="mt-6 h-[var(--slide-meter-size)] border border-[var(--slide-surface-border)]"
                data-stat-meter=""
              >
                <span
                  className="block h-full bg-primary"
                  style={{ width: meterWidth(item.meter) }}
                />
              </div>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}
