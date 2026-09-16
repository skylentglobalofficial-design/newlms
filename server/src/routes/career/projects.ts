import { Router } from "express"
import { z } from "zod"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { validationError } from "../../lib/career/shared.js"
import {
  CareerEvidenceError,
  findCareerLinkForLearnerProject,
  getCareerEvidenceProject,
  linkLearnerProjectToCareer,
  listCareerEvidenceProjects,
  unlinkCareerEvidenceProject,
} from "../../lib/career/evidence.js"

export const careerProjectsRouter = Router()

const uuidSchema = z.string().uuid()
const fromLearnerSchema = z.object({
  learnerProjectId: z.string().uuid(),
})

const careerRateLimit = rateLimit({
  windowMs: Number(process.env.SKYLENT_LABS_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.SKYLENT_LABS_RATE_LIMIT_MAX ?? 40),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(request: AuthenticatedRequest) {
    const userId = request.auth?.user.id
    if (userId) return `career:${userId}`
    return ipKeyGenerator(request.ip ?? "127.0.0.1")
  },
  handler(_request, response) {
    response.status(429).json({ error: "Could not update Career OS. Try again." })
  },
})

function sendCareerEvidenceError(res: import("express").Response, error: unknown) {
  if (error instanceof CareerEvidenceError) {
    if (error.code === "not_found") {
      res.status(404).json({ error: error.message })
      return
    }
    if (error.code === "forbidden") {
      res.status(403).json({ error: error.message })
      return
    }
    if (error.code === "incomplete") {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(400).json({ error: error.message })
    return
  }
  console.error("Career OS evidence failed:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown")
  res.status(500).json({ error: "Could not update Career OS. Try again." })
}

careerProjectsRouter.post(
  "/from-learner-project",
  requireAuth,
  requireCsrf,
  careerRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const parsed = fromLearnerSchema.safeParse(req.body ?? {})
    if (!parsed.success) return validationError(res, parsed.error)
    try {
      const result = await linkLearnerProjectToCareer(req.auth!.user.id, parsed.data.learnerProjectId)
      res.status(result.created ? 201 : 200).json({ data: result.project })
    } catch (error) {
      sendCareerEvidenceError(res, error)
    }
  },
)

careerProjectsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await listCareerEvidenceProjects(req.auth!.user.id)
    res.json({ data })
  } catch (error) {
    sendCareerEvidenceError(res, error)
  }
})

careerProjectsRouter.get(
  "/by-learner-project/:learnerProjectId",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const parsed = uuidSchema.safeParse(req.params.learnerProjectId)
    if (!parsed.success) return res.status(400).json({ error: "Invalid project." })
    try {
      const data = await findCareerLinkForLearnerProject(req.auth!.user.id, parsed.data)
      res.json({ data })
    } catch (error) {
      sendCareerEvidenceError(res, error)
    }
  },
)

careerProjectsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = uuidSchema.safeParse(req.params.id)
  if (!parsed.success) return res.status(400).json({ error: "Invalid project." })
  try {
    const data = await getCareerEvidenceProject(req.auth!.user.id, parsed.data)
    res.json({ data })
  } catch (error) {
    sendCareerEvidenceError(res, error)
  }
})

careerProjectsRouter.delete(
  "/:id",
  requireAuth,
  requireCsrf,
  careerRateLimit,
  async (req: AuthenticatedRequest, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) return res.status(400).json({ error: "Invalid project." })
    try {
      const data = await unlinkCareerEvidenceProject(req.auth!.user.id, parsed.data)
      res.json({ data })
    } catch (error) {
      sendCareerEvidenceError(res, error)
    }
  },
)
