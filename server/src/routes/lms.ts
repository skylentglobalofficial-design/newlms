import crypto from "node:crypto"
import { Router } from "express"
import multer from "multer"
import { z } from "zod"
import { AssignmentStatus, CurriculumNodeType } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import {
  attachAuth,
  requireAuth,
  requireCsrf,
  type AuthenticatedRequest,
} from "../lib/auth.js"
import {
  buildPendingAttachmentRecord,
  formatAttachmentApiRecord,
  LOCAL_STORAGE_PROVIDER,
  sanitizeAttachmentFileName,
} from "../lib/assignment-attachments.js"
import {
  formatAssignmentBrief,
  projectSubmissionRequirements,
  resolveDatasetAbsolutePath,
} from "../lib/assignment-brief.js"
import {
  buildLocalStorageKey,
  deleteLocalArtifact,
  isStoredBinaryAttachment,
  readLocalArtifact,
  writeLocalArtifact,
} from "../lib/artifact-storage.js"
import {
  getArtifactMaxBytes,
  validateProjectArtifactBuffer,
} from "../lib/artifact-validation.js"
import {
  assertLessonUnlocked,
  buildCourseWorkspace,
  computeResume,
  findCourseBySlug,
  findNodeByLessonKey,
  findProgramBySlug,
  flattenNodes,
  formatVideoMedia,
  getPrimaryEnrollment,
  lessonKey,
  loadLessonStates,
  resolveCourseEnrollment,
  syncCertificateState,
} from "../lib/lms.js"

export const lmsRouter = Router()

const artifactUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getArtifactMaxBytes(),
    files: 1,
  },
})

const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

const lessonKeySchema = z.object({
  lessonKey: z.string().min(1).max(40),
})

const enrollSchema = z
  .object({
    courseSlug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    programSlug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  })
  .refine((data) => Boolean(data.courseSlug ?? data.programSlug), {
    message: "courseSlug or programSlug is required",
    path: ["courseSlug"],
  })

const attachmentSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  byteSize: z.number().int().min(1).max(50_000_000),
})

const progressPatchSchema = z.object({
  action: z.enum(["access", "complete"]),
})

const quizAttemptSchema = z.object({
  answers: z.array(z.number().int().min(0)),
})

const assignmentPatchSchema = z.object({
  action: z.enum(["start", "submit"]),
  /** Written analysis for projects may be 400–800 words (~5–8k chars); keep headroom. */
  responseText: z.string().max(20000).optional(),
  attachments: z.array(attachmentSchema).max(5).optional(),
})

async function requireEnrollment(userId: string, courseId: string) {
  return resolveCourseEnrollment(userId, courseId)
}

async function loadCourseContext(userId: string, courseSlug: string) {
  const course = await findCourseBySlug(courseSlug)
  if (!course) return { error: "not_found" as const }
  const enrollment = await requireEnrollment(userId, course.id)
  if (!enrollment) return { error: "forbidden" as const, course }
  const lessonStates = await loadLessonStates(enrollment, course)
  return { course, enrollment, lessonStates }
}

lmsRouter.get("/dashboard", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const enrollment = await getPrimaryEnrollment(userId)

    if (!enrollment?.course) {
      return res.json({ data: null })
    }

    const workspace = await buildCourseWorkspace(enrollment)
    res.json({ data: workspace })
  } catch (error) {
    console.error("Failed to load LMS dashboard:", error)
    res.status(500).json({ error: "Failed to load dashboard" })
  }
})

