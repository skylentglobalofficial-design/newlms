import { Router } from "express"
import { z } from "zod"
import { JobApplicationStatus, Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import {
  assertOwnedApplication,
} from "../../lib/career/profile.js"
import {
  serializeApplication,
  serializeApplicationEvent,
} from "../../lib/career/serializers.js"
import { parseOptionalDate, validationError } from "../../lib/career/shared.js"

export const applicationsRouter = Router()

const uuidSchema = z.string().uuid()

const createSchema = z.object({
  jobId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  roleTitle: z.string().trim().min(1).max(200).optional(),
  status: z.nativeEnum(JobApplicationStatus).optional(),
  appliedAt: z.string().optional(),
  nextActionAt: z.string().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  source: z.string().trim().max(120).nullable().optional(),
})

const patchSchema = z.object({
  status: z.nativeEnum(JobApplicationStatus).optional(),
  roleTitle: z.string().trim().min(1).max(200).optional(),
  appliedAt: z.string().nullable().optional(),
  nextActionAt: z.string().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  source: z.string().trim().max(120).nullable().optional(),
})

const eventSchema = z.object({
  type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable().optional(),
  occurredAt: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

const VALID_TRANSITIONS: Record<JobApplicationStatus, JobApplicationStatus[]> = {
  SAVED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["SCREENING", "INTERVIEW", "REJECTED", "WITHDRAWN"],
  SCREENING: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["REJECTED", "WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
}

function assertValidStatusTransition(from: JobApplicationStatus, to: JobApplicationStatus) {
  if (from === to) return true
  return VALID_TRANSITIONS[from].includes(to)
}

applicationsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const statusFilter = z.nativeEnum(JobApplicationStatus).optional().safeParse(req.query.status)
    const apps = await prisma.jobApplication.findMany({
      where: {
        userId: req.auth!.user.id,
        ...(statusFilter.success && statusFilter.data ? { status: statusFilter.data } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { job: true, employer: true },
    })
    res.json({ data: apps.map(serializeApplication) })
  } catch (error) {
    console.error("Failed to list applications:", error)
    res.status(500).json({ error: "Failed to list applications" })
  }
})

applicationsRouter.post("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  if (!parsed.data.jobId && !parsed.data.employerId && !parsed.data.roleTitle) {
    return res.status(400).json({ error: "jobId, employerId, or roleTitle is required" })
  }

  try {
    if (parsed.data.jobId) {
      const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } })
      if (!job) return res.status(404).json({ error: "Job not found" })
    }
    if (parsed.data.employerId) {
      const employer = await prisma.employer.findUnique({ where: { id: parsed.data.employerId } })
      if (!employer) return res.status(404).json({ error: "Employer not found" })
    }

    const status = parsed.data.status ?? JobApplicationStatus.APPLIED
    const app = await prisma.jobApplication.create({
      data: {
        userId: req.auth!.user.id,
        jobId: parsed.data.jobId ?? null,
        employerId: parsed.data.employerId ?? null,
        roleTitle: parsed.data.roleTitle ?? null,
        status,
        appliedAt: parseOptionalDate(parsed.data.appliedAt) ?? (status === "APPLIED" ? new Date() : null),
        nextActionAt: parseOptionalDate(parsed.data.nextActionAt),
        notes: parsed.data.notes ?? null,
        source: parsed.data.source ?? null,
      },
      include: { job: true, employer: true },
    })

    res.status(201).json({ data: serializeApplication(app) })
  } catch (error) {
    console.error("Failed to create application:", error)
    res.status(500).json({ error: "Failed to create application" })
  }
})

applicationsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
  if (!app) return res.status(404).json({ error: "Application not found" })

  try {
    const full = await prisma.jobApplication.findUnique({
      where: { id: app.id },
      include: { job: true, employer: true },
    })
    res.json({ data: serializeApplication(full!) })
  } catch (error) {
    res.status(500).json({ error: "Failed to load application" })
  }
})

applicationsRouter.patch("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
  if (!app) return res.status(404).json({ error: "Application not found" })

  if (parsed.data.status && !assertValidStatusTransition(app.status, parsed.data.status)) {
    return res.status(400).json({ error: `Invalid status transition from ${app.status} to ${parsed.data.status}` })
  }

  try {
    const updated = await prisma.jobApplication.update({
      where: { id: app.id },
      data: {
        status: parsed.data.status,
        roleTitle: parsed.data.roleTitle,
        appliedAt: parsed.data.appliedAt === undefined ? undefined : parseOptionalDate(parsed.data.appliedAt),
        nextActionAt: parsed.data.nextActionAt === undefined ? undefined : parseOptionalDate(parsed.data.nextActionAt),
        notes: parsed.data.notes,
        source: parsed.data.source,
      },
      include: { job: true, employer: true },
    })
    res.json({ data: serializeApplication(updated) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update application" })
  }
})

applicationsRouter.delete("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
  if (!app) return res.status(404).json({ error: "Application not found" })

  try {
    await prisma.jobApplication.delete({ where: { id: app.id } })
    res.json({ data: { deleted: true } })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete application" })
  }
})

applicationsRouter.get("/:id/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
  if (!app) return res.status(404).json({ error: "Application not found" })

  try {
    const events = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id },
      orderBy: { occurredAt: "desc" },
    })
    res.json({ data: events.map(serializeApplicationEvent) })
  } catch (error) {
    res.status(500).json({ error: "Failed to list application events" })
  }
})

applicationsRouter.post("/:id/events", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })
  const parsed = eventSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
  if (!app) return res.status(404).json({ error: "Application not found" })

  const occurredAt = parseOptionalDate(parsed.data.occurredAt)
  if (!occurredAt) return res.status(400).json({ error: "Invalid occurredAt date" })

  try {
    const event = await prisma.applicationEvent.create({
      data: {
        applicationId: app.id,
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        occurredAt,
        metadata: (parsed.data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
    res.status(201).json({ data: serializeApplicationEvent(event) })
  } catch (error) {
    res.status(500).json({ error: "Failed to create application event" })
  }
})
