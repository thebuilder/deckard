import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { generateCommand, renderAllCardColors } from "./generate-cards.ts"

describe("card-colors.ts", () => {
  for (const [file, expected] of renderAllCardColors()) {
    const theme = path.basename(path.dirname(file))

    it(`matches ${theme}/theme.css`, () => {
      const committed = fs.existsSync(file)
        ? fs.readFileSync(file, "utf8")
        : null

      expect(
        committed,
        `${theme}/card-colors.ts is out of date with ${theme}/theme.css. Run \`${generateCommand}\`.`
      ).toBe(expected)
    })
  }
})
