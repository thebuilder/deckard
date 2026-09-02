// The one measurement behind both the amber ring `next dev` draws and the
// `deckard check-overflow` gate, so a slide can never pass one and fail the
// other. The CLI evaluates this exact function inside the page, which is why
// every helper it needs is declared inside it: a reference to anything at module
// scope does not survive the trip into the browser.

/** Which of the three ways a slide loses content a finding describes. */
export type SlideLayoutCheck = "band" | "canvas" | "clipping"

/** The chrome row a part runs into. */
export type SlideLayoutBand = "footer" | "header"

export interface SlideLayoutFinding {
  /** The row a "band" finding crosses. */
  band?: SlideLayoutBand
  check: SlideLayoutCheck
  /** The part's own `data-slide-*` or `data-stat-*` attribute, or its tag. */
  part: string
  /** Canvas pixels lost across the slide. */
  x: number
  /** Canvas pixels lost down the slide. */
  y: number
}

export interface SlideLayoutReport {
  findings: SlideLayoutFinding[]
  /** False when the route rendered no `[data-slide-frame]`, which is a broken shell rather than a full slide. */
  framed: boolean
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: splitting this out would put the helpers at module scope, and Playwright evaluates this function by its source, so a free variable would be undefined in the page and the CI gate would stop measuring what the browser measures
export function measureSlideLayout(
  canvasRoot?: HTMLElement | null
): SlideLayoutReport {
  // A pixel of rounding is not a layout bug.
  const tolerance = 1

  const canvas =
    canvasRoot ?? document.querySelector<HTMLElement>("[data-slide-canvas]")

  if (!canvas) {
    return { findings: [], framed: false }
  }

  // The stage is scaled to fit the window, so a rectangle read here is in screen
  // pixels. Everything reported below is in canvas pixels, which is the only
  // unit an author can do anything about.
  const scale =
    canvas.offsetWidth > 0
      ? canvas.getBoundingClientRect().width / canvas.offsetWidth
      : 1
  const inCanvasPixels = (value: number) => (scale > 0 ? value / scale : value)

  // The frame and the two chrome rows are the stage, not a part of a slide, so
  // naming one of them locates nothing.
  const structural = new Set([
    "data-slide-canvas",
    "data-slide-footer",
    "data-slide-frame",
    "data-slide-header",
  ])

  const marker = (element: Element) =>
    element
      .getAttributeNames()
      .find(
        (name) =>
          (name.startsWith("data-slide-") || name.startsWith("data-stat-")) &&
          !structural.has(name)
      )

  // A theme restyles a part by its attribute, so the attribute is also the name
  // the author knows the part by. Markup a block never named falls back to its
  // tag, placed inside the nearest part that does have a name.
  const partName = (element: Element) => {
    const own = marker(element)

    if (own) {
      return `[${own}]`
    }

    const tag = `<${element.tagName.toLowerCase()}>`

    for (
      let ancestor = element.parentElement;
      ancestor && ancestor !== canvas;
      ancestor = ancestor.parentElement
    ) {
      const named = marker(ancestor)

      if (named) {
        return `${tag} in [${named}]`
      }
    }

    return tag
  }

  // A list that runs past the footer drags every row with it, and naming the
  // rows as well as the list is noise. Only the outermost part is reported.
  const outermost = <T extends { element: Element }>(entries: T[]) =>
    entries.filter(
      (entry) =>
        !entries.some(
          (other) => other !== entry && other.element.contains(entry.element)
        )
    )

  // Three cards in a row overflow by the same amount and are one mistake, so the
  // same sentence about the same slide is only worth saying once.
  const distinct = (entries: SlideLayoutFinding[]) => {
    const seen = new Set<string>()

    return entries.filter((finding) => {
      const id = `${finding.check}:${finding.band ?? ""}:${finding.part}:${Math.round(finding.x)}:${Math.round(finding.y)}`

      if (seen.has(id)) {
        return false
      }

      seen.add(id)

      return true
    })
  }

  const regions = [
    { label: "slide content", selector: "[data-slide-frame]" },
    { label: "the header", selector: "[data-slide-header]" },
    { label: "the footer", selector: "[data-slide-footer]" },
  ]

  const findings: SlideLayoutFinding[] = []

  // The canvas edge. The frame and the two chrome rows are what it clips.
  for (const region of regions) {
    const element = canvas.querySelector<HTMLElement>(region.selector)

    if (!element) {
      continue
    }

    const x = element.scrollWidth - element.clientWidth
    const y = element.scrollHeight - element.clientHeight

    if (x > tolerance || y > tolerance) {
      findings.push({
        check: "canvas",
        part: region.label,
        x: Math.max(x, 0),
        y: Math.max(y, 0),
      })
    }
  }

  const frame = canvas.querySelector<HTMLElement>("[data-slide-frame]")

  if (!frame) {
    return { findings: distinct(findings), framed: false }
  }

  const header = canvas.querySelector<HTMLElement>("[data-slide-header]")
  const footer = canvas.querySelector<HTMLElement>("[data-slide-footer]")

  // A fullscreen slide is handed the whole canvas and the chrome moves out of
  // its way, so content under the band is the point of the layout.
  const isBanded = canvas.dataset.slideLayout !== "fullscreen"
  const headerBottom = header?.getBoundingClientRect().bottom
  const footerTop = footer?.getBoundingClientRect().top

  const intoHeader: { amount: number; element: Element }[] = []
  const intoFooter: { amount: number; element: Element }[] = []

  if (isBanded) {
    for (const element of frame.querySelectorAll("*")) {
      // What a scroll area scrolls is meant to leave the box. The box itself
      // still has to fit, so only its contents are exempt.
      if (element.parentElement?.closest("[data-slide-scroll-area]")) {
        continue
      }

      const style = getComputedStyle(element)

      // A part taken out of flow is placed on purpose, and an overlay or a
      // full-bleed backdrop is allowed to sit under the chrome.
      if (
        style.position === "absolute" ||
        style.position === "fixed" ||
        style.visibility === "hidden"
      ) {
        continue
      }

      const rect = element.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) {
        continue
      }

      if (headerBottom !== undefined) {
        const amount = inCanvasPixels(headerBottom - rect.top)

        if (amount > tolerance) {
          intoHeader.push({ amount, element })
        }
      }

      if (footerTop !== undefined) {
        const amount = inCanvasPixels(rect.bottom - footerTop)

        if (amount > tolerance) {
          intoFooter.push({ amount, element })
        }
      }
    }
  }

