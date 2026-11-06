import { createFacultyDoubtTicket, listLearnerDoubtTickets, type FacultyDoubtTicket } from "../lib/doubt-sla.js"
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
import { isAuthoredProgramme } from "../lib/authored-courses.js"
import { courseIsEnrolable } from "../lib/course-publication.js"
import { readConsent, recordPolicyAcceptance } from "../lib/policy.js"
import { answersInOptionRange, QuizAttemptThrottled, QuizMaxAttemptsExceeded, recordScoredQuizAttempt } from "../lib/quiz-attempts.js"
import { awardCourseEnrolmentElixir, awardVerifiedLearning } from "../lib/elixir.js"
import {
  capabilityAvailable,
  isDatabaseUnavailableError,
  isMissingSchemaError,
  quizQuestionSelect,
  readSchemaCapabilities,
  UNAVAILABLE_MESSAGES,
  unavailableBody,
} from "../lib/schema-capabilities.js"
import {
  assertLessonUnlocked,
  buildCourseWorkspace,
  computeResume,
  findCourseBySlug,
  findNodeByLessonKey,
  attachProgramWorkspace,
  buildProgramWorkspace,
  findProgramBySlug,
  flattenNodes,
  formatVideoMedia,
  loadLearnerDashboard,
  adoptProgrammeCourseProgress,
  loadLessonStates,
  resolveCourseEnrollment,
  summarizeEnrollmentCourses,
  syncCertificateState,
} from "../lib/lms.js"

export const lmsRouter = Router()

function sendLmsFailure(res: import("express").Response, error: unknown, fallback: string) {
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
    return res.status(503).json({ error: `${fallback} right now.`, code: "unavailable" })
  }
  console.error(fallback, error instanceof Error ? error.name : "unknown")
  return res.status(500).json({ error: fallback })
}

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

/** New enrolments only. Returns false after sending 503. Does not create a row. */
async function newEnrolmentPolicyReady(res: import("express").Response): Promise<boolean> {
  try {
    if ((await readSchemaCapabilities()).policyAcceptance) return true
  } catch (error) {
    console.error("Enrolment blocked: policy storage could not be checked:", error instanceof Error ? error.name : "schema check failed")
    res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.enrolment))
    return false
  }
  res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.enrolment))
  return false
}

async function loadQuizQuestions(nodeId: string) {
  const explanations = (await readSchemaCapabilities()).quizExplanations
  const rows = await prisma.quizQuestion.findMany({
    where: { nodeId },
    orderBy: { sortOrder: "asc" },
    select: quizQuestionSelect(explanations),
  })
  return rows.map((row) => ({
    ...row,
    explanation: "explanation" in row && row.explanation ? row.explanation : null,
  }))
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
    const workspace = await loadLearnerDashboard(req.auth!.user.id)
    res.json({ data: workspace })
  } catch (error) {
    sendLmsFailure(res, error, "Failed to load dashboard")
  }
})

