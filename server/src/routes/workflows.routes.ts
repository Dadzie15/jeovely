import { Router } from "express"

import { notImplementedHandler } from "../middleware/not-implemented.js"
import { validate } from "../middleware/validate.js"
import { createWorkflowSchema } from "../schemas/workflow.schema.js"

// Planned: list, read, update, delete workflows and manage their steps.
export const workflowsRouter = Router()

// Input is validated now so the contract is fixed before persistence lands.
workflowsRouter.post("/", validate({ body: createWorkflowSchema }), notImplementedHandler("Creating workflows"))

workflowsRouter.use(notImplementedHandler("Workflows"))
