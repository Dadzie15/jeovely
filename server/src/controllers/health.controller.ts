import type { RequestHandler } from "express"

import { env } from "../config/env.js"
import { checkDatabase } from "../services/database.js"
import { sendSuccess } from "../utils/api-response.js"

export const getHealth: RequestHandler = async (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    service: "jeovely-api",
    message: "Jeovely API is running",
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    database: await checkDatabase(),
    timestamp: new Date().toISOString(),
  })
}
