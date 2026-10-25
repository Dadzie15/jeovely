import type { RequestHandler, Response } from "express"

import { SESSION_COOKIE_NAME } from "../config/auth.js"
import { findActiveSession, type ActiveSession } from "../services/session.service.js"
import { readCookie } from "../utils/cookies.js"
import { unauthorized } from "../utils/http-error.js"

/** Rejects the request with 401 unless it carries a valid, unexpired session cookie. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE_NAME)
  const session = token ? await findActiveSession(token) : null
  if (!session) return next(unauthorized())
  res.locals.session = session
  next()
}

/** The session attached by requireAuth. Only call from handlers mounted after it. */
export function getSession(res: Response): ActiveSession {
  const session = res.locals.session
  if (!session) throw unauthorized()
  return session
}
