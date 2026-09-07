import crypto from "node:crypto"
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import { canManageLessonMaterials, DEMO_TEACHING_COURSE_SLUG, loadCourseLessonNode } from "../lib/lesson-materials.js"
import { formatAttachmentForApi } from "../lib/assignment-attachments.js"
import {
  OBJECT_STORAGE_PROVIDER,
  buildLessonMaterialStorageKey,
  createPresignedUploadUrl,
  inferMaterialMimeType,
  isObjectStorageConfigured,
  objectExists,
  resolveMaterialDownloadUrl,
  sanitizeMaterialFileName,
  toPublicMaterial,
  validateMaterialByteSize,
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

const submissionIdSchema = z.object({
  submissionId: z.string().uuid(),
})

async function loadFacultyDashboardData(courseSlugFilter: string | null) {
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
      where: {
        status: "submitted",
        ...(courseSlugFilter ? { enrollment: { course: { slug: courseSlugFilter } } } : {}),
      },
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
          select: { id: true, fileName: true, mimeType: true, byteSize: true, uploadStatus: true },
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

    const courseSlugFilter = hasApiRole(req, "superadmin") ? null : DEMO_TEACHING_COURSE_SLUG
    const data = canLoadTeachingData ? await loadFacultyDashboardData(courseSlugFilter) : emptyFacultyDashboard()
    res.json({ data })
  } catch (error) {
    console.error("Failed to load faculty dashboard:", error)
    res.status(500).json({ error: "Failed to load faculty dashboard" })
  }
})

facultyRouter.get(
  "/submissions/:submissionId",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const parsed = submissionIdSchema.safeParse({ submissionId: req.params.submissionId })
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    try {
      const submission = await prisma.assignmentProgress.findUnique({
        where: { id: parsed.data.submissionId },
        include: {
          user: { select: { displayName: true, email: true } },
          node: { select: { title: true, sourceId: true } },
          enrollment: {
            include: {
              course: { select: { slug: true, title: true } },
              program: { select: { slug: true, name: true } },
            },
          },
          attachments: true,
        },
      })

      if (!submission || submission.status !== "submitted") {
        return res.status(404).json({ error: "Submission not found" })
      }

      const courseSlug = submission.enrollment.course?.slug
      if (!courseSlug || !canManageLessonMaterials(req, courseSlug)) {
        return res.status(403).json({ error: "Forbidden" })
      }

      const attachments = await Promise.all(
        submission.attachments.map(async (file) => {
          const formatted = await formatAttachmentForApi(file)
          return {
            ...formatted,
            createdAt: file.createdAt.toISOString(),
          }
        }),
      )

      res.json({
        data: {
          id: submission.id,
          status: submission.status,
          responseText: submission.responseText,
          submittedAt: submission.submittedAt?.toISOString() ?? null,
          studentName: submission.user.displayName ?? submission.user.email,
          studentEmail: submission.user.email,
          lessonTitle: submission.node.title,
          lessonKey: submission.node.sourceId,
          courseSlug,
          courseTitle: submission.enrollment.course?.title ?? null,
          programName: submission.enrollment.program?.name ?? null,
          attachments,
          objectStorageConfigured: isObjectStorageConfigured(),
        },
      })
    } catch (error) {
      console.error("Failed to load faculty submission:", error)
      res.status(500).json({ error: "Failed to load submission" })
    }
  },
)

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

const notesBodySchema = z.object({
  notesBody: z.string().max(50000),
})

function nodeTypeKey(nodeType: string): string {
  return nodeType.toLowerCase()
}

facultyRouter.get(
  "/courses/:slug/lessons",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    if (!slugParsed.success) {
      return res.status(400).json({ error: "Validation failed" })
    }

    if (!canManageLessonMaterials(req, slugParsed.data.slug)) {
      return res.status(403).json({ error: "Forbidden" })
    }

    try {
      const course = await prisma.course.findUnique({
        where: { slug: slugParsed.data.slug },
        include: {
          curriculum: {
            orderBy: { order: "asc" },
            include: { nodes: { orderBy: { order: "asc" } } },
          },
        },
      })
      if (!course) return res.status(404).json({ error: "Course not found" })

      const lessons = course.curriculum.flatMap((module) =>
        module.nodes.map((node) => ({
          lessonKey: node.sourceId ?? `l${node.order + 1}`,
          title: node.title,
          type: nodeTypeKey(node.nodeType),
          duration: node.duration ?? null,
          moduleTitle: module.title,
        })),
      )

      res.json({ data: lessons })
    } catch (error) {
      console.error("Failed to list faculty lessons:", error)
      res.status(500).json({ error: "Failed to list faculty lessons" })
    }
  },
)

