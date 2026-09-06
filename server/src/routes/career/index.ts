import { Router } from "express"
import { profileRouter } from "./profile.js"
import { jobsRouter } from "./jobs.js"
import { savedJobsRouter } from "./saved-jobs.js"
import { applicationsRouter } from "./applications.js"
import { interviewsRouter } from "./interviews.js"
import { questionsRouter } from "./questions.js"
import { practiceRouter } from "./practice.js"
import { supportRouter } from "./support.js"

export const careerRouter = Router()

careerRouter.use("/profile", profileRouter)
careerRouter.use("/jobs", jobsRouter)
careerRouter.use("/saved-jobs", savedJobsRouter)
careerRouter.use("/applications", applicationsRouter)
careerRouter.use("/interviews", interviewsRouter)
careerRouter.use("/questions", questionsRouter)
careerRouter.use("/practice", practiceRouter)
careerRouter.use("/support", supportRouter)
