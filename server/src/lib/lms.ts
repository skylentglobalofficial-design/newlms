import type {
  AssignmentProgress,
  Course,
  CurriculumModule,
  CurriculumNode,
  CurriculumNodeType,
  LessonProgress,
  QuizAttempt,
  UserEnrollment,
} from "@prisma/client"
import { prisma } from "./prisma.js"

export type LessonKey = string

export type FormattedLesson = {
  id: LessonKey
  title: string
  type: string | null
  duration?: string
  locked?: boolean
  requiredLessonKey?: string | null
  media?: {
    provider: "mux" | "unavailable"
    playbackId?: string
  }
}

export type FormattedModule = {
  id: string
  title: string
  lessons: FormattedLesson[]
}

export type LessonStatePayload = {
  started: boolean
  complete: boolean
  locked: boolean
  requiredLessonKey?: string | null
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
}

export type CourseProgressSummary = {
  completedCount: number
  totalLessons: number
  progressPct: number
  allComplete: boolean
}

export type ProgramCourseProgress = {
  slug: string
  title: string
  progress: CourseProgressSummary
  resume: ResumePayload
}

export type ProgramResumePayload = ResumePayload & {
  courseSlug: string
  courseTitle: string
}

export type ProgramWorkspace = {
  slug: string
  name: string
  enrollmentId: string
  status: string
  certificateEligible: boolean
  certificateStatus: string
  progress: CourseProgressSummary & {
    completedCourses: number
    totalCourses: number
  }
  resume: ProgramResumePayload
  courses: ProgramCourseProgress[]
}

export type CourseWorkspace = {
  enrollment: {
    id: string
    status: string
    courseSlug: string
    courseTitle: string
    certificateEligible: boolean
    certificateStatus: string
  }
  course: {
    slug: string
    title: string
    modules: FormattedModule[]
  }
  lessonStates: Record<LessonKey, LessonStatePayload>
  progress: CourseProgressSummary
  resume: ResumePayload
  program?: ProgramWorkspace | null
}

export type ResumePayload = {
  lessonId: string
  lessonTitle: string
  moduleId: string
  moduleTitle: string
  moduleIndex: number
  moduleTotal: number
  nextLessonId: string | null
  nextLessonTitle: string | null
}

type CourseWithCurriculum = Course & {
  curriculum: (CurriculumModule & { nodes: CurriculumNode[] })[]
}

const courseInclude = {
  curriculum: {
    orderBy: { order: "asc" as const },
    include: {
      nodes: { orderBy: { order: "asc" as const } },
    },
  },
}

function nodeTypeKey(nodeType: CurriculumNodeType): string {
  return nodeType.toLowerCase()
}

export function lessonKey(node: CurriculumNode): LessonKey {
  return node.sourceId ?? `l${node.order + 1}`
}

export function moduleKey(module: CurriculumModule): string {
  return module.sourceId ?? `m${module.order + 1}`
}

export function formatCourseModules(
  course: CourseWithCurriculum,
  lessonStates: Record<LessonKey, LessonStatePayload>,
): FormattedModule[] {
  return course.curriculum.map((module) => ({
    id: moduleKey(module),
    title: module.title,
    lessons: module.nodes.map((node) => {
      const key = lessonKey(node)
      const state = lessonStates[key]
      const media =
        nodeTypeKey(node.nodeType) === "video"
          ? node.muxPlaybackId
            ? { provider: "mux" as const, playbackId: node.muxPlaybackId }
            : { provider: "unavailable" as const }
          : undefined
      return {
        id: key,
        title: node.title,
        type: nodeTypeKey(node.nodeType),
        duration: node.duration ?? undefined,
        locked: state?.locked ?? false,
        requiredLessonKey: state?.requiredLessonKey ?? null,
        media,
      }
    }),
  }))
}

export function flattenNodes(course: CourseWithCurriculum): Array<{
  node: CurriculumNode
  module: CurriculumModule
  moduleIndex: number
  lessonKey: LessonKey
}> {
  const items: Array<{
    node: CurriculumNode
    module: CurriculumModule
    moduleIndex: number
    lessonKey: LessonKey
  }> = []

  course.curriculum.forEach((module, moduleIndex) => {
    module.nodes.forEach((node) => {
      items.push({
        node,
        module,
        moduleIndex: moduleIndex + 1,
        lessonKey: lessonKey(node),
      })
    })
  })

  return items
}

