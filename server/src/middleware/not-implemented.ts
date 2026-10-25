import type { RequestHandler } from "express"

import { notImplemented } from "../utils/http-error.js"

/** Placeholder for modules whose routes exist but have no implementation yet (501). */
export const notImplementedHandler =
  (feature: string): RequestHandler =>
  (_req, _res, next) =>
    next(notImplemented(feature))
