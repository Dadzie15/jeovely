import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { ApiError, onUnauthorized } from "@/lib/api"
import { authApi, type LoginInput, type RegisterInput, type User } from "@/lib/auth-api"
import { AuthContext, type AuthContextValue, type AuthNotice, type AuthStatus } from "@/components/auth/auth-context"

interface SessionState {
  status: AuthStatus
  user: User | null
}

const signedOut: SessionState = { status: "unauthenticated", user: null }

/**
 * Owns the signed-in user for the whole app.
 *
 * The session itself is an HttpOnly cookie managed by the API: this provider
 * never reads, writes or persists a token. It only keeps the user object in
 * memory and learns about the session by calling GET /api/auth/me — on start
 * (restoring a session after a reload), when the tab becomes visible again,
 * and implicitly whenever any API call answers 401 UNAUTHENTICATED.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ status: "loading", user: null })
  const [notice, setNotice] = useState<AuthNotice>(null)
  const statusRef = useRef<AuthStatus>("loading")
  statusRef.current = session.status

  const signIn = useCallback((user: User) => {
    setSession({ status: "authenticated", user })
    setNotice(null)
  }, [])

  // Initial session check (also what restores a session after a reload).
  useEffect(() => {
    const controller = new AbortController()
    authApi
      .me(controller.signal)
      .then(signIn)
      .catch(() => {
        // 401 = no session. A network/server failure is treated the same way:
        // the user can still sign in, and protected pages stay protected.
        if (!controller.signal.aborted) setSession(signedOut)
      })
    return () => controller.abort()
  }, [signIn])

  // Any request that finds the session gone (expired, revoked, signed out in
  // another tab) moves the app to signed-out, with an explanation.
  useEffect(
    () =>
      onUnauthorized(() => {
        if (statusRef.current !== "authenticated") return
        setSession(signedOut)
        setNotice("expired")
      }),
    []
  )

  const refresh = useCallback(async () => {
    try {
      const user = await authApi.me()
      if (statusRef.current === "authenticated") setSession({ status: "authenticated", user })
      else signIn(user)
    } catch (error) {
      // A 401 is already handled by the onUnauthorized listener above; other
      // failures (e.g. offline) keep the current state rather than signing out.
      if (error instanceof ApiError && error.status === 401 && statusRef.current !== "authenticated") {
        setSession(signedOut)
      }
    }
  }, [signIn])

  // Revalidate when the user returns to the tab, so an expired session is
  // noticed without waiting for the next API call.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && statusRef.current === "authenticated") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [refresh])

  const login = useCallback(
    async (input: LoginInput) => {
      const user = await authApi.login(input)
      signIn(user)
      return user
    },
    [signIn]
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const user = await authApi.register(input)
      signIn(user)
      return user
    },
    [signIn]
  )

  const logout = useCallback(async () => {
    // Only clear local state once the server has deleted the session; if the
    // request fails the cookie is still valid, so pretending otherwise would
    // leave the user signed in on reload. Callers surface the error.
    await authApi.logout()
    setSession(signedOut)
    setNotice("signed-out")
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...session, notice, login, register, logout, refresh }),
    [session, notice, login, register, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
