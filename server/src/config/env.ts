import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { z } from "zod"

// One .env at the repository root serves both apps (Vite only exposes VITE_* vars).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
loadEnv({ path: path.join(repoRoot, ".env"), quiet: true })

const csv = z
  .string()
  .transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean))
  .pipe(z.array(z.url()))

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_URL: z.url().default("http://localhost:4000"),
  /** Comma-separated list of origins allowed to call the API from a browser. */
  FRONTEND_URL: csv.default(["http://localhost:5173"]),
  JSON_BODY_LIMIT: z.string().default("100kb"),
  DATABASE_URL: z.string().min(1).optional(),
  /** Reserved for the auth module; unused until a provider is chosen. */
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment configuration:")
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === "production"
