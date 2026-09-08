import { Router } from "express"
import { requireAuth } from "../../lib/auth.js"
import { requireRoles } from "../../lib/roles.js"
import { profileRouter } from "./profile.js"
import { jobsRouter } from "./jobs.js"
import { savedJobsRouter } from "./saved-jobs.js"
import { applicationsRouter } from "./applications.js"
import { interviewsRouter } from "./interviews.js"
import { questionsRouter } from "./questions.js"
import { practiceRouter } from "./practice.js"
import { supportRouter } from "./support.js"

export const careerRouter = Router()

const studentCareerAccess = [requireAuth, requireRoles("student")]

careerRouter.use("/profile", studentCareerAccess, profileRouter)
careerRouter.use("/jobs", jobsRouter)
careerRouter.use("/saved-jobs", studentCareerAccess, savedJobsRouter)
careerRouter.use("/applications", studentCareerAccess, applicationsRouter)
careerRouter.use("/interviews", studentCareerAccess, interviewsRouter)
careerRouter.use("/questions", questionsRouter)
careerRouter.use("/practice", studentCareerAccess, practiceRouter)
careerRouter.use("/support", studentCareerAccess, supportRouter)
