import crypto from "node:crypto"
import { Router } from "express"
import { z } from "zod"
import { CoursePublicationStatus, CurriculumNodeType, RoleName } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import { recordAdminAudit } from "../lib/admin-audit.js"
import { capabilityAvailable, isDatabaseUnavailableError, isMissingSchemaError, readSchemaCapabilities, UNAVAILABLE_MESSAGES, unavailableBody } from "../lib/schema-capabilities.js"
import { deleteFile, generateStorageKey, uploadFile, validateFile, StorageServiceError } from "../lib/storage.js"
import { LESSON_MATERIAL_TYPES, MAX_UPLOAD_BYTES } from "../lib/upload-payload.js"
import { describeLiveLesson } from "../lib/live-lesson.js"
import { ensureCanonicalCourseCurriculumSynced } from "../lib/canonical-curriculum-sync.js"

export const adminCurriculumRouter = Router()

const guards = [requireAuth, requireRoles("superadmin", "admin"), requireCsrf] as const
const readGuards = [requireAuth, requireRoles("superadmin", "admin")] as const

const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const uuidSchema = z.string().uuid()

const courseSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  description: z.string().trim().min(1).max(8000),
  category: z.string().trim().min(1).max(80),
  level: z.string().trim().min(1).max(80).default("Foundation"),
  duration: z.string().trim().min(1).max(80).default("Not set"),
  mode: z.string().trim().min(1).max(80).default("Self-paced"),
  price: z.number().int().min(0).max(10_000_000).default(0),
  originalPrice: z.number().int().min(0).max(10_000_000).default(0),
  outcomes: z.array(z.string().trim().min(1).max(240)).max(20).default([]),
  forWhom: z.array(z.string().trim().min(1).max(240)).max(20).default([]),
})

const moduleSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional(),
  position: z.number().int().min(1).max(500).optional(),
})

const lectureSchema = z.object({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(8000).optional(),
  nodeType: z.nativeEnum(CurriculumNodeType).default(CurriculumNodeType.NOTES),
  referenceUrl: z.string().trim().url().max(500).optional(),
  position: z.number().int().min(1).max(500).optional(),
  maxAttempts: z.number().int().min(1).max(20).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  questions: z.array(z.object({
    question: z.string().trim().min(1).max(2000),
    options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
    correctIndex: z.number().int().min(0),
    explanation: z.string().trim().max(2000).optional(),
  })).max(30).optional(),
})

const fileSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  dataBase64: z.string().min(1).max(45_000_000),
})

function decodeFile(input: z.infer<typeof fileSchema>, allowed: string[]) {
  if (/[/\\]|\.\./.test(input.fileName) || input.fileName.includes(":")) {
    return { error: "File name must not be a path" as const }
  }
  let data: Buffer
  try {
    data = Buffer.from(input.dataBase64, "base64")
  } catch {
    return { error: "File data is not valid base64" as const }
  }
  if (data.length === 0 || data.length > MAX_UPLOAD_BYTES) {
    return { error: "File must be between 1 byte and 32 MB" as const }
  }
  const checked = validateFile(
    { size: data.length, mimeType: input.contentType, fileName: input.fileName },
    { maxSize: MAX_UPLOAD_BYTES, allowedTypes: allowed },
  )
  if (!checked.valid) return { error: checked.error ?? "File was rejected" }
  return { data }
}

async function loadCourse(id: string) {
  await ensureCanonicalCourseCurriculumSynced()
  const caps = await readSchemaCapabilities()
  return prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      desc: true,
      category: true,
      level: true,
      duration: true,
      mode: true,
      price: true,
      originalPrice: true,
      outcomes: true,
      forWhom: true,
      ...(caps.coursePublication
        ? { publicationStatus: true, authoredInApp: true, coverFileName: true }
        : {}),
      curriculum: {
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          title: true,
          description: true,
          nodes: {
            orderBy: { order: "asc" as const },
            select: {
              id: true,
              title: true,
              nodeType: true,
              ...(caps.curriculumNodeNotes ? { summary: true, referenceUrl: true } : {}),
              lessonMaterials: { select: { id: true, fileName: true, mimeType: true, byteSize: true } },
            },
          },
        },
      },
    },
  })
}

function optionalField<T>(row: object, key: string): T | null {
  return key in row ? (row as Record<string, T | null>)[key] ?? null : null
}

async function refuseAuthoring(res: import("express").Response): Promise<boolean> {
  if (await capabilityAvailable("coursePublication")) return false
  res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
  return true
}

