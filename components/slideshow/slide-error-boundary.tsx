"use client"

import { Component, type ReactNode } from "react"

interface SlideErrorBoundaryProps {
  children: ReactNode
  slideId: string
}

interface SlideErrorBoundaryState {
  message: string | null
  slideId: string
}

function toMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function SlideErrorCard({
  message,
  slideId,
}: {
  message: string
  slideId: string
}) {
  return (
    <div className="flex h-full w-full items-center justify-center py-12">
      <div
        className="w-full max-w-3xl space-y-4 rounded-[calc(var(--radius)*2)] border border-destructive/40 bg-destructive/5 p-6 shadow-sm backdrop-blur-sm"
        role="alert"
      >
        <p className="font-semibold text-destructive text-sm uppercase tracking-[0.3em]">
          Slide error
        </p>
        <h2 className="text-balance font-semibold text-3xl tracking-tight">
          Slide {slideId} threw while rendering
        </h2>
        <p className="text-muted-foreground text-sm leading-7">
          The rest of the deck still works. Keep presenting with the arrow keys
          or the command center, and fix this slide afterwards.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border/70 bg-card/80 p-4 font-mono text-destructive text-sm">
          {message}
        </pre>
      </div>
    </div>
  )
}

export class SlideErrorBoundary extends Component<
  SlideErrorBoundaryProps,
  SlideErrorBoundaryState
> {
  state: SlideErrorBoundaryState = {
    message: null,
    slideId: this.props.slideId,
  }

  static getDerivedStateFromError(error: unknown) {
    return { message: toMessage(error) }
  }

  static getDerivedStateFromProps(
    props: SlideErrorBoundaryProps,
    state: SlideErrorBoundaryState
  ) {
    if (props.slideId === state.slideId) {
      return null
    }

    return { message: null, slideId: props.slideId }
  }

  componentDidCatch(error: unknown) {
    this.setState({ message: toMessage(error) })
  }

  render() {
    const { message } = this.state

    if (message === null) {
      return this.props.children
    }

    return <SlideErrorCard message={message} slideId={this.props.slideId} />
  }
}
