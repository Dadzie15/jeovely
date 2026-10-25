import { Router } from "express"

import { RATE_LIMITS } from "../config/auth.js"
import { login, logout, me, register } from "../controllers/auth.controller.js"
import { createRateLimiter } from "../middleware/rate-limit.js"
import { requireAuth } from "../middleware/require-auth.js"
import { validate } from "../middleware/validate.js"
import { loginSchema, registerSchema } from "../schemas/auth.schema.js"

/** A factory so each app instance (and each test) gets its own rate-limit counters. */
export function createAuthRouter() {
  const router = Router()

  router.post("/register", createRateLimiter(RATE_LIMITS.register), validate({ body: registerSchema }), register)
  router.post(
    "/login",
    createRateLimiter({ ...RATE_LIMITS.login, skipSuccessfulRequests: true }),
    validate({ body: loginSchema }),
    login
  )
  router.get("/me", requireAuth, me)
  router.post("/logout", logout)

  return router
}