function serializeCourse(course: NonNullable<Awaited<ReturnType<typeof loadCourse>>>) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.desc,
    category: course.category,
    level: course.level,
    duration: course.duration,
    mode: course.mode,
    price: course.price,
    originalPrice: course.originalPrice,
    outcomes: course.outcomes,
    forWhom: course.forWhom,
    publicationStatus: optionalField<string>(course, "publicationStatus"),
    authoredInApp: optionalField<boolean>(course, "authoredInApp") ?? false,
    coverFileName: optionalField<string>(course, "coverFileName"),
    modules: course.curriculum.map((module, index) => ({
      id: module.id,
      position: index + 1,
      title: module.title,
      description: module.description,
      lectures: module.nodes.map((node, nodeIndex) => ({
        id: node.id,
        position: nodeIndex + 1,
        title: node.title,
        summary: optionalField<string>(node, "summary"),
        nodeType: node.nodeType,
        referenceUrl: optionalField<string>(node, "referenceUrl"),
        liveLesson: describeLiveLesson(node.referenceUrl),
        materials: node.lessonMaterials,
      })),
    })),
  }
}

function sendAuthoringError(res: import("express").Response, error: unknown, fallback: string) {
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
  }
  console.error(fallback, error instanceof Error ? error.name : "unknown")
  return res.status(500).json({ error: fallback })
}

adminCurriculumRouter.get("/courses", ...readGuards, async (_req, res) => {
  await ensureCanonicalCourseCurriculumSynced()
  const caps = await readSchemaCapabilities().catch(() => null)
  if (!caps) return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
  try {
    const courses = await prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        level: true,
        duration: true,
        mode: true,
        price: true,
        lessonCount: true,
        ...(caps.coursePublication ? { publicationStatus: true, authoredInApp: true } : {}),
      },
    })
    res.json({
      data: courses.map((course) => ({
        ...course,
        publicationStatus: optionalField<string>(course, "publicationStatus"),
        authoredInApp: optionalField<boolean>(course, "authoredInApp") ?? false,
      })),
    })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to list authored courses")
  }
})

adminCurriculumRouter.get("/courses/:courseId", ...readGuards, async (req, res) => {
  const parsed = z.object({ courseId: uuidSchema }).safeParse(req.params)
  if (!parsed.success) return res.status(400).json({ error: "Invalid course" })
  try {
    const course = await loadCourse(parsed.data.courseId)
    if (!course) return res.status(404).json({ error: "Course not found" })
    res.json({ data: serializeCourse(course) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
    }
    console.error("Failed to load authored course:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load course" })
  }
})

adminCurriculumRouter.post("/courses", ...guards, async (req: AuthenticatedRequest, res) => {
  const parsed = courseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors })
  if (await refuseAuthoring(res)) return
  try {
    const created = await prisma.course.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        category: parsed.data.category,
        level: parsed.data.level,
        duration: parsed.data.duration,
        mode: parsed.data.mode,
        lessonCount: 0,
        projectCount: 0,
        rating: 0,
        reviews: 0,
        price: parsed.data.price,
        originalPrice: parsed.data.originalPrice,
        desc: parsed.data.description,
        longDesc: parsed.data.description,
        outcomes: parsed.data.outcomes,
        forWhom: parsed.data.forWhom,
        publicationStatus: CoursePublicationStatus.DRAFT,
        authoredInApp: true,
      },
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.course.create",
      targetType: "Course",
      targetId: created.id,
      summary: `Created draft course ${created.slug}`,
    })
    const course = await loadCourse(created.id)
    res.status(201).json({ data: serializeCourse(course!) })
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return res.status(409).json({ error: "A course with that slug already exists" })
    }
    sendAuthoringError(res, error, "Failed to create course")
  }
})

adminCurriculumRouter.patch("/courses/:courseId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  const body = courseSchema.omit({ slug: true }).partial().safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  if (await refuseAuthoring(res)) return
  try {
    const existing = await prisma.course.findUnique({ where: { id: params.data.courseId }, select: { id: true, slug: true } })
    if (!existing) return res.status(404).json({ error: "Course not found" })
    await prisma.course.update({
      where: { id: existing.id },
      data: {
        ...(body.data.title !== undefined ? { title: body.data.title } : {}),
        ...(body.data.description !== undefined ? { desc: body.data.description, longDesc: body.data.description } : {}),
        ...(body.data.category !== undefined ? { category: body.data.category } : {}),
        ...(body.data.level !== undefined ? { level: body.data.level } : {}),
        ...(body.data.duration !== undefined ? { duration: body.data.duration } : {}),
        ...(body.data.mode !== undefined ? { mode: body.data.mode } : {}),
        ...(body.data.price !== undefined ? { price: body.data.price } : {}),
        ...(body.data.originalPrice !== undefined ? { originalPrice: body.data.originalPrice } : {}),
        ...(body.data.outcomes !== undefined ? { outcomes: body.data.outcomes } : {}),
        ...(body.data.forWhom !== undefined ? { forWhom: body.data.forWhom } : {}),
      },
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.course.update",
      targetType: "Course",
      targetId: existing.id,
      summary: `Updated course ${existing.slug}`,
    })
    const loaded = await loadCourse(existing.id)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to update course")
  }
})

