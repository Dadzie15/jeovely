import cors from "cors"
import express from "express"
import helmet from "helmet"

import { env } from "./config/env.js"
import { errorHandler } from "./middleware/error-handler.js"
import { notFoundHandler } from "./middleware/not-found.js"
import { requestLogger } from "./middleware/request-logger.js"
import { apiRouter } from "./routes/index.js"
import { HttpError } from "./utils/http-error.js"

export function createApp() {
  const app = express()

  // First, so requests rejected by CORS or the body parser are logged too.
  app.use(requestLogger)
  app.use(helmet())
  app.use(
    cors({
      // Browsers may only call the API from configured frontend origins.
      // Requests without an Origin header (curl, server-to-server) are allowed.
      origin(origin, callback) {
        if (!origin || env.FRONTEND_URL.includes(origin)) return callback(null, true)
        callback(new HttpError(403, "CORS_ORIGIN_DENIED", "Origin not allowed"))
      },
      credentials: true,
    })
  )
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }))

  app.use("/api", apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
