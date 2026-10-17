import { Router } from "express"
import { z } from "zod"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { PracticeWorkspaceError, learnerPracticeWorkspace, saveLearnerPracticeResponse } from "../lib/practice-workspaces/service.js"

export const practiceRouter = Router()

const slugSchema = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

function sendError(res: import("express").Response, error: unknown) {
  if (error instanceof PracticeWorkspaceError) {
    res.status(error.status).json({ error: error.message })
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