lmsRouter.get("/enrollments", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const enrollments = await prisma.userEnrollment.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        course: { select: { slug: true, title: true } },
        program: { select: { slug: true, name: true } },
      },
    })

    res.json({
      data: enrollments.map((entry) => ({
        id: entry.id,
        status: entry.status,
        courseSlug: entry.course?.slug ?? null,
        courseTitle: entry.course?.title ?? null,
        programSlug: entry.program?.slug ?? null,
        programName: entry.program?.name ?? null,
        certificateEligible: entry.certificateEligible,
        certificateStatus: entry.certificateStatus,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Failed to list enrollments:", error)
    res.status(500).json({ error: "Failed to list enrollments" })
  }
})

lmsRouter.post("/enrollments", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = enrollSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const userId = req.auth!.user.id

    if (parsed.data.programSlug) {
      const program = await findProgramBySlug(parsed.data.programSlug)
      if (!program) return res.status(404).json({ error: "Program not found" })
      if (program.programCourses.length === 0) {
        return res.status(400).json({ error: "Program has no linked courses" })
      }

      const existing = await prisma.userEnrollment.findUnique({
        where: { userId_programId: { userId, programId: program.id } },
      })
      const primaryCourse = program.programCourses[0].course
      if (existing) {
        const workspace = await buildCourseWorkspace({ ...existing, course: primaryCourse })
        return res.json({ data: workspace })
      }

      const enrollment = await prisma.userEnrollment.create({
        data: { userId, programId: program.id, status: "active" },
      })
      const workspace = await buildCourseWorkspace({ ...enrollment, course: primaryCourse })
      return res.status(201).json({ data: workspace })
    }

    const course = await findCourseBySlug(parsed.data.courseSlug!)
    if (!course) return res.status(404).json({ error: "Course not found" })

    const existing = await prisma.userEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    })
    if (existing) {
      const workspace = await buildCourseWorkspace({ ...existing, course })
      return res.json({ data: workspace })
    }

    const enrollment = await prisma.userEnrollment.create({
      data: { userId, courseId: course.id, status: "active" },
    })
    const workspace = await buildCourseWorkspace({ ...enrollment, course })
    return res.status(201).json({ data: workspace })
  } catch (error) {
    console.error("Failed to enroll:", error)
    res.status(500).json({ error: "Failed to enroll" })
  }
})

lmsRouter.get("/courses/:slug/access", async (req, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const course = await findCourseBySlug(parsed.data.slug)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const auth = await attachAuth(req as AuthenticatedRequest)
    if (!auth) {
      return res.json({
        data: {
          authenticated: false,
          enrolled: false,
          canAccess: false,
          reason: "login_required",
        },
      })
    }

    const enrollment = await requireEnrollment(auth.user.id, course.id)
    if (!enrollment) {
      return res.json({
        data: {
          authenticated: true,
          enrolled: false,
          canAccess: false,
          reason: "not_enrolled",
          courseSlug: course.slug,
          courseTitle: course.title,
        },
      })
    }

    res.json({
      data: {
        authenticated: true,
        enrolled: true,
        canAccess: true,
        enrollmentId: enrollment.id,
        courseSlug: course.slug,
        courseTitle: course.title,
      },
    })
  } catch (error) {
    console.error("Failed to check course access:", error)
    res.status(500).json({ error: "Failed to check access" })
  }
})

lmsRouter.get("/courses/:slug", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const course = await findCourseBySlug(parsed.data.slug)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in this course" })
    }

    const workspace = await buildCourseWorkspace({ ...enrollment, course })
    res.json({ data: workspace })
  } catch (error) {
    console.error("Failed to load course workspace:", error)
    res.status(500).json({ error: "Failed to load course" })
  }
})

lmsRouter.get("/courses/:slug/resume", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const course = await findCourseBySlug(parsed.data.slug)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in this course" })
    }

    const lessonStates = await loadLessonStates(enrollment, course)
    const resume = computeResume(course, lessonStates, enrollment.lastAccessedNodeId)
    res.json({ data: resume })
  } catch (error) {
    console.error("Failed to compute resume:", error)
    res.status(500).json({ error: "Failed to compute resume" })
  }
})

