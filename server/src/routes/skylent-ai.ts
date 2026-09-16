import { Router, type Response } from "express"
import { z } from "zod"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import {
  assertLessonUnlocked,
  findCourseBySlug,
  findNodeByLessonKey,
  loadLessonStates,
  resolveCourseEnrollment,
} from "../lib/lms.js"
import { answerLessonQuestion, isAiConfigured } from "../lib/skylent-ai/service.js"
import type { AiAction, ChatTurn } from "../lib/skylent-ai/types.js"

export const skylentAiRouter = Router()

const slugParam = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const lessonKeyParam = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const aiAction = z.enum(["ask", "explain", "example", "quiz", "practice"])

const historySchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    }),
  )
  .max(12)
  .optional()

export const askSchema = z
  .object({
    action: aiAction.default("ask"),
    question: z.string().max(2000).optional(),
    messages: historySchema,
  })
  .refine((value) => value.action !== "ask" || Boolean(value.question?.trim()), {
    message: "Question is required",
    path: ["question"],
  })

export const conceptualAskSchema = z
  .object({
    courseSlug: slugParam,
    lessonSlug: lessonKeyParam.optional(),
    lessonId: lessonKeyParam.optional(),
    mode: aiAction.optional(),
    action: aiAction.optional(),
    question: z.string().max(2000).optional(),
    messages: historySchema,
  })
  .superRefine((value, ctx) => {
    if (!value.lessonSlug && !value.lessonId) {
      ctx.addIssue({ code: "custom", message: "Lesson is required", path: ["lessonSlug"] })
    }
    const action = value.mode ?? value.action ?? "ask"
    if (action === "ask" && !value.question?.trim()) {
      ctx.addIssue({ code: "custom", message: "Question is required", path: ["question"] })
    }
  })

const aiRateLimit = rateLimit({
  windowMs: Number(process.env.SKYLENT_AI_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.SKYLENT_AI_RATE_LIMIT_MAX ?? 40),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(request: AuthenticatedRequest) {
    const userId = request.auth?.user.id
    if (userId) return `user:${userId}`
    return ipKeyGenerator(request.ip ?? "127.0.0.1")
  },
  handler(_request, response) {
    response.status(429).json({ error: "Skylent AI couldn't answer right now. Try again." })
  },
})

type AskPayload = {
  action: AiAction
  question: string
  messages: ChatTurn[]
}

async function respondToLessonAsk(
  req: AuthenticatedRequest,
  res: Response,
  courseSlug: string,
  lessonKey: string,
  payload: AskPayload,
) {
  const course = await findCourseBySlug(courseSlug)
  if (!course) {
    res.status(404).json({ error: "Course not found" })
    return
  }
  const enrollment = await resolveCourseEnrollment(req.auth!.user.id, course.id)
  if (!enrollment) {
    res.status(403).json({ error: "Enrolment required" })
    return
  }
  const lessonStates = await loadLessonStates(enrollment, course)
  const located = await findNodeByLessonKey(course, lessonKey)
  if (!located) {
    res.status(404).json({ error: "Lesson not found" })
    return
  }
  const lock = assertLessonUnlocked(course, lessonKey, lessonStates)
  if (!lock.ok) {
    res.status(lock.status).json(lock.body)
    return
  }

  if (!isAiConfigured()) {
    res.status(503).json({ error: "Skylent AI isn't available yet.", code: "not_configured" })
    return
  }

  const result = await answerLessonQuestion({
    action: payload.action,
    question: payload.question,
    history: payload.messages.slice(-8),
    courseSlug: course.slug,
    courseTitle: course.title,
    moduleTitle: located.module.title,
    lessonId: lessonKey,
    lessonTitle: located.node.title,
    lessonKind: String(located.node.nodeType ?? "notes").toLowerCase(),
  })

  if ("unavailable" in result) {
    res.status(503).json({ error: "Skylent AI isn't available yet.", code: "not_configured" })
    return
  }

  res.json({
    data: {
      answer: result.answer,
      basedOn: result.basedOn,
      related: result.related,
      caseLabel: result.caseLabel,
    },
  })
}

skylentAiRouter.get("/ai/status", requireAuth, async (_req, res) => {
  res.json({
    data: {
      available: isAiConfigured(),
    },
  })
})

skylentAiRouter.post("/ai/ask", requireAuth, requireCsrf, aiRateLimit, async (req: AuthenticatedRequest, res) => {
  const body = conceptualAskSchema.safeParse(req.body ?? {})
  if (!body.success) {
    const questionIssue = body.error.issues.some((issue) => issue.path[0] === "question")
    const lessonIssue = body.error.issues.some((issue) => issue.path[0] === "lessonSlug")
    res.status(400).json({
      error: questionIssue ? "Question is required" : lessonIssue ? "Invalid lesson" : "Invalid request",
    })
    return
  }

  try {
    await respondToLessonAsk(req, res, body.data.courseSlug, body.data.lessonSlug ?? body.data.lessonId ?? "", {
      action: body.data.mode ?? body.data.action ?? "ask",
      question: body.data.question?.trim() ?? "",
      messages: body.data.messages ?? [],
    })
  } catch (error) {
    console.error("Skylent AI failed:", error instanceof Error ? error.name : "unknown")
    res.status(502).json({ error: "Skylent AI couldn't answer right now. Try again." })
  }
})

skylentAiRouter.post(
  "/courses/:slug/lessons/:lessonKey/ai",
  requireAuth,
  requireCsrf,
  aiRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParam.safeParse(req.params.slug)
    const lessonParsed = lessonKeyParam.safeParse(req.params.lessonKey)
    if (!slugParsed.success || !lessonParsed.success) {
      res.status(400).json({ error: "Invalid lesson" })
      return
    }

    const body = askSchema.safeParse(req.body ?? {})
    if (!body.success) {
      const questionIssue = body.error.issues.some((issue) => issue.path[0] === "question")
      res.status(400).json({ error: questionIssue ? "Question is required" : "Invalid request" })
      return
    }

    try {
      await respondToLessonAsk(req, res, slugParsed.data, lessonParsed.data, {
        action: body.data.action,
        question: body.data.question?.trim() ?? "",
        messages: body.data.messages ?? [],
      })
    } catch (error) {
      console.error("Skylent AI failed:", error instanceof Error ? error.name : "unknown")
      res.status(502).json({ error: "Skylent AI couldn't answer right now. Try again." })
    }
  },
)
