import { Router } from "express"
import { z } from "zod"
import { InterviewQuestionDifficulty } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { serializeInterviewQuestion } from "../../lib/career/serializers.js"

export const questionsRouter = Router()

const listQuerySchema = z.object({
  category: z.string().trim().max(80).optional(),
  difficulty: z.nativeEnum(InterviewQuestionDifficulty).optional(),
  roleTag: z.string().trim().max(80).optional(),
  active: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(10_000).optional(),
})

questionsRouter.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors })
  }

  try {
    const { category, difficulty, roleTag, active, limit = 20, offset = 0 } = parsed.data
    const where = {
      ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(roleTag ? { roleTag: { equals: roleTag, mode: "insensitive" as const } } : {}),
      ...(active === undefined ? { active: true } : { active: active === "true" }),
    }

    const [questions, total] = await Promise.all([
      prisma.interviewQuestion.findMany({
        where,
        orderBy: [{ category: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.interviewQuestion.count({ where }),
    ])

    res.json({
      data: questions.map(serializeInterviewQuestion),
      meta: { total, limit, offset },
    })
  } catch (error) {
    console.error("Failed to list interview questions:", error)
    res.status(500).json({ error: "Failed to list interview questions" })
  }
})