lmsRouter.post(
  "/courses/:slug/lessons/:lessonKey/progress",
  requireAuth,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const bodyParsed = progressPatchSchema.safeParse(req.body)

    if (!slugParsed.success || !lessonParsed.success || !bodyParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located) return res.status(404).json({ error: "Lesson not found" })

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const now = new Date()
      const isComplete = bodyParsed.data.action === "complete"

      const progress = await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        create: {
          enrollmentId: enrollment.id,
          nodeId: located.node.id,
          startedAt: now,
          lastAccessedAt: now,
          completedAt: isComplete ? now : null,
        },
        update: {
          lastAccessedAt: now,
          ...(isComplete ? { completedAt: now } : {}),
        },
      })

      await prisma.userEnrollment.update({
        where: { id: enrollment.id },
        data: { lastAccessedNodeId: located.node.id },
      })

      if (isComplete) {
        await syncCertificateState(enrollment.id, course.id)
      }

      const updatedStates = await loadLessonStates(enrollment, course)
      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          state: updatedStates[lessonParsed.data.lessonKey],
          progress: progress.completedAt
            ? { completedAt: progress.completedAt.toISOString() }
            : { lastAccessedAt: progress.lastAccessedAt.toISOString() },
        },
      })
    } catch (error) {
      console.error("Failed to update lesson progress:", error)
      res.status(500).json({ error: "Failed to update progress" })
    }
  },
)

lmsRouter.get(
  "/courses/:slug/lessons/:lessonKey/practice",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located) return res.status(404).json({ error: "Lesson not found" })

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const practice = await prisma.lessonPractice.findUnique({
        where: { nodeId: located.node.id },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      })

      if (!practice) {
        return res.status(404).json({ error: "Practice content isn't available yet." })
      }

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          lessonTitle: located.node.title,
          moduleId: located.module.sourceId ?? `m${located.module.order + 1}`,
          moduleTitle: located.module.title,
          courseSlug: course.slug,
          courseTitle: course.title,
          interactionType: practice.interactionType,
          context: practice.context,
          task: practice.task,
          preferredOptionKey: practice.preferredOptionKey,
          options: practice.options.map((option) => ({
            id: option.optionKey,
            label: option.label,
            teachingFeedback: option.teachingFeedback,
          })),
        },
      })
    } catch (error) {
      console.error("Failed to load lesson practice:", error)
      res.status(500).json({ error: "Failed to load lesson practice" })
    }
  },
)

lmsRouter.get(
  "/courses/:slug/lessons/:lessonKey/quiz",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.QUIZ) {
        return res.status(404).json({ error: "Quiz lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const questions = await prisma.quizQuestion.findMany({
        where: { nodeId: located.node.id },
        orderBy: { sortOrder: "asc" },
      })

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          questions: questions.map((q) => ({
            id: q.id,
            q: q.question,
            options: q.options as string[],
          })),
        },
      })
    } catch (error) {
      console.error("Failed to load quiz:", error)
      res.status(500).json({ error: "Failed to load quiz" })
    }
  },
)

