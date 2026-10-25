import type { ErrorRequestHandler } from "express"

import { isProduction } from "../config/env.js"
import { sendError } from "../utils/api-response.js"
import { HttpError } from "../utils/http-error.js"

/** Errors raised by express.json() (body-parser) carry a `type` and `status`. */
function isBodyParserError(err: unknown): err is { type: string; status: number } {
  return typeof err === "object" && err !== null && "type" in err && "status" in err
}

/**
 * Single place that turns errors into API responses. Unexpected errors are
 * logged server-side and returned as a generic 500; stack traces are only
 * included outside production.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err)

  if (err instanceof HttpError) {
    return sendError(res, err.status, { code: err.code, message: err.message, details: err.details })
  }

  if (isBodyParserError(err)) {
    if (err.type === "entity.parse.failed") {
      return sendError(res, 400, { code: "INVALID_JSON", message: "Request body is not valid JSON" })
    }
    if (err.type === "entity.too.large") {
      return sendError(res, 413, { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large" })
    }
    if (err.status >= 400 && err.status < 500) {
      return sendError(res, err.status, { code: "BAD_REQUEST", message: "Malformed request" })
    }
  }

  console.error("[api] Unhandled error:", err)
  return sendError(res, 500, {
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
    ...(isProduction ? {} : { details: err instanceof Error ? { message: err.message, stack: err.stack } : err }),
  })
}
