/// <reference types="vitest/config" />
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
    build: {
      rolldownOptions: {
        output: {
          // React + the router change rarely: keep them in their own long-cached
          // chunk. It's a static import, so it downloads in parallel (no waterfall).
          codeSplitting: {
            groups: [{ name: "react-vendor", test: /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ }],
          },
        },
      },
    },
    // Frontend unit/component tests (`npm run test:web`). The API has its own runner.
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./src/test/setup.ts"],
      restoreMocks: true,
      unstubGlobals: true,
    },
  }
})
