/**
 * Integration test runner: prepares a dedicated PostgreSQL test database,
 * applies migrations to it, then runs the node:test suites against it.
 *
 *   TEST_DATABASE_URL  used if set; otherwise derived from DATABASE_URL by
 *                      appending "_test" to the database name.
 *
 * Safety: refuses to run unless the target database name ends in "_test" and
 * differs from DATABASE_URL's, because the tests delete all rows between cases.
 * Connection strings are never printed (they contain credentials).
 */
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../generated/prisma/client.js"

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
loadEnv({ path: path.join(serverDir, "..", ".env"), quiet: true })

function fail(message: string): never {
  console.error(`[test] ${message}`)
  process.exit(1)
}

const baseUrl = process.env.DATABASE_URL
const explicitTestUrl = process.env.TEST_DATABASE_URL
if (!baseUrl && !explicitTestUrl) fail("Set DATABASE_URL (or TEST_DATABASE_URL) in .env to run the tests.")

const testUrl = new URL(explicitTestUrl ?? baseUrl!)
const baseName = baseUrl ? new URL(baseUrl).pathname.slice(1) : undefined
if (!explicitTestUrl) testUrl.pathname = `/${baseName}_test`
const testName = testUrl.pathname.slice(1)

if (!/^[A-Za-z0-9_]+_test$/.test(testName)) fail(`Refusing to use "${testName}": test database name must end in "_test".`)
if (testName === baseName) fail("Refusing to run: the test database is the same as DATABASE_URL.")

// Create the database if needed, via the server's maintenance database.
const adminUrl = new URL(testUrl)
adminUrl.pathname = "/postgres"
const admin = new PrismaClient({ adapter: new PrismaPg({ connectionString: adminUrl.toString() }) })
try {
  const existing = await admin.$queryRaw<{ exists: number }[]>`SELECT 1 AS exists FROM pg_database WHERE datname = ${testName}`
  if (existing.length === 0) {
    // Identifier already validated against /^[A-Za-z0-9_]+$/ above.
    await admin.$executeRawUnsafe(`CREATE DATABASE "${testName}"`)
    console.log(`[test] Created database "${testName}"`)
  }
} catch (err) {
  fail(`Could not prepare database "${testName}": ${err instanceof Error ? err.message : String(err)}`)
} finally {
  await admin.$disconnect()
}

const childEnv = { ...process.env, DATABASE_URL: testUrl.toString(), NODE_ENV: "test" }
const npx = process.platform === "win32" ? "npx.cmd" : "npx"

console.log(`[test] Applying migrations to "${testName}"`)
const migrate = spawnSync(npx, ["prisma", "migrate", "deploy"], { cwd: serverDir, env: childEnv, stdio: "inherit", shell: process.platform === "win32" })
if (migrate.status !== 0) fail("prisma migrate deploy failed")

const tests = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", "--test-concurrency=1", "src/**/*.test.ts"],
  { cwd: serverDir, env: childEnv, stdio: "inherit" }
)
process.exit(tests.status ?? 1)