adminCurriculumRouter.post("/courses/:courseId/modules", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  const body = moduleSchema.safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const course = await prisma.course.findUnique({ where: { id: params.data.courseId }, select: { id: true, slug: true } })
    if (!course) return res.status(404).json({ error: "Course not found" })
    const existing = await prisma.curriculumModule.findMany({
      where: { courseId: course.id },
      orderBy: { order: "asc" },
      select: { id: true },
    })
    const index = body.data.position == null ? existing.length : Math.min(existing.length, body.data.position - 1)
    const created = await prisma.curriculumModule.create({
      data: {
        courseId: course.id,
        title: body.data.title,
        description: body.data.description ?? null,
        order: existing.length + 1,
        sourceId: `mod-${crypto.randomUUID()}`,
        topics: [],
      },
    })
    const ordered = [...existing.slice(0, index).map((row) => row.id), created.id, ...existing.slice(index).map((row) => row.id)]
    await prisma.$transaction(ordered.map((id, order) => prisma.curriculumModule.update({ where: { id }, data: { order } })))
    await prisma.course.update({ where: { id: course.id }, data: { authoredInApp: true } }).catch(() => undefined)
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.module.create",
      targetType: "CurriculumModule",
      targetId: created.id,
      summary: `Added module at position ${index + 1} on ${course.slug}`,
    })
    const loaded = await loadCourse(course.id)
    res.status(201).json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to create module")
  }
})

adminCurriculumRouter.patch("/modules/:moduleId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ moduleId: uuidSchema }).safeParse(req.params)
  const body = moduleSchema.partial().safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const module = await prisma.curriculumModule.findUnique({ where: { id: params.data.moduleId }, select: { id: true, courseId: true } })
    if (!module?.courseId) return res.status(404).json({ error: "Module not found" })
    await prisma.curriculumModule.update({
      where: { id: module.id },
      data: {
        ...(body.data.title ? { title: body.data.title } : {}),
        ...(body.data.description !== undefined ? { description: body.data.description } : {}),
      },
    })
    if (body.data.position) {
      const siblings = await prisma.curriculumModule.findMany({
        where: { courseId: module.courseId },
        orderBy: { order: "asc" },
        select: { id: true },
      })
      const rest = siblings.map((row) => row.id).filter((id) => id !== module.id)
      const index = Math.min(rest.length, body.data.position - 1)
      const ordered = [...rest.slice(0, index), module.id, ...rest.slice(index)]
      await prisma.$transaction(ordered.map((id, order) => prisma.curriculumModule.update({ where: { id }, data: { order } })))
    }
    await prisma.course.update({ where: { id: module.courseId }, data: { authoredInApp: true } }).catch(() => undefined)
    const loaded = await loadCourse(module.courseId)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to update module")
  }
})

adminCurriculumRouter.post("/modules/order", ...guards, async (req: AuthenticatedRequest, res) => {
  const body = z.object({ courseId: uuidSchema, moduleIds: z.array(uuidSchema).min(1).max(500) }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const modules = await prisma.curriculumModule.findMany({
      where: { courseId: body.data.courseId },
      select: { id: true },
    })
    const current = new Set(modules.map((row) => row.id))
    if (current.size !== body.data.moduleIds.length || body.data.moduleIds.some((id) => !current.has(id))) {
      return res.status(400).json({ error: "Module order must list every module of this course once" })
    }
    await prisma.$transaction(body.data.moduleIds.map((id, order) => prisma.curriculumModule.update({ where: { id }, data: { order } })))
    const loaded = await loadCourse(body.data.courseId)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to reorder modules")
  }
})

