import type { Response } from "express"

/**
 * Every API response uses one of these two shapes:
 *   { success: true,  data: T }
 *   { success: false, error: { code, message, details? } }
 */
export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  const body: ApiSuccess<T> = { success: true, data }
  return res.status(status).json(body)
}

export function sendError(res: Response, status: number, error: ApiErrorBody["error"]) {
  const body: ApiErrorBody = { success: false, error }
  return res.status(status).json(body)
}
