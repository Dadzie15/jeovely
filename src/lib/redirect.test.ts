import { describe, expect, it } from "vitest"

import { authPageLink, loginPathFor, safeRedirectPath } from "@/lib/redirect"

describe("safeRedirectPath", () => {
  it("keeps same-origin in-app paths, including query and hash", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard")
    expect(safeRedirectPath("/workflows/42?tab=runs#latest")).toBe("/workflows/42?tab=runs#latest")
  })

  it.each([
    ["https://evil.example/phish"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["\\\\evil.example"],
    ["javascript:alert(1)"],
    ["evil.example"],
    ["/\t/evil.example"],
    ["/%0a/evil"], // encoded is fine as a path, but must stay same-origin
  ])("never leaves the app for %j", (target) => {
    const result = safeRedirectPath(target)
    expect(result.startsWith("/")).toBe(true)
    expect(result.startsWith("//")).toBe(false)
    expect(new URL(result, "https://app.test").origin).toBe("https://app.test")
  })

  it("falls back to the dashboard for unsafe or missing targets", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/dashboard")
    expect(safeRedirectPath("//evil.example")).toBe("/dashboard")
    expect(safeRedirectPath("/\\evil.example")).toBe("/dashboard")
    expect(safeRedirectPath(null)).toBe("/dashboard")
    expect(safeRedirectPath("")).toBe("/dashboard")
  })

  it("does not send a signed-in user back to the sign-in pages", () => {
    expect(safeRedirectPath("/login")).toBe("/dashboard")
    expect(safeRedirectPath("/register?next=/x")).toBe("/dashboard")
  })
})

describe("loginPathFor", () => {
  it("carries the requested page in ?next=", () => {
    expect(loginPathFor({ pathname: "/workflows/7", search: "?a=1", hash: "" })).toBe("/login?next=%2Fworkflows%2F7%3Fa%3D1")
  })

  it("omits ?next= for the default destination", () => {
    expect(loginPathFor({ pathname: "/dashboard", search: "", hash: "" })).toBe("/login")
  })
})

describe("authPageLink", () => {
  it("forwards a safe ?next= between the auth pages and drops an unsafe one", () => {
    expect(authPageLink("/register", new URLSearchParams("next=/workflows"))).toBe("/register?next=%2Fworkflows")
    expect(authPageLink("/register", new URLSearchParams("next=https://evil.example"))).toBe("/register")
    expect(authPageLink("/login", new URLSearchParams())).toBe("/login")
  })
})
