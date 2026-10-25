import { env } from "./config/env.js"
import { createApp } from "./app.js"
import { disconnectDb } from "./services/database.js"

const server = createApp().listen(env.PORT, () => {
  console.log(`[api] Jeovely API listening on port ${env.PORT} (${env.NODE_ENV})`)
  if (!env.DATABASE_URL) {
    console.warn("[api] DATABASE_URL is not set; database features are unavailable.")
  }
})

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[api] Port ${env.PORT} is already in use. Stop the other process or set PORT in .env.`)
  } else {
    console.error("[api] Server failed to start:", err)
  }
  process.exit(1)
})

function shutdown(signal: string) {
  console.log(`[api] ${signal} received, shutting down`)
  server.close(async () => {
    await disconnectDb()
    process.exit(0)
  })
  // Force-exit if open connections keep the server alive.
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
