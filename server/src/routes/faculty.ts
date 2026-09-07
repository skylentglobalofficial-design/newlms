import crypto from "node:crypto"
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import { canManageLessonMaterials, loadCourseLessonNode } from "../lib/lesson-materials.js"
import {
  OBJECT_STORAGE_PROVIDER,
  buildLessonMaterialStorageKey,
  createPresignedDownloadUrl,
  createPresignedUploadUrl,
  isObjectStorageConfigured,
  sanitizeMaterialFileName,
  toPublicMaterial,
  validateMaterialByteSize,
  validateMaterialMimeType,
} from "../lib/object-storage.js"

export const facultyRouter = Router()

const TEACHING_SCOPE_UNAVAILABLE =
  "Faculty-to-program/course assignment is not modeled in the database yet. Teaching data and learner submissions cannot be scoped safely for this account."

function emptyFacultyDashboard() {
  return {
    programs: [],
    courses: [],
    submissions: [],
    pendingReviewCount: 0,
    curriculumSummary: [],
    teachingScopeAvailable: false,
    teachingScopeMessage: TEACHING_SCOPE_UNAVAILABLE,
    cohortAnalyticsAvailable: false,
  }
}

async function loadSuperadminFacultyDashboard() {
  const [programs, courses, submissions] = await Promise.all([
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        duration: true,
        format: true,
        programType: true,
      },
      take: 8,
    }),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      include: {
        curriculum: {
          orderBy: { order: "asc" },
          include: { nodes: { orderBy: { order: "asc" } } },
        },
      },
      take: 6,
    }),
    prisma.assignmentProgress.findMany({
      where: { status: "submitted" },
      orderBy: { submittedAt: "desc" },
      take: 20,
      include: {
        user: { select: { displayName: true, email: true } },
        node: { select: { title: true, sourceId: true } },
        enrollment: {
          include: {
            course: { select: { slug: true, title: true } },
            program: { select: { slug: true, name: true } },
          },
        },
        attachments: {
          select: { id: true, fileName: true, mimeType: true, byteSize: true, storageProvider: true },
        },
      },
    }),
  ])

  const teachingCourse = courses[0]
  const curriculumSummary = teachingCourse
    ? [
        {
          label: "Module",
          detail: teachingCourse.curriculum[0]?.title ?? "—",
          status: "complete",
        },
        {
          label: "Lesson",
          detail: teachingCourse.curriculum[0]?.nodes[0]?.title ?? "—",
          status: "complete",
        },
        {
          label: "Assignments pending",
          detail: String(submissions.length),
          status: "current",
        },
      ]
    : []

  return {
    programs,
    courses: courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      moduleCount: course.curriculum.length,
      lessonCount: course.curriculum.reduce((sum, mod) => sum + mod.nodes.length, 0),
    })),
    submissions: submissions.map((row) => ({
      id: row.id,
      studentName: row.user.displayName ?? row.user.email,
      studentEmail: row.user.email,
      lessonTitle: row.node.title,
      lessonKey: row.node.sourceId,
      courseSlug: row.enrollment.course?.slug ?? null,
      courseTitle: row.enrollment.course?.title ?? null,
      programName: row.enrollment.program?.name ?? null,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      attachmentCount: row.attachments.length,
    })),
    pendingReviewCount: submissions.length,
    curriculumSummary,
    teachingScopeAvailable: true,
    teachingScopeMessage: null,
    cohortAnalyticsAvailable: false,
  }
}

function isDemoFacultyAccount(email: string | null | undefined) {
  return email?.endsWith("@demo.skylent.dev") ?? false
}

facultyRouter.get("/dashboard", requireAuth, requireRoles("faculty", "superadmin"), async (req: AuthenticatedRequest, res) => {
  try {
    const canLoadTeachingData =
      hasApiRole(req, "superadmin") ||
      (hasApiRole(req, "faculty") && isDemoFacultyAccount(req.auth?.user.email))

    const data = canLoadTeachingData ? await loadSuperadminFacultyDashboard() : emptyFacultyDashboard()
    res.json({ data })
  } catch (error) {
    console.error("Failed to load faculty dashboard:", error)
    res.status(500).json({ error: "Failed to load faculty dashboard" })
  }
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

const materialIdSchema = z.object({
  materialId: z.string().uuid(),
})

const materialUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  byteSize: z.number().int().min(1).max(50_000_000),
})

async function resolveFacultyLessonContext(courseSlug: string, lessonKey: string) {
  const located = await loadCourseLessonNode(courseSlug, lessonKey)
  if (located.error === "course_not_found") {
    return { status: 404 as const, body: { error: "Course not found" } }
  }
  if (located.error === "lesson_not_found") {
    return { status: 404 as const, body: { error: "Lesson not found" } }
  }
  return { status: 200 as const, course: located.course, node: located.node }
}

