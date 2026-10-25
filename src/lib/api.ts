/**
 * Thin fetch wrapper for the Flowly API.
 *
 * Base URL comes from VITE_API_URL. When unset it falls back to the same-origin
 * "/api" path, which the Vite dev server proxies to the backend (vite.config.ts)
 * and a production reverse proxy can serve the same way.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "")

/** Error shape returned by the API: { success: false, error: { code, message, details? } } */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } }

type RequestOptions = Omit<RequestInit, "method" | "body">

async function request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")
  if (body !== undefined) headers.set("Content-Type", "application/json")

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      credentials: "include",
      ...options,
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the Flowly API", cause)
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!payload) {
    throw new ApiError(response.status, "INVALID_RESPONSE", `Unexpected response (${response.status})`)
  }
  if (!response.ok || !payload.success) {
    const error = payload.success ? undefined : payload.error
    throw new ApiError(
      response.status,
      error?.code ?? "HTTP_ERROR",
      error?.message ?? `Request failed (${response.status})`,
      error?.details
    )
  }
  return payload.data
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
}
