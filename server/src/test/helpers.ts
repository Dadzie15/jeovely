import type { AddressInfo } from "node:net"
import type { Server } from "node:http"

import { createApp } from "../app.js"
import { getDb } from "../services/database.js"

/** Starts a fresh app (fresh rate-limit counters) on a random port. */
export async function startTestServer() {
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s))
  })
  const { port } = server.address() as AddressInfo
  return {
    baseUrl: `http://127.0.0.1:${port}/api`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  }
}

/** Deletes all rows. Guarded so it can only ever touch a *_test database. */
export async function resetDatabase() {
  const db = getDb()
  const [{ name }] = await db.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`
  if (!name.endsWith("_test")) throw new Error(`resetDatabase refused to run against "${name}"`)
  await db.$executeRawUnsafe(
    'TRUNCATE TABLE "sessions", "workflow_executions", "workflow_steps", "workflows", "workspace_members", "workspaces", "users" CASCADE'
  )
}

export interface ApiErrorShape {
  code: string
  message: string
  details?: { location: string; path: string; message: string }[]
}

/** The API's response envelope (see utils/api-response.ts). */
export type ApiBody<T> = { success: true; data: T } | { success: false; error: ApiErrorShape }

/** Asserts a success envelope and returns its data. */
export function dataOf<T>(res: JsonResponse<ApiBody<T>>): T {
  if (!res.body.success) throw new Error(`Expected success, got ${res.status} ${JSON.stringify(res.body.error)}`)
  return res.body.data
}

/** Asserts an error envelope and returns its error. */
export function errorOf(res: JsonResponse<ApiBody<unknown>>): ApiErrorShape {
  if (res.body.success) throw new Error(`Expected an error, got ${res.status}`)
  return res.body.error
}

export interface JsonResponse<T = unknown> {
  status: number
  body: T
  setCookie: string | null
}

/** fetch + JSON with an optional cookie, returning status, body and Set-Cookie. */
export async function request<T = unknown>(
  url: string,
  init: { method?: string; body?: unknown; cookie?: string; headers?: Record<string, string> } = {}
): Promise<JsonResponse<T>> {
  const headers: Record<string, string> = { ...init.headers }
  if (init.body !== undefined) headers["Content-Type"] = "application/json"
  if (init.cookie) headers.Cookie = init.cookie
  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  return { status: res.status, body: (await res.json()) as T, setCookie: res.headers.get("set-cookie") }
}

/** "name=value" from a Set-Cookie header, ready to send back as a Cookie header. */
export function cookiePair(setCookie: string | null): string {
  if (!setCookie) throw new Error("Expected a Set-Cookie header")
  return setCookie.split(";")[0]
}
