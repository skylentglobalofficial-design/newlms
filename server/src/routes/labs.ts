import { Router } from "express"
import { z } from "zod"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import {
  executeLabOperation,
  executeNorthwindSql,
  getLabWorkspace,
  getSavedLabWork,
  LabServiceError,
  listLabWork,
  saveLabWork,
} from "../lib/skylent-labs/service.js"
import { SQL_OPERATION, VALID_NET_REVENUE } from "../lib/skylent-labs/catalog.js"
import { MAX_SQL_QUERY_CHARS } from "../lib/skylent-labs/sql/limits.js"

export const labsRouter = Router()

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
  .optional()

const workIdParam = z.string().uuid()

const runSchema = z.object({
  operation: z.literal(VALID_NET_REVENUE),
  lessonKey: lessonKeyParam,
})

const sqlRunSchema = z.object({
  query: z.string().max(MAX_SQL_QUERY_CHARS),
  lessonKey: lessonKeyParam,
})

const saveSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal(VALID_NET_REVENUE),
    lessonKey: lessonKeyParam,
  }),
  z.object({
    operation: z.literal(SQL_OPERATION),
    query: z.string().max(MAX_SQL_QUERY_CHARS),
    lessonKey: lessonKeyParam,
  }),
])

const labRateLimit = rateLimit({
  windowMs: Number(process.env.SKYLENT_LABS_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.SKYLENT_LABS_RATE_LIMIT_MAX ?? 40),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(request: AuthenticatedRequest) {
    const userId = request.auth?.user.id
    if (userId) return `user:${userId}`
    return ipKeyGenerator(request.ip ?? "127.0.0.1")
  },
  handler(_request, response) {
    response.status(429).json({ error: "Skylent Labs could not finish that request. Try again." })
  },
})

function parseLabParams(req: AuthenticatedRequest) {
  const course = slugParam.safeParse(req.params.courseSlug)
  const lab = slugParam.safeParse(req.params.labSlug)
  if (!course.success || !lab.success) return null
  return { courseSlug: course.data, labSlug: lab.data }
}

function sendLabError(res: import("express").Response, error: unknown) {
  if (error instanceof LabServiceError) {
    if (error.code === "not_found") {
      res.status(404).json({ error: error.message })
      return
    }
    if (error.code === "forbidden") {
      res.status(403).json({ error: error.message })
      return
    }
    if (error.code === "invalid_operation" || error.code === "invalid_request") {
      res.status(400).json({ error: error.message })
      return
    }
    if (error.code === "query_expensive") {
      res.status(400).json({ error: error.message })
      return
    }
    if (error.code === "query_error") {
      res.status(400).json({ error: error.message })
      return
    }
  }
  console.error("Skylent Labs failed:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown")
  res.status(500).json({ error: "Skylent Labs could not finish that request. Try again." })
}

labsRouter.get("/:courseSlug/:labSlug", requireAuth, async (req: AuthenticatedRequest, res) => {
  const params = parseLabParams(req)
  if (!params) {
    res.status(400).json({ error: "Invalid lab" })
    return
  }
  const lessonParsed = lessonKeyParam.safeParse(
    typeof req.query.lesson === "string" ? req.query.lesson : undefined,
  )
  if (!lessonParsed.success) {
    res.status(400).json({ error: "Invalid lesson" })
    return
  }
  try {
    const data = await getLabWorkspace({
      userId: req.auth!.user.id,
      courseSlug: params.courseSlug,
      labSlug: params.labSlug,
      lessonKey: lessonParsed.data,
    })
    res.json({ data })
  } catch (error) {
    sendLabError(res, error)
  }
})

labsRouter.post(
  "/:courseSlug/:labSlug/sql/run",
  requireAuth,
  requireCsrf,
  labRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const params = parseLabParams(req)
    if (!params) {
      res.status(400).json({ error: "Invalid lab" })
      return
    }
    const body = sqlRunSchema.safeParse(req.body ?? {})
    if (!body.success) {
      const tooLarge = body.error.issues.some((issue) => issue.code === "too_big" && issue.path.includes("query"))
      res.status(400).json({
        error: tooLarge
          ? "That query is too large or expensive to run. Try a smaller query."
          : "Invalid request",
      })
      return
    }
    try {
      const data = await executeNorthwindSql({
        userId: req.auth!.user.id,
        courseSlug: params.courseSlug,
        labSlug: params.labSlug,
        query: body.data.query,
      })
      res.json({ data })
    } catch (error) {
      sendLabError(res, error)
    }
  },
)

labsRouter.post(
  "/:courseSlug/:labSlug/run",
  requireAuth,
  requireCsrf,
  labRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const params = parseLabParams(req)
    if (!params) {
      res.status(400).json({ error: "Invalid lab" })
      return
    }
    const body = runSchema.safeParse(req.body ?? {})
    if (!body.success) {
      res.status(400).json({ error: "Invalid operation" })
      return
    }
    try {
      const data = await executeLabOperation({
        userId: req.auth!.user.id,
        courseSlug: params.courseSlug,
        labSlug: params.labSlug,
        operation: body.data.operation,
      })
      res.json({ data })
    } catch (error) {
      sendLabError(res, error)
    }
  },
)

labsRouter.post(
  "/:courseSlug/:labSlug/work",
  requireAuth,
  requireCsrf,
  labRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const params = parseLabParams(req)
    if (!params) {
      res.status(400).json({ error: "Invalid lab" })
      return
    }
    const body = saveSchema.safeParse(req.body ?? {})
    if (!body.success) {
      res.status(400).json({ error: "Invalid request" })
      return
    }
    try {
      const data = await saveLabWork({
        userId: req.auth!.user.id,
        courseSlug: params.courseSlug,
        labSlug: params.labSlug,
        operation: body.data.operation,
        lessonKey: body.data.lessonKey,
        query: body.data.operation === SQL_OPERATION ? body.data.query : undefined,
      })
      res.status(201).json({ data })
    } catch (error) {
      sendLabError(res, error)
    }
  },
)

labsRouter.get("/:courseSlug/:labSlug/work", requireAuth, async (req: AuthenticatedRequest, res) => {
  const params = parseLabParams(req)
  if (!params) {
    res.status(400).json({ error: "Invalid lab" })
    return
  }
  try {
    const data = await listLabWork({
      userId: req.auth!.user.id,
      courseSlug: params.courseSlug,
      labSlug: params.labSlug,
    })
    res.json({ data })
  } catch (error) {
    sendLabError(res, error)
  }
})

labsRouter.get("/:courseSlug/:labSlug/work/:workId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const params = parseLabParams(req)
  const workId = workIdParam.safeParse(req.params.workId)
  if (!params || !workId.success) {
    res.status(400).json({ error: "Invalid request" })
    return
  }
  try {
    const data = await getSavedLabWork({
      userId: req.auth!.user.id,
      courseSlug: params.courseSlug,
      labSlug: params.labSlug,
      workId: workId.data,
    })
    res.json({ data })
  } catch (error) {
    sendLabError(res, error)
  }
})