adminCurriculumRouter.delete("/modules/:moduleId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ moduleId: uuidSchema }).safeParse(req.params)
  const body = z.object({ confirm: z.boolean().optional(), confirmDestroyProgress: z.boolean().optional() }).safeParse(req.body ?? {})
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const module = await prisma.curriculumModule.findUnique({
      where: { id: params.data.moduleId },
      include: { nodes: { select: { id: true } } },
    })
    if (!module?.courseId) return res.status(404).json({ error: "Module not found" })
    if (module.nodes.length > 0 && !body.data.confirm) {
      return res.status(409).json({ error: "This module has lectures. Confirm deletion to continue." })
    }
    const progress = await prisma.lessonProgress.count({ where: { node: { moduleId: module.id } } })
    if (progress > 0 && !body.data.confirmDestroyProgress) {
      return res.status(409).json({ error: "Learners have progress in this module. Deletion would remove it." })
    }
    await prisma.curriculumModule.delete({ where: { id: module.id } })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.module.delete",
      targetType: "CurriculumModule",
      targetId: module.id,
      summary: `Deleted module ${module.title}`,
    })
    const loaded = await loadCourse(module.courseId)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to delete module")
  }
})

adminCurriculumRouter.post("/modules/:moduleId/lectures", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ moduleId: uuidSchema }).safeParse(req.params)
  const body = lectureSchema.safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const module = await prisma.curriculumModule.findUnique({
      where: { id: params.data.moduleId },
      include: { nodes: { select: { id: true }, orderBy: { order: "asc" } } },
    })
    if (!module?.courseId) return res.status(404).json({ error: "Module not found" })
    if (body.data.questions?.some((question) => question.correctIndex >= question.options.length)) {
      return res.status(400).json({ error: "Quiz answer is outside the options" })
    }
    if (body.data.nodeType === CurriculumNodeType.QUIZ && !body.data.questions?.length) {
      return res.status(400).json({ error: "A quiz needs at least one question" })
    }
    if (!(await capabilityAvailable("curriculumNodeNotes"))) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
    }
    if ((body.data.maxAttempts != null || body.data.passingScore != null) && !(await capabilityAvailable("curriculumNodeQuizLimits"))) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
    }
    if (body.data.questions?.some((question) => question.explanation) && !(await capabilityAvailable("quizExplanations"))) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
    }
    const index = body.data.position == null ? module.nodes.length : Math.min(module.nodes.length, body.data.position - 1)
    const created = await prisma.curriculumNode.create({
      data: {
        moduleId: module.id,
        title: body.data.title,
        summary: body.data.summary ?? null,
        nodeType: body.data.nodeType,
        referenceUrl: body.data.referenceUrl ?? null,
        order: module.nodes.length + 1,
        sourceId: `lec-${crypto.randomUUID()}`,
        maxAttempts: body.data.maxAttempts,
        passingScore: body.data.passingScore,
        quizQuestions: body.data.questions
          ? {
              create: body.data.questions.map((question, sortOrder) => ({
                sortOrder,
                question: question.question,
                options: question.options,
                correctIndex: question.correctIndex,
                explanation: question.explanation,
              })),
            }
          : undefined,
      },
    })
    const ordered = [
      ...module.nodes.slice(0, index).map((row) => row.id),
      created.id,
      ...module.nodes.slice(index).map((row) => row.id),
    ]
    await prisma.$transaction(ordered.map((id, order) => prisma.curriculumNode.update({ where: { id }, data: { order } })))
    await prisma.course.update({ where: { id: module.courseId }, data: { authoredInApp: true } }).catch(() => undefined)
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.lecture.create",
      targetType: "CurriculumNode",
      targetId: created.id,
      summary: `Added ${body.data.nodeType} lecture to module ${module.id}`,
    })
    const loaded = await loadCourse(module.courseId)
    res.status(201).json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to create lecture")
  }
})

adminCurriculumRouter.patch("/lectures/:lectureId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ lectureId: uuidSchema }).safeParse(req.params)
  const body = z.object({
    title: z.string().trim().min(1).max(160).optional(),
    summary: z.string().trim().max(8000).nullable().optional(),
    nodeType: z.nativeEnum(CurriculumNodeType).optional(),
    referenceUrl: z.string().trim().url().max(500).nullable().optional(),
  }).safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const lecture = await prisma.curriculumNode.findUnique({
      where: { id: params.data.lectureId },
      select: { id: true, module: { select: { courseId: true } } },
    })
    if (!lecture?.module.courseId) return res.status(404).json({ error: "Lecture not found" })
    await prisma.curriculumNode.update({
      where: { id: lecture.id },
      data: {
        ...(body.data.title !== undefined ? { title: body.data.title } : {}),
        ...(body.data.summary !== undefined ? { summary: body.data.summary } : {}),
        ...(body.data.nodeType !== undefined ? { nodeType: body.data.nodeType } : {}),
        ...(body.data.referenceUrl !== undefined ? { referenceUrl: body.data.referenceUrl } : {}),
      },
    })
    await prisma.course.update({ where: { id: lecture.module.courseId }, data: { authoredInApp: true } }).catch(() => undefined)
    const loaded = await loadCourse(lecture.module.courseId)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to update lecture")
  }
})

