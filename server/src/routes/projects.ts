import { Router } from "express"
import { z } from "zod"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { PROJECT_REFLECTION_MAX } from "../lib/skylent-projects/catalog.js"
import {
  attachProjectEvidence,
  completeProjectTask,
  ensureLearnerProject,
  getLearnerProject,
  listLearnerProjects,
  ProjectServiceError,
  updateProjectReflection,
} from "../lib/skylent-projects/service.js"

export const projectsRouter = Router()

const projectTypeSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const projectIdSchema = z.string().uuid()
const taskKeySchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9_]+$/)

const createSchema = z.object({
  projectType: projectTypeSchema,
})

const evidenceSchema = z.object({
  taskKey: taskKeySchema,
  labWorkId: z.string().uuid(),
})

const reflectionSchema = z.object({
  finding: z.string().max(PROJECT_REFLECTION_MAX).optional(),
  whyItMatters: z.string().max(PROJECT_REFLECTION_MAX).optional(),
  recommendation: z.string().max(PROJECT_REFLECTION_MAX).optional(),
})

const projectRateLimit = rateLimit({
  windowMs: Number(process.env.SKYLENT_LABS_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.SKYLENT_LABS_RATE_LIMIT_MAX ?? 40),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(request: AuthenticatedRequest) {
    const userId = request.auth?.user.id
    if (userId) return `user:${userId}`
    return ipKeyGenerator(request.ip ?? "127.0.0.1")
  },
  handler(_request, response) {
    response.status(429).json({ error: "Could not save that project. Try again." })
  },
})

function sendProjectError(res: import("express").Response, error: unknown) {
  if (error instanceof ProjectServiceError) {
    if (error.code === "not_found") {
      res.status(404).json({ error: error.message })
      return
    }
    if (error.code === "forbidden") {
      res.status(403).json({ error: error.message })
      return
    }
    res.status(400).json({ error: error.message })
    return
  }
  console.error("Skylent project failed:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown")
  res.status(500).json({ error: "Could not open that project. Try again." })
}

projectsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await listLearnerProjects(req.auth!.user.id)
    res.json({ data })
  } catch (error) {
    sendProjectError(res, error)
  }
})

projectsRouter.post("/", requireAuth, requireCsrf, projectRateLimit, async (req: AuthenticatedRequest, res) => {
  const body = createSchema.safeParse(req.body ?? {})
  if (!body.success) {
    res.status(400).json({ error: "Unknown project." })
    return
  }
  try {
    const data = await ensureLearnerProject(req.auth!.user.id, body.data.projectType)
    res.status(201).json({ data })
  } catch (error) {
    sendProjectError(res, error)
  }
})

projectsRouter.get("/:projectId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId)
  if (!projectId.success) {
    res.status(400).json({ error: "Invalid project." })
    return
  }
  try {
    const data = await getLearnerProject(req.auth!.user.id, projectId.data)
    res.json({ data })
  } catch (error) {
    sendProjectError(res, error)
  }
})

projectsRouter.post(
  "/:projectId/tasks/:taskKey/complete",
  requireAuth,
  requireCsrf,
  projectRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const projectId = projectIdSchema.safeParse(req.params.projectId)
    const taskKey = taskKeySchema.safeParse(req.params.taskKey)
    if (!projectId.success || !taskKey.success) {
      res.status(400).json({ error: "Invalid request." })
      return
    }
    try {
      const data = await completeProjectTask({
        userId: req.auth!.user.id,
        projectId: projectId.data,
        taskKey: taskKey.data,
      })
      res.json({ data })
    } catch (error) {
      sendProjectError(res, error)
    }
  },
)

projectsRouter.post(
  "/:projectId/evidence",
  requireAuth,
  requireCsrf,
  projectRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const projectId = projectIdSchema.safeParse(req.params.projectId)
    const body = evidenceSchema.safeParse(req.body ?? {})
    if (!projectId.success || !body.success) {
      res.status(400).json({ error: "Invalid request." })
      return
    }
    try {
      const data = await attachProjectEvidence({
        userId: req.auth!.user.id,
        projectId: projectId.data,
        taskKey: body.data.taskKey,
        labWorkId: body.data.labWorkId,
      })
      res.json({ data })
    } catch (error) {
      sendProjectError(res, error)
    }
  },
)

projectsRouter.patch(
  "/:projectId/reflection",
  requireAuth,
  requireCsrf,
  projectRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const projectId = projectIdSchema.safeParse(req.params.projectId)
    const body = reflectionSchema.safeParse(req.body ?? {})
    if (!projectId.success || !body.success) {
      res.status(400).json({ error: "Invalid request." })
      return
    }
    try {
      const data = await updateProjectReflection({
        userId: req.auth!.user.id,
        projectId: projectId.data,
        finding: body.data.finding,
        whyItMatters: body.data.whyItMatters,
        recommendation: body.data.recommendation,
      })
      res.json({ data })
    } catch (error) {
      sendProjectError(res, error)
    }
  },
)

projectsRouter.post(
  "/:projectId/save",
  requireAuth,
  requireCsrf,
  projectRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const projectId = projectIdSchema.safeParse(req.params.projectId)
    const body = reflectionSchema.safeParse(req.body ?? {})
    if (!projectId.success || !body.success) {
      res.status(400).json({ error: "Invalid request." })
      return
    }
    try {
      const data = await updateProjectReflection({
        userId: req.auth!.user.id,
        projectId: projectId.data,
        finding: body.data.finding,
        whyItMatters: body.data.whyItMatters,
        recommendation: body.data.recommendation,
        save: true,
      })
      res.json({ data })
    } catch (error) {
      sendProjectError(res, error)
    }
  },
)
