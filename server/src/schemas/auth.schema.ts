import { z } from "zod"

/** Trimmed and lower-cased so "Ada@Example.com " and "ada@example.com" are one account. */
const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254, "Email must be at most 254 characters")
  .pipe(z.email("Enter a valid email address"))

// Upper bound keeps hashing cost bounded (very long inputs are a DoS vector).
const PASSWORD_MAX = 128

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email,
  password: z
    .string({ error: "Password is required" })
    .min(10, "Password must be at least 10 characters")
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required")
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
