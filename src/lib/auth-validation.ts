/**
 * Client-side checks that mirror server/src/schemas/auth.schema.ts, so users
 * get instant feedback. The API remains the source of truth: its
 * VALIDATION_ERROR details are mapped back onto fields (see fieldErrorsFrom).
 */
import { ApiError } from "@/lib/api"

export const PASSWORD_MIN = 10
export const PASSWORD_MAX = 128
export const NAME_MAX = 100
export const EMAIL_MAX = 254

// Deliberately permissive (one "@", a dot in the domain, no spaces); the server does the strict check.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FieldErrors<K extends string> = Partial<Record<K, string>>

export interface RegisterValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginValues {
  email: string
  password: string
}

export const passwordRules = [
  { id: "length", label: `At least ${PASSWORD_MIN} characters`, test: (p: string) => p.length >= PASSWORD_MIN },
  { id: "letter", label: "One letter", test: (p: string) => /[A-Za-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
] as const

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return "Enter your email address"
  if (email.length > EMAIL_MAX) return `Email must be at most ${EMAIL_MAX} characters`
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like name@company.com"
  return undefined
}

export function validateRegister(values: RegisterValues): FieldErrors<keyof RegisterValues> {
  const errors: FieldErrors<keyof RegisterValues> = {}
  const name = values.name.trim()

  if (!name) errors.name = "Enter your full name"
  else if (name.length > NAME_MAX) errors.name = `Name must be at most ${NAME_MAX} characters`

  const email = validateEmail(values.email)
  if (email) errors.email = email

  if (!values.password) errors.password = "Create a password"
  else if (values.password.length > PASSWORD_MAX) errors.password = `Password must be at most ${PASSWORD_MAX} characters`
  else {
    const failed = passwordRules.filter((rule) => !rule.test(values.password))
    if (failed.length > 0) {
      errors.password = `Password needs ${failed.map((rule) => rule.label.toLowerCase()).join(", ")}`
    }
  }

  if (!values.confirmPassword) errors.confirmPassword = "Confirm your password"
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords don't match"

  return errors
}

export function validateLogin(values: LoginValues): FieldErrors<keyof LoginValues> {
  const errors: FieldErrors<keyof LoginValues> = {}
  const email = validateEmail(values.email)
  if (email) errors.email = email
  if (!values.password) errors.password = "Enter your password"
  else if (values.password.length > PASSWORD_MAX) errors.password = `Password must be at most ${PASSWORD_MAX} characters`
  return errors
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}

/** Maps the API's VALIDATION_ERROR details ([{ location, path, message }]) onto form fields. */
export function fieldErrorsFrom<K extends string>(error: unknown, fields: readonly K[]): FieldErrors<K> {
  const result: FieldErrors<K> = {}
  if (!(error instanceof ApiError) || error.code !== "VALIDATION_ERROR" || !Array.isArray(error.details)) {
    return result
  }
  for (const issue of error.details as unknown[]) {
    if (typeof issue !== "object" || issue === null) continue
    const { path, message } = issue as { path?: unknown; message?: unknown }
    if (typeof path !== "string" || typeof message !== "string") continue
    const field = fields.find((f) => f === path)
    if (field && !result[field]) result[field] = message
  }
  return result
}

/** A human message for a failed auth request. Field-level problems are handled separately. */
export function authErrorMessage(error: unknown, action: "login" | "register"): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again."
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return "That email and password don't match an account. Check them and try again."
    case "EMAIL_TAKEN":
      return "An account with this email already exists."
    case "RATE_LIMITED":
      return "Too many attempts. Please wait a few minutes before trying again."
    case "NETWORK_ERROR":
      return "We couldn't reach Jeovely. Check your connection and try again."
    case "VALIDATION_ERROR":
      return "Please fix the highlighted fields."
    default:
      return action === "login"
        ? "We couldn't sign you in right now. Please try again."
        : "We couldn't create your account right now. Please try again."
  }
}