adminCurriculumRouter.delete("/lectures/:lectureId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ lectureId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const lecture = await prisma.curriculumNode.findUnique({
      where: { id: params.data.lectureId },
      select: { id: true, title: true, module: { select: { courseId: true } } },
    })
    if (!lecture?.module.courseId) return res.status(404).json({ error: "Lecture not found" })
    await prisma.curriculumNode.delete({ where: { id: lecture.id } })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.lecture.delete",
      targetType: "CurriculumNode",
      targetId: lecture.id,
      summary: `Deleted lecture ${lecture.title}`,
    })
    const loaded = await loadCourse(lecture.module.courseId)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to delete lecture")
  }
})

adminCurriculumRouter.post("/lectures/:lectureId/materials", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ lectureId: uuidSchema }).safeParse(req.params)
  const body = fileSchema.safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  const decoded = decodeFile(body.data, LESSON_MATERIAL_TYPES)
  if ("error" in decoded) return res.status(400).json({ error: decoded.error })
  try {
    const lecture = await prisma.curriculumNode.findUnique({
      where: { id: params.data.lectureId },
      select: { id: true, module: { select: { courseId: true } } },
    })
    if (!lecture?.module.courseId) return res.status(404).json({ error: "Lecture not found" })
    const key = generateStorageKey(`courses/${lecture.module.courseId}/materials`, body.data.fileName)
    const stored = await uploadFile(key, decoded.data, { contentType: body.data.contentType })
    const createdMat = await prisma.lessonMaterial.create({
      data: {
        nodeId: lecture.id,
        fileName: body.data.fileName,
        mimeType: body.data.contentType,
        byteSize: decoded.data.length,
        storageProvider: stored.provider,
        storageKey: stored.key,
      },
    })
    if (body.data.contentType.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(body.data.fileName)) {
      await prisma.curriculumNode.update({
        where: { id: lecture.id },
        data: { referenceUrl: `/api/v1/lms/materials/${createdMat.id}` },
      }).catch(() => undefined)
    }
    const loaded = await loadCourse(lecture.module.courseId)
    res.status(201).json({ data: serializeCourse(loaded!) })
  } catch (error) {
    if (error instanceof StorageServiceError) {
      return res.status(503).json({ error: "File storage is not configured. The file was not saved." })
    }
    sendAuthoringError(res, error, "Failed to store lesson material")
  }
})

adminCurriculumRouter.post("/courses/:courseId/cover", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  const body = fileSchema.safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  const decoded = decodeFile(body.data, ["image/jpeg", "image/png", "image/webp", "image/gif"])
  if ("error" in decoded) return res.status(400).json({ error: decoded.error })
  try {
    const course = await prisma.course.findUnique({ where: { id: params.data.courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ error: "Course not found" })
    if (await refuseAuthoring(res)) return
    const key = generateStorageKey(`courses/${course.id}/cover`, body.data.fileName)
    const stored = await uploadFile(key, decoded.data, { contentType: body.data.contentType })
    await prisma.course.update({
      where: { id: course.id },
      data: { coverStorageKey: stored.key, coverContentType: body.data.contentType, coverFileName: body.data.fileName },
    })
    const loaded = await loadCourse(course.id)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    if (error instanceof StorageServiceError) {
      return res.status(503).json({ error: "File storage is not configured. The image was not saved." })
    }
    sendAuthoringError(res, error, "Failed to store course cover")
  }
})

adminCurriculumRouter.post("/courses/:courseId/publish", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Invalid course" })
  if (await refuseAuthoring(res)) return
  try {
    const course = await loadCourse(params.data.courseId)
    if (!course) return res.status(404).json({ error: "Course not found" })
    const lectures = course.curriculum.reduce((sum, module) => sum + module.nodes.length, 0)
    if (course.curriculum.length === 0 || lectures === 0) {
      return res.status(400).json({ error: "Publish needs at least one module and one lecture" })
    }
    await prisma.course.update({
      where: { id: course.id },
      data: { publicationStatus: CoursePublicationStatus.PUBLISHED, lessonCount: lectures },
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.course.publish",
      targetType: "Course",
      targetId: course.id,
      summary: `Published course ${course.slug}`,
    })
    const loaded = await loadCourse(course.id)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to publish course")
  }
})

