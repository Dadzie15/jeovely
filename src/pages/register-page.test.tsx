import { screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ADA, deferred, fail, mockApi, ok, renderApp, unauthenticated } from "@/test/utils"

async function fillForm(user: ReturnType<typeof renderApp>["user"], overrides: Partial<Record<string, string>> = {}) {
  const values = { name: "Ada Lovelace", email: "ada@example.com", password: "analytical-1843", confirm: "analytical-1843", ...overrides }
  await user.type(screen.getByLabelText("Full name"), values.name)
  await user.type(screen.getByLabelText("Email address"), values.email)
  await user.type(screen.getByLabelText("Password"), values.password)
  await user.type(screen.getByLabelText("Confirm password"), values.confirm)
}

describe("Registration page", () => {
  it("renders accessible fields with the right autocomplete hints", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    renderApp("/register")

    expect(await screen.findByRole("heading", { name: "Create your Jeovely account" })).toBeInTheDocument()
    expect(screen.getByLabelText("Full name")).toHaveAttribute("autocomplete", "name")
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email")
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password")
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute("autocomplete", "new-password")
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")
  })

  it("validates before calling the API and focuses the first invalid field", async () => {
    const api = mockApi({ "GET /api/auth/me": unauthenticated })
    const { user } = renderApp("/register")
    await screen.findByLabelText("Full name")

    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(screen.getByLabelText("Full name")).toHaveAccessibleDescription(/enter your full name/i)
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Full name")).toHaveFocus()
    expect(screen.getByText("Enter your email address")).toBeInTheDocument()
    expect(screen.getByText("Create a password")).toBeInTheDocument()
    expect(screen.getByText("Confirm your password")).toBeInTheDocument()
    expect(api.callsTo("POST /api/auth/register")).toHaveLength(0)
  })

  it("flags weak passwords and mismatched confirmation", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    const { user } = renderApp("/register")
    await screen.findByLabelText("Full name")

    await fillForm(user, { password: "short", confirm: "shorter" })
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(screen.getByText(/password needs at least 10 characters, one number/i)).toBeInTheDocument()
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
  })

  it("toggles password visibility without submitting", async () => {
    const api = mockApi({ "GET /api/auth/me": unauthenticated })
    const { user } = renderApp("/register")
    const password = await screen.findByLabelText("Password")

    expect(password).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(password).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true")
    expect(api.callsTo("POST /api/auth/register")).toHaveLength(0)
  })

  it("registers, signs the user in and lands on the dashboard", async () => {
    const pending = deferred<ReturnType<typeof ok>>()
    const api = mockApi({ "GET /api/auth/me": unauthenticated, "POST /api/auth/register": () => pending.promise })
    const { user, router } = renderApp("/register")
    await screen.findByLabelText("Full name")

    await fillForm(user, { email: "  ada@example.com " })
    await user.click(screen.getByRole("button", { name: "Create account" }))

    // In flight: busy, and a second click doesn't send another request.
    const busy = screen.getByRole("button", { name: /creating your account/i })
    expect(busy).toBeDisabled()
    await user.click(busy)
    expect(api.callsTo("POST /api/auth/register")).toHaveLength(1)

    const [, init] = api.callsTo("POST /api/auth/register")[0]
    expect(init?.credentials).toBe("include")
    expect(JSON.parse(String(init?.body))).toEqual({ name: "Ada Lovelace", email: "ada@example.com", password: "analytical-1843" })

    pending.resolve(ok({ user: ADA }, 201))
    expect(await screen.findByRole("heading", { name: "Welcome to Jeovely, Ada" })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/dashboard")
  })

  it("shows the API's duplicate-email error on the email field", async () => {
    mockApi({
      "GET /api/auth/me": unauthenticated,
      "POST /api/auth/register": () => fail(409, "EMAIL_TAKEN", "An account with this email already exists"),
    })
    const { user, router } = renderApp("/register")
    await screen.findByLabelText("Full name")

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i)
    expect(screen.getByRole("link", { name: "Sign in instead" })).toHaveAttribute("href", "/login")
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled()
    expect(router.state.location.pathname).toBe("/register")
  })

  it("maps server-side validation details onto fields", async () => {
    mockApi({
      "GET /api/auth/me": unauthenticated,
      "POST /api/auth/register": () =>
        fail(400, "VALIDATION_ERROR", "Request validation failed", [
          { location: "body", path: "email", message: "Enter a valid email address" },
        ]),
    })
    const { user } = renderApp("/register")
    await screen.findByLabelText("Full name")

    await fillForm(user, { email: "ada@example.c" })
    await user.click(screen.getByRole("button", { name: "Create account" }))

    await waitFor(() => expect(screen.getByLabelText("Email address")).toHaveAccessibleDescription("Enter a valid email address"))
  })
})
