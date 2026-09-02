export interface TableColumn {
  label: string
  /* Right aligned, mono, and tabular. One flag rather than three, because a
   * column of numbers wants all three or none of them. */
  numeric?: boolean
}

export interface TableRow {
  cells: readonly React.ReactNode[]
  highlight?: boolean
}

/* first:ps-0 last:pe-0 so the first word of the table sits on the frame margin
 * every other block starts at, rather than a cell padding inside it. */
const cellBase = "px-6 py-5 first:ps-0 last:pe-0"

function cellClassName(column: TableColumn | undefined) {
  return column?.numeric
    ? `${cellBase} text-right font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-support-size)] tabular-nums`
    : `${cellBase} text-left text-[length:var(--slide-support-size)]`
}

/*
 * A ruled table sized for a room rather than a spreadsheet. Rows are a plain
 * array so a slide can await them, and nothing here caps the count: what fits
 * depends on the theme's type scale, and the overflow check is the thing that
 * knows. Four or five rows is what the source templates show.
 */
export function DataTable({
  columns,
  rows,
}: {
  columns: readonly TableColumn[]
  rows: readonly TableRow[]
}) {
  return (
    <table
      className="w-full border-collapse"
      data-slide-surface=""
      data-slide-table=""
    >
      <thead data-slide-table-head="">
        <tr className="border-[var(--slide-surface-border)] border-b-2">
          {columns.map((column) => (
            <th
              className={`${cellClassName(column)} font-semibold text-[length:var(--slide-label-size)] text-muted-foreground uppercase tracking-[var(--slide-label-tracking)]`}
              data-slide-table-heading=""
              key={column.label}
              scope="col"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            className={
              row.highlight
                ? "border-[var(--slide-surface-border)] border-b bg-[var(--slide-accent-soft)] last:border-b-0"
                : "border-[var(--slide-surface-border)] border-b last:border-b-0"
            }
            data-slide-table-highlight={row.highlight ? "" : undefined}
            data-slide-table-row=""
            // biome-ignore lint/suspicious/noArrayIndexKey: a row is authored cells with no identity of its own, and the table never reorders
            key={rowIndex}
          >
            {row.cells.map((cell, cellIndex) => (
              <td
                className={cellClassName(columns[cellIndex])}
                data-slide-table-cell=""
                // biome-ignore lint/suspicious/noArrayIndexKey: the cell's identity is its column, which is its position
                key={cellIndex}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export interface TimelineEntry {
  date: string
  detail?: string
  done?: boolean
  label: string
}

/*
 * Milestones as columns on one rule, each with its date over a short label and
 * a line of detail. The marker carries data-slide-timeline-done rather than a
 * colour of its own, so a theme decides what shipped looks like next to what
 * has not.
 */
export function Timeline({ items }: { items: readonly TimelineEntry[] }) {
  return (
    <div
      className="grid h-full content-center gap-[var(--slide-content-gap)]"
      data-slide-surface=""
      data-slide-timeline=""
      style={{
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item) => (
        <div
          className="flex flex-col gap-5"
          data-slide-timeline-item=""
          key={item.label}
        >
          <span
            className={
              item.done
                ? "block h-[6px] bg-primary"
                : "block h-[6px] bg-[var(--slide-surface-border)]"
            }
            data-slide-timeline-done={item.done ? "" : undefined}
            data-slide-timeline-marker=""
          />
          <span
            className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]"
            data-slide-timeline-date=""
          >
            {item.date}
          </span>
          <h3
            className="text-balance font-semibold text-[length:var(--slide-subheading-size)] leading-[1.15] tracking-tight"
            data-slide-timeline-label=""
          >
            {item.label}
          </h3>
          {item.detail ? (
            <p
              className="text-pretty text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.45]"
              data-slide-timeline-detail=""
            >
              {item.detail}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export type LogTone = "alert" | "note" | "ok"

export interface LogEntry {
  message: string
  status?: string
  time: string
  tone?: LogTone
}

const logToneClassName: Record<LogTone, string> = {
  alert: "text-destructive",
  note: "text-muted-foreground",
  ok: "text-primary",
}

/*
 * Timestamped rows with a status on the right: a build log, a rollout, an
 * incident read back in order. The words are content, so they are props here
 * rather than ::before text in a terminal theme.
 */
export function LogList({ items }: { items: readonly LogEntry[] }) {
  return (
    <ol
      className="grid content-start border-[var(--slide-surface-border)] border-t-2 font-[family-name:var(--slide-font-mono)]"
      data-slide-log=""
      data-slide-surface=""
    >
      {items.map((item) => (
        <li
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-8 border-[var(--slide-surface-border)] border-b py-5 last:border-b-0"
          data-slide-log-row=""
          data-slide-log-tone={item.tone ?? "note"}
          key={item.message}
        >
          <span
            className="text-[length:var(--slide-support-size)] text-muted-foreground tabular-nums"
            data-slide-log-time=""
          >
            {item.time}
          </span>
          <span
            className="text-pretty text-[length:var(--slide-support-size)] text-foreground"
            data-slide-log-message=""
          >
            {item.message}
          </span>
          {item.status ? (
            <span
              className={`text-[length:var(--slide-label-size)] uppercase tracking-[var(--slide-label-tracking)] ${logToneClassName[item.tone ?? "note"]}`}
              data-slide-log-status=""
            >
              {item.status}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
