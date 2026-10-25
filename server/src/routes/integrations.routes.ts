import { Router } from "express"

import { notImplementedHandler } from "../middleware/not-implemented.js"

// Planned: available triggers/actions and connected accounts.
export const integrationsRouter = Router()

integrationsRouter.use(notImplementedHandler("Integrations"))
