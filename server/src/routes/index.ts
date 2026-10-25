import { Router } from "express"

import { authRouter } from "./auth.routes.js"
import { executionsRouter } from "./executions.routes.js"
import { healthRouter } from "./health.routes.js"
import { integrationsRouter } from "./integrations.routes.js"
import { usersRouter } from "./users.routes.js"
import { workflowsRouter } from "./workflows.routes.js"
import { workspacesRouter } from "./workspaces.routes.js"

/** Everything mounted under /api. */
export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/workflows", workflowsRouter)
apiRouter.use("/executions", executionsRouter)
apiRouter.use("/integrations", integrationsRouter)
apiRouter.use("/users", usersRouter)
apiRouter.use("/workspaces", workspacesRouter)
