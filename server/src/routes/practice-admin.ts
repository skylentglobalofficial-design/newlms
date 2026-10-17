import { Router } from "express"
import { z } from "zod"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import {
  PracticeWorkspaceError,
  approvePracticeWorkspace,
  configurePracticeWorkspace,
  createPracticeWorkspace,
  getPracticeWorkspace,
  listPracticeWorkspaces,
  publishPracticeWorkspace,
  rejectPracticeWorkspace,
  revalidatePracticeWorkspace,
  testPracticeWorkspace,
  unpublishPracticeWorkspace,
} from "../lib/practice-workspaces/service.js"
import type { CourseSyllabus } from "../lib/practice-platform/types.js"

export const practiceAdminRouter = Router()

const guards = [requireAuth, requireRoles("superadmin"), requireCsrf] as const

const lessonSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(200),
  type: z.enum(["notes", "quiz", "assignment", "video"]),
  exercise: z.enum(["sql", "spreadsheet", "dashboard", "case", "notebook", "frontend", "api", "prompt", "exam", "written"]).optional(),
})

const syllabusSchema = z.object({
  courseSlug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  programmeSlug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().min(1).max(200),
  outcomes: z.array(z.string().max(300)).max(12),
  tools: z.array(z.string().max(80)).max(12),
  datasets: z.array(z.string().max(120)).max(8).optional(),
  lessons: z.array(lessonSchema).max(40),
})

const configSchema = z.object({
  adapterId: z.string().min(1).max(80).nullable().optional(),
  lessonIds: z.array(z.string().min(1).max(40)).max(40).optional(),
  datasetId: z.string().min(1).max(80).nullable().optional(),
  caseId: z.string().min(1).max(80).nullable().optional(),
  caseTitle: z.string().max(200).optional(),
  caseNotes: z.string().max(8000).optional(),
  tools: z.array(z.string().max(80)).max(12).optional(),
})

function routeId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}

function sendError(res: import("express").Response, error: unknown) {
  if (error instanceof PracticeWorkspaceError) {
    res.status(error.status).json({ error: error.message })
    return
  }
  console.error("Practice workspace failed:", error instanceof Error ? error.message : "unknown")
  res.status(500).json({ error: "The practice workspace could not be updated." })
}

practiceAdminRouter.get("/practice-workspaces", requireAuth, requireRoles("superadmin"), async (_req, res) => {
  try {
    res.json({ data: await listPracticeWorkspaces() })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces", ...guards, async (req: AuthenticatedRequest, res) => {
  const parsed = syllabusSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" })
    return
  }
  try {
    const data = await createPracticeWorkspace(req.auth!.user.id, parsed.data as CourseSyllabus)
    res.status(201).json({ data })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.get("/practice-workspaces/:id", requireAuth, requireRoles("superadmin"), async (req, res) => {
  try {
    res.json({ data: await getPracticeWorkspace(routeId(req.params.id)) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.patch("/practice-workspaces/:id", ...guards, async (req: AuthenticatedRequest, res) => {
  const parsed = configSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" })
    return
  }
  try {
    res.json({ data: await configurePracticeWorkspace(req.auth!.user.id, routeId(req.params.id), parsed.data) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces/:id/test", ...guards, async (req: AuthenticatedRequest, res) => {
  try {
    const row = await getPracticeWorkspace(routeId(req.params.id))
    res.json({ data: testPracticeWorkspace(row) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces/:id/approve", ...guards, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({ data: await approvePracticeWorkspace(req.auth!.user.id, routeId(req.params.id)) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces/:id/publish", ...guards, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({ data: await publishPracticeWorkspace(req.auth!.user.id, routeId(req.params.id)) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces/:id/reject", ...guards, async (req: AuthenticatedRequest, res) => {
  const note = z.object({ note: z.string().min(3).max(500) }).safeParse(req.body)
  if (!note.success) {
    res.status(400).json({ error: "A review note is required." })
    return
  }
  try {
    res.json({ data: await rejectPracticeWorkspace(req.auth!.user.id, routeId(req.params.id), note.data.note) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces/:id/unpublish", ...guards, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({ data: await unpublishPracticeWorkspace(req.auth!.user.id, routeId(req.params.id)) })
  } catch (error) {
    sendError(res, error)
  }
})

practiceAdminRouter.post("/practice-workspaces/:id/revalidate", ...guards, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({ data: await revalidatePracticeWorkspace(req.auth!.user.id, routeId(req.params.id)) })
  } catch (error) {
    sendError(res, error)
  }
})
