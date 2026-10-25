import assert from "node:assert/strict"
import { after, afterEach, beforeEach, describe, it } from "node:test"

import { SESSION_COOKIE_NAME } from "../config/auth.js"
import { disconnectDb, getDb } from "../services/database.js"
import { cookiePair, dataOf, errorOf, request, resetDatabase, startTestServer, type ApiBody } from "../test/helpers.js"

type UserBody = ApiBody<{ user: Record<string, unknown> }>

const VALID = { name: "Ada Lovelace", email: "Ada@Example.com ", password: "analytical-engine-1843" }

describe("auth API", () => {
  let api: Awaited<ReturnType<typeof startTestServer>>

  // A fresh server per test: clean database and fresh rate-limit counters.
  beforeEach(async () => {
    await resetDatabase()
    api = await startTestServer()
  })
  afterEach(() => api.close())
  after(() => disconnectDb())

  const register = (body: unknown = VALID) => request<UserBody>(`${api.baseUrl}/auth/register`, { method: "POST", body })
  const login = (body: unknown, cookie?: string) =>
    request<UserBody>(`${api.baseUrl}/auth/login`, { method: "POST", body, cookie })
  const me = (cookie?: string) => request<UserBody>(`${api.baseUrl}/auth/me`, { cookie })

  describe("POST /auth/register", () => {
    it("creates the account, returns a safe user and starts a session", async () => {
      const res = await register()

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      const user = dataOf(res).user
      assert.equal(user.email, "ada@example.com", "email is trimmed and lower-cased")
      assert.equal(user.name, "Ada Lovelace")
      assert.deepEqual(Object.keys(user).sort(), ["avatarUrl", "createdAt", "email", "id", "name"])

      assert.ok(res.setCookie?.startsWith(`${SESSION_COOKIE_NAME}=`))
      assert.match(res.setCookie ?? "", /HttpOnly/i)
      assert.match(res.setCookie ?? "", /SameSite=Lax/i)
      assert.match(res.setCookie ?? "", /Path=\//i)

      const stored = await getDb().user.findUniqueOrThrow({ where: { email: "ada@example.com" } })
      assert.ok(stored.passwordHash?.startsWith("$argon2id$"), "password stored as an Argon2id hash")
      assert.ok(!stored.passwordHash?.includes(VALID.password))
    })

    it("rejects a duplicate email, regardless of case", async () => {
      await register()
      const res = await register({ ...VALID, email: "ADA@example.COM" })

      assert.equal(res.status, 409)
      assert.equal(errorOf(res).code, "EMAIL_TAKEN")
      assert.equal(await getDb().user.count(), 1)
    })

    it("rejects invalid input with field-level messages", async () => {
      const res = await register({ name: "  ", email: "not-an-email", password: "short" })

      assert.equal(res.status, 400)
      assert.equal(errorOf(res).code, "VALIDATION_ERROR")
      // Every failed rule is reported, grouped here by field.
      const messages = (field: string) =>
        (errorOf(res).details ?? []).filter((d) => d.path === field).map((d) => d.message)
      assert.deepEqual(messages("name"), ["Name is required"])
      assert.deepEqual(messages("email"), ["Enter a valid email address"])
      assert.deepEqual(messages("password"), [
        "Password must be at least 10 characters",
        "Password must contain at least one number",
      ])
      assert.equal(await getDb().user.count(), 0)
    })

    it("rejects weak passwords", async () => {
      const lettersOnly = await register({ ...VALID, password: "onlyletterspassword" })
      assert.equal(lettersOnly.status, 400)
      assert.match(JSON.stringify(errorOf(lettersOnly).details), /at least one number/)

      const digitsOnly = await register({ ...VALID, password: "12345678901" })
      assert.equal(digitsOnly.status, 400)
      assert.match(JSON.stringify(errorOf(digitsOnly).details), /at least one letter/)
    })

    it("rate-limits repeated registrations", async () => {
      for (let i = 0; i < 10; i++) {
        assert.equal((await register({ ...VALID, email: `user${i}@example.com` })).status, 201)
      }
      const blocked = await register({ ...VALID, email: "one-too-many@example.com" })
      assert.equal(blocked.status, 429)
      assert.equal(errorOf(blocked).code, "RATE_LIMITED")
    })
  })

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await register()
    })

    it("signs in with valid credentials (email is case-insensitive)", async () => {
      const res = await login({ email: "ADA@example.com", password: VALID.password })

      assert.equal(res.status, 200)
      assert.equal(dataOf(res).user.email, "ada@example.com")
      assert.equal("passwordHash" in dataOf(res).user, false)
      assert.ok(res.setCookie?.startsWith(`${SESSION_COOKIE_NAME}=`))
    })

    it("uses one generic error for a wrong password and an unknown email", async () => {
      const wrongPassword = await login({ email: VALID.email, password: "wrong-password-123" })
      const unknownEmail = await login({ email: "nobody@example.com", password: VALID.password })

      for (const res of [wrongPassword, unknownEmail]) {
        assert.equal(res.status, 401)
        assert.equal(errorOf(res).code, "INVALID_CREDENTIALS")
        assert.equal(errorOf(res).message, "Invalid email or password")
        assert.equal(res.setCookie, null)
      }
    })

    it("replaces the previous session on a new sign-in", async () => {
      const first = cookiePair((await login({ email: VALID.email, password: VALID.password })).setCookie)
      const second = cookiePair((await login({ email: VALID.email, password: VALID.password }, first)).setCookie)

      assert.notEqual(first, second)
      assert.equal((await me(first)).status, 401)
      assert.equal((await me(second)).status, 200)
    })

    it("rate-limits repeated failed sign-ins, but not successful ones", async () => {
      const wrong = { email: VALID.email, password: "wrong-password-123" }
      for (let i = 0; i < 12; i++) {
        assert.equal((await login({ email: VALID.email, password: VALID.password })).status, 200)
      }
      for (let i = 0; i < 10; i++) assert.equal((await login(wrong)).status, 401)

      const blocked = await login(wrong)
      assert.equal(blocked.status, 429)
      assert.equal(errorOf(blocked).code, "RATE_LIMITED")
    })
  })

  describe("GET /auth/me", () => {
    it("returns 401 without a session", async () => {
      const res = await me()
      assert.equal(res.status, 401)
      assert.equal(errorOf(res).code, "UNAUTHENTICATED")
    })

    it("returns 401 for an unknown session token", async () => {
      assert.equal((await me(`${SESSION_COOKIE_NAME}=forged-token`)).status, 401)
    })

    it("returns the signed-in user", async () => {
      const cookie = cookiePair((await register()).setCookie)
      const res = await me(cookie)

      assert.equal(res.status, 200)
      assert.equal(dataOf(res).user.email, "ada@example.com")
      assert.equal("passwordHash" in dataOf(res).user, false)
    })

    it("returns 401 once the session has expired", async () => {
      const cookie = cookiePair((await register()).setCookie)
      await getDb().session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })

      assert.equal((await me(cookie)).status, 401)
      assert.equal(await getDb().session.count(), 0, "expired session is removed")
    })
  })

  describe("POST /auth/logout", () => {
    it("ends the session and clears the cookie", async () => {
      const cookie = cookiePair((await register()).setCookie)
      const res = await request<ApiBody<{ signedOut: boolean }>>(`${api.baseUrl}/auth/logout`, {
        method: "POST",
        cookie,
      })

      assert.equal(res.status, 200)
      assert.equal(dataOf(res).signedOut, true)
      assert.match(res.setCookie ?? "", /Expires=Thu, 01 Jan 1970/i)
      assert.equal(await getDb().session.count(), 0)
      assert.equal((await me(cookie)).status, 401, "old cookie no longer works")
    })

    it("is idempotent without a session", async () => {
      const res = await request(`${api.baseUrl}/auth/logout`, { method: "POST" })
      assert.equal(res.status, 200)
    })

    it("rejects requests from an untrusted origin (CSRF)", async () => {
      const cookie = cookiePair((await register()).setCookie)
      const res = await request<ApiBody<unknown>>(`${api.baseUrl}/auth/logout`, {
        method: "POST",
        cookie,
        headers: { Origin: "https://evil.example" },
      })

      assert.equal(res.status, 403)
      assert.equal(errorOf(res).code, "CORS_ORIGIN_DENIED")
      assert.equal(await getDb().session.count(), 1, "session untouched")
    })
  })
})
