import type { RequestHandler } from "express"
import type { ZodType } from "zod"

import { HttpError } from "../utils/http-error.js"

interface Schemas {
  body?: ZodType
  query?: ZodType
  params?: ZodType
}

/**
 * Validates request input with zod before the handler runs.
 * The parsed body replaces req.body; parsed query/params are placed on
 * res.locals.validated (Express 5's req.query is read-only).
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    const issues: { location: string; path: string; message: string }[] = []
    const validated: Record<string, unknown> = {}

    for (const location of ["body", "query", "params"] as const) {
      const schema = schemas[location]
      if (!schema) continue
      const result = schema.safeParse(req[location])
      if (result.success) {
        validated[location] = result.data
      } else {
        for (const issue of result.error.issues) {
          issues.push({ location, path: issue.path.join("."), message: issue.message })
        }
      }
    }

    if (issues.length > 0) {
      return next(new HttpError(400, "VALIDATION_ERROR", "Request validation failed", issues))
    }

    if (validated.body !== undefined) req.body = validated.body
    res.locals.validated = validated
    next()
  }
}
