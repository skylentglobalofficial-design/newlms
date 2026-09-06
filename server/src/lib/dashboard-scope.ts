import { prisma } from "./prisma.js"

export async function getOrganisationMemberUserIds(organisationId: string): Promise<string[]> {
  const memberships = await prisma.organisationMembership.findMany({
    where: { organisationId },
    select: { userId: true },
  })
  return memberships.map((row) => row.userId)
}

export async function requireOrganisationMembership(userId: string) {
  return prisma.organisationMembership.findFirst({
    where: { userId },
    include: { organisation: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function getOrganisationScopedEnrollmentStats(organisationId: string) {
  const orgUserIds = await getOrganisationMemberUserIds(organisationId)
  if (orgUserIds.length === 0) {
    return {
      orgUserIds,
      enrollmentCount: 0,
      programRows: [] as Array<{ programId: string; enrollmentCount: number }>,
      courseIds: [] as string[],
    }
  }

  const enrollmentWhere = { userId: { in: orgUserIds } }
  const enrollmentCount = await prisma.userEnrollment.count({ where: enrollmentWhere })

  const programEnrollments = await prisma.userEnrollment.groupBy({
    by: ["programId"],
    where: { ...enrollmentWhere, programId: { not: null } },
    _count: { _all: true },
  })

  const directCourseEnrollments = await prisma.userEnrollment.groupBy({
    by: ["courseId"],
    where: { ...enrollmentWhere, courseId: { not: null } },
    _count: { _all: true },
  })

  const programIds = programEnrollments
    .map((row) => row.programId)
    .filter((id): id is string => Boolean(id))

  const linkedCourses = programIds.length
    ? await prisma.programCourse.findMany({
        where: { programId: { in: programIds } },
        select: { courseId: true },
      })
    : []

  const courseIds = [
    ...new Set([
      ...directCourseEnrollments
        .map((row) => row.courseId)
        .filter((id): id is string => Boolean(id)),
      ...linkedCourses.map((row) => row.courseId),
    ]),
  ]

  return {
    orgUserIds,
    enrollmentCount,
    programRows: programEnrollments
      .filter((row) => row.programId)
      .map((row) => ({
        programId: row.programId!,
        enrollmentCount: row._count._all,
      })),
    courseIds,
  }
}
