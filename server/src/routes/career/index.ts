import { Router } from "express"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { CAREER_OS_UNAVAILABLE, readCareerOsAccess, requireCareerOsAccess } from "../../lib/career-os-access.js"
import { isDatabaseUnavailableError, isMissingSchemaError } from "../../lib/schema-capabilities.js"
import { profileRouter } from "./profile.js"
import { employerJobsRouter } from "./employer-jobs.js"
import { jobsRouter } from "./jobs.js"
import { savedJobsRouter } from "./saved-jobs.js"
import { applicationsRouter } from "./applications.js"
import { interviewsRouter } from "./interviews.js"
import { questionsRouter } from "./questions.js"
import { practiceRouter } from "./practice.js"
import { supportRouter } from "./support.js"
import { careerProjectsRouter } from "./projects.js"

export const careerRouter = Router()

careerRouter.get("/access", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const state = await readCareerOsAccess(req.auth!.user.id)
    if (state === "unavailable") return res.status(503).json(CAREER_OS_UNAVAILABLE)
    const entitled = state === "entitled"
    res.json({
      data: {
        locked: !entitled,
        entitled,
        note: entitled
          ? "This account has an explicit Career OS entitlement."
          : "Career OS is locked. Signing in, finishing a course, or joining Career Rise does not unlock it.",
      },
    })
  } catch (error) {
    console.error("Career OS access check failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json(CAREER_OS_UNAVAILABLE)
  }
})

careerRouter.post("/activate", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    await prisma.careerOsAccess.upsert({
      where: { userId },
      update: {},
      create: { userId, reason: "learner_workspace_activation" },
    })
    res.json({ data: { entitled: true, locked: false } })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(CAREER_OS_UNAVAILABLE)
    }
    console.error("Career OS activation failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json(CAREER_OS_UNAVAILABLE)
  }
})

careerRouter.use("/profile", requireCareerOsAccess, profileRouter)
careerRouter.use("/projects", requireCareerOsAccess, careerProjectsRouter)
careerRouter.use("/employer", employerJobsRouter)
careerRouter.use("/jobs", jobsRouter)
careerRouter.use("/saved-jobs", requireCareerOsAccess, savedJobsRouter)
careerRouter.use("/applications", requireCareerOsAccess, applicationsRouter)
careerRouter.use("/interviews", requireCareerOsAccess, interviewsRouter)
careerRouter.use("/questions", requireCareerOsAccess, questionsRouter)
careerRouter.use("/practice", requireCareerOsAccess, practiceRouter)
careerRouter.use("/support", requireCareerOsAccess, supportRouter)
