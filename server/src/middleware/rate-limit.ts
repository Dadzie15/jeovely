import { rateLimit } from "express-rate-limit"

import { HttpError } from "../utils/http-error.js"

interface LimitConfig {
  windowMs: number
  limit: number
  /** Count only failed requests (status >= 400), e.g. for sign-in. */
  skipSuccessfulRequests?: boolean
}

/**
 * Per-IP limiter that answers with the standard error envelope (429).
 * The store is in-memory: limits are per API process, so multiple instances
 * would need a shared store (e.g. Redis) — see README.
 */
export function createRateLimiter({ windowMs, limit, skipSuccessfulRequests = false }: LimitConfig) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new HttpError(429, "RATE_LIMITED", "Too many attempts. Please try again later."))
    },
  })
}
