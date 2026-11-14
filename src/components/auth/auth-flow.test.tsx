import { act, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { api } from "@/lib/api"
import { ADA, deferred, fail, mockApi, ok, renderApp, unauthenticated } from "@/test/utils"

describe("Session restoration", () => {
  it("shows a loading state, then restores an existing session from /api/auth/me", async () => {
    const pending = deferred<ReturnType<typeof ok>>()
    const mock = mockApi({ "GET /api/auth/me": () => pending.promise })
    renderApp("/dashboard")

    expect(screen.getByRole("status")).toHaveTextContent(/checking your session/i)
    pending.resolve(ok({ user: ADA }))

    expect(await screen.findByRole("heading", { name: "Welcome to Jeovely, Ada" })).toBeInTheDocument()
    expect(screen.getByText("ada@example.com")).toBeInTheDocument()
    expect(mock.callsTo("GET /api/auth/me")[0][1]?.credentials).toBe("include")
  })

  it("never stores session data in web storage", async () => {
    mockApi({ "GET /api/auth/me": () => ok({ user: ADA }) })
    renderApp("/dashboard")
    await screen.findByRole("heading", { name: /welcome to jeovely/i })

    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
})

describe("Route protection", () => {
  it("sends signed-out visitors to /login, remembering where they were going", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    const { router } = renderApp("/dashboard?tab=runs")

    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/login")
    expect(new URLSearchParams(router.state.location.search).get("next")).toBe("/dashboard?tab=runs")
  })

  it("treats an unreachable API as signed out on protected pages", async () => {
    mockApi({
      "GET /api/auth/me": () => {
        throw new TypeError("Failed to fetch")
      },
    })
    const { router } = renderApp("/dashboard")
    await screen.findByRole("heading", { name: "Welcome back" })
    expect(router.state.location.pathname).toBe("/login")
  })

  it.each(["/login", "/register"])("sends signed-in users away from %s", async (path) => {
    mockApi({ "GET /api/auth/me": () => ok({ user: ADA }) })
    const { router } = renderApp(path)

    await screen.findByRole("heading", { name: /welcome to jeovely/i })
    expect(router.state.location.pathname).toBe("/dashboard")
  })

  it("shows a 404 page for unknown routes", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    renderApp("/does-not-exist")
    expect(await screen.findByRole("heading", { name: "We couldn't find that page" })).toBeInTheDocument()
  })
})

describe("Logout", () => {
  it("ends the session on the server and returns to the sign-in page", async () => {
    const mock = mockApi({
      "GET /api/auth/me": () => ok({ user: ADA }),
      "POST /api/auth/logout": () => ok({ signedOut: true }),
    })
    const { user, router } = renderApp("/dashboard")

    await user.click(await screen.findByRole("button", { name: "Sign out" }))

    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("You've been signed out.")
    expect(router.state.location.pathname).toBe("/login")
    expect(router.state.location.search).toBe("")
    expect(mock.callsTo("POST /api/auth/logout")).toHaveLength(1)
    expect(mock.callsTo("POST /api/auth/logout")[0][1]?.credentials).toBe("include")
  })

  it("stays signed in and explains when the server can't be reached", async () => {
    mockApi({
      "GET /api/auth/me": () => ok({ user: ADA }),
      "POST /api/auth/logout": () => {
        throw new TypeError("Failed to fetch")
      },
    })
    const { user, router } = renderApp("/dashboard")

    await user.click(await screen.findByRole("button", { name: "Sign out" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't sign you out/i)
    expect(router.state.location.pathname).toBe("/dashboard")
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled()
  })
})

describe("Expired sessions", () => {
  it("signs the user out with an explanation when any API call reports UNAUTHENTICATED", async () => {
    mockApi({
      "GET /api/auth/me": () => ok({ user: ADA }),
      "GET /api/workflows": () => unauthenticated(),
    })
    const { router } = renderApp("/dashboard")
    await screen.findByRole("heading", { name: /welcome to jeovely/i })

    await act(async () => {
      await api.get("/workflows").catch(() => undefined)
    })

    expect(await screen.findByRole("status")).toHaveTextContent(/session has expired/i)
    expect(router.state.location.pathname).toBe("/login")
  })

  it("re-checks the session when the tab becomes visible again", async () => {
    let valid = true
    mockApi({ "GET /api/auth/me": () => (valid ? ok({ user: ADA }) : unauthenticated()) })
    const { router } = renderApp("/dashboard")
    await screen.findByRole("heading", { name: /welcome to jeovely/i })

    valid = false
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
    })

    expect(await screen.findByRole("status")).toHaveTextContent(/session has expired/i)
    await waitFor(() => expect(router.state.location.pathname).toBe("/login"))
  })

  it("does not treat a wrong password as an expired session", async () => {
    mockApi({
      "GET /api/auth/me": unauthenticated,
      "POST /api/auth/login": () => fail(401, "INVALID_CREDENTIALS", "Invalid email or password"),
    })
    const { user } = renderApp("/login")
    await user.type(await screen.findByLabelText("Email address"), "ada@example.com")
    await user.type(screen.getByLabelText("Password"), "wrong-password-1")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await screen.findByRole("alert")
    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument()
  })
})