  for (const band of ["header", "footer"] as const) {
    for (const entry of outermost(
      band === "header" ? intoHeader : intoFooter
    )) {
      findings.push({
        band,
        check: "band",
        part: partName(entry.element),
        x: 0,
        y: entry.amount,
      })
    }
  }

  // A box that hides its own overflow reports no size of its own, so nothing
  // above catches it. The content is gone all the same.
  const clipped: { element: Element; x: number; y: number }[] = []

  // Inside the frame only. The chrome truncates the brand, the title, and the
  // meta on purpose, which is a clipped box saying exactly what it means to say,
  // and the frame itself is measured against the canvas edge above.
  for (const element of frame.querySelectorAll<HTMLElement>("*")) {
    // A scroll area exceeding its box is what a scroll area is for.
    if (element.closest("[data-slide-scroll-area]")) {
      continue
    }

    const style = getComputedStyle(element)
    const x =
      style.overflowX === "visible"
        ? 0
        : element.scrollWidth - element.clientWidth
    const y =
      style.overflowY === "visible"
        ? 0
        : element.scrollHeight - element.clientHeight

    if (x > tolerance || y > tolerance) {
      clipped.push({ element, x: Math.max(x, 0), y: Math.max(y, 0) })
    }
  }

  for (const entry of outermost(clipped)) {
    findings.push({
      check: "clipping",
      part: partName(entry.element),
      x: entry.x,
      y: entry.y,
    })
  }

  return { findings: distinct(findings), framed: true }
}

/**
 * One phrase for one finding, shared so the warning in the browser and the line
 * in CI say the same thing about the same slide.
 */
export function describeSlideLayoutFinding(
  finding: SlideLayoutFinding
): string {
  if (finding.check === "band") {
    const band = finding.band === "header" ? "the header" : "the footer"

    return `${finding.part} runs ${Math.round(finding.y)}px into ${band}`
  }

  if (finding.check === "clipping") {
    const axes = [
      finding.y > 0 ? `${Math.round(finding.y)}px vertically` : "",
      finding.x > 0 ? `${Math.round(finding.x)}px horizontally` : "",
    ].filter(Boolean)

    return `${finding.part} clips its own content: ${axes.join(", ")}`
  }

  const edges = [
    finding.y > 0 ? `${Math.round(finding.y)}px below the canvas` : "",
    finding.x > 0 ? `${Math.round(finding.x)}px past its right edge` : "",
  ].filter(Boolean)

  return `${finding.part} runs ${edges.join(", ")}`
}