lmsRouter.get("/enrollments", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const enrollments = await prisma.userEnrollment.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        course: { select: { slug: true, title: true } },
        program: {
          select: {
            slug: true,
            name: true,
            programCourses: {
              orderBy: { sortOrder: "asc" },
              select: { course: { select: { slug: true, title: true } } },
            },
          },
        },
      },
    })

    const data = await Promise.all(enrollments.map(async (entry) => {
      const linkedCourses =
        entry.program?.programCourses.map((link) => ({
          slug: link.course.slug,
          title: link.course.title,
        })) ??
        (entry.course ? [{ slug: entry.course.slug, title: entry.course.title }] : [])
      const linkedCourse = entry.course ?? entry.program?.programCourses[0]?.course ?? null
      const courses = await summarizeEnrollmentCourses(entry.id)
      return {
        id: entry.id,
        status: entry.status,
        courseSlug: linkedCourse?.slug ?? null,
        courseTitle: linkedCourse?.title ?? null,
        linkedCourses,
        courses,
        programSlug: entry.program?.slug ?? null,
        programName: entry.program?.name ?? null,
        certificateEligible: entry.certificateEligible,
        certificateStatus: entry.certificateStatus,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      }
    }))
    res.json({ data })
  } catch (error) {
    sendLmsFailure(res, error, "Failed to list enrollments")
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
      if (program.enrollmentStatus !== "OPEN") {
        const message =
          program.enrollmentStatus === "WAITLIST"
            ? "This programme is on waitlist and cannot be enrolled through this API"
            : "This programme is not open for enrollment"
        return res.status(400).json({ error: message })
      }
      if (program.programCourses.length === 0) {
        return res.status(400).json({ error: "Program has no linked courses" })
      }

      const hasAuthoredCourse = program.programCourses.some((link) => courseIsEnrolable(link.course))
      if (!hasAuthoredCourse) {
        return res.status(400).json({ error: "Program has no authored courses available for enrollment" })
      }

      const existing = await prisma.userEnrollment.findUnique({
        where: { userId_programId: { userId, programId: program.id } },
      })
      if (existing) {
        const programWorkspace = await buildProgramWorkspace(userId, program)
        const resumeSlug = programWorkspace?.resume.courseSlug
        const primaryCourse =
          program.programCourses.find((link) => link.course.slug === resumeSlug)?.course ??
          program.programCourses[0].course
        const workspace = await buildCourseWorkspace({ ...existing, course: primaryCourse })
        return res.json({ data: workspace ? { ...workspace, program: programWorkspace } : workspace })
      }

      // New programme enrolments only. An existing row above still reopens its workspace.
      const approvedProgramme = isAuthoredProgramme(program.slug)
      const everyLinkedCourseAuthored = program.programCourses.every((link) => courseIsEnrolable(link.course))
      if (!approvedProgramme || !everyLinkedCourseAuthored) {
        return res.status(400).json({ error: "This programme is not open for enrollment" })
      }

      // A new enrolment needs the terms accepted in this request. Opening an existing one (above) does not.
      const consent = readConsent(req.body)
      if (!consent.ok) return res.status(consent.status).json(consent.body)
      if (!(await newEnrolmentPolicyReady(res))) return
      const enrollment = await prisma.$transaction(async (tx) => {
        const created = await tx.userEnrollment.create({
          data: { userId, programId: program.id, status: "active" },
        })
        await recordPolicyAcceptance(tx, {
          context: "enrolment",
          policyVersion: consent.policyVersion,
          userId,
          reference: created.id,
        })
        return created
      })
      await awardCourseEnrolmentElixir({
        userId,
        enrollmentId: enrollment.id,
        slug: program.slug,
        title: program.name,
      })
      const workspace = await buildCourseWorkspace({
        ...enrollment,
        course: program.programCourses[0].course,
      })
      const programWorkspace = await buildProgramWorkspace(userId, program)
      return res.status(201).json({ data: workspace ? { ...workspace, program: programWorkspace } : workspace })
    }

    const course = await findCourseBySlug(parsed.data.courseSlug!)
    if (!course) return res.status(404).json({ error: "Course not found" })
    if (!courseIsEnrolable(course)) {
      return res.status(400).json({ error: "This course is not open for enrollment yet" })
    }

    const existing = await prisma.userEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    })
    if (existing) {
      const workspace = await buildCourseWorkspace({ ...existing, course })
      return res.json({ data: await attachProgramWorkspace(userId, workspace, null, course.id) })
    }

    const consent = readConsent(req.body)
    if (!consent.ok) return res.status(consent.status).json(consent.body)
    if (!(await newEnrolmentPolicyReady(res))) return
    const enrolled = await prisma.$transaction(async (tx) => {
      const created = await tx.userEnrollment.create({
        data: { userId, courseId: course.id, status: "active" },
      })
      await recordPolicyAcceptance(tx, {
        context: "enrolment",
        policyVersion: consent.policyVersion,
        userId,
        reference: created.id,
      })
      const moved = await adoptProgrammeCourseProgress(tx, userId, course.id, created.id)
      return { created, moved }
    })
    let enrollment = enrolled.created
    if (enrolled.moved) {
      await syncCertificateState(enrollment.id, course.id)
      enrollment = await prisma.userEnrollment.findUniqueOrThrow({ where: { id: enrollment.id } })
    }
    await awardCourseEnrolmentElixir({
      userId,
      enrollmentId: enrollment.id,
      slug: course.slug,
      title: course.title,
      listedPriceRupees: course.price,
    })
    const workspace = await buildCourseWorkspace({ ...enrollment, course })
    return res.status(201).json({ data: await attachProgramWorkspace(userId, workspace, null, course.id) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      console.error("Enrolment blocked: policy storage could not be checked:", error instanceof Error ? error.name : "schema check failed")
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.enrolment))
    }
    console.error("Failed to enroll:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to enroll" })
  }
})