async function mapFacultyMaterials(materials: Array<{
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  published: boolean
  createdAt: Date
  updatedAt: Date
  storageKey: string
}>) {
  if (!isObjectStorageConfigured()) {
    return materials.map((material) => ({
      ...toPublicMaterial(material),
      downloadUrl: null,
    }))
  }

  return Promise.all(
    materials.map(async (material) => ({
      ...toPublicMaterial(material),
      downloadUrl: await createPresignedDownloadUrl(material.storageKey),
    })),
  )
}

facultyRouter.get(
  "/courses/:slug/lessons/:lessonKey/materials",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    if (!slugParsed.success || !lessonParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    if (!canManageLessonMaterials(req, slugParsed.data.slug)) {
      return res.status(403).json({ error: "Forbidden" })
    }

    try {
      const context = await resolveFacultyLessonContext(slugParsed.data.slug, lessonParsed.data.lessonKey)
      if (context.status !== 200) {
        return res.status(context.status).json(context.body)
      }

      const materials = await prisma.lessonMaterial.findMany({
        where: { nodeId: context.node.id },
        orderBy: { createdAt: "desc" },
      })

      const data = await mapFacultyMaterials(materials)
      res.json({ data })
    } catch (error) {
      console.error("Failed to list faculty lesson materials:", error)
      res.status(500).json({ error: "Failed to list lesson materials" })
    }
  },
)

facultyRouter.post(
  "/courses/:slug/lessons/:lessonKey/materials",
  requireAuth,
  requireCsrf,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const bodyParsed = materialUploadSchema.safeParse(req.body)
    if (!slugParsed.success || !lessonParsed.success || !bodyParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    if (!canManageLessonMaterials(req, slugParsed.data.slug)) {
      return res.status(403).json({ error: "Forbidden" })
    }

    const { fileName, mimeType, byteSize } = bodyParsed.data
    if (!validateMaterialMimeType(mimeType)) {
      return res.status(400).json({ error: "Unsupported file type" })
    }
    if (!validateMaterialByteSize(byteSize)) {
      return res.status(400).json({ error: "Invalid file size" })
    }

    if (!isObjectStorageConfigured()) {
      return res.status(503).json({ error: "Object storage is not configured" })
    }

    try {
      const context = await resolveFacultyLessonContext(slugParsed.data.slug, lessonParsed.data.lessonKey)
      if (context.status !== 200) {
        return res.status(context.status).json(context.body)
      }

      const safeFileName = sanitizeMaterialFileName(fileName)
      const materialId = crypto.randomUUID()
      const storageKey = buildLessonMaterialStorageKey({
        courseSlug: slugParsed.data.slug,
        nodeId: context.node.id,
        materialId,
        fileName: safeFileName,
      })

      const material = await prisma.lessonMaterial.create({
        data: {
          id: materialId,
          nodeId: context.node.id,
          fileName: safeFileName,
          mimeType: mimeType.trim().toLowerCase(),
          byteSize,
          storageProvider: OBJECT_STORAGE_PROVIDER,
          storageKey,
          published: false,
          uploadedById: req.auth!.user.id,
        },
      })

      const uploadUrl = await createPresignedUploadUrl({
        storageKey,
        mimeType: material.mimeType,
        byteSize,
      })

      res.status(201).json({
        data: {
          material: toPublicMaterial(material),
          uploadUrl,
          uploadMethod: "PUT" as const,
          uploadHeaders: { "Content-Type": material.mimeType },
        },
      })
    } catch (error) {
      console.error("Failed to create lesson material upload:", error)
      res.status(500).json({ error: "Failed to create lesson material upload" })
    }
  },
)

facultyRouter.post(
  "/courses/:slug/lessons/:lessonKey/materials/:materialId/publish",
  requireAuth,
  requireCsrf,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const materialParsed = materialIdSchema.safeParse({ materialId: req.params.materialId })
    if (!slugParsed.success || !lessonParsed.success || !materialParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    if (!canManageLessonMaterials(req, slugParsed.data.slug)) {
      return res.status(403).json({ error: "Forbidden" })
    }

    try {
      const context = await resolveFacultyLessonContext(slugParsed.data.slug, lessonParsed.data.lessonKey)
      if (context.status !== 200) {
        return res.status(context.status).json(context.body)
      }

      const existing = await prisma.lessonMaterial.findFirst({
        where: { id: materialParsed.data.materialId, nodeId: context.node.id },
      })
      if (!existing) {
        return res.status(404).json({ error: "Material not found" })
      }

      const material = await prisma.lessonMaterial.update({
        where: { id: existing.id },
        data: { published: true },
      })

      res.json({ data: toPublicMaterial(material) })
    } catch (error) {
      console.error("Failed to publish lesson material:", error)
      res.status(500).json({ error: "Failed to publish lesson material" })
    }
  },
)
