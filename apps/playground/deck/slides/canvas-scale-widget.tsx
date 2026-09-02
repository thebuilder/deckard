"use client"

import { Button } from "@deckard/core/ui"
import { useCallback, useState } from "react"

export interface Screen {
  height: number
  id: string
  label: string
  width: number
}

const diagramWidth = 460
const diagramHeight = 260

// An authored size to carry through the multiplier. Not a token, an example.
const sampleTypeSize = 48

function ScreenButton({
  isSelected,
  onSelect,
  screen,
}: {
  isSelected: boolean
  onSelect: (id: string) => void
  screen: Screen
}) {
  const handleClick = useCallback(() => {
    onSelect(screen.id)
  }, [onSelect, screen.id])

  return (
    <Button
      aria-pressed={isSelected}
      onClick={handleClick}
      size="sm"
      type="button"
      variant={isSelected ? "default" : "outline"}
    >
      {screen.label}
    </Button>
  )
}

function Readout({
  note,
  term,
  value,
}: {
  note: string
  term: string
  value: string
}) {
  return (
    <div className="border-[var(--slide-surface-border)] border-t pt-3">
      <dt className="font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]">
        {term}
      </dt>
      <dd className="mt-2 font-[family-name:var(--slide-font-mono)] text-[length:var(--slide-body-size)] tabular-nums">
        {value}
      </dd>
      <dd className="mt-1 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.4]">
        {note}
      </dd>
    </div>
  )
}

function describeLetterbox(barX: number, barY: number) {
  if (barX < 1 && barY < 1) {
    return { note: "The window is exactly the canvas ratio", value: "none" }
  }

  return barX > barY
    ? { note: "Bars down each side", value: `${Math.round(barX)}px` }
    : { note: "Bars above and below", value: `${Math.round(barY)}px` }
}

export function CanvasScaleCalculator({
  canvasHeight,
  canvasWidth,
  screens,
}: {
  canvasHeight: number
  canvasWidth: number
  screens: Screen[]
}) {
  const [selectedId, setSelectedId] = useState(screens[0].id)
  const screen = screens.find((item) => item.id === selectedId) ?? screens[0]

  // The whole of contain fit: one min() over the two ratios.
  const scale = Math.min(
    screen.width / canvasWidth,
    screen.height / canvasHeight
  )
  const paintedWidth = canvasWidth * scale
  const paintedHeight = canvasHeight * scale
  const letterbox = describeLetterbox(
    (screen.width - paintedWidth) / 2,
    (screen.height - paintedHeight) / 2
  )

  const fit = Math.min(
    diagramWidth / screen.width,
    diagramHeight / screen.height
  )

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {screens.map((item) => (
          <ScreenButton
            isSelected={item.id === screen.id}
            key={item.id}
            onSelect={setSelectedId}
            screen={item}
          />
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-10">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Readout
            note={`${screen.width} by ${screen.height} device pixels`}
            term="Scale"
            value={`${(scale * 100).toFixed(1)}%`}
          />
          <Readout
            note="What the room actually sees"
            term="Painted"
            value={`${Math.round(paintedWidth)} x ${Math.round(paintedHeight)}`}
          />
          <Readout
            note={`An authored ${sampleTypeSize}px heading, at this scale`}
            term="Type"
            value={`${(sampleTypeSize * scale).toFixed(1)}px`}
          />
          <Readout
            note={letterbox.note}
            term="Letterbox"
            value={letterbox.value}
          />
        </dl>

        <figure className="m-0">
          <div
            className="flex items-center justify-center"
            style={{ height: diagramHeight, width: diagramWidth }}
          >
            <div
              className="flex items-center justify-center border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)]"
              style={{ height: screen.height * fit, width: screen.width * fit }}
            >
              <div
                className="border border-primary bg-primary/25"
                style={{
                  height: paintedHeight * fit,
                  width: paintedWidth * fit,
                }}
              />
            </div>
          </div>
          <figcaption className="mt-2 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.4]">
            The outer rectangle is the window. The tinted one is this canvas.
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