lmsRouter.get("/courses/:slug/access", async (req, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    // The public access check only needs course identity metadata. Avoid loading
    // the full curriculum here so this lightweight endpoint cannot fail on
    // unrelated curriculum data/schema issues.
    const course = await prisma.course.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true, slug: true, title: true },
    })
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
    sendLmsFailure(res, error, "Failed to check access")
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
    res.json({ data: await attachProgramWorkspace(req.auth!.user.id, workspace, null, course.id) })
  } catch (error) {
    sendLmsFailure(res, error, "Failed to load course")
  }
})

lmsRouter.get("/programs/:slug/access", async (req, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const program = await findProgramBySlug(parsed.data.slug)
    if (!program) {
      return res.status(404).json({ error: "Program not found" })
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

    const workspace = await buildProgramWorkspace(auth.user.id, program)
    if (!workspace) {
      return res.json({
        data: {
          authenticated: true,
          enrolled: false,
          canAccess: false,
          reason: "not_enrolled",
          programSlug: program.slug,
          programName: program.name,
        },
      })
    }

    res.json({
      data: {
        authenticated: true,
        enrolled: true,
        canAccess: true,
        enrollmentId: workspace.enrollmentId,
        programSlug: program.slug,
        programName: program.name,
      },
    })
  } catch (error) {
    sendLmsFailure(res, error, "Failed to check access")
  }
})

