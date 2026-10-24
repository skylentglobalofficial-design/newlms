import { Router } from "express"
import { z } from "zod"
import { CareerEmploymentType, CareerWorkMode, JobStatus, Prisma, RoleName } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { requireRoles } from "../../lib/roles.js"
import { employerIdsForUser } from "../../lib/career/employer-access.js"
import { serializeEmployer, serializeJob } from "../../lib/career/serializers.js"
import { slugSchema, validationError } from "../../lib/career/shared.js"
import { readSchemaCapabilities } from "../../lib/schema-capabilities.js"

export const employerJobsRouter = Router()

const guards = [requireAuth, requireRoles("recruiter", "superadmin")] as const

const jobFields = {
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1).max(8000),
  slug: z.string().trim().max(80).optional(),
  employmentType: z.nativeEnum(CareerEmploymentType).nullable().optional(),
  workMode: z.nativeEnum(CareerWorkMode).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  experienceMin: z.number().int().min(0).max(60).nullable().optional(),
  experienceMax: z.number().int().min(0).max(60).nullable().optional(),
  salaryMin: z.number().int().min(0).nullable().optional(),
  salaryMax: z.number().int().min(0).nullable().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  category: z.string().trim().max(80).nullable().optional(),
  applicationUrl: z.string().trim().url().max(500).nullable().optional(),
}

function refineJob(value: {
  slug?: string
  applicationUrl?: string | null
  experienceMin?: number | null
  experienceMax?: number | null
  salaryMin?: number | null
  salaryMax?: number | null
}, ctx: z.RefinementCtx) {
  if (value.slug && !slugSchema(value.slug)) {
    ctx.addIssue({ code: "custom", path: ["slug"], message: "Slug must be lowercase alphanumeric with dashes" })
  }
  if (value.applicationUrl && !/^https?:\/\//i.test(value.applicationUrl)) {
    ctx.addIssue({ code: "custom", path: ["applicationUrl"], message: "Application URL must start with http:// or https://" })
  }
  if (value.experienceMin != null && value.experienceMax != null && value.experienceMin > value.experienceMax) {
    ctx.addIssue({ code: "custom", path: ["experienceMax"], message: "Experience maximum must be at least the minimum" })
  }
  if (value.salaryMin != null && value.salaryMax != null && value.salaryMin > value.salaryMax) {
    ctx.addIssue({ code: "custom", path: ["salaryMax"], message: "Salary maximum must be at least the minimum" })
  }
}

const createSchema = z.object({
  employerId: z.string().uuid().optional(),
  ...jobFields,
}).superRefine(refineJob)

const patchSchema = z.object(jobFields).partial().superRefine(refineJob)

function slugify(title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72)
  return base || "job"
}

async function uniqueSlug(requested: string) {
  const existing = await prisma.job.findUnique({ where: { slug: requested }, select: { id: true } })
  if (!existing) return requested
  return `${requested.slice(0, 64)}-${Date.now().toString(36)}`
}

async function ownedJob(userId: string, jobId: string) {
  const employerIds = await employerIdsForUser(userId)
  if (employerIds.length === 0) return null
  return prisma.job.findFirst({
    where: { id: jobId, employerId: { in: employerIds } },
    include: { employer: true },
  })
}

employerJobsRouter.get("/jobs", ...guards, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const employerIds = await employerIdsForUser(userId)
    const employers = employerIds.length
      ? await prisma.employer.findMany({ where: { id: { in: employerIds } }, orderBy: { name: "asc" } })
      : []
    const jobs = employerIds.length
      ? await prisma.job.findMany({
          where: { employerId: { in: employerIds } },
          include: { employer: true },
          orderBy: { updatedAt: "desc" },
        })
      : []
    res.json({
      data: jobs.map((job) => serializeJob(job)),
      employers: employers.map(serializeEmployer),
      meta: { linked: employerIds.length > 0 },
    })
  } catch (error) {
    console.error("Failed to list employer jobs:", error)
    res.status(500).json({ error: "Failed to list jobs" })
  }
})