export async function findCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: courseInclude,
  })
}

export async function findNodeByLessonKey(course: CourseWithCurriculum, key: LessonKey) {
  for (const module of course.curriculum) {
    for (const node of module.nodes) {
      if (lessonKey(node) === key) {
        return { node, module }
      }
    }
  }
  return null
}

export async function getActiveCourseEnrollment(userId: string, courseId: string) {
  return prisma.userEnrollment.findFirst({
    where: {
      userId,
      courseId,
      status: { in: ["active", "completed"] },
    },
  })
}

export async function getProgramEnrollmentForCourse(userId: string, courseId: string) {
  return prisma.userEnrollment.findFirst({
    where: {
      userId,
      programId: { not: null },
      status: { in: ["active", "completed"] },
      program: {
        programCourses: { some: { courseId } },
      },
    },
  })
}

export async function resolveCourseEnrollment(userId: string, courseId: string) {
  const direct = await getActiveCourseEnrollment(userId, courseId)
  if (direct) return direct

  return getProgramEnrollmentForCourse(userId, courseId)
}

/** @deprecated use resolveCourseEnrollment */
export async function getActiveEnrollment(userId: string, courseId: string) {
  return resolveCourseEnrollment(userId, courseId)
}

async function loadProgramEnrollment(userId: string) {
  return prisma.userEnrollment.findFirst({
    where: {
      userId,
      status: { in: ["active", "completed"] },
      programId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      program: {
        include: {
          programCourses: {
            orderBy: { sortOrder: "asc" },
            include: { course: { include: courseInclude } },
          },
        },
      },
      lastAccessedNode: true,
    },
  })
}

async function loadDirectCourseEnrollment(userId: string) {
  return prisma.userEnrollment.findFirst({
    where: {
      userId,
      status: { in: ["active", "completed"] },
      courseId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      course: { include: courseInclude },
      lastAccessedNode: true,
    },
  })
}

async function resolveProgramResumeEnrollment(
  userId: string,
  programEnrollment: NonNullable<Awaited<ReturnType<typeof loadProgramEnrollment>>>,
) {
  if (!programEnrollment.program?.programCourses[0]?.course) return null

  const program = await buildProgramWorkspace(userId, programEnrollment.program)
  const resumeSlug = program?.resume.courseSlug
  const resumeCourse =
    programEnrollment.program.programCourses.find((link) => link.course.slug === resumeSlug)?.course ??
    programEnrollment.program.programCourses[0].course
  const enrollment = (await resolveCourseEnrollment(userId, resumeCourse.id)) ?? programEnrollment
  return { program, resumeCourse, enrollment }
}

export async function getPrimaryEnrollment(userId: string) {
  const programEnrollment = await loadProgramEnrollment(userId)
  if (programEnrollment) {
    const resolved = await resolveProgramResumeEnrollment(userId, programEnrollment)
    if (resolved) {
      return {
        ...resolved.enrollment,
        course: resolved.resumeCourse,
      }
    }
  }

  return loadDirectCourseEnrollment(userId)
}

function buildLessonState(
  node: CurriculumNode,
  progress: LessonProgress | undefined,
  quizAttempts: QuizAttempt[],
  assignment: AssignmentProgress | undefined,
  lock: { locked: boolean; requiredLessonKey?: string | null },
): LessonStatePayload {
  const complete = Boolean(progress?.completedAt)
  const quizPassed = quizAttempts.some((a) => a.passed)
  const assignmentSubmitted = assignment?.status === "submitted"

  return {
    started: Boolean(progress?.startedAt),
    complete,
    locked: lock.locked,
    requiredLessonKey: lock.requiredLessonKey ?? null,
    videoWatched: nodeTypeKey(node.nodeType) === "video" ? complete : false,
    quizPassed: nodeTypeKey(node.nodeType) === "quiz" ? quizPassed || complete : false,
    assignmentSubmitted: nodeTypeKey(node.nodeType) === "assignment" ? assignmentSubmitted || complete : false,
    startedAt: progress?.startedAt?.toISOString(),
    completedAt: progress?.completedAt?.toISOString(),
    lastAccessedAt: progress?.lastAccessedAt?.toISOString(),
  }
}

