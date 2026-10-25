import type { RequestHandler } from "express"

/** Minimal access log: method, path, status and duration. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = performance.now()
  res.on("finish", () => {
    const ms = (performance.now() - start).toFixed(1)
    console.log(`[api] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`)
  })
  next()
}
