import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ADA, mockApi, ok, renderApp, unauthenticated } from "@/test/utils"

const trialLinks = () => screen.getAllByRole("link", { name: /^start free trial/i })

describe("Landing page", () => {
  it("stays public and points every 'Start free trial' CTA at /register", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    renderApp("/")

    expect(await screen.findByRole("heading", { level: 1, name: /team workflows that run themselves/i })).toBeInTheDocument()
    // Navbar, hero, Team pricing plan and final CTA.
    const links = trialLinks()
    expect(links).toHaveLength(4)
    for (const link of links) expect(link).toHaveAttribute("href", "/register")
  })

  it.each([
    ["navbar", () => within(screen.getByRole("banner")).getByRole("link", { name: "Start free trial" })],
    ["hero", () => trialLinks()[1]],
    ["pricing", () => screen.getByRole("link", { name: /^start free trial.*team plan$/i })],
    ["final CTA", () => within(screen.getByRole("region", { name: /ready to get your time back/i })).getByRole("link", { name: "Start free trial" })],
  ])("the %s CTA opens the registration page in-app", async (_name, getLink) => {
    const api = mockApi({ "GET /api/auth/me": unauthenticated })
    const { user, router } = renderApp("/")
    await screen.findByRole("heading", { level: 1 })

    await user.click(getLink())

    expect(await screen.findByRole("heading", { name: "Create your Jeovely account" })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/register")
    // Client-side navigation: the session was checked once, not re-fetched by a full page load.
    expect(api.callsTo("GET /api/auth/me")).toHaveLength(1)
  })

  it("keeps in-page anchors such as 'See how it works' as plain hash links", async () => {
    mockApi({ "GET /api/auth/me": unauthenticated })
    renderApp("/")
    expect(await screen.findByRole("link", { name: "See how it works" })).toHaveAttribute("href", "#how")
  })

  it("sends signed-in visitors who click the CTA on to their dashboard", async () => {
    mockApi({ "GET /api/auth/me": () => ok({ user: ADA }) })
    const { user, router } = renderApp("/")
    await screen.findByRole("link", { name: "Dashboard" })

    await user.click(within(screen.getByRole("banner")).getByRole("link", { name: "Start free trial" }))

    expect(await screen.findByRole("heading", { name: /welcome to jeovely, ada/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/dashboard")
  })
})
