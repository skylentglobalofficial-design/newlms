import { Router } from "express"
import { requireAuth, type AuthenticatedRequest } from "../../lib/auth.js"
import { hasCareerOsAccess, requireCareerOsAccess } from "../../lib/career-os-access.js"
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
  const entitled = await hasCareerOsAccess(req.auth!.user.id)
  res.json({
    data: {
      locked: !entitled,
      entitled,
      note: entitled
        ? "This account has an explicit Career OS entitlement."
        : "Career OS is locked. Signing in, finishing a course, or joining Career Rise does not unlock it.",
    },
  })
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
