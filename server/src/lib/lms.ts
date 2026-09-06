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
}

export type FormattedModule = {
  id: string
  title: string
  lessons: FormattedLesson[]
}

export type LessonStatePayload = {
  started: boolean
  complete: boolean
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
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
  progress: {
    completedCount: number
    totalLessons: number
    progressPct: number
    allComplete: boolean
  }
  resume: ResumePayload
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

export function formatCourseModules(course: CourseWithCurriculum): FormattedModule[] {
  return course.curriculum.map((module) => ({
    id: moduleKey(module),
    title: module.title,
    lessons: module.nodes.map((node) => ({
      id: lessonKey(node),
      title: node.title,
      type: nodeTypeKey(node.nodeType),
      duration: node.duration ?? undefined,
    })),
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

export async function getActiveEnrollment(userId: string, courseId: string) {
  return prisma.userEnrollment.findFirst({
    where: {
      userId,
      courseId,
      status: { in: ["active", "completed"] },
    },
  })
}

export async function getPrimaryEnrollment(userId: string) {
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

function buildLessonState(
  node: CurriculumNode,
  progress: LessonProgress | undefined,
  quizAttempts: QuizAttempt[],
  assignment: AssignmentProgress | undefined,
): LessonStatePayload {
  const complete = Boolean(progress?.completedAt)
  const quizPassed = quizAttempts.some((a) => a.passed)
  const assignmentSubmitted = assignment?.status === "submitted"

  return {
    started: Boolean(progress?.startedAt),
    complete,
    videoWatched: nodeTypeKey(node.nodeType) === "video" ? complete : false,
    quizPassed: nodeTypeKey(node.nodeType) === "quiz" ? quizPassed || complete : false,
    assignmentSubmitted: nodeTypeKey(node.nodeType) === "assignment" ? assignmentSubmitted || complete : false,
    startedAt: progress?.startedAt?.toISOString(),
    completedAt: progress?.completedAt?.toISOString(),
    lastAccessedAt: progress?.lastAccessedAt?.toISOString(),
  }
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
  const current = lastAccessed ?? firstIncomplete ?? items[0]
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

  const lessonStates: Record<LessonKey, LessonStatePayload> = {}
  for (const item of flattenNodes(course)) {
    lessonStates[item.lessonKey] = buildLessonState(
      item.node,
      progressByNode.get(item.node.id),
      attemptsByNode.get(item.node.id) ?? [],
      assignmentByNode.get(item.node.id),
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
      modules: formatCourseModules(enrollment.course),
    },
    lessonStates,
    progress,
    resume,
  }
}

export async function syncCertificateState(enrollmentId: string) {
  const enrollment = await prisma.userEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { include: courseInclude } },
  })
  if (!enrollment?.course) return

  const lessonStates = await loadLessonStates(enrollment, enrollment.course)
  const { allComplete } = computeProgress(enrollment.course, lessonStates)

  await prisma.userEnrollment.update({
    where: { id: enrollmentId },
    data: {
      certificateEligible: allComplete,
      certificateStatus: allComplete ? "eligible" : "locked",
      status: allComplete ? "completed" : "active",
    },
  })
}
