import { Router } from "express"
import { z } from "zod"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import {
  PracticeWorkspaceError,
  authorizePythonExecution,
  learnerPracticeWorkspace,
  saveLearnerPracticeResponse,
} from "../lib/practice-workspaces/service.js"
import { PythonRuntimeUnavailable, pythonRuntime } from "../lib/practice-runtime/python.js"
import { readSchemaCapabilities, UNAVAILABLE_MESSAGES, unavailableBody } from "../lib/schema-capabilities.js"

export const practiceRouter = Router()

practiceRouter.use(async (_req, res, next) => {
  try {
    if ((await readSchemaCapabilities()).practiceWorkspaces) {
      next()
      return
    }
    res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.practice))
  } catch (error) {
    next(error)
  }
})

const slugSchema = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

function sendError(res: import("express").Response, error: unknown) {
  if (error instanceof PracticeWorkspaceError) {
    res.status(error.status).json(error.body ?? { error: error.message })
    return
  }
  console.error("Learner practice workspace failed:", error instanceof Error ? error.message : "unknown")
  res.status(500).json({ error: "The practice workspace could not be opened." })
}

practiceRouter.get("/workspaces/:courseSlug", requireAuth, async (req: AuthenticatedRequest, res) => {
  const slug = slugSchema.safeParse(req.params.courseSlug)
  const lesson = z.string().min(1).max(40).optional().safeParse(typeof req.query.lesson === "string" ? req.query.lesson : undefined)
  if (!slug.success || !lesson.success) {
    res.status(400).json({ error: "Invalid course" })
    return
  }
  try {
    res.json({ data: await learnerPracticeWorkspace(req.auth!.user.id, slug.data, lesson.data) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceRouter.post("/runtimes/python/execute", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({
    courseSlug: slugSchema,
    lessonId: z.string().min(1).max(40),
    source: z.string().max(20000),
  }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" })
    return
  }
  try {
    await authorizePythonExecution(req.auth!.user.id, parsed.data.courseSlug, parsed.data.lessonId)
  } catch (error) {
    sendError(res, error)
    return
  }
  try {
    const probe = await pythonRuntime.probe()
    if (!probe.available) {
      res.status(503).json({ error: probe.reason, code: "runtime_unavailable" })
      return
    }
    const result = await pythonRuntime.execute({
      courseSlug: parsed.data.courseSlug,
      lessonId: parsed.data.lessonId,
      source: parsed.data.source,
    })
    res.json({ data: result })
  } catch (error) {
    if (error instanceof PythonRuntimeUnavailable) {
      res.status(503).json({ error: error.message, code: error.code })
      return
    }
    res.status(503).json({ error: "The Python runtime could not run that exercise.", code: "runtime_unavailable" })
  }
})

practiceRouter.put("/workspaces/:courseSlug/responses/:lessonId", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const slug = slugSchema.safeParse(req.params.courseSlug)
  const lessonId = z.string().min(1).max(40).safeParse(req.params.lessonId)
  const body = z.object({ body: z.string().min(1).max(8000) }).safeParse(req.body)
  if (!slug.success || !lessonId.success || !body.success) {
    res.status(400).json({ error: "Validation failed" })
    return
  }
  try {
    res.json({ data: await saveLearnerPracticeResponse(req.auth!.user.id, slug.data, lessonId.data, body.data.body) })
  } catch (error) {
    sendError(res, error)
  }
})
