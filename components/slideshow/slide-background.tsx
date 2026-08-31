import type { SlideBackgroundMode } from "@/types/slides"

export function SlideBackground({
  variant = "default",
}: {
  variant?: SlideBackgroundMode
}) {
  if (variant === "none") {
    return null
  }

  if (variant === "grid") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_62%)]" />
      </div>
    )
  }

  if (variant === "spotlight") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[calc(var(--canvas-height)*0.78)] w-[calc(var(--canvas-width)*0.92)] -translate-x-1/2 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.24),transparent_66%)] dark:bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.14),transparent_66%)]" />
        <div className="absolute right-0 bottom-0 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-[-8rem] top-[-8rem] h-full bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.2),transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.3),transparent_68%)]" />
      <div className="absolute inset-x-0 top-0 h-[calc(var(--canvas-height)*0.72)] bg-gradient-to-b from-[rgba(22,26,54,0.12)] via-[rgba(22,26,54,0.06)] to-transparent dark:from-[rgba(33,39,88,0.16)] dark:via-[rgba(33,39,88,0.08)] dark:to-transparent" />
      <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
    </div>
  )
}
