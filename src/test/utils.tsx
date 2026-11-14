import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { vi } from "vitest"

import type { User } from "@/lib/auth-api"
import { AuthProvider } from "@/components/auth/auth-provider"
import { routes } from "@/routes"

export const ADA: User = {
  id: "user_ada",
  email: "ada@example.com",
  name: "Ada Lovelace",
  avatarUrl: null,
  createdAt: "2026-11-01T10:00:00.000Z",
}

type Reply = { status: number; body: unknown } | Promise<{ status: number; body: unknown }>
type Handler = (request: { body: unknown }) => Reply

export const ok = (data: unknown, status = 200) => ({ status, body: { success: true, data } })
export const fail = (status: number, code: string, message: string, details?: unknown) => ({
  status,
  body: { success: false, error: { code, message, details } },
})
export const unauthenticated = () => fail(401, "UNAUTHENTICATED", "Authentication required")

/**
 * Replaces fetch with a fake of the Jeovely API, keyed by "METHOD /path".
 * Mirrors the real envelope ({ success, data } / { success, error }) so the
 * real client (src/lib/api.ts) is exercised. Unhandled routes fail the test.
 */
export function mockApi(handlers: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input), "http://localhost")
    const key = `${init.method ?? "GET"} ${url.pathname}`
    const handler = handlers[key]
    if (!handler) throw new Error(`Unexpected request: ${key}`)
    const reply = await handler({ body: init.body ? JSON.parse(String(init.body)) : undefined })
    return new Response(JSON.stringify(reply.body), {
      status: reply.status,
      headers: { "Content-Type": "application/json" },
    })
  })
  vi.stubGlobal("fetch", fetchMock)

  return {
    fetch: fetchMock,
    /** Calls made to one endpoint, as [url, init] pairs. */
    callsTo: (key: string) =>
      fetchMock.mock.calls.filter(([input, init]) => `${init?.method ?? "GET"} ${new URL(String(input), "http://localhost").pathname}` === key),
  }
}

/** Renders the full app (auth provider + real routes) at `path`. */
export function renderApp(path = "/") {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  const view = render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
  return { ...view, router, user }
}

/** A promise you resolve later, for asserting in-flight states. */
export function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}