adminCurriculumRouter.post("/courses/:courseId/unpublish", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Invalid course" })
  if (await refuseAuthoring(res)) return
  try {
    const course = await loadCourse(params.data.courseId)
    if (!course) return res.status(404).json({ error: "Course not found" })
    await prisma.course.update({
      where: { id: course.id },
      data: { publicationStatus: CoursePublicationStatus.DRAFT },
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.course.unpublish",
      targetType: "Course",
      targetId: course.id,
      summary: `Moved course ${course.slug} back to draft`,
    })
    const loaded = await loadCourse(course.id)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to unpublish course")
  }
})

adminCurriculumRouter.get("/courses/:courseId/faculty", ...readGuards, async (req, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Invalid course" })
  try {
    const [assigned, facultyUsers] = await Promise.all([
      prisma.facultyCourseAssignment.findMany({
        where: { courseId: params.data.courseId },
        include: { user: { select: { id: true, displayName: true, email: true } } },
      }),
      prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: { name: { in: [RoleName.FACULTY, RoleName.ADMIN, RoleName.PLATFORM_ADMIN] } },
            },
          },
        },
        select: { id: true, displayName: true, email: true },
        orderBy: { email: "asc" },
      }),
    ])
    res.json({
      data: {
        assigned: assigned.map((a) => ({
          userId: a.user.id,
          name: a.user.displayName ?? a.user.email,
          email: a.user.email,
          assignedAt: a.createdAt.toISOString(),
        })),
        availableFaculty: facultyUsers.map((u) => ({
          id: u.id,
          name: u.displayName ?? u.email,
          email: u.email,
        })),
      },
    })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to load course faculty assignments")
  }
})

adminCurriculumRouter.post("/courses/:courseId/faculty", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  const body = z.object({ userId: uuidSchema }).safeParse(req.body)
  if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
  try {
    await prisma.facultyCourseAssignment.upsert({
      where: { userId_courseId: { userId: body.data.userId, courseId: params.data.courseId } },
      update: {},
      create: { userId: body.data.userId, courseId: params.data.courseId },
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.faculty.assign",
      targetType: "Course",
      targetId: params.data.courseId,
      summary: `Assigned faculty ${body.data.userId} to course ${params.data.courseId}`,
    })
    res.status(201).json({ data: { assigned: true } })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to assign faculty to course")
  }
})

adminCurriculumRouter.delete("/courses/:courseId/faculty/:userId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema, userId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Validation failed" })
  try {
    await prisma.facultyCourseAssignment.deleteMany({
      where: { courseId: params.data.courseId, userId: params.data.userId },
    })
    res.json({ data: { removed: true } })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to unassign faculty")
  }
})


adminCurriculumRouter.delete("/courses/:courseId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ courseId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Invalid course" })
  try {
    const existing = await prisma.course.findUnique({
      where: { id: params.data.courseId },
      select: { id: true, slug: true, title: true },
    })
    if (!existing) return res.status(404).json({ error: "Course not found" })
    await prisma.course.delete({ where: { id: existing.id } })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "curriculum.course.delete",
      targetType: "Course",
      targetId: existing.id,
      summary: `Deleted course ${existing.slug} (${existing.title})`,
    }).catch(() => undefined)
    res.json({ data: { deleted: true, id: existing.id, slug: existing.slug } })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to delete course")
  }
})


adminCurriculumRouter.delete("/materials/:materialId", ...guards, async (req: AuthenticatedRequest, res) => {
  const params = z.object({ materialId: uuidSchema }).safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: "Invalid material" })
  try {
    const mat = await prisma.lessonMaterial.findUnique({
      where: { id: params.data.materialId },
      include: { node: { select: { module: { select: { courseId: true } } } } },
    })
    if (!mat || !mat.node.module.courseId) return res.status(404).json({ error: "Material not found" })
    await deleteFile(mat.storageKey).catch(() => undefined)
    await prisma.lessonMaterial.delete({ where: { id: mat.id } })
    const loaded = await loadCourse(mat.node.module.courseId)
    res.json({ data: serializeCourse(loaded!) })
  } catch (error) {
    sendAuthoringError(res, error, "Failed to delete lesson material")
  }
})
