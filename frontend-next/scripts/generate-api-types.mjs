#!/usr/bin/env node
/**
 * Generate TypeScript types from the running Paperless OpenAPI schema.
 * Do not edit files written to types/generated/.
 */
import { spawnSync } from "node:child_process"
import { mkdirSync } from "node:fs"

const origin = (process.env.PAPERLESS_URL ?? "http://localhost:8000").replace(/\/$/, "")
const schemaUrl = `${origin}/api/schema/`
const outDir = new URL("../types/generated/", import.meta.url)
mkdirSync(outDir, { recursive: true })
const outFile = new URL("./schema.d.ts", outDir)

const result = spawnSync(
  "pnpm",
  ["dlx", "openapi-typescript", schemaUrl, "-o", outFile.pathname],
  { stdio: "inherit" },
)

if (result.status !== 0) {
  console.error("Failed to generate API types. Is the Paperless backend running?")
  process.exit(result.status ?? 1)
}
