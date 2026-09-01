import process from "node:process"

// The harness lives outside the deck it checks, so the app is wherever the
// script was invoked from. pnpm runs a package script with the package as cwd.
export const projectRoot = process.cwd()
