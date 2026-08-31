import { codeToHtml } from "shiki"

interface CodeBlockProps {
  code: string
  language?: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export async function CodeBlock({
  code,
  language = "typescript",
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

  return (
    <div
      className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm [&_.line]:inline-block [&_.line]:min-h-[1.5rem] [&_code]:grid [&_code]:gap-0.5 [&_code]:font-mono [&_code]:text-sm [&_pre]:overflow-x-auto [&_pre]:px-5 [&_pre]:py-4 [&_pre]:text-sm [&_pre]:leading-6"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki renders highlighted markup from deck-authored source on the server
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
