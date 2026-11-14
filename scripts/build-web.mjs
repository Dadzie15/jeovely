/**
 * Production build of the frontend (`npm run build`).
 *
 * Why this exists instead of a bare `vite build`: the root .env is shared with
 * the API and usually contains NODE_ENV=development. When NODE_ENV is not
 * already set in the process, Vite reads it from .env and, for the value
 * "development", switches the whole build to development (React's dev build,
 * dev export conditions, unminified checks). Setting NODE_ENV here, before
 * Vite resolves its config, keeps .env's value scoped to the API.
 *
 * Cross-platform without extra dependencies (no cross-env): npm scripts can't
 * set environment variables portably, but a Node script can. An explicit
 * NODE_ENV from the shell is still respected, e.g. for a debug build.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

process.env.NODE_ENV ??= "production"

// Import after NODE_ENV is set, so nothing reads it earlier.
const { build } = await import("vite")

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
if (process.env.NODE_ENV !== "production") {
  console.warn(`[build-web] NODE_ENV=${process.env.NODE_ENV}: building a non-production bundle.`)
}
await build({ root, mode: "production" })
