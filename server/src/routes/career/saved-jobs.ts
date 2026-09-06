import { Router } from "express"
import { z } from "zod"
import { JobStatus } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { serializeSavedJob } from "../../lib/career/serializers.js"
import { validationError } from "../../lib/career/shared.js"

export const savedJobsRouter = Router()

const saveSchema = z.object({
  jobId: z.string().uuid(),
})

savedJobsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const entries = await prisma.savedJob.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: { createdAt: "desc" },
      include: { job: { include: { employer: true } } },
    })
    res.json({ data: entries.map(serializeSavedJob) })
  } catch (error) {
    console.error("Failed to list saved jobs:", error)
    res.status(500).json({ error: "Failed to list saved jobs" })
  }
})

savedJobsRouter.post("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = saveSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } })
    if (!job || job.status !== JobStatus.OPEN) {
      return res.status(404).json({ error: "Job not found" })
    }

    const entry = await prisma.savedJob.upsert({
      where: { userId_jobId: { userId: req.auth!.user.id, jobId: job.id } },
      create: { userId: req.auth!.user.id, jobId: job.id },
      update: {},
      include: { job: { include: { employer: true } } },
    })

    res.status(201).json({ data: serializeSavedJob(entry) })
  } catch (error) {
    console.error("Failed to save job:", error)
    res.status(500).json({ error: "Failed to save job" })
  }
})

savedJobsRouter.delete("/:jobId", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const jobIdParsed = z.string().uuid().safeParse(req.params.jobId)
  if (!jobIdParsed.success) return res.status(400).json({ error: "Invalid job id" })

  try {
    const entry = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: req.auth!.user.id, jobId: jobIdParsed.data } },
    })
    if (!entry) return res.status(404).json({ error: "Saved job not found" })

    await prisma.savedJob.delete({ where: { id: entry.id } })
    res.json({ data: { removed: true } })
  } catch (error) {
    console.error("Failed to unsave job:", error)
    res.status(500).json({ error: "Failed to unsave job" })
  }
})