facultyRouter.get(
  "/courses/:slug/lessons/:lessonKey/notes",
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

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          title: context.node.title,
          notesBody: context.node.notesBody ?? "",
        },
      })
    } catch (error) {
      console.error("Failed to load faculty lesson notes:", error)
      res.status(500).json({ error: "Failed to load lesson notes" })
    }
  },
)

facultyRouter.patch(
  "/courses/:slug/lessons/:lessonKey/notes",
  requireAuth,
  requireCsrf,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const slugParsed = slugParamSchema.safeParse(req.params)
    const lessonParsed = lessonKeySchema.safeParse({ lessonKey: req.params.lessonKey })
    const bodyParsed = notesBodySchema.safeParse(req.body)
    if (!slugParsed.success || !lessonParsed.success || !bodyParsed.success) {
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

      const node = await prisma.curriculumNode.update({
        where: { id: context.node.id },
        data: { notesBody: bodyParsed.data.notesBody },
      })

      res.json({
        data: {
          lessonKey: lessonParsed.data.lessonKey,
          title: node.title,
          notesBody: node.notesBody ?? "",
        },
      })
    } catch (error) {
      console.error("Failed to update faculty lesson notes:", error)
      res.status(500).json({ error: "Failed to update lesson notes" })
    }
  },
)

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
  uploadStatus: "PENDING" | "READY" | "FAILED"
  published: boolean
  createdAt: Date
  updatedAt: Date
  storageKey: string
}>) {
  return Promise.all(
    materials.map(async (material) => ({
      ...toPublicMaterial(material),
      downloadUrl: await resolveMaterialDownloadUrl({
        storageKey: material.storageKey,
        uploadStatus: material.uploadStatus,
        published: material.published,
        requirePublished: false,
      }),
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
    const resolvedMimeType = inferMaterialMimeType(fileName, mimeType)
    if (!resolvedMimeType) {
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
          mimeType: resolvedMimeType,
          byteSize,
          storageProvider: OBJECT_STORAGE_PROVIDER,
          storageKey,
          uploadStatus: "PENDING",
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
      if (error instanceof Error && error.message === "Object storage is not configured") {
        return res.status(503).json({ error: "Object storage is not configured" })
      }
      res.status(500).json({ error: "Failed to create lesson material upload" })
    }
  },
)

facultyRouter.post(
  "/courses/:slug/lessons/:lessonKey/materials/:materialId/complete-upload",
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

    if (!isObjectStorageConfigured()) {
      return res.status(503).json({ error: "Object storage is not configured" })
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

      if (existing.uploadStatus === "READY") {
        return res.json({ data: toPublicMaterial(existing) })
      }

      const exists = await objectExists(existing.storageKey)
      if (!exists) {
        await prisma.lessonMaterial.update({
          where: { id: existing.id },
          data: { uploadStatus: "FAILED" },
        })
        return res.status(409).json({ error: "Storage object not found", code: "upload_incomplete" })
      }

      const material = await prisma.lessonMaterial.update({
        where: { id: existing.id },
        data: { uploadStatus: "READY" },
      })

      res.json({ data: toPublicMaterial(material) })
    } catch (error) {
      console.error("Failed to complete lesson material upload:", error)
      res.status(500).json({ error: "Failed to complete lesson material upload" })
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

      if (!isObjectStorageConfigured()) {
        return res.status(503).json({ error: "Object storage is not configured" })
      }

      if (existing.uploadStatus !== "READY") {
        return res.status(409).json({
          error: "Material upload is not ready",
          code: "upload_not_ready",
          uploadStatus: existing.uploadStatus,
        })
      }

      const exists = await objectExists(existing.storageKey)
      if (!exists) {
        await prisma.lessonMaterial.update({
          where: { id: existing.id },
          data: { uploadStatus: "FAILED" },
        })
        return res.status(409).json({ error: "Storage object not found", code: "object_missing" })
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
