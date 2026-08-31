import path from "node:path"
import { fileURLToPath } from "node:url"

const libDirectory = path.dirname(fileURLToPath(import.meta.url))

export const projectRoot = path.resolve(libDirectory, "../..")
export const workspaceRoot = path.resolve(projectRoot, "../..")
