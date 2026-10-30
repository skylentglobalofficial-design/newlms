import { Router } from "express"
import { z } from "zod"
import { CurriculumNodeType } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import { findCourseBySlug, findNodeByLessonKey, formatVideoMedia } from "../lib/lms.js"
import {
  curriculumNodeSelect,
  isDatabaseUnavailableError,
  isMissingSchemaError,
  readSchemaCapabilities,
} from "../lib/schema-capabilities.js"
import { isMuxPlaybackId, muxPlaybackIdSchemaMessage } from "../lib/media/playback-id.js"
import { validationError } from "../lib/career/shared.js"

export const adminMediaRouter = Router()

const guards = [requireAuth, requireRoles("superadmin")] as const

const bodySchema = z.object({
  muxPlaybackId: z.string().trim().nullable(),
})

adminMediaRouter.patch(
  "/courses/:slug/lessons/:lessonKey/media",
  ...guards,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const params = z.object({
      slug: z.string().trim().min(1).max(120),
      lessonKey: z.string().trim().min(1).max(80),
    }).safeParse(req.params)
    const body = bodySchema.safeParse(req.body)
    if (!params.success) return res.status(400).json({ error: "Invalid lesson" })
    if (!body.success) return validationError(res, body.error)
    if (body.data.muxPlaybackId !== null && !isMuxPlaybackId(body.data.muxPlaybackId)) {
      return res.status(400).json({ error: muxPlaybackIdSchemaMessage })
    }

    try {
      const course = await findCourseBySlug(params.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })
      const located = await findNodeByLessonKey(course, params.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.VIDEO) {
        return res.status(404).json({ error: "Video lesson not found" })
      }
      const quizLimits = (await readSchemaCapabilities()).curriculumNodeQuizLimits
      const node = await prisma.curriculumNode.update({
        where: { id: located.node.id },
        data: { muxPlaybackId: body.data.muxPlaybackId },
        select: curriculumNodeSelect(quizLimits),
      })
      res.json({
        data: {
          lessonKey: params.data.lessonKey,
          media: formatVideoMedia(node),
        },
      })
    } catch (error) {
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json({ error: "Lesson media is not available right now.", code: "unavailable" })
      }
      console.error("Failed to update lesson media:", error instanceof Error ? error.name : "unknown")
      res.status(500).json({ error: "Failed to update lesson media" })
    }
  },
)