lmsRouter.post(
  "/courses/:slug/lessons/:lessonKey/quiz/attempts",
  requireAuth,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const bodyParsed = quizAttemptSchema.safeParse(req.body)
    if (!slugParsed.success || !lessonParsed.success || !bodyParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.QUIZ) {
        return res.status(404).json({ error: "Quiz lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const questions = await prisma.quizQuestion.findMany({
        where: { nodeId: located.node.id },
        orderBy: { sortOrder: "asc" },
      })

      if (questions.length === 0) {
        return res.status(400).json({ error: "Quiz has no questions" })
      }

      if (bodyParsed.data.answers.length !== questions.length) {
        return res.status(400).json({ error: "Answer count mismatch" })
      }

      const score = questions.reduce((total, question, index) => {
        return total + (bodyParsed.data.answers[index] === question.correctIndex ? 1 : 0)
      }, 0)
      const passed = score === questions.length

      const priorAttempts = await prisma.quizAttempt.count({
        where: { enrollmentId: enrollment.id, nodeId: located.node.id },
      })

      const attempt = await prisma.quizAttempt.create({
        data: {
          userId: req.auth!.user.id,
          enrollmentId: enrollment.id,
          nodeId: located.node.id,
          attemptNumber: priorAttempts + 1,
          score,
          totalQuestions: questions.length,
          passed,
          answers: bodyParsed.data.answers,
        },
      })

      const now = new Date()
      if (passed) {
        await prisma.lessonProgress.upsert({
          where: {
            enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
          },
          create: {
            enrollmentId: enrollment.id,
            nodeId: located.node.id,
            startedAt: now,
            lastAccessedAt: now,
            completedAt: now,
          },
          update: {
            lastAccessedAt: now,
            completedAt: now,
          },
        })
        await prisma.userEnrollment.update({
          where: { id: enrollment.id },
          data: { lastAccessedNodeId: located.node.id },
        })
        await syncCertificateState(enrollment.id, course.id)
      } else {
        await prisma.lessonProgress.upsert({
          where: {
            enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
          },
          create: {
            enrollmentId: enrollment.id,
            nodeId: located.node.id,
            startedAt: now,
            lastAccessedAt: now,
          },
          update: { lastAccessedAt: now },
        })
      }

      res.status(201).json({
        data: {
          attemptId: attempt.id,
          attemptNumber: attempt.attemptNumber,
          score,
          totalQuestions: questions.length,
          passed,
          submittedAt: attempt.submittedAt.toISOString(),
        },
      })
    } catch (error) {
      console.error("Failed to submit quiz attempt:", error)
      res.status(500).json({ error: "Failed to submit quiz attempt" })
    }
  },
)


lmsRouter.get(
  "/courses/:slug/lessons/:lessonKey/assignment",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.ASSIGNMENT) {
        return res.status(404).json({ error: "Assignment lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const [assignment, brief] = await Promise.all([
        prisma.assignmentProgress.findUnique({
          where: {
            enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
          },
          include: { attachments: true },
        }),
        prisma.assignmentBrief.findUnique({ where: { nodeId: located.node.id } }),
      ])

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          title: located.node.title,
          status: assignment?.status ?? AssignmentStatus.not_started,
          submittedAt: assignment?.submittedAt?.toISOString() ?? null,
          responseText: assignment?.responseText ?? null,
          attachments:
            assignment?.attachments.map((file) =>
              formatAttachmentApiRecord(file, {
                slug: slugParsed.data.slug,
                lessonKey: lessonParsed.data.lessonKey,
              }),
            ) ?? [],
          brief: formatAssignmentBrief(brief, slugParsed.data.slug, lessonParsed.data.lessonKey),
        },
      })
    } catch (error) {
      console.error("Failed to load assignment:", error)
      res.status(500).json({ error: "Failed to load assignment" })
    }
  },
)

