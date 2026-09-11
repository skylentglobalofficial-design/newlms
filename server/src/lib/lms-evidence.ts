import { prisma } from "./prisma.js"
import { getOrCreateProfile } from "./career/profile.js"
import { assignmentBriefFor } from "./assignment-briefs.js"

export async function recordLmsAssignmentEvidence(input: {
  userId: string
  enrollmentId: string
  courseSlug: string
  courseTitle: string
  lessonKey: string
  lessonTitle: string
  artifactFileName?: string | null
  submittedAt: Date
}) {
  const profile = await getOrCreateProfile(input.userId)
  const brief = assignmentBriefFor(input.courseSlug, input.lessonKey)
  const sourceRef = `lms_assignment:${input.enrollmentId}:${input.lessonKey}`
  const artifactLine = input.artifactFileName
    ? ` Submitted file: ${input.artifactFileName}.`
    : " No file was stored with this submission."
  const description = [
    `LMS project from ${input.courseTitle} (${input.courseSlug}), lesson “${input.lessonTitle}”.`,
    "Status: submitted.",
    artifactLine.trim(),
    "This is learner-submitted course work. It is not employer-verified and does not mean the learner is placed or job-ready.",
  ].join(" ")

  const existing = await prisma.careerProject.findUnique({ where: { sourceRef } })
  const data = {
    title: input.lessonTitle,
    description,
    technologies: brief?.skills ?? [],
    outcome: `Submitted in ${input.courseTitle} on ${input.submittedAt.toISOString().slice(0, 10)}.`,
    sourceKind: "lms_assignment",
    sourceRef,
    sourceCourseSlug: input.courseSlug,
    sourceLessonKey: input.lessonKey,
    sourceEnrollmentId: input.enrollmentId,
    artifactFileName: input.artifactFileName ?? null,
    sourceCompletedAt: input.submittedAt,
  }

  if (existing) {
    await prisma.careerProject.update({
      where: { id: existing.id },
      data,
    })
    return
  }

  await prisma.careerProject.create({
    data: {
      profileId: profile.id,
      sortOrder: profile.projects.length,
      ...data,
    },
  })
}

export async function recordLmsCourseEvidence(input: {
  userId: string
  enrollmentId: string
  courseSlug: string
  courseTitle: string
  certificatePublicId?: string | null
  completedAt: Date
}) {
  const profile = await getOrCreateProfile(input.userId)
  const sourceRef = `lms_course:${input.enrollmentId}`
  const certLine = input.certificatePublicId
    ? ` Certificate ID ${input.certificatePublicId}.`
    : ""
  const description = [
    `Completed the published Skylent course ${input.courseTitle} (${input.courseSlug}).`,
    certLine.trim(),
    "This records course completion only. It is not employer-verified and does not claim placement or job-readiness.",
  ]
    .filter(Boolean)
    .join(" ")

  const existing = await prisma.careerProject.findUnique({ where: { sourceRef } })
  const data = {
    title: `${input.courseTitle} — completed`,
    description,
    technologies: [],
    outcome: `Course completed on ${input.completedAt.toISOString().slice(0, 10)}.`,
    sourceKind: "lms_course",
    sourceRef,
    sourceCourseSlug: input.courseSlug,
    sourceLessonKey: null,
    sourceEnrollmentId: input.enrollmentId,
    artifactFileName: null,
    sourceCompletedAt: input.completedAt,
  }

  if (existing) {
    await prisma.careerProject.update({ where: { id: existing.id }, data })
    return
  }

  await prisma.careerProject.create({
    data: {
      profileId: profile.id,
      sortOrder: profile.projects.length,
      ...data,
    },
  })
}