employerJobsRouter.post("/jobs", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const userId = req.auth!.user.id
    const employerIds = await employerIdsForUser(userId)
    if (employerIds.length === 0) {
      return res.status(403).json({ error: "No employer is linked to this account" })
    }
    const employerId = parsed.data.employerId ?? (employerIds.length === 1 ? employerIds[0] : undefined)
    if (!employerId) {
      return res.status(400).json({ error: "employerId is required when the account belongs to more than one employer" })
    }
    if (!employerIds.includes(employerId)) {
      return res.status(404).json({ error: "Employer not found" })
    }

    const slug = await uniqueSlug(parsed.data.slug ?? slugify(parsed.data.title))
    const job = await prisma.job.create({
      data: {
        employerId,
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        employmentType: parsed.data.employmentType ?? null,
        workMode: parsed.data.workMode ?? null,
        location: parsed.data.location ?? null,
        experienceMin: parsed.data.experienceMin ?? null,
        experienceMax: parsed.data.experienceMax ?? null,
        salaryMin: parsed.data.salaryMin ?? null,
        salaryMax: parsed.data.salaryMax ?? null,
        skills: parsed.data.skills ?? [],
        category: parsed.data.category ?? null,
        applicationUrl: parsed.data.applicationUrl ?? null,
        status: JobStatus.DRAFT,
      },
      include: { employer: true },
    })
    res.status(201).json({ data: serializeJob(job) })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "A job with that slug already exists" })
    }
    console.error("Failed to create job:", error)
    res.status(500).json({ error: "Failed to create job" })
  }
})

employerJobsRouter.patch("/jobs/:id", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) return res.status(400).json({ error: "Invalid job id" })
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const job = await ownedJob(req.auth!.user.id, id.data)
    if (!job) return res.status(404).json({ error: "Job not found" })
    if (parsed.data.slug && parsed.data.slug !== job.slug) {
      const taken = await prisma.job.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })
      if (taken) return res.status(409).json({ error: "A job with that slug already exists" })
    }
    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        slug: parsed.data.slug,
        employmentType: parsed.data.employmentType,
        workMode: parsed.data.workMode,
        location: parsed.data.location,
        experienceMin: parsed.data.experienceMin,
        experienceMax: parsed.data.experienceMax,
        salaryMin: parsed.data.salaryMin,
        salaryMax: parsed.data.salaryMax,
        skills: parsed.data.skills,
        category: parsed.data.category,
        applicationUrl: parsed.data.applicationUrl,
      },
      include: { employer: true },
    })
    res.json({ data: serializeJob(updated) })
  } catch (error) {
    console.error("Failed to update job:", error)
    res.status(500).json({ error: "Failed to update job" })
  }
})

employerJobsRouter.post("/jobs/:id/publish", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) return res.status(400).json({ error: "Invalid job id" })
  try {
    const job = await ownedJob(req.auth!.user.id, id.data)
    if (!job) return res.status(404).json({ error: "Job not found" })
    const updated = job.status === JobStatus.OPEN
      ? job
      : await prisma.job.update({
          where: { id: job.id },
          data: { status: JobStatus.OPEN, postedAt: job.postedAt ?? new Date() },
          include: { employer: true },
        })
    res.json({ data: serializeJob(updated) })
  } catch (error) {
    console.error("Failed to publish job:", error)
    res.status(500).json({ error: "Failed to publish job" })
  }
})

employerJobsRouter.post("/jobs/:id/close", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) return res.status(400).json({ error: "Invalid job id" })
  try {
    const job = await ownedJob(req.auth!.user.id, id.data)
    if (!job) return res.status(404).json({ error: "Job not found" })
    const updated = job.status === JobStatus.CLOSED
      ? job
      : await prisma.job.update({
          where: { id: job.id },
          data: { status: JobStatus.CLOSED },
          include: { employer: true },
        })
    res.json({ data: serializeJob(updated) })
  } catch (error) {
    console.error("Failed to close job:", error)
    res.status(500).json({ error: "Failed to close job" })
  }
})

employerJobsRouter.get("/jobs/:id/applications", ...guards, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) return res.status(400).json({ error: "Invalid job id" })
  try {
    const job = await ownedJob(req.auth!.user.id, id.data)
    if (!job) return res.status(404).json({ error: "Job not found" })
    const sharing = (await readSchemaCapabilities()).jobApplicationSharing
    if (!sharing) {
      res.json({ data: [] })
      return
    }
    const apps = await prisma.jobApplication.findMany({
      where: { jobId: job.id, sharedWithEmployer: true },
      include: { user: { select: { displayName: true } } },
      orderBy: { appliedAt: "desc" },
    })
    res.json({
      data: apps.map((app) => ({
        id: app.id,
        status: app.status,
        roleTitle: app.roleTitle,
        appliedAt: app.appliedAt?.toISOString() ?? null,
        applicantName: app.user.displayName?.trim() || "Learner",
      })),
    })
  } catch (error) {
    console.error("Failed to list job applications:", error)
    res.status(500).json({ error: "Failed to list applications" })
  }
})

export async function userHasRecruiterRole(userId: string) {
  const row = await prisma.userRole.findFirst({
    where: { userId, role: { name: { in: [RoleName.RECRUITER, RoleName.ADMIN] } } },
    select: { userId: true },
  })
  return Boolean(row)
}