lmsRouter.get(
  "/courses/:slug/lessons/:lessonKey/assignment/dataset",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.ASSIGNMENT) {
        return res.status(404).json({ error: "Assignment lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const brief = await prisma.assignmentBrief.findUnique({ where: { nodeId: located.node.id } })
      if (!brief?.datasetRelativePath || !brief.datasetFileName) {
        return res.status(404).json({ error: "Dataset not available for this assignment" })
      }

      const absolutePath = resolveDatasetAbsolutePath(brief.datasetRelativePath)
      if (!absolutePath) {
        return res.status(404).json({ error: "Dataset file not found" })
      }

      res.setHeader(
        "Content-Type",
        brief.datasetMimeType ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${brief.datasetFileName.replace(/"/g, "")}"`,
      )
      if (brief.datasetDisclaimer) {
        res.setHeader("X-Skylent-Dataset-Disclaimer", brief.datasetDisclaimer.slice(0, 500))
      }
      return res.sendFile(absolutePath)
    } catch (error) {
      console.error("Failed to download assignment dataset:", error)
      res.status(500).json({ error: "Failed to download dataset" })
    }
  },
)

lmsRouter.post(
  "/courses/:slug/lessons/:lessonKey/assignment/artifact",
  requireAuth,
  requireCsrf,
  (req, res, next) => {
    artifactUpload.single("artifact")(req, res, (error: unknown) => {
      if (!error) return next()
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: `Artifact exceeds maximum size of ${getArtifactMaxBytes()} bytes`,
          })
        }
        return res.status(400).json({ error: `Upload failed: ${error.message}` })
      }
      return res.status(400).json({ error: "Upload failed" })
    })
  },
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({ error: "Missing artifact file field (artifact)" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.ASSIGNMENT) {
        return res.status(404).json({ error: "Assignment lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const brief = await prisma.assignmentBrief.findUnique({ where: { nodeId: located.node.id } })
      const projectRules = projectSubmissionRequirements(brief?.content)
      if (!projectRules.isProject) {
        return res.status(400).json({
          error: "Binary artifact upload is only enabled for authored project assignments",
        })
      }

      const originalName = sanitizeAttachmentFileName(file.originalname || "artifact.bin")
      const validation = validateProjectArtifactBuffer(originalName, file.mimetype, file.buffer)
      if (!validation.ok) {
        return res.status(400).json({ error: validation.error })
      }

      const now = new Date()
      const assignment = await prisma.assignmentProgress.upsert({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        create: {
          userId: req.auth!.user.id,
          enrollmentId: enrollment.id,
          nodeId: located.node.id,
          status: AssignmentStatus.in_progress,
        },
        update: {
          updatedAt: now,
        },
      })

      const existing = await prisma.assignmentAttachment.findMany({
        where: { assignmentProgressId: assignment.id },
      })
      for (const old of existing) {
        if (old.storageProvider === LOCAL_STORAGE_PROVIDER) {
          await deleteLocalArtifact(old.storageKey)
        }
      }
      if (existing.length) {
        await prisma.assignmentAttachment.deleteMany({ where: { assignmentProgressId: assignment.id } })
      }

      const attachmentId = crypto.randomUUID()
      const storageKey = buildLocalStorageKey({
        userId: req.auth!.user.id,
        enrollmentId: enrollment.id,
        nodeId: located.node.id,
        attachmentId,
        extension: validation.policy.extension,
      })
      await writeLocalArtifact(storageKey, file.buffer)

      const created = await prisma.assignmentAttachment.create({
        data: {
          id: attachmentId,
          assignmentProgressId: assignment.id,
          fileName: originalName,
          mimeType: validation.policy.canonicalMime,
          byteSize: file.buffer.byteLength,
          storageProvider: LOCAL_STORAGE_PROVIDER,
          storageKey,
        },
      })

      await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        create: {
          enrollmentId: enrollment.id,
          nodeId: located.node.id,
          startedAt: now,
          lastAccessedAt: now,
        },
        update: { lastAccessedAt: now },
      })

      res.status(201).json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          status: assignment.status,
          attachment: formatAttachmentApiRecord(created, {
            slug: slugParsed.data.slug,
            lessonKey: lessonParsed.data.lessonKey,
          }),
        },
      })
    } catch (error) {
      console.error("Failed to upload assignment artifact:", error)
      res.status(500).json({ error: "Failed to upload assignment artifact" })
    }
  },
)

lmsRouter.get(
  "/courses/:slug/lessons/:lessonKey/assignment/attachments/:attachmentId",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const attachmentId = z.string().uuid().safeParse(req.params.attachmentId)
    if (!slugParsed.success || !lessonParsed.success || !attachmentId.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.ASSIGNMENT) {
        return res.status(404).json({ error: "Assignment lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const attachment = await prisma.assignmentAttachment.findUnique({
        where: { id: attachmentId.data },
        include: {
          assignmentProgress: {
            select: {
              userId: true,
              enrollmentId: true,
              nodeId: true,
            },
          },
        },
      })
      if (!attachment) return res.status(404).json({ error: "Attachment not found" })

      // Owner-only download for now (faculty download can reuse this with a later role check).
      if (
        attachment.assignmentProgress.userId !== req.auth!.user.id ||
        attachment.assignmentProgress.enrollmentId !== enrollment.id ||
        attachment.assignmentProgress.nodeId !== located.node.id
      ) {
        return res.status(403).json({ error: "Not authorized to download this attachment" })
      }

      if (!isStoredBinaryAttachment(attachment)) {
        return res.status(404).json({ error: "Attachment binary is not available" })
      }

      const bytes = await readLocalArtifact(attachment.storageKey)
      if (!bytes) {
        return res.status(404).json({ error: "Attachment binary is missing from storage" })
      }

      res.setHeader("Content-Type", attachment.mimeType)
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${attachment.fileName.replace(/"/g, "")}"`,
      )
      res.setHeader("Content-Length", String(bytes.byteLength))
      res.send(bytes)
    } catch (error) {
      console.error("Failed to download assignment attachment:", error)
      res.status(500).json({ error: "Failed to download attachment" })
    }
  },
)

lmsRouter.post(
  "/courses/:slug/lessons/:lessonKey/assignment",
  requireAuth,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const bodyParsed = assignmentPatchSchema.safeParse(req.body)
    if (!slugParsed.success || !lessonParsed.success || !bodyParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.ASSIGNMENT) {
        return res.status(404).json({ error: "Assignment lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      const brief = await prisma.assignmentBrief.findUnique({ where: { nodeId: located.node.id } })
      const projectRules = projectSubmissionRequirements(brief?.content)

      const now = new Date()
      const isSubmit = bodyParsed.data.action === "submit"
      const hasText = Boolean(bodyParsed.data.responseText?.trim())
      const hasDeclaredAttachments = Boolean(bodyParsed.data.attachments?.length)

      // Load any already-uploaded stored binary for project completion checks.
      const existingProgress = await prisma.assignmentProgress.findUnique({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        include: { attachments: true },
      })
      const storedArtifacts =
        existingProgress?.attachments.filter((file) => isStoredBinaryAttachment(file)) ?? []

      if (isSubmit) {
        if (projectRules.isProject) {
          if (projectRules.requireWrittenAnalysis && !hasText) {
            return res.status(400).json({
              error: "Written analysis is required to submit this project",
            })
          }
          if (projectRules.requireStoredArtifact && storedArtifacts.length === 0) {
            return res.status(400).json({
              error:
                "A stored analytical artifact upload is required before submitting this project. Filename-only metadata is not sufficient.",
            })
          }
          // Reject attempts to complete via pending metadata-only attachments on projects.
          if (hasDeclaredAttachments) {
            return res.status(400).json({
              error:
                "Project submissions no longer accept attachment metadata in the JSON body. Upload the artifact binary first, then submit the written analysis.",
            })
          }
        } else if (!hasText && !hasDeclaredAttachments) {
          return res.status(400).json({
            error: "Response text or attachment metadata is required to submit",
          })
        }
      }

      const assignment = await prisma.assignmentProgress.upsert({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        create: {
          userId: req.auth!.user.id,
          enrollmentId: enrollment.id,
          nodeId: located.node.id,
          status: isSubmit ? AssignmentStatus.submitted : AssignmentStatus.in_progress,
          responseText: bodyParsed.data.responseText ?? null,
          submittedAt: isSubmit ? now : null,
        },
        update: {
          status: isSubmit ? AssignmentStatus.submitted : AssignmentStatus.in_progress,
          responseText: bodyParsed.data.responseText ?? undefined,
          submittedAt: isSubmit ? now : undefined,
        },
      })

      // Non-project assignments may still declare pending metadata attachments.
      if (isSubmit && !projectRules.isProject && bodyParsed.data.attachments?.length) {
        const prior = await prisma.assignmentAttachment.findMany({
          where: { assignmentProgressId: assignment.id },
        })
        for (const old of prior) {
          if (old.storageProvider === LOCAL_STORAGE_PROVIDER) {
            await deleteLocalArtifact(old.storageKey)
          }
        }
        await prisma.assignmentAttachment.deleteMany({ where: { assignmentProgressId: assignment.id } })
        await prisma.assignmentAttachment.createMany({
          data: bodyParsed.data.attachments.map((file) => ({
            assignmentProgressId: assignment.id,
            ...buildPendingAttachmentRecord(assignment.id, file),
          })),
        })
      }

      if (isSubmit) {
        await prisma.lessonProgress.upsert({
          where: {
            enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
          },
          create: {
            enrollmentId: enrollment.id,
            nodeId: located.node.id,
            startedAt: now,
            lastAccessedAt: now,
            completedAt: now,
          },
          update: {
            lastAccessedAt: now,
            completedAt: now,
          },
        })
        await prisma.userEnrollment.update({
          where: { id: enrollment.id },
          data: { lastAccessedNodeId: located.node.id },
        })
        await syncCertificateState(enrollment.id, course.id)
      } else {
        await prisma.lessonProgress.upsert({
          where: {
            enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
          },
          create: {
            enrollmentId: enrollment.id,
            nodeId: located.node.id,
            startedAt: now,
            lastAccessedAt: now,
          },
          update: { lastAccessedAt: now },
        })
      }

      const attachments = await prisma.assignmentAttachment.findMany({
        where: { assignmentProgressId: assignment.id },
      })

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          status: assignment.status,
          submittedAt: assignment.submittedAt?.toISOString() ?? null,
          responseText: assignment.responseText,
          attachments: attachments.map((file) =>
            formatAttachmentApiRecord(file, {
              slug: slugParsed.data.slug,
              lessonKey: lessonParsed.data.lessonKey,
            }),
          ),
          brief: formatAssignmentBrief(brief, slugParsed.data.slug, lessonParsed.data.lessonKey),
        },
      })
    } catch (error) {
      console.error("Failed to update assignment:", error)
      res.status(500).json({ error: "Failed to update assignment" })
    }
  },
)