export function computeLessonLocks(
  course: CourseWithCurriculum,
  lessonStates: Record<LessonKey, Pick<LessonStatePayload, "complete">>,
): Record<LessonKey, { locked: boolean; requiredLessonKey?: string | null }> {
  const items = flattenNodes(course)
  const locks: Record<LessonKey, { locked: boolean; requiredLessonKey?: string | null }> = {}

  items.forEach((item, index) => {
    if (index === 0) {
      locks[item.lessonKey] = { locked: false }
      return
    }
    const previous = items[index - 1]
    const previousComplete = lessonStates[previous.lessonKey]?.complete ?? false
    locks[item.lessonKey] = {
      locked: !previousComplete,
      requiredLessonKey: previousComplete ? null : previous.lessonKey,
    }
  })

  return locks
}

export function assertLessonUnlocked(
  course: CourseWithCurriculum,
  lessonKeyValue: LessonKey,
  lessonStates: Record<LessonKey, LessonStatePayload>,
) {
  const state = lessonStates[lessonKeyValue]
  if (state?.locked) {
    return {
      ok: false as const,
      status: 403,
      body: {
        error: "Lesson locked",
        reason: "previous_incomplete",
        requiredLessonKey: state.requiredLessonKey ?? null,
      },
    }
  }
  return { ok: true as const }
}

export function computeProgress(
  course: CourseWithCurriculum,
  lessonStates: Record<LessonKey, LessonStatePayload>,
) {
  const allLessons = flattenNodes(course)
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter((item) => lessonStates[item.lessonKey]?.complete).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  return {
    completedCount,
    totalLessons,
    progressPct,
    allComplete: totalLessons > 0 && completedCount === totalLessons,
  }
}

export function computeResume(
  course: CourseWithCurriculum,
  lessonStates: Record<LessonKey, LessonStatePayload>,
  lastAccessedNodeId?: string | null,
): ResumePayload {
  const items = flattenNodes(course)
  if (items.length === 0) {
    return {
      lessonId: "",
      lessonTitle: "",
      moduleId: "",
      moduleTitle: "",
      moduleIndex: 0,
      moduleTotal: 0,
      nextLessonId: null,
      nextLessonTitle: null,
    }
  }

  const lastAccessed = lastAccessedNodeId
    ? items.find((item) => item.node.id === lastAccessedNodeId)
    : undefined

  const firstIncomplete = items.find((item) => !lessonStates[item.lessonKey]?.complete)
  const lastAccessedIncomplete =
    lastAccessed && !lessonStates[lastAccessed.lessonKey]?.complete ? lastAccessed : undefined
  const current = lastAccessedIncomplete ?? firstIncomplete ?? lastAccessed ?? items[0]
  const currentIndex = items.findIndex((item) => item.lessonKey === current.lessonKey)
  const next = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null

  return {
    lessonId: current.lessonKey,
    lessonTitle: current.node.title,
    moduleId: moduleKey(current.module),
    moduleTitle: current.module.title,
    moduleIndex: current.moduleIndex,
    moduleTotal: course.curriculum.length,
    nextLessonId: next?.lessonKey ?? null,
    nextLessonTitle: next?.node.title ?? null,
  }
}

export async function loadLessonStates(
  enrollment: UserEnrollment,
  course: CourseWithCurriculum,
): Promise<Record<LessonKey, LessonStatePayload>> {
  const nodeIds = flattenNodes(course).map((item) => item.node.id)

  const [progressRows, quizAttempts, assignments] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { enrollmentId: enrollment.id, nodeId: { in: nodeIds } },
    }),
    prisma.quizAttempt.findMany({
      where: { enrollmentId: enrollment.id, nodeId: { in: nodeIds } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.assignmentProgress.findMany({
      where: { enrollmentId: enrollment.id, nodeId: { in: nodeIds } },
    }),
  ])

  const progressByNode = new Map(progressRows.map((row) => [row.nodeId, row]))
  const attemptsByNode = new Map<string, QuizAttempt[]>()
  for (const attempt of quizAttempts) {
    const list = attemptsByNode.get(attempt.nodeId) ?? []
    list.push(attempt)
    attemptsByNode.set(attempt.nodeId, list)
  }
  const assignmentByNode = new Map(assignments.map((row) => [row.nodeId, row]))

  const baseStates: Record<LessonKey, Pick<LessonStatePayload, "complete">> = {}
  for (const item of flattenNodes(course)) {
    const progress = progressByNode.get(item.node.id)
    const quizPassed = (attemptsByNode.get(item.node.id) ?? []).some((a) => a.passed)
    const assignmentSubmitted = assignmentByNode.get(item.node.id)?.status === "submitted"
    const complete = Boolean(progress?.completedAt) || quizPassed || assignmentSubmitted
    baseStates[item.lessonKey] = { complete }
  }

  const locks = computeLessonLocks(course, baseStates)
  const lessonStates: Record<LessonKey, LessonStatePayload> = {}
  for (const item of flattenNodes(course)) {
    lessonStates[item.lessonKey] = buildLessonState(
      item.node,
      progressByNode.get(item.node.id),
      attemptsByNode.get(item.node.id) ?? [],
      assignmentByNode.get(item.node.id),
      locks[item.lessonKey] ?? { locked: false },
    )
  }

  return lessonStates
}

