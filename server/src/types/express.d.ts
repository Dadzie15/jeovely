import type { ActiveSession } from "../services/session.service.js"

declare global {
  namespace Express {
    interface Locals {
      /** Set by requireAuth for authenticated requests. */
      session?: ActiveSession
    }
  }
}

export {}
