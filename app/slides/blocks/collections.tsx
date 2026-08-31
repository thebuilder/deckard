export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <div>
      {items.map((item, index) => (
        <div
          className="grid gap-4 border-border/70 border-b py-5 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6 sm:py-6"
          // biome-ignore lint/suspicious/noArrayIndexKey: authored bullet nodes have no stable identity and the list never reorders
          key={index}
        >
          <div className="flex items-center gap-3 sm:block">
            <span className="font-semibold text-[0.72rem] text-muted-foreground uppercase tracking-[0.3em]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="max-w-4xl text-[1.35rem] text-foreground leading-[1.55] sm:text-[1.6rem] sm:leading-[1.45]">
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          className="rounded-2xl border border-border/70 bg-card/70 p-5"
          key={item.title}
        >
          <h3 className="text-balance font-semibold text-xl tracking-tight">
            {item.title}
          </h3>
          <p className="mt-3 text-muted-foreground text-sm leading-7">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}
