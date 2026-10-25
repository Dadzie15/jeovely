import { PrismaPg } from "@prisma/adapter-pg"

import { env } from "../config/env.js"
import { PrismaClient } from "../generated/prisma/client.js"
import { HttpError } from "../utils/http-error.js"

let client: PrismaClient | undefined

/** Lazily creates the Prisma client so the API can boot before a database exists. */
export function getDb(): PrismaClient {
  if (!env.DATABASE_URL) {
    throw new HttpError(503, "DATABASE_NOT_CONFIGURED", "The database is not configured")
  }
  client ??= new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) })
  return client
}

export type DatabaseStatus = "connected" | "unreachable" | "not_configured"

export async function checkDatabase(timeoutMs = 2000): Promise<DatabaseStatus> {
  if (!env.DATABASE_URL) return "not_configured"
  let timer: NodeJS.Timeout | undefined
  try {
    await Promise.race([
      getDb().$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Database check timed out")), timeoutMs)
      }),
    ])
    return "connected"
  } catch {
    return "unreachable"
  } finally {
    clearTimeout(timer)
  }
}

export async function disconnectDb() {
  await client?.$disconnect()
}
