export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <div data-slide-list="" data-slide-surface="">
      {items.map((item, index) => (
        <div
          className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-8 border-[var(--slide-surface-border)] border-b py-6 last:border-b-0"
          data-slide-list-item=""
          // biome-ignore lint/suspicious/noArrayIndexKey: authored bullet nodes have no stable identity and the list never reorders
          key={index}
        >
          <div className="block">
            <span
              className="font-semibold text-[length:var(--slide-support-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
              data-slide-list-marker=""
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          {/* ch, not px: the measure has to follow the type when a focus slide
              swaps the body size up. */}
          <p
            className="max-w-[62ch] text-pretty text-[length:var(--slide-body-size)] text-foreground leading-[1.4]"
            data-slide-list-text=""
          >
            {item}
          </p>
        </div>
      ))}
    </div>
  )
}

export interface ContentsEntry {
  folio?: string
  index?: string
  title: string
}

/*
 * The table of contents: a numeral, a section name, and the folio it starts on,
 * ruled between rows. The numeral is authored rather than generated so a deck
 * can set roman numerals where its theme wants them, and falls back to 01, 02
 * so the common case passes titles alone.
 */
export function ContentsList({ items }: { items: readonly ContentsEntry[] }) {
  return (
    <ol
      className="grid content-start border-[var(--slide-surface-border)] border-t-2"
      data-slide-contents=""
      data-slide-surface=""
    >
      {items.map((item, index) => (
        <li
          className="grid grid-cols-[6.875rem_minmax(0,1fr)_7.5rem] items-baseline gap-8 border-[var(--slide-surface-border)] border-b py-5 last:border-b-0"
          data-slide-contents-item=""
          key={item.title}
        >
          <span
            className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-support-size)] text-primary"
            data-slide-contents-index=""
          >
            {item.index ?? String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-pretty text-[length:var(--slide-body-size)] text-foreground leading-[1.25]"
            data-slide-contents-title=""
          >
            {item.title}
          </span>
          <span
            className="text-right font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-support-size)] text-muted-foreground tabular-nums"
            data-slide-contents-folio=""
          >
            {item.folio}
          </span>
        </li>
      ))}
    </ol>
  )
}

export interface ColumnEntry {
  label?: string
  text: string
  title: string
}

/*
 * Parallel points as ruled columns rather than cards, which is what every
 * template but meridian does with a two-up or three-up. Reach for FeatureGrid
 * when the deck wants the points to read as objects and this when it wants them
 * to read as a continuation of the sentence above them.
 */
export function ColumnGrid({ items }: { items: readonly ColumnEntry[] }) {
  return (
    <div
      className="grid h-full content-center items-start gap-[var(--slide-content-gap)]"
      data-slide-columns=""
      data-slide-surface=""
      style={{
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <div
          className="flex flex-col gap-4 border-[var(--slide-surface-border)] border-t-2 pt-8"
          data-slide-column=""
          key={item.title}
        >
          <span
            className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-support-size)] text-primary"
            data-slide-column-index=""
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {item.label ? (
            <span
              className="font-semibold text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]"
              data-slide-column-label=""
            >
              {item.label}
            </span>
          ) : null}
          <h3
            className="text-balance font-semibold text-[length:var(--slide-subheading-size)] leading-[1.15] tracking-tight"
            data-slide-column-title=""
          >
            {item.title}
          </h3>
          <p
            className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]"
            data-slide-column-text=""
          >
            {item.text}
          </p>
        </div>
      ))}
    </div>
  )
}

export function FeatureGrid({
  items,
}: {
  items: Array<{ title: string; description: string }>
}) {
  return (
    <div
      className="grid h-full grid-cols-3 gap-[var(--slide-item-gap)]"
      data-slide-grid=""
    >
      {items.map((item) => (
        <div
          className="flex flex-col gap-4 rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-9"
          data-slide-card=""
          data-slide-surface=""
          key={item.title}
        >
          <h3
            className="text-balance font-semibold text-[length:var(--slide-subheading-size)] leading-[1.15] tracking-tight"
            data-slide-card-title=""
          >
            {item.title}
          </h3>
          <p
            className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]"
            data-slide-card-body=""
          >
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}

export interface GridCard {
  /* The one card in the set the deck is arguing for. It takes
   * --slide-accent-soft, which is the only tint in the contract, so marking two
   * marks neither. */
  accent?: boolean
  description: string
  label?: string
  title: string
}

/*
 * Cards on a fixed number of columns, wrapping onto as many rows as the items
 * need. FeatureGrid is three cards across in one row; this is the grid a deck
 * reaches for at four or six, and the one place a card may carry a tint.
 */
export function CardGrid({
  columns = 2,
  items,
}: {
  columns?: 2 | 3
  items: readonly GridCard[]
}) {
  return (
    <div
      className="grid h-full auto-rows-fr gap-[var(--slide-item-gap)]"
      data-slide-grid=""
      data-slide-surface=""
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <div
          className={
            item.accent
              ? "flex flex-col gap-4 rounded-[var(--slide-radius)] border border-primary bg-[var(--slide-accent-soft)] p-9"
              : "flex flex-col gap-4 rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-9"
          }
          data-slide-card=""
          data-slide-card-accent={item.accent ? "" : undefined}
          key={item.title}
        >
          {item.label ? (
            <span
              className="font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
              data-slide-card-label=""
            >
              {item.label}
            </span>
          ) : null}
          <h3
            className="text-balance font-semibold text-[length:var(--slide-subheading-size)] leading-[1.15] tracking-tight"
            data-slide-card-title=""
          >
            {item.title}
          </h3>
          <p
            className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]"
            data-slide-card-body=""
          >
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}
