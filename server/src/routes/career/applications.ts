import { Router } from "express"
import { z } from "zod"
import { JobApplicationStatus, Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { isJobOpenForApplications } from "../../lib/career/job-eligibility.js"
import { JobStatus } from "@prisma/client"
import {
  assertOwnedApplication,
} from "../../lib/career/profile.js"
import {
  serializeApplication,
  serializeApplicationEvent,
} from "../../lib/career/serializers.js"
import { parseOptionalDate, validationError } from "../../lib/career/shared.js"
import { isDatabaseUnavailableError, isMissingSchemaError, jobApplicationSelect, readSchemaCapabilities } from "../../lib/schema-capabilities.js"

function applicationRead(sharing: boolean) {
  return {
    ...jobApplicationSelect(sharing),
    job: true,
    employer: true,
  } as const
}

function withShareFlag<T extends { sharedWithEmployer?: boolean }>(row: T, sharing: boolean) {
  return { ...row, sharedWithEmployer: sharing ? Boolean(row.sharedWithEmployer) : false }
}

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
    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
    const apps = await prisma.jobApplication.findMany({
      where: {
        userId: req.auth!.user.id,
        ...(statusFilter.success && statusFilter.data ? { status: statusFilter.data } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: applicationRead(sharing),
    })
    res.json({ data: apps.map((app) => serializeApplication(withShareFlag(app, sharing))) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to list applications:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to list applications" })
  }
})

const shareSchema = z.object({
  jobId: z.string().uuid(),
})

applicationsRouter.post("/share", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = shareSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
    if (!sharing) return res.status(503).json({ error: "Sharing an application with an employer is not available yet.", code: "unavailable" })

    const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } })
    if (!job || job.status !== JobStatus.OPEN) return res.status(404).json({ error: "Job not found" })

    const existing = await prisma.jobApplication.findFirst({
      where: { userId: req.auth!.user.id, jobId: job.id },
      orderBy: { updatedAt: "desc" },
    })

    if (existing && (existing.status === JobApplicationStatus.WITHDRAWN || existing.status === JobApplicationStatus.REJECTED)) {
      return res.status(409).json({ error: "This application is closed and cannot be shared" })
    }

    const app = existing
      ? await prisma.jobApplication.update({
          where: { id: existing.id },
          data: {
            sharedWithEmployer: true,
            status: existing.status === JobApplicationStatus.SAVED ? JobApplicationStatus.APPLIED : undefined,
            employerId: existing.employerId ?? job.employerId,
            roleTitle: existing.roleTitle ?? job.title,
            appliedAt: existing.appliedAt ?? new Date(),
          },
          select: applicationRead(true),
        })
      : await prisma.jobApplication.create({
          data: {
            userId: req.auth!.user.id,
            jobId: job.id,
            employerId: job.employerId,
            roleTitle: job.title,
            status: "APPLIED",
            appliedAt: new Date(),
            source: "career-os-share",
            sharedWithEmployer: true,
          },
          select: applicationRead(true),
        })

    res.status(existing ? 200 : 201).json({ data: serializeApplication(withShareFlag(app, true)) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to share application:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to share application" })
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
      if (!job || !isJobOpenForApplications(job.status)) return res.status(404).json({ error: "Job not found" })
    }
    if (parsed.data.employerId) {
      const employer = await prisma.employer.findUnique({ where: { id: parsed.data.employerId } })
      if (!employer) return res.status(404).json({ error: "Employer not found" })
    }

    const status = parsed.data.status ?? JobApplicationStatus.APPLIED
    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
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
      select: applicationRead(sharing),
    })

    res.status(201).json({ data: serializeApplication(withShareFlag(app, sharing)) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to create application:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to create application" })
  }
})

applicationsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  try {
    const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
    if (!app) return res.status(404).json({ error: "Application not found" })

    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
    const full = await prisma.jobApplication.findUnique({
      where: { id: app.id },
      select: applicationRead(sharing),
    })
    res.json({ data: serializeApplication(withShareFlag(full!, sharing)) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to load application:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load application" })
  }
})

applicationsRouter.patch("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
    if (!app) return res.status(404).json({ error: "Application not found" })

    if (parsed.data.status && !assertValidStatusTransition(app.status, parsed.data.status)) {
      return res.status(400).json({ error: `Invalid status transition from ${app.status} to ${parsed.data.status}` })
    }

    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
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
      select: applicationRead(sharing),
    })
    res.json({ data: serializeApplication(withShareFlag(updated, sharing)) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to update application:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to update application" })
  }
})

applicationsRouter.post("/:id/unshare", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  try {
    const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
    if (!app) return res.status(404).json({ error: "Application not found" })

    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
    if (!sharing) return res.status(503).json({ error: "Sharing an application with an employer is not available yet.", code: "unavailable" })
    const updated = await prisma.jobApplication.update({
      where: { id: app.id },
      data: { sharedWithEmployer: false },
      select: applicationRead(true),
    })
    res.json({ data: serializeApplication(withShareFlag(updated, true)) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to stop sharing application:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to stop sharing application" })
  }
})

applicationsRouter.delete("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  try {
    const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
    if (!app) return res.status(404).json({ error: "Application not found" })

    await prisma.jobApplication.delete({ where: { id: app.id } })
    res.json({ data: { deleted: true } })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to delete application:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to delete application" })
  }
})

applicationsRouter.get("/:id/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })

  try {
    const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
    if (!app) return res.status(404).json({ error: "Application not found" })

    const events = await prisma.applicationEvent.findMany({
      where: { applicationId: app.id },
      orderBy: { occurredAt: "desc" },
    })
    res.json({ data: events.map(serializeApplicationEvent) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to list application events:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to list application events" })
  }
})

applicationsRouter.post("/:id/events", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid application id" })
  const parsed = eventSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  const occurredAt = parseOptionalDate(parsed.data.occurredAt)
  if (!occurredAt) return res.status(400).json({ error: "Invalid occurredAt date" })

  try {
    const app = await assertOwnedApplication(req.auth!.user.id, idParsed.data)
    if (!app) return res.status(404).json({ error: "Application not found" })

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
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Career OS is temporarily unavailable.", code: "unavailable" })
    }
    console.error("Failed to create application event:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to create application event" })
  }
})