export async function buildCourseWorkspace(
  enrollment: UserEnrollment & { course: CourseWithCurriculum | null },
): Promise<CourseWorkspace | null> {
  if (!enrollment.course) return null

  const lessonStates = await loadLessonStates(enrollment, enrollment.course)
  const progress = computeProgress(enrollment.course, lessonStates)
  const resume = computeResume(enrollment.course, lessonStates, enrollment.lastAccessedNodeId)

  return {
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      courseSlug: enrollment.course.slug,
      courseTitle: enrollment.course.title,
      certificateEligible: enrollment.certificateEligible,
      certificateStatus: enrollment.certificateStatus,
    },
    course: {
      slug: enrollment.course.slug,
      title: enrollment.course.title,
      modules: formatCourseModules(enrollment.course, lessonStates),
    },
    lessonStates,
    progress,
    resume,
  }
}

export async function syncCertificateState(enrollmentId: string, courseId?: string) {
  const enrollment = await prisma.userEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: courseInclude },
      program: {
        include: {
          programCourses: {
            orderBy: { sortOrder: "asc" },
            include: { course: { include: courseInclude } },
          },
        },
      },
    },
  })

  if (!enrollment) return

  if (enrollment.program?.programCourses.length) {
    const programWorkspace = await buildProgramWorkspace(enrollment.userId, enrollment.program)
    const allComplete = programWorkspace?.progress.allComplete ?? false
    await prisma.userEnrollment.update({
      where: { id: enrollmentId },
      data: {
        certificateEligible: allComplete,
        certificateStatus: allComplete ? "eligible" : "locked",
        status: allComplete ? "completed" : "active",
      },
    })
    return
  }

  const course =
    enrollment.course ??
    (courseId
      ? await prisma.course.findUnique({ where: { id: courseId }, include: courseInclude })
      : null)
  if (!course) return

  const lessonStates = await loadLessonStates(enrollment, course)
  const { allComplete } = computeProgress(course, lessonStates)

  await prisma.userEnrollment.update({
    where: { id: enrollmentId },
    data: {
      certificateEligible: allComplete,
      certificateStatus: allComplete ? "eligible" : "locked",
      status: allComplete ? "completed" : "active",
    },
  })

  const relatedPrograms = await prisma.userEnrollment.findMany({
    where: {
      userId: enrollment.userId,
      programId: { not: null },
      status: { in: ["active", "completed"] },
      program: { programCourses: { some: { courseId: course.id } } },
    },
    select: { id: true },
  })
  for (const related of relatedPrograms) {
    if (related.id === enrollmentId) continue
    await syncCertificateState(related.id)
  }
}

export async function findProgramBySlug(slug: string) {
  return prisma.program.findUnique({
    where: { slug },
    include: {
      programCourses: {
        orderBy: { sortOrder: "asc" },
        include: { course: { include: courseInclude } },
      },
    },
  })
}

type ProgramWithLinkedCourses = NonNullable<Awaited<ReturnType<typeof findProgramBySlug>>>