lmsRouter.get(
  "/courses/:slug/lessons/:lessonKey/media",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const course = await findCourseBySlug(slugParsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })

      const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

      const located = await findNodeByLessonKey(course, lessonParsed.data.lessonKey)
      if (!located || located.node.nodeType !== CurriculumNodeType.VIDEO) {
        return res.status(404).json({ error: "Video lesson not found" })
      }

      const lessonStates = await loadLessonStates(enrollment, course)
      const unlock = assertLessonUnlocked(course, lessonParsed.data.lessonKey, lessonStates)
      if (!unlock.ok) return res.status(unlock.status).json(unlock.body)

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          title: located.node.title,
          duration: located.node.duration,
          media: formatVideoMedia(located.node),
        },
      })
    } catch (error) {
      console.error("Failed to load lesson media:", error)
      res.status(500).json({ error: "Failed to load lesson media" })
    }
  },
)

lmsRouter.get("/courses/:slug/certificate", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const course = await findCourseBySlug(parsed.data.slug)
    if (!course) return res.status(404).json({ error: "Course not found" })

    const enrollment = await requireEnrollment(req.auth!.user.id, course.id)
    if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

    const lessonStates = await loadLessonStates(enrollment, course)
    const items = flattenNodes(course)
    const requirements = items.map((item) => ({
      lessonKey: item.lessonKey,
      title: item.node.title,
      complete: lessonStates[item.lessonKey]?.complete ?? false,
    }))

    res.json({
      data: {
        certificateEligible: enrollment.certificateEligible,
        certificateStatus: enrollment.certificateStatus,
        requirements,
        allComplete: requirements.every((r) => r.complete),
      },
    })
  } catch (error) {
    console.error("Failed to load certificate state:", error)
    res.status(500).json({ error: "Failed to load certificate state" })
  }
})
