import { Router } from "express"
import { z } from "zod"
import { InterviewRoundStatus, InterviewRoundType } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { assertOwnedApplication, assertOwnedInterviewRound } from "../../lib/career/profile.js"
import { serializeInterviewRound } from "../../lib/career/serializers.js"
import { parseOptionalDate, validationError } from "../../lib/career/shared.js"

export const interviewsRouter = Router()

const uuidSchema = z.string().uuid()

const createSchema = z.object({
  applicationId: z.string().uuid().nullable().optional(),
  type: z.nativeEnum(InterviewRoundType),
  title: z.string().trim().min(1).max(200),
  scheduledAt: z.string().nullable().optional(),
  status: z.nativeEnum(InterviewRoundStatus).optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
})

const patchSchema = createSchema.partial()

interviewsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const rounds = await prisma.interviewRound.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    })
    res.json({ data: rounds.map(serializeInterviewRound) })
  } catch (error) {
    console.error("Failed to list interview rounds:", error)
    res.status(500).json({ error: "Failed to list interview rounds" })
  }
})

interviewsRouter.post("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const userId = req.auth!.user.id
    if (parsed.data.applicationId) {
      const app = await assertOwnedApplication(userId, parsed.data.applicationId)
      if (!app) return res.status(404).json({ error: "Application not found" })
    }

    const round = await prisma.interviewRound.create({
      data: {
        userId,
        applicationId: parsed.data.applicationId ?? null,
        type: parsed.data.type,
        title: parsed.data.title,
        scheduledAt: parseOptionalDate(parsed.data.scheduledAt),
        status: parsed.data.status ?? InterviewRoundStatus.PENDING,
        notes: parsed.data.notes ?? null,
      },
    })
    res.status(201).json({ data: serializeInterviewRound(round) })
  } catch (error) {
    console.error("Failed to create interview round:", error)
    res.status(500).json({ error: "Failed to create interview round" })
  }
})

interviewsRouter.patch("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid interview round id" })
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  const round = await assertOwnedInterviewRound(req.auth!.user.id, idParsed.data)
  if (!round) return res.status(404).json({ error: "Interview round not found" })

  if (parsed.data.applicationId) {
    const app = await assertOwnedApplication(req.auth!.user.id, parsed.data.applicationId)
    if (!app) return res.status(404).json({ error: "Application not found" })
  }

  try {
    const updated = await prisma.interviewRound.update({
      where: { id: round.id },
      data: {
        applicationId: parsed.data.applicationId === undefined ? undefined : parsed.data.applicationId,
        type: parsed.data.type,
        title: parsed.data.title,
        scheduledAt: parsed.data.scheduledAt === undefined ? undefined : parseOptionalDate(parsed.data.scheduledAt),
        status: parsed.data.status,
        notes: parsed.data.notes,
      },
    })
    res.json({ data: serializeInterviewRound(updated) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update interview round" })
  }
})

interviewsRouter.delete("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid interview round id" })

  const round = await assertOwnedInterviewRound(req.auth!.user.id, idParsed.data)
  if (!round) return res.status(404).json({ error: "Interview round not found" })

  try {
    await prisma.interviewRound.delete({ where: { id: round.id } })
    res.json({ data: { deleted: true } })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete interview round" })
  }
})
