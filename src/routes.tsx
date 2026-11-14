import { Outlet, ScrollRestoration, type RouteObject } from "react-router"

import { GuestRoute, ProtectedRoute } from "@/components/auth/route-guards"
import { DashboardPage } from "@/pages/dashboard-page"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { RegisterPage } from "@/pages/register-page"

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

/**
 * App routes. Shared by the browser router (App.tsx) and the memory router in tests.
 *   /            public marketing site
 *   /login       guests only
 *   /register    guests only
 *   /dashboard   signed-in only (placeholder)
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/dashboard", element: <DashboardPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]
