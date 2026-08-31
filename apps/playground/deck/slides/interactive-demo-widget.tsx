"use client"

import type {
  SlideBackgroundMode,
  SlideFooterMode,
  SlideHeaderMode,
  SlideLayoutMode,
} from "@deckard/core"

import { Button } from "@deckard/core/ui"
import { useCallback, useState } from "react"

export interface ChromePreset {
  background: SlideBackgroundMode
  footer: SlideFooterMode
  header: SlideHeaderMode
  id: string
  label: string
  layout: SlideLayoutMode
  summary: string
}

function PresetButton({
  isSelected,
  onSelect,
  preset,
}: {
  isSelected: boolean
  onSelect: (id: string) => void
  preset: ChromePreset
}) {
  const handleClick = useCallback(() => {
    onSelect(preset.id)
  }, [onSelect, preset.id])

  return (
    <Button
      aria-pressed={isSelected}
      onClick={handleClick}
      size="sm"
      type="button"
      variant={isSelected ? "default" : "outline"}
    >
      {preset.label}
    </Button>
  )
}

function MetadataRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-[var(--slide-surface-border)] border-b py-2 last:border-b-0">
      <dt className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-support-size)] text-muted-foreground">
        {name}
      </dt>
      <dd className="font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-support-size)]">{`"${value}"`}</dd>
    </div>
  )
}

export function ChromePresetPlayground({
  presets,
}: {
  presets: ChromePreset[]
}) {
  const [selectedId, setSelectedId] = useState(presets[0].id)
  const selected = presets.find((preset) => preset.id === selectedId)

  if (!selected) {
    return null
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <PresetButton
            isSelected={preset.id === selected.id}
            key={preset.id}
            onSelect={setSelectedId}
            preset={preset}
          />
        ))}
      </div>

      <div className="rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-5">
        <p className="text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.7]">
          {selected.summary}
        </p>
        <dl className="mt-4">
          <MetadataRow name="layout" value={selected.layout} />
          <MetadataRow name="header" value={selected.header} />
          <MetadataRow name="footer" value={selected.footer} />
          <MetadataRow name="background" value={selected.background} />
        </dl>
      </div>
    </div>
  )
}
