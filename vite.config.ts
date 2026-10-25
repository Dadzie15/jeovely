import path from "node:path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => {
  // Read the shared root .env (all keys, not just VITE_*) for dev-server settings.
  const env = loadEnv(mode, import.meta.dirname, "")

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      // Same-origin /api calls in development are forwarded to the Express API.
      proxy: {
        "/api": env.API_URL || "http://localhost:4000",
      },
    },
  }
})
