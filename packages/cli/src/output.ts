import process from "node:process"

export type ColorMode = "dark" | "light"

export function write(line: string): void {
  process.stdout.write(`${line}\n`)
}

export function fail(error: unknown): never {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  )
  process.exit(1)
}
