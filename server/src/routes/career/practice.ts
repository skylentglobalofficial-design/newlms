import { Router } from "express"
import { z } from "zod"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { assertOwnedInterviewRound } from "../../lib/career/profile.js"
import { serializeInterviewPractice } from "../../lib/career/serializers.js"
import { parseOptionalDate, validationError } from "../../lib/career/shared.js"

export const practiceRouter = Router()

const createSchema = z.object({
  questionId: z.string().uuid().nullable().optional(),
  interviewRoundId: z.string().uuid().nullable().optional(),
  answer: z.string().trim().max(8000).nullable().optional(),
  score: z.number().int().min(0).max(100).nullable().optional(),
  practicedAt: z.string().optional(),
  feedback: z.string().trim().max(4000).nullable().optional(),
})

practiceRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const records = await prisma.interviewPractice.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: { practicedAt: "desc" },
    })
    res.json({ data: records.map(serializeInterviewPractice) })
  } catch (error) {
    console.error("Failed to list practice records:", error)
    res.status(500).json({ error: "Failed to list practice records" })
  }
})

practiceRouter.post("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const userId = req.auth!.user.id

    if (parsed.data.questionId) {
      const question = await prisma.interviewQuestion.findUnique({ where: { id: parsed.data.questionId } })
      if (!question || !question.active) return res.status(404).json({ error: "Question not found" })
    }

    if (parsed.data.interviewRoundId) {
      const round = await assertOwnedInterviewRound(userId, parsed.data.interviewRoundId)
      if (!round) return res.status(404).json({ error: "Interview round not found" })
    }

    const practicedAt = parseOptionalDate(parsed.data.practicedAt) ?? new Date()
    const record = await prisma.interviewPractice.create({
      data: {
        userId,
        questionId: parsed.data.questionId ?? null,
        interviewRoundId: parsed.data.interviewRoundId ?? null,
        answer: parsed.data.answer ?? null,
        score: parsed.data.score ?? null,
        practicedAt,
        feedback: parsed.data.feedback ?? null,
      },
    })
    res.status(201).json({ data: serializeInterviewPractice(record) })
  } catch (error) {
    console.error("Failed to create practice record:", error)
    res.status(500).json({ error: "Failed to create practice record" })
  }
})
