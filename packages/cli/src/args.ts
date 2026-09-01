export interface FlagSpec {
  booleans?: string[]
  strings?: string[]
}

export interface ParsedArgs {
  flags: Record<string, boolean | string>
  positionals: string[]
}

const flagPattern = /^--([\w-]+)(=(.*))?$/s

function knownNames(spec: FlagSpec): string[] {
  return [...(spec.booleans ?? []), ...(spec.strings ?? [])].sort()
}

function rejectUnknown(name: string, spec: FlagSpec): never {
  throw new Error(
    `Unknown flag --${name}. This command takes: ${
      knownNames(spec)
        .map((entry) => `--${entry}`)
        .join(", ") || "no flags"
    }.`
  )
}

// --flag value becomes --flag=value, so the pass below reads one shape.
function joinValueFlags(argv: string[], strings: Set<string>): string[] {
  const joined: string[] = []

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index]
    const [, name, , inline] = flagPattern.exec(entry) ?? []

    if (!(name && inline === undefined && strings.has(name))) {
      joined.push(entry)
      continue
    }

    const value = argv[index + 1]

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${name} needs a value.`)
    }

    joined.push(`--${name}=${value}`)
    index += 1
  }

  return joined
}

// One parser for every subcommand: --flag, --flag=value, --flag value, --no-flag.
export function parseArgs(argv: string[], spec: FlagSpec): ParsedArgs {
  const booleans = new Set(spec.booleans ?? [])
  const strings = new Set(spec.strings ?? [])
  const flags: Record<string, boolean | string> = {}
  const positionals: string[] = []

  for (const entry of joinValueFlags(argv, strings)) {
    const [, name, , inline] = flagPattern.exec(entry) ?? []

    if (!name) {
      positionals.push(entry)
      continue
    }

    if (strings.has(name)) {
      flags[name] = inline ?? ""
      continue
    }

    const negated = name.startsWith("no-") ? name.slice(3) : ""

    if (booleans.has(negated)) {
      flags[negated] = false
      continue
    }

    if (!booleans.has(name)) {
      rejectUnknown(name, spec)
    }

    flags[name] = inline === undefined ? true : inline !== "false"
  }

  return { flags, positionals }
}

export function stringFlag(args: ParsedArgs, name: string): string | undefined {
  const value = args.flags[name]

  return typeof value === "string" && value.length > 0 ? value : undefined
}

export function booleanFlag(
  args: ParsedArgs,
  name: string,
  fallback = false
): boolean {
  const value = args.flags[name]

  return typeof value === "boolean" ? value : fallback
}

export function numberFlag(
  args: ParsedArgs,
  name: string,
  fallback: number
): number {
  const raw = stringFlag(args, name)

  if (raw === undefined) {
    return fallback
  }

  const parsed = Number(raw)

  if (!(Number.isInteger(parsed) && parsed > 0)) {
    throw new Error(`--${name} takes a positive whole number, not "${raw}".`)
  }

  return parsed
}

export function choiceFlag<T extends string>(
  args: ParsedArgs,
  name: string,
  choices: readonly T[],
  fallback: T
): T {
  const raw = stringFlag(args, name)

  if (raw === undefined) {
    return fallback
  }

  if (!(choices as readonly string[]).includes(raw)) {
    throw new Error(
      `--${name} takes one of ${choices.join(", ")}, not "${raw}".`
    )
  }

  return raw as T
}
