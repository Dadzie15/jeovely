import { describe, expect, it } from "vitest"

import { ApiError } from "@/lib/api"
import { authErrorMessage, fieldErrorsFrom, validateLogin, validateRegister } from "@/lib/auth-validation"

const valid = { name: "Ada Lovelace", email: "ada@example.com", password: "analytical-1843", confirmPassword: "analytical-1843" }

describe("validateRegister", () => {
  it("accepts input the API accepts", () => {
    expect(validateRegister(valid)).toEqual({})
  })

  it("mirrors the API's password rules (10+ chars, a letter, a number)", () => {
    expect(validateRegister({ ...valid, password: "short1", confirmPassword: "short1" }).password).toMatch(/at least 10/i)
    expect(validateRegister({ ...valid, password: "onlyletters", confirmPassword: "onlyletters" }).password).toMatch(/one number/i)
    expect(validateRegister({ ...valid, password: "1234567890", confirmPassword: "1234567890" }).password).toMatch(/one letter/i)
  })

  it("requires every field and a matching confirmation", () => {
    const errors = validateRegister({ name: "  ", email: "nope", password: "", confirmPassword: "" })
    expect(Object.keys(errors).sort()).toEqual(["confirmPassword", "email", "name", "password"])
    expect(validateRegister({ ...valid, confirmPassword: "different-1843" }).confirmPassword).toBe("Passwords don't match")
  })
})

describe("validateLogin", () => {
  it("needs a valid email and a password", () => {
    expect(validateLogin({ email: "ada@example.com", password: "x" })).toEqual({})
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Enter your email address",
      password: "Enter your password",
    })
  })
})

describe("server error mapping", () => {
  it("maps VALIDATION_ERROR details onto fields", () => {
    const error = new ApiError(400, "VALIDATION_ERROR", "Request validation failed", [
      { location: "body", path: "email", message: "Enter a valid email address" },
      { location: "body", path: "unknown", message: "ignored" },
    ])
    expect(fieldErrorsFrom(error, ["email", "password"] as const)).toEqual({ email: "Enter a valid email address" })
  })

  it("gives readable messages for known error codes", () => {
    expect(authErrorMessage(new ApiError(401, "INVALID_CREDENTIALS", "x"), "login")).toMatch(/don't match an account/)
    expect(authErrorMessage(new ApiError(429, "RATE_LIMITED", "x"), "login")).toMatch(/too many attempts/i)
    expect(authErrorMessage(new ApiError(0, "NETWORK_ERROR", "x"), "register")).toMatch(/couldn't reach/i)
    expect(authErrorMessage(new Error("boom"), "register")).toMatch(/something went wrong/i)
  })
})
