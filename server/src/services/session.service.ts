import { createHash, randomBytes } from "node:crypto"

import { SESSION_TTL_MS } from "../config/auth.js"
import { getDb } from "./database.js"
import { safeUserSelect, type SafeUser } from "./user.service.js"

/** Only a hash of the token is stored; the raw token lives in the cookie alone. */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

// Avoid a database write on every request just to bump lastUsedAt.
const LAST_USED_RESOLUTION_MS = 15 * 60 * 1000

export async function createSession(userId: string, userAgent: string | undefined) {
  const token = randomBytes(32).toString("base64url") // 256 bits of entropy
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  const db = getDb()

  await db.$transaction([
    // Opportunistic cleanup of this user's expired sessions.
    db.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } }),
    db.session.create({
      data: { userId, tokenHash: hashToken(token), expiresAt, userAgent: userAgent?.slice(0, 512) },
    }),
  ])

  return { token, expiresAt }
}

export interface ActiveSession {
  id: string
  expiresAt: Date
  user: SafeUser
}

/** Resolves a cookie token to its session and user; null if unknown or expired. */
export async function findActiveSession(token: string): Promise<ActiveSession | null> {
  const db = getDb()
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, expiresAt: true, lastUsedAt: true, user: { select: safeUserSelect } },
  })
  if (!session) return null

  const now = Date.now()
  if (session.expiresAt.getTime() <= now) {
    await db.session.deleteMany({ where: { id: session.id } })
    return null
  }
  if (now - session.lastUsedAt.getTime() > LAST_USED_RESOLUTION_MS) {
    await db.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date(now) } })
  }
  return { id: session.id, expiresAt: session.expiresAt, user: session.user }
}

export async function deleteSessionByToken(token: string) {
  await getDb().session.deleteMany({ where: { tokenHash: hashToken(token) } })
}
