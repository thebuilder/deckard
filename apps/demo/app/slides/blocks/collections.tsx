export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <div data-slide-list="" data-slide-surface="">
      {items.map((item, index) => (
        <div
          className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-8 border-[var(--slide-surface-border)] border-b py-7 last:border-b-0"
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
