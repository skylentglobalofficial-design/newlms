import { Router } from "express"
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

export const askSchema = z
  .object({
    action: z.enum(["ask", "explain", "example", "quiz", "practice"]).default("ask"),
    question: z.string().max(2000).optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(4000),
        }),
      )
      .max(12)
      .optional(),
  })
  .refine((value) => value.action !== "ask" || Boolean(value.question?.trim()), {
    message: "Question is required",
    path: ["question"],
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

skylentAiRouter.get("/ai/status", requireAuth, async (_req, res) => {
  res.json({
    data: {
      available: isAiConfigured(),
    },
  })
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
      const course = await findCourseBySlug(slugParsed.data)
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
      const located = await findNodeByLessonKey(course, lessonParsed.data)
      if (!located) {
        res.status(404).json({ error: "Lesson not found" })
        return
      }
      const lock = assertLessonUnlocked(course, lessonParsed.data, lessonStates)
      if (!lock.ok) {
        res.status(lock.status).json(lock.body)
        return
      }

      if (!isAiConfigured()) {
        res.status(503).json({ error: "Skylent AI isn't available yet.", code: "not_configured" })
        return
      }

      const result = await answerLessonQuestion({
        action: body.data.action,
        question: body.data.question?.trim() ?? "",
        history: (body.data.messages ?? []).slice(-8),
        courseSlug: course.slug,
        courseTitle: course.title,
        moduleTitle: located.module.title,
        lessonId: lessonParsed.data,
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
        },
      })
    } catch (error) {
      console.error("Skylent AI failed:", error instanceof Error ? error.name : "unknown")
      res.status(502).json({ error: "Skylent AI couldn't answer right now. Try again." })
    }
  },
)
