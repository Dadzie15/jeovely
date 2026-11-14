import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ADA, deferred, fail, mockApi, ok, renderApp, unauthenticated } from "@/test/utils"

async function signIn(user: ReturnType<typeof renderApp>["user"], email = "ada@example.com", password = "analytical-1843") {
  await user.type(await screen.findByLabelText("Email address"), email)
  await user.type(screen.getByLabelText("Password"), password)
  await user.click(screen.getByRole("button", { name: "Sign in" }))
}

describe("Login page", () => {
  it("renders accessible fields with the right autocomplete hints", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    renderApp("/login")

    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email")
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password")
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("type", "button")
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/register")
  })

  it("validates before calling the API", async () => {
    const api = mockApi({ "GET /api/auth/me": unauthenticated })
    const { user } = renderApp("/login")
    await screen.findByLabelText("Email address")

    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(screen.getByText("Enter your email address")).toBeInTheDocument()
    expect(screen.getByText("Enter your password")).toBeInTheDocument()
    expect(screen.getByLabelText("Email address")).toHaveFocus()

    await user.type(screen.getByLabelText("Email address"), "not-an-email")
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(api.callsTo("POST /api/auth/login")).toHaveLength(0)
  })

  it("signs in with credentials included and goes to the dashboard", async () => {
    const pending = deferred<ReturnType<typeof ok>>()
    const api = mockApi({ "GET /api/auth/me": unauthenticated, "POST /api/auth/login": () => pending.promise })
    const { user, router } = renderApp("/login")

    await signIn(user)
    const busy = screen.getByRole("button", { name: /signing in/i })
    expect(busy).toBeDisabled()
    await user.click(busy)
    expect(api.callsTo("POST /api/auth/login")).toHaveLength(1)

    const [, init] = api.callsTo("POST /api/auth/login")[0]
    expect(init?.credentials).toBe("include")
    expect(JSON.parse(String(init?.body))).toEqual({ email: "ada@example.com", password: "analytical-1843" })

    pending.resolve(ok({ user: ADA }))
    expect(await screen.findByRole("heading", { name: "Welcome to Jeovely, Ada" })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/dashboard")
  })

  it("returns the user to the page they originally requested", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated, "POST /api/auth/login": () => ok({ user: ADA }) })
    const { user, router } = renderApp("/login?next=%2Fdashboard%3Ftab%3Druns")

    await signIn(user)
    await screen.findByRole("heading", { name: /welcome to jeovely/i })
    expect(router.state.location.pathname).toBe("/dashboard")
    expect(router.state.location.search).toBe("?tab=runs")
  })

  it("ignores an off-site ?next= (open redirect protection)", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated, "POST /api/auth/login": () => ok({ user: ADA }) })
    const { user, router } = renderApp("/login?next=https%3A%2F%2Fevil.example%2Fphish")

    await signIn(user)
    await screen.findByRole("heading", { name: /welcome to jeovely/i })
    expect(router.state.location.pathname).toBe("/dashboard")
  })

  it("shows a clear error for wrong credentials and lets the user retry", async () => {
    mockApi({
      "GET /api/auth/me": unauthenticated,
      "POST /api/auth/login": () => fail(401, "INVALID_CREDENTIALS", "Invalid email or password"),
    })
    const { user, router } = renderApp("/login")

    await signIn(user, "ada@example.com", "wrong-password-1")
    expect(await screen.findByRole("alert")).toHaveTextContent(/don't match an account/i)
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled()
    expect(router.state.location.pathname).toBe("/login")
  })

  it("explains rate limiting and network failures", async () => {
    mockApi({
      "GET /api/auth/me": unauthenticated,
      "POST /api/auth/login": () => fail(429, "RATE_LIMITED", "Too many attempts. Please try again later."),
    })
    const { user } = renderApp("/login")
    await signIn(user)
    expect(await screen.findByRole("alert")).toHaveTextContent(/too many attempts/i)
  })
})
