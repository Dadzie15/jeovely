import { z } from "zod"

/** Request body for creating a workflow (mirrors the Workflow model in prisma/schema.prisma). */
export const createWorkflowSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
})

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>
