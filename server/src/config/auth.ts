import type { CookieOptions } from "express"

import { env, isProduction } from "./env.js"

export const SESSION_TTL_MS = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000

/**
 * In production the `__Host-` prefix makes the browser enforce Secure, Path=/
 * and no Domain, so the cookie can't be set or overridden by a subdomain.
 * Browsers reject `__Host-` cookies without Secure, so plain HTTP dev uses a
 * normal name.
 */
export const SESSION_COOKIE_NAME = isProduction ? "__Host-jeovely_session" : "jeovely_session"

/**
 * HttpOnly: invisible to JavaScript (XSS can't read it).
 * SameSite=Lax: not sent on cross-site POST/fetch, the first CSRF defence;
 * the Origin allow-list in app.ts (CORS) is the second.
 * Secure: HTTPS-only in production.
 */
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
}

/** Argon2id cost (OWASP minimum: 19 MiB memory, 2 iterations, 1 lane). */
export const PASSWORD_HASH_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
}

export const RATE_LIMITS = {
  /** New accounts per IP. */
  register: { windowMs: 60 * 60 * 1000, limit: 10 },
  /** Failed sign-ins per IP (successful ones don't count). */
  login: { windowMs: 15 * 60 * 1000, limit: 10 },
}
