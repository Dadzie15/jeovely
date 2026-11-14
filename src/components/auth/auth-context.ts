import { createContext } from "react"

import type { LoginInput, RegisterInput, User } from "@/lib/auth-api"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

/**
 * Why the user is signed out, so the sign-in page can explain it.
 * "expired": the API rejected a session the app believed was valid.
 */
export type AuthNotice = "signed-out" | "expired" | null

export interface AuthContextValue {
  status: AuthStatus
  /** The signed-in user, held in memory only. Null unless status is "authenticated". */
  user: User | null
  notice: AuthNotice
  login: (input: LoginInput) => Promise<User>
  /** Creates the account; the API signs the new user in immediately. */
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  /** Re-checks the session cookie with GET /api/auth/me. */
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
