import { Router } from "express"
import { z } from "zod"
import { CareerEmploymentType, CareerWorkMode, EmployerVerificationStatus, JobStatus, Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { attachAuth, type AuthenticatedRequest } from "../../lib/auth.js"
import { serializeJob } from "../../lib/career/serializers.js"
import { slugSchema } from "../../lib/career/shared.js"

export const jobsRouter = Router()

const uuidSchema = z.string().uuid()

const listQuerySchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  category: z.string().trim().max(80).optional(),
  workMode: z.nativeEnum(CareerWorkMode).optional(),
  location: z.string().trim().max(120).optional(),
  employerId: z.string().uuid().optional(),
  employmentType: z.nativeEnum(CareerEmploymentType).optional(),
  q: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(10_000).optional(),
})

jobsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors })
  }

  try {
    const auth = await attachAuth(req)
    const { status, category, workMode, location, employerId, employmentType, q, limit = 20, offset = 0 } = parsed.data

    const where: Prisma.JobWhereInput = {
      status: status ?? JobStatus.OPEN,
      // The public board is only verified employers. Demo / pending fixtures
      // stay in the database for seeded application history, but they are not
      // listed as live roles.
      employer: { verificationStatus: EmployerVerificationStatus.VERIFIED },
    }
    if (category) where.category = { equals: category, mode: "insensitive" }
    if (workMode) where.workMode = workMode
    if (location) where.location = { contains: location, mode: "insensitive" }
    if (employerId) where.employerId = employerId
    if (employmentType) where.employmentType = employmentType
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { employer: true },
        orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ])

    let savedJobIds = new Set<string>()
    if (auth) {
      const saved = await prisma.savedJob.findMany({
        where: { userId: auth.user.id, jobId: { in: jobs.map((j) => j.id) } },
        select: { jobId: true },
      })
      savedJobIds = new Set(saved.map((s) => s.jobId))
    }

    res.json({
      data: jobs.map((job) => serializeJob(job, savedJobIds.has(job.id))),
      meta: { total, limit, offset },
    })
  } catch (error) {
    console.error("Failed to list jobs:", error)
    res.status(500).json({ error: "Failed to list jobs" })
  }
})

jobsRouter.get("/:idOrSlug", async (req: AuthenticatedRequest, res) => {
  const param = String(req.params.idOrSlug)
  const isUuid = uuidSchema.safeParse(param).success
  const isSlug = slugSchema(param)

  if (!isUuid && !isSlug) {
    return res.status(400).json({ error: "Invalid job identifier" })
  }

  try {
    const auth = await attachAuth(req)
    const job = await prisma.job.findFirst({
      where: isUuid ? { id: param } : { slug: param },
      include: { employer: true },
    })

    if (!job || job.status !== JobStatus.OPEN) {
      return res.status(404).json({ error: "Job not found" })
    }

    let saved = false
    if (auth) {
      const entry = await prisma.savedJob.findUnique({
        where: { userId_jobId: { userId: auth.user.id, jobId: job.id } },
      })
      saved = Boolean(entry)
    }

    res.json({ data: serializeJob(job, saved) })
  } catch (error) {
    console.error("Failed to load job:", error)
    res.status(500).json({ error: "Failed to load job" })
  }
})
