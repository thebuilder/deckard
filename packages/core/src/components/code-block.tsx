import { codeToHtml } from "shiki"

import { SlideScrollArea } from "./slide-scroll-area"

interface CodeBlockProps {
  code: string
  language?: string
  maxHeight?: number
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

const highlightedClassName =
  "text-[length:var(--slide-code-size)] leading-[1.5] [&_.line]:inline-block [&_.line]:min-h-[1.5em] [&_code]:grid [&_code]:gap-[0.15em] [&_code]:font-[family-name:var(--slide-font-mono)] [&_pre]:overflow-x-auto [&_pre]:px-[1.1em] [&_pre]:py-[0.9em]"

export async function CodeBlock({
  code,
  language = "typescript",
  maxHeight,
}: CodeBlockProps) {
  let html = `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`

  try {
    html = await codeToHtml(code, {
      defaultColor: "light-dark()",
      lang: language,
      rootStyle: false,
      themes: {
        dark: "github-dark",
        light: "github-light",
      },
    })
  } catch (error) {
    console.error("Shiki highlighting error:", error)
  }

  const highlighted = (
    <div
      className={highlightedClassName}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki renders highlighted markup from deck-authored source on the server
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )

  return (
    <div
      className="overflow-hidden rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface)] shadow-[var(--slide-surface-shadow)] backdrop-blur-sm"
      data-slide-surface=""
    >
      {maxHeight ? (
        <SlideScrollArea label="Code sample" maxHeight={maxHeight}>
          {highlighted}
        </SlideScrollArea>
      ) : (
        highlighted
      )}
    </div>
  )
}
