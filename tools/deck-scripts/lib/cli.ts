import process from "node:process"

export type ColorMode = "dark" | "light"

export function write(line: string): void {
  process.stdout.write(`${line}\n`)
}

export function readColorMode(argv: string[]): ColorMode {
  return argv.includes("--light") ? "light" : "dark"
}

export function readStringFlag(
  argv: string[],
  flag: string
): string | undefined {
  const prefix = `--${flag}=`
  const match = argv.find((entry) => entry.startsWith(prefix))
  const value = match?.slice(prefix.length)

  return value && value.length > 0 ? value : undefined
}

export function readNumberFlag(
  argv: string[],
  flag: string,
  fallback: number
): number {
  const prefix = `--${flag}=`
  const match = argv.find((value) => value.startsWith(prefix))
  const parsed = Number(match?.slice(prefix.length))

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function fail(error: unknown): never {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  )
  process.exit(1)
}
