/** An error that maps directly to an HTTP response. Thrown anywhere, rendered by errorHandler. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, "BAD_REQUEST", message, details)

export const notFound = (message = "Resource not found") => new HttpError(404, "NOT_FOUND", message)

export const notImplemented = (feature: string) =>
  new HttpError(501, "NOT_IMPLEMENTED", `${feature} is not implemented yet`)
