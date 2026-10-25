import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"

// The single .env file lives at the repository root (see .env.example).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
loadEnv({ path: path.join(root, ".env"), quiet: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Optional so `prisma generate` / `validate` work before a database exists;
  // `prisma migrate` will report a clear error until DATABASE_URL is set.
  datasource: { url: process.env.DATABASE_URL },
})
