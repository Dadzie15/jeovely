import { Router } from "express"

import { notImplementedHandler } from "../middleware/not-implemented.js"

// Planned: list and inspect workflow runs (WorkflowExecution).
export const executionsRouter = Router()

executionsRouter.use(notImplementedHandler("Executions"))