export async function buildProgramWorkspace(
  userId: string,
  program: ProgramWithLinkedCourses,
): Promise<ProgramWorkspace | null> {
  const programEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      programId: program.id,
      status: { in: ["active", "completed"] },
    },
  })
  if (!programEnrollment) return null

  const courses: ProgramCourseProgress[] = []
  for (const link of program.programCourses) {
    const course = link.course
    const enrollment = await resolveCourseEnrollment(userId, course.id)
    if (!enrollment) continue
    const lessonStates = await loadLessonStates(enrollment, course)
    const progress = computeProgress(course, lessonStates)
    const lastAccessedInThisCourse = flattenNodes(course).some(
      (item) => item.node.id === enrollment.lastAccessedNodeId,
    )
    const resume = computeResume(
      course,
      lessonStates,
      lastAccessedInThisCourse ? enrollment.lastAccessedNodeId : null,
    )
    courses.push({
      slug: course.slug,
      title: course.title,
      progress,
      resume,
    })
  }

  if (courses.length === 0) return null

  const completedCount = courses.reduce((sum, course) => sum + course.progress.completedCount, 0)
  const totalLessons = courses.reduce((sum, course) => sum + course.progress.totalLessons, 0)
  const completedCourses = courses.filter((course) => course.progress.allComplete).length
  const totalCourses = courses.length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const allComplete = totalCourses > 0 && completedCourses === totalCourses

  let lastAccessedCourseSlug: string | null = null
  if (programEnrollment.lastAccessedNodeId) {
    for (const link of program.programCourses) {
      if (flattenNodes(link.course).some((item) => item.node.id === programEnrollment.lastAccessedNodeId)) {
        lastAccessedCourseSlug = link.course.slug
        break
      }
    }
  }

  const incomplete = courses.filter((course) => !course.progress.allComplete)
  const preferred =
    (lastAccessedCourseSlug
      ? incomplete.find((course) => course.slug === lastAccessedCourseSlug)
      : undefined) ??
    incomplete[0] ??
    courses[0]

  return {
    slug: program.slug,
    name: program.name,
    enrollmentId: programEnrollment.id,
    status: programEnrollment.status,
    certificateEligible: allComplete,
    certificateStatus: allComplete ? "eligible" : programEnrollment.certificateStatus,
    progress: {
      completedCount,
      totalLessons,
      progressPct,
      allComplete,
      completedCourses,
      totalCourses,
    },
    resume: {
      ...preferred.resume,
      courseSlug: preferred.slug,
      courseTitle: preferred.title,
    },
    courses,
  }
}

export async function findProgramWorkspaceForCourse(userId: string, courseId: string) {
  const programEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      programId: { not: null },
      status: { in: ["active", "completed"] },
      program: { programCourses: { some: { courseId } } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      program: {
        include: {
          programCourses: {
            orderBy: { sortOrder: "asc" },
            include: { course: { include: courseInclude } },
          },
        },
      },
    },
  })
  if (!programEnrollment?.program) return null
  return buildProgramWorkspace(userId, programEnrollment.program)
}

export async function loadLearnerDashboard(userId: string): Promise<CourseWorkspace | null> {
  const programEnrollment = await loadProgramEnrollment(userId)
  if (programEnrollment) {
    const resolved = await resolveProgramResumeEnrollment(userId, programEnrollment)
    if (resolved) {
      const workspace = await buildCourseWorkspace({
        ...resolved.enrollment,
        course: resolved.resumeCourse,
      })
      if (workspace) return { ...workspace, program: resolved.program }
    }
  }

  const courseEnrollment = await loadDirectCourseEnrollment(userId)
  if (!courseEnrollment?.course) return null
  const workspace = await buildCourseWorkspace(courseEnrollment)
  return workspace
}

export async function attachProgramWorkspace(
  userId: string,
  workspace: CourseWorkspace | null,
  program?: ProgramWithLinkedCourses | null,
  courseId?: string | null,
): Promise<CourseWorkspace | null> {
  if (!workspace) return null
  const programWorkspace = program
    ? await buildProgramWorkspace(userId, program)
    : courseId
      ? await findProgramWorkspaceForCourse(userId, courseId)
      : null
  return { ...workspace, program: programWorkspace }
}

export async function getCourseIdsForProgram(programId: string) {
  const links = await prisma.programCourse.findMany({
    where: { programId },
    orderBy: { sortOrder: "asc" },
    select: { courseId: true },
  })
  return links.map((link) => link.courseId)
}

export function formatVideoMedia(node: CurriculumNode) {
  if (nodeTypeKey(node.nodeType) !== "video") return null
  if (node.muxPlaybackId) {
    return { provider: "mux" as const, playbackId: node.muxPlaybackId }
  }
  return { provider: "unavailable" as const }
}
