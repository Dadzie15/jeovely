import type { RequestHandler, Response } from "express"

import { SESSION_COOKIE_NAME, SESSION_TTL_MS, sessionCookieOptions } from "../config/auth.js"
import { getSession } from "../middleware/require-auth.js"
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js"
import { createSession, deleteSessionByToken } from "../services/session.service.js"
import { authenticateUser, registerUser } from "../services/user.service.js"
import { sendSuccess } from "../utils/api-response.js"
import { readCookie } from "../utils/cookies.js"

async function startSession(res: Response, userId: string, userAgent: string | undefined) {
  const { token } = await createSession(userId, userAgent)
  res.cookie(SESSION_COOKIE_NAME, token, { ...sessionCookieOptions, maxAge: SESSION_TTL_MS })
}

/** POST /api/auth/register — creates the account and signs the user in. */
export const register: RequestHandler = async (req, res) => {
  const user = await registerUser(req.body as RegisterInput)
  await startSession(res, user.id, req.get("user-agent"))
  sendSuccess(res, { user }, 201)
}

/** POST /api/auth/login */
export const login: RequestHandler = async (req, res) => {
  const user = await authenticateUser(req.body as LoginInput)
  // A fresh token on every sign-in prevents session fixation.
  const previous = readCookie(req.headers.cookie, SESSION_COOKIE_NAME)
  if (previous) await deleteSessionByToken(previous)
  await startSession(res, user.id, req.get("user-agent"))
  sendSuccess(res, { user })
}

/** GET /api/auth/me (behind requireAuth) */
export const me: RequestHandler = (_req, res) => {
  sendSuccess(res, { user: getSession(res).user })
}

/** POST /api/auth/logout — idempotent: always clears the cookie. */
export const logout: RequestHandler = async (req, res) => {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE_NAME)
  if (token) await deleteSessionByToken(token)
  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions)
  sendSuccess(res, { signedOut: true })
}
