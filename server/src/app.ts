import cors from "cors"
import express from "express"
import helmet from "helmet"

import { env } from "./config/env.js"
import { errorHandler } from "./middleware/error-handler.js"
import { notFoundHandler } from "./middleware/not-found.js"
import { requestLogger } from "./middleware/request-logger.js"
import { createApiRouter } from "./routes/index.js"
import { HttpError } from "./utils/http-error.js"

export function createApp() {
  const app = express()

  // Behind a reverse proxy, trust its X-Forwarded-For so rate limits see client IPs.
  if (env.TRUST_PROXY > 0) app.set("trust proxy", env.TRUST_PROXY)

  // First, so requests rejected by CORS or the body parser are logged too.
  app.use(requestLogger)
  app.use(helmet())
  app.use(
    cors({
      // Browsers may only call the API from configured frontend origins.
      // This also acts as the CSRF origin check: browsers always send Origin on
      // cross-origin requests, so a request from any other site is rejected
      // (403) before it reaches a handler — even when it would carry cookies.
      // Requests without an Origin header (curl, server-to-server) are allowed.
      origin(origin, callback) {
        if (!origin || env.FRONTEND_URL.includes(origin)) return callback(null, true)
        callback(new HttpError(403, "CORS_ORIGIN_DENIED", "Origin not allowed"))
      },
      credentials: true,
    })
  )
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }))

  app.use("/api", createApiRouter())

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
