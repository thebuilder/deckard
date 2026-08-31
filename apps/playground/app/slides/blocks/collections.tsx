export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <div>
      {items.map((item, index) => (
        <div
          className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-6 border-[var(--slide-surface-border)] border-b py-6 last:border-b-0"
          // biome-ignore lint/suspicious/noArrayIndexKey: authored bullet nodes have no stable identity and the list never reorders
          key={index}
        >
          <div className="block">
            <span className="font-semibold text-[length:var(--slide-support-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="max-w-4xl text-[length:var(--slide-body-size)] text-foreground leading-[1.45]">
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
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          className="rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-5"
          key={item.title}
        >
          <h3 className="text-balance font-semibold text-xl tracking-tight">
            {item.title}
          </h3>
          <p className="mt-3 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.7]">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}
