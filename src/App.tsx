import { MotionConfig } from "framer-motion"
import { createBrowserRouter, RouterProvider } from "react-router"

import { AuthProvider } from "@/components/auth/auth-provider"
import { routes } from "@/routes"

const router = createBrowserRouter(routes)

export default function App() {
  return (
    // "user" makes every motion component honour prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MotionConfig>
  )
}
