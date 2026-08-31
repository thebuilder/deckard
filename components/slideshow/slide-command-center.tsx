"use client"

import { CommandIcon, List } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import type { SlideSummary } from "@/lib/deck/types"

interface SlideCommandCenterProps {
  currentNumber: number
  deckTitle: string
  slides: SlideSummary[]
}

function SlideCommandOption({
  slide,
  isCurrent,
  onSelect,
}: {
  slide: SlideSummary
  isCurrent: boolean
  onSelect: (href: string) => void
}) {
  const handleSelect = useCallback(() => {
    onSelect(slide.href)
  }, [onSelect, slide.href])

  return (
    <CommandItem
      onSelect={handleSelect}
      value={`${slide.number} ${slide.title} ${slide.id}`}
    >
      <span className="inline-flex min-w-10 text-muted-foreground tabular-nums">
        {String(slide.number).padStart(2, "0")}
      </span>
      <span className="truncate">{slide.title}</span>
      <span className="hidden truncate text-muted-foreground text-xs md:inline">
        {slide.id}
      </span>
      {isCurrent ? <CommandShortcut>Current</CommandShortcut> : null}
    </CommandItem>
  )
}

export function SlideCommandCenter({
  currentNumber,
  deckTitle,
  slides,
}: SlideCommandCenterProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCommandShortcut =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)

      if (!isCommandShortcut) {
        return
      }

      event.preventDefault()
      setIsOpen((open) => !open)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const openDialog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const goToSlide = useCallback(
    (href: string) => {
      setIsOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <>
      <span className="pointer-events-none hidden items-center gap-1 text-[11px] text-muted-foreground tracking-wide sm:inline-flex">
        <CommandIcon className="size-3" />K
      </span>

      <Button
        aria-label="Open slide command center"
        className="border-border/70 bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-accent/70 hover:text-foreground"
        onClick={openDialog}
        size="icon-sm"
        title="Open slide command center"
        type="button"
        variant="outline"
      >
        <List />
      </Button>

      <CommandDialog
        className="sm:max-w-lg"
        description="Jump to any slide by number or title."
        onOpenChange={setIsOpen}
        open={isOpen}
        title={deckTitle}
      >
        <Command>
          <CommandInput placeholder="Go to slide by number, title, or id..." />
          <CommandList>
            <CommandEmpty>No slides found.</CommandEmpty>
            <CommandGroup heading="Slides">
              {slides.map((slide) => (
                <SlideCommandOption
                  isCurrent={slide.number === currentNumber}
                  key={slide.href}
                  onSelect={goToSlide}
                  slide={slide}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
