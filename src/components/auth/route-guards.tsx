import { Navigate, Outlet, useLocation, useSearchParams } from "react-router"

import { useAuth } from "@/hooks/use-auth"
import { loginPathFor, REDIRECT_PARAM, safeRedirectPath } from "@/lib/redirect"
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen"

/**
 * Wraps signed-in-only routes. Signed-out visitors go to /login, carrying the
 * page they asked for in ?next= so they come back to it after signing in.
 */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === "loading") return <AuthLoadingScreen />
  if (status === "unauthenticated") return <Navigate to={loginPathFor(location)} replace />
  return <Outlet />
}

/**
 * Wraps /login and /register. Signed-in users are sent on to their
 * (validated) ?next= destination, or the dashboard. This is also what moves
 * the user on after a successful sign-in or registration.
 */
export function GuestRoute() {
  const { status } = useAuth()
  const [searchParams] = useSearchParams()

  if (status === "loading") return <AuthLoadingScreen />
  if (status === "authenticated") return <Navigate to={safeRedirectPath(searchParams.get(REDIRECT_PARAM))} replace />
  return <Outlet />
}
