import type { Prisma, PrismaClient } from "@prisma/client"
import { prisma } from "./prisma.js"

/**
 * Career Rise completion is module-level.
 *
 * A module counts only when it has at least one curriculum node.
 * It is complete only when every node in that module has a LessonProgress
 * row with completedAt set for the learner's enrolment.
 * Opening a lesson records startedAt and does not complete the module.
 *
 * percent = floor(completedModules * 100 / totalModules)
 * eligible when completedModules * 100 >= totalModules * 60
 */
export const CAREER_RISE_THRESHOLD_PERCENT = 60

export type ModuleCompletionInput = {
  nodeCount: number
  completedNodeCount: number
}

export type CareerRiseCompletion = {
  totalModules: number
  completedModules: number
  percent: number
  eligible: boolean
  thresholdPercent: number
}

export function careerRiseCompletion(modules: readonly ModuleCompletionInput[]): CareerRiseCompletion {
  const counted = modules.filter((module) => module.nodeCount > 0)
  const totalModules = counted.length
  const completedModules = counted.filter(
    (module) => module.completedNodeCount === module.nodeCount,
  ).length
  if (totalModules === 0) {
    return {
      totalModules: 0,
      completedModules: 0,
      percent: 0,
      eligible: false,
      thresholdPercent: CAREER_RISE_THRESHOLD_PERCENT,
    }
  }
  return {
    totalModules,
    completedModules,
    percent: Math.floor((completedModules * 100) / totalModules),
    eligible: completedModules * 100 >= totalModules * CAREER_RISE_THRESHOLD_PERCENT,
    thresholdPercent: CAREER_RISE_THRESHOLD_PERCENT,
  }
}

export function careerRiseScopeKey(scope: { courseId?: string | null; programId?: string | null }): string {
  if (scope.courseId && !scope.programId) return `course:${scope.courseId}`
  if (scope.programId && !scope.courseId) return `program:${scope.programId}`
  throw new Error("Career Rise scope needs exactly one course or programme")
}

type Db = PrismaClient | Prisma.TransactionClient

type CourseWithNodes = {
  id: string
  slug: string
  title: string
  curriculum: Array<{ id: string; nodes: Array<{ id: string }> }>
}

async function loadCoursesForScope(
  db: Db,
  scope: { courseId?: string | null; programId?: string | null },
): Promise<CourseWithNodes[]> {
  if (scope.courseId) {
    const course = await db.course.findUnique({
      where: { id: scope.courseId },
      select: {
        id: true,
        slug: true,
        title: true,
        curriculum: { select: { id: true, nodes: { select: { id: true } } } },
      },
    })
    return course ? [course] : []
  }
  if (!scope.programId) return []
  const links = await db.programCourse.findMany({
    where: { programId: scope.programId },
    orderBy: { sortOrder: "asc" },
    select: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          curriculum: { select: { id: true, nodes: { select: { id: true } } } },
        },
      },
    },
  })
  return links.map((link) => link.course)
}

export async function measureCareerRise(
  userId: string,
  scope: { courseId?: string | null; programId?: string | null },
  db: Db = prisma,
): Promise<CareerRiseCompletion & { courseIds: string[] }> {
  const courses = await loadCoursesForScope(db, scope)
  const courseIds = courses.map((course) => course.id)
  const nodeIds = courses.flatMap((course) => course.curriculum.flatMap((module) => module.nodes.map((node) => node.id)))
  const completed = nodeIds.length
    ? await db.lessonProgress.findMany({
        where: {
          nodeId: { in: nodeIds },
          completedAt: { not: null },
          enrollment: { userId, status: { in: ["active", "completed"] } },
        },
        select: { nodeId: true },
      })
    : []
  const completedIds = new Set(completed.map((row) => row.nodeId))
  const modules = courses.flatMap((course) =>
    course.curriculum.map((module) => ({
      nodeCount: module.nodes.length,
      completedNodeCount: module.nodes.filter((node) => completedIds.has(node.id)).length,
    })),
  )
  return { ...careerRiseCompletion(modules), courseIds }
}

export async function findCareerRiseEnrolment(
  userId: string,
  scope: { courseId?: string | null; programId?: string | null },
  db: Db = prisma,
) {
  return db.careerRiseEnrolment.findUnique({
    where: { userId_scopeKey: { userId, scopeKey: careerRiseScopeKey(scope) } },
  })
}