lmsRouter.get("/programs/:slug", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const program = await findProgramBySlug(parsed.data.slug)
    if (!program) {
      return res.status(404).json({ error: "Program not found" })
    }

    const workspace = await buildProgramWorkspace(req.auth!.user.id, program)
    if (!workspace) {
      return res.status(403).json({ error: "Not enrolled in this programme" })
    }

    res.json({ data: workspace })
  } catch (error) {
    sendLmsFailure(res, error, "Failed to load programme")
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
    sendLmsFailure(res, error, "Failed to compute resume")
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

      if (isComplete) {
        if (located.node.nodeType === CurriculumNodeType.QUIZ) {
          const passedAttempt = await prisma.quizAttempt.findFirst({
            where: {
              enrollmentId: enrollment.id,
              nodeId: located.node.id,
              passed: true,
            },
            select: { id: true },
          })
          if (!passedAttempt) {
            return res.status(400).json({
              error: "Quiz must be passed before it can be completed",
            })
          }
        }

        if (located.node.nodeType === CurriculumNodeType.ASSIGNMENT) {
          const submission = await prisma.assignmentProgress.findUnique({
            where: {
              enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
            },
            select: { status: true },
          })
          if (submission?.status !== "submitted" && submission?.status !== "graded") {
            return res.status(400).json({
              error: "Assignment must be submitted before it can be completed",
            })
          }
        }
      }

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
        if (located.node.nodeType === CurriculumNodeType.NOTES || located.node.nodeType === CurriculumNodeType.VIDEO || located.node.nodeType === CurriculumNodeType.TOPIC) {
          await awardVerifiedLearning({
            userId: req.auth!.user.id,
            activity: "lesson_complete",
            sourceId: located.node.id,
            courseSlug: course.slug,
            lessonKey: lessonParsed.data.lessonKey,
          })
        }
      }

      const updatedStates = await loadLessonStates(enrollment, course)
      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          state: updatedStates[lessonParsed.data.lessonKey],
          lessonStates: isComplete ? updatedStates : undefined,
          progress: progress.completedAt
            ? { completedAt: progress.completedAt.toISOString() }
            : { lastAccessedAt: progress.lastAccessedAt.toISOString() },
        },
      })
    } catch (error) {
      sendLmsFailure(res, error, "Failed to update progress")
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

      const questions = await loadQuizQuestions(located.node.id)

      const attemptCount = await prisma.quizAttempt.count({
        where: { enrollmentId: enrollment.id, nodeId: located.node.id },
      })

      const maxAttempts = located.node.maxAttempts
      const attemptsRemaining = maxAttempts ? Math.max(0, maxAttempts - attemptCount) : null

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          questions: questions.map((q) => ({
            id: q.id,
            q: q.question,
            options: Array.isArray(q.options) ? q.options.filter((option): option is string => typeof option === "string") : [],
          })),
          attemptCount,
          maxAttempts,
          attemptsRemaining,
          passingScore: located.node.passingScore,
        },
      })
    } catch (error) {
      sendLmsFailure(res, error, "Failed to load quiz")
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

      const questions = await loadQuizQuestions(located.node.id)

      if (questions.length === 0) {
        return res.status(400).json({ error: "Quiz has no questions" })
      }

      if (bodyParsed.data.answers.length !== questions.length) {
        return res.status(400).json({ error: "Answer count mismatch" })
      }

      if (!answersInOptionRange(bodyParsed.data.answers, questions)) {
        return res.status(400).json({ error: "Answer out of range" })
      }

      const recorded = await recordScoredQuizAttempt({
        userId: req.auth!.user.id,
        enrollmentId: enrollment.id,
        nodeId: located.node.id,
        answers: bodyParsed.data.answers,
        questions,
        maxAttempts: located.node.maxAttempts,
        passingScore: located.node.passingScore,
      })

      if (recorded.passed) {
        await syncCertificateState(enrollment.id, course.id)
        const scorePercent = recorded.totalQuestions > 0 ? Math.floor((recorded.score / recorded.totalQuestions) * 100) : null
        await awardVerifiedLearning({
          userId: req.auth!.user.id,
          activity: "quiz_complete",
          sourceId: located.node.id,
          courseSlug: course.slug,
          lessonKey: lessonParsed.data.lessonKey,
        })
        await awardVerifiedLearning({
          userId: req.auth!.user.id,
          activity: "quiz_score",
          sourceId: located.node.id,
          scorePercent,
          courseSlug: course.slug,
          lessonKey: lessonParsed.data.lessonKey,
        })
      }

      const review = questions.map((q, index) => ({
        questionId: q.id,
        yourAnswer: bodyParsed.data.answers[index],
        correct: bodyParsed.data.answers[index] === q.correctIndex,
        correctAnswer: recorded.passed ? q.correctIndex : undefined,
        explanation: recorded.passed ? q.explanation : undefined,
      }))

      const updatedLessonStates = recorded.passed ? await loadLessonStates(enrollment, course) : undefined

      res.status(201).json({
        data: {
          attemptId: recorded.attempt.id,
          attemptNumber: recorded.attempt.attemptNumber,
          score: recorded.passed ? recorded.score : undefined,
          totalQuestions: recorded.totalQuestions,
          passed: recorded.passed,
          submittedAt: recorded.attempt.submittedAt.toISOString(),
          review: recorded.passed ? review : review.map(({ questionId, yourAnswer }) => ({ questionId, yourAnswer })),
          lessonStates: updatedLessonStates,
        },
      })
    } catch (error) {
      if (error instanceof QuizAttemptThrottled) {
        res.setHeader("Retry-After", String(error.retryAfterSeconds))
        return res.status(429).json({
          error: "Too many quiz attempts. Try again later.",
          retryAfterSeconds: error.retryAfterSeconds,
        })
      }
      if (error instanceof QuizMaxAttemptsExceeded) {
        return res.status(403).json({
          error: `Maximum ${error.maxAttempts} attempts allowed for this quiz`,
          maxAttempts: error.maxAttempts,
          currentAttempts: error.currentAttempts,
        })
      }
      sendLmsFailure(res, error, "Failed to submit quiz attempt")
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

      const grading = (await readSchemaCapabilities()).assignmentGrading
      const assignment = await prisma.assignmentProgress.findUnique({
        where: {
          enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
        },
        select: {
          status: true,
          responseText: true,
          submittedAt: true,
          ...(grading ? { grade: true, feedback: true, gradedAt: true } : {}),
          attachments: true,
        },
      })

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          status: assignment?.status ?? "not_started",
          responseText: assignment?.responseText ?? null,
          submittedAt: assignment?.submittedAt?.toISOString() ?? null,
          grade: assignment && "grade" in assignment ? assignment.grade ?? null : null,
          feedback: assignment && "feedback" in assignment ? assignment.feedback ?? null : null,
          gradedAt: assignment && "gradedAt" in assignment && assignment.gradedAt ? assignment.gradedAt.toISOString() : null,
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
      sendLmsFailure(res, error, "Failed to load assignment")
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

      // Read before the lock. A database without the grading columns must not
      // be asked to null them. Graded status only exists once those columns do.
      const grading = (await readSchemaCapabilities()).assignmentGrading

      // Same transaction-scoped lock as quiz attempts. The second request waits
      // until the first commits, then reads the status that request stored.
      const assignment = await prisma.$transaction(async (tx) => {
        const lockKey = `skylent-assignment:${enrollment.id}:${located.node.id}`
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))::text AS locked`

        const existing = await tx.assignmentProgress.findUnique({
          where: {
            enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: located.node.id },
          },
          select: { id: true, status: true, submittedAt: true },
        })
        const alreadyFinal = existing?.status === AssignmentStatus.submitted || existing?.status === AssignmentStatus.graded
        if (!isSubmit && alreadyFinal) return existing

        // Faculty grading stores the current grade on this row. There is no
        // grading-history table to keep. A new submit after graded clears
        // those four fields so the old grade is not attached to the new text.
        const clearGrade = isSubmit && existing?.status === AssignmentStatus.graded && grading

        const saved = await tx.assignmentProgress.upsert({
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
            ...(clearGrade
              ? { grade: null, feedback: null, gradedById: null, gradedAt: null }
              : {}),
          },
          select: { id: true, status: true, submittedAt: true },
        })

        if (isSubmit && bodyParsed.data.attachments?.length) {
          await tx.assignmentAttachment.deleteMany({ where: { assignmentProgressId: saved.id } })
          await tx.assignmentAttachment.createMany({
            data: bodyParsed.data.attachments.map((file) => ({
              assignmentProgressId: saved.id,
              ...buildPendingAttachmentRecord(saved.id, file),
            })),
          })
        }

        if (isSubmit) {
          await tx.lessonProgress.upsert({
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
          await tx.userEnrollment.update({
            where: { id: enrollment.id },
            data: { lastAccessedNodeId: located.node.id },
          })
        } else {
          await tx.lessonProgress.upsert({
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

        return saved
      })

      if (isSubmit) {
        await syncCertificateState(enrollment.id, course.id)
        await awardVerifiedLearning({
          userId: req.auth!.user.id,
          activity: "assignment_complete",
          sourceId: located.node.id,
          courseSlug: course.slug,
          lessonKey: lessonParsed.data.lessonKey,
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
      sendLmsFailure(res, error, "Failed to update assignment")
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
      sendLmsFailure(res, error, "Failed to load lesson media")
    }
  },
)

lmsRouter.get("/courses/:slug/certificate", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = slugParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    if (!(await capabilityAvailable("skylentCertificates"))) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.certificates))
    }

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
    const allComplete = requirements.length > 0 && requirements.every((item) => item.complete)
    let issued: { revoked: boolean } | null = null
    try {
      issued = await prisma.skylentCertificate.findUnique({
        where: { userId_courseId: { userId: req.auth!.user.id, courseId: course.id } },
        select: { revoked: true },
      })
    } catch (error) {
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.certificates))
      }
      throw error
    }
    const certificateStatus = issued && !issued.revoked ? "issued" : allComplete ? "eligible" : "locked"

    res.json({
      data: {
        certificateEligible: allComplete,
        certificateStatus,
        requirements,
        allComplete,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.certificates))
    }
    console.error("Failed to load certificate state:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load certificate state" })
  }
})


lmsRouter.post(
  "/courses/:slug/lessons/:lessonKey/doubt",
  requireAuth,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const parsed = slugParamSchema.merge(lessonKeySchema).safeParse(req.params)
    if (!parsed.success) return res.status(400).json({ error: "Invalid request" })
    const body = z
      .object({
        question: z.string().trim().max(1000).optional(),
        lessonTitle: z.string().trim().max(240).optional(),
      })
      .safeParse(req.body ?? {})
    if (!body.success) return res.status(400).json({ error: "Invalid request" })
    try {
      const course = await findCourseBySlug(parsed.data.slug)
      if (!course) return res.status(404).json({ error: "Course not found" })
      const enrollment = await resolveCourseEnrollment(req.auth!.user.id, course.id)
      if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })
      const found = await findNodeByLessonKey(course, parsed.data.lessonKey)
      if (!found) return res.status(404).json({ error: "Lesson not found" })
      const ticket = createFacultyDoubtTicket({
        userId: req.auth!.user.id,
        learnerName: req.auth!.user.displayName ?? req.auth!.user.email,
        courseSlug: course.slug,
        lessonKey: parsed.data.lessonKey,
        lessonTitle: body.data.lessonTitle ?? found.node.title,
        question: body.data.question,
      })
      type DoubtDbRow = {
        id: string
        userId: string
        learnerName: string
        courseSlug: string
        lessonKey: string
        lessonTitle: string | null
        question: string
        status: string
        slaMinutes: number
        createdAt: Date
        resolvedAt: Date | null
        resolvedById: string | null
        resolutionNote: string | null
      }
      const doubtDelegate = (prisma as unknown as {
        facultyDoubtTicket?: {
          upsert: (args: Record<string, unknown>) => Promise<DoubtDbRow>
          findMany: (args: Record<string, unknown>) => Promise<DoubtDbRow[]>
        }
      }).facultyDoubtTicket
      if (doubtDelegate) {
        await doubtDelegate
          .upsert({
            where: { id: ticket.id },
            create: {
              id: ticket.id,
              userId: ticket.userId,
              learnerName: ticket.learnerName,
              courseSlug: ticket.courseSlug,
              lessonKey: ticket.lessonKey,
              lessonTitle: ticket.lessonTitle,
              question: ticket.question,
              status: ticket.status,
              slaMinutes: ticket.slaMinutes,
            },
            update: {
              question: ticket.question,
            },
          })
          .catch((err: unknown) =>
            console.error("Failed to persist doubt to DB:", err instanceof Error ? err.name : "unknown"),
          )
      }
      res.status(201).json({ data: ticket })
    } catch (error) {
      sendLmsFailure(res, error, "Failed to escalate doubt")
    }
  },
)

lmsRouter.get("/doubts/mine", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const byId = new Map<string, FacultyDoubtTicket>()
    for (const mem of listLearnerDoubtTickets(userId)) {
      byId.set(mem.id, mem)
    }
    type DoubtDbRow = {
      id: string
      userId: string
      learnerName: string
      courseSlug: string
      lessonKey: string
      lessonTitle: string | null
      question: string
      status: string
      slaMinutes: number
      createdAt: Date
      resolvedAt: Date | null
      resolvedById: string | null
      resolutionNote: string | null
    }
    const doubtDelegate = (prisma as unknown as {
      facultyDoubtTicket?: {
        findMany: (args: Record<string, unknown>) => Promise<DoubtDbRow[]>
      }
    }).facultyDoubtTicket
    if (doubtDelegate) {
      const dbRows = await doubtDelegate.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }).catch((): DoubtDbRow[] => [])
      for (const row of dbRows) {
        byId.set(row.id, {
          id: row.id,
          userId: row.userId,
          learnerName: row.learnerName,
          courseSlug: row.courseSlug,
          lessonKey: row.lessonKey,
          lessonTitle: row.lessonTitle ?? row.lessonKey,
          question: row.question,
          status: row.status === "resolved" ? "resolved" : "open",
          slaMinutes: row.slaMinutes,
          createdAt: row.createdAt.toISOString(),
          resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
          resolvedById: row.resolvedById ?? null,
          resolutionNote: row.resolutionNote ?? null,
        })
      }
    }
    const sorted = [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    res.json({ data: sorted })
  } catch (error) {
    sendLmsFailure(res, error, "Failed to load learner doubts")
  }
})
