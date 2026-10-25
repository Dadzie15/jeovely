import { Router } from "express"

import { notImplementedHandler } from "../middleware/not-implemented.js"

// Planned: sign-up, sign-in, sign-out and session lookup once an auth provider is chosen.
export const authRouter = Router()

authRouter.use(notImplementedHandler("Authentication"))
