import { Router } from "express"
import { z } from "zod"
import { AssignmentStatus, CurriculumNodeType } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import {
  attachAuth,
  requireAuth,
  requireCsrf,
  type AuthenticatedRequest,
} from "../lib/auth.js"
import { buildPendingAttachmentRecord } from "../lib/assignment-attachments.js"
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
  responseText: z.string().max(10000).optional(),
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

      const assignment = await prisma.assignmentProgress.findUnique({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        include: { attachments: true },
      })

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          status: assignment?.status ?? "not_started",
          submittedAt: assignment?.submittedAt?.toISOString() ?? null,
          attachments: assignment?.attachments.map((file) => ({
            id: file.id,
            fileName: file.fileName,
            mimeType: file.mimeType,
            byteSize: file.byteSize,
            storageProvider: file.storageProvider,
          })) ?? [],
        },
      })
    } catch (error) {
      console.error("Failed to load assignment:", error)
      res.status(500).json({ error: "Failed to load assignment" })
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

      const now = new Date()
      const isSubmit = bodyParsed.data.action === "submit"
      const hasText = Boolean(bodyParsed.data.responseText?.trim())
      const hasAttachments = Boolean(bodyParsed.data.attachments?.length)
      if (isSubmit && !hasText && !hasAttachments) {
        return res.status(400).json({ error: "Response text or attachment metadata is required to submit" })
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

      if (isSubmit && bodyParsed.data.attachments?.length) {
        await prisma.$transaction(async (tx) => {
          await tx.assignmentAttachment.deleteMany({ where: { assignmentProgressId: assignment.id } })
          for (const file of bodyParsed.data.attachments ?? []) {
            await tx.assignmentAttachment.create({
              data: {
                assignmentProgressId: assignment.id,
                ...buildPendingAttachmentRecord(assignment.id, file),
              },
            })
          }
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

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          status: assignment.status,
          submittedAt: assignment.submittedAt?.toISOString() ?? null,
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
