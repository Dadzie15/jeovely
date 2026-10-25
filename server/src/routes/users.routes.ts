import { Router } from "express"

import { notImplementedHandler } from "../middleware/not-implemented.js"

// Planned: current user profile and preferences.
export const usersRouter = Router()

usersRouter.use(notImplementedHandler("Users"))
