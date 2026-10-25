import { Router } from "express"

import { notImplementedHandler } from "../middleware/not-implemented.js"

// Planned: workspace CRUD and member management.
export const workspacesRouter = Router()

workspacesRouter.use(notImplementedHandler("Workspaces"))
