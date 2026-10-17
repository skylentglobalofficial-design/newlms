import { Prisma, type PracticeWorkspaceStatus } from "@prisma/client"
import { prisma } from "../prisma.js"
import { resolveCourseEnrollment } from "../lms.js"
import {
  provisionCourse,
  publishedBindingFor,
  rankWorkspaceAdapters,
  validateManifest,
  type CourseSyllabus,
  type WorkspaceManifest,
} from "../practice-platform/index.js"

const RESERVED_DATASETS: Record<string, string> = {
  northwind_sales: "data-analytics",
}

const RESERVED_CASES: Record<string, string> = {
  "harbor-desk": "product-management",
}

export type WorkspaceConfig = {
  adapterId: string | null
  lessonIds: string[]
  datasetId: string | null
  caseId: string | null
  caseTitle: string
  caseNotes: string
  tools: string[]
}

export class PracticeWorkspaceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

function emptyConfig(): WorkspaceConfig {
  return { adapterId: null, lessonIds: [], datasetId: null, caseId: null, caseTitle: "", caseNotes: "", tools: [] }
}

function asConfig(value: unknown): WorkspaceConfig {
  const row = value && typeof value === "object" ? (value as Partial<WorkspaceConfig>) : {}
  return {
    adapterId: typeof row.adapterId === "string" ? row.adapterId : null,
    lessonIds: Array.isArray(row.lessonIds) ? row.lessonIds.filter((item) => typeof item === "string") : [],
    datasetId: typeof row.datasetId === "string" ? row.datasetId : null,
    caseId: typeof row.caseId === "string" ? row.caseId : null,
    caseTitle: typeof row.caseTitle === "string" ? row.caseTitle : "",
    caseNotes: typeof row.caseNotes === "string" ? row.caseNotes : "",
    tools: Array.isArray(row.tools) ? row.tools.filter((item) => typeof item === "string") : [],
  }
}

function asManifest(value: unknown): WorkspaceManifest {
  return value as WorkspaceManifest
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

function isolationError(courseSlug: string, config: WorkspaceConfig): string | null {
  if (config.datasetId && RESERVED_DATASETS[config.datasetId] && RESERVED_DATASETS[config.datasetId] !== courseSlug) {
    return "That dataset belongs to another course and cannot be attached here."
  }
  if (config.caseId && RESERVED_CASES[config.caseId] && RESERVED_CASES[config.caseId] !== courseSlug) {
    return "That case belongs to another course and cannot be attached here."
  }
  return null
}

/**
 * Turn a recommendation plus an admin configuration into a status.
 * Matching a syllabus never publishes, and it never grants another course's material.
 */
export function evaluateWorkspace(syllabus: CourseSyllabus, config: WorkspaceConfig): WorkspaceManifest {
  const recommendation = provisionCourse(syllabus)
  const scores = rankWorkspaceAdapters(syllabus)
  const blocked = isolationError(syllabus.courseSlug, config)
  if (blocked) {
    return {
      ...recommendation,
      status: "needs_review",
      adapterId: config.adapterId ?? recommendation.adapterId,
      href: null,
      datasetId: null,
      caseId: null,
      lessonIds: [],
      reasons: [blocked],
      missing: [],
      learnerNote: blocked,
    }
  }

  if (recommendation.status === "not_configured" || recommendation.status === "pending_infrastructure") {
    return { ...recommendation, href: null, lessonIds: [] }
  }

  const chosen = config.adapterId ?? recommendation.adapterId
  const chosenScore = scores.find((row) => row.id === chosen)
  if (!chosen || !chosenScore) {
    return {
      ...recommendation,
      status: "needs_review",
      href: null,
      lessonIds: [],
      reasons: ["Choose a workspace type that matched this syllabus."],
      learnerNote: "Choose a workspace type that matched this syllabus.",
    }
  }

  const lessonIds = config.lessonIds.filter((id) => syllabus.lessons.some((lesson) => lesson.id === id))
  if (config.lessonIds.length > 0 && lessonIds.length !== config.lessonIds.length) {
    return {
      ...recommendation,
      status: "needs_review",
      adapterId: chosen,
      href: null,
      lessonIds: [],
      reasons: ["Every lesson association must be a lesson in this syllabus."],
      learnerNote: "Every lesson association must be a lesson in this syllabus.",
    }
  }

  if (chosen === "case-studio") {
    if (config.caseTitle.trim().length < 3 || config.caseNotes.trim().length < 40 || lessonIds.length === 0) {
      return {
        ...recommendation,
        status: "needs_review",
        adapterId: chosen,
        href: null,
        lessonIds: [],
        reasons: ["Add the case title, the case notes, and at least one lesson before this workspace can be approved."],
        learnerNote: "The case studio needs its own notes and lesson association. Harbor Desk is not reused.",
      }
    }
    return {
      ...recommendation,
      status: "ready",
      adapterId: chosen,
      title: config.caseTitle.trim(),
      tools: config.tools.length ? config.tools : syllabus.tools,
      lessonIds,
      href: null,
      datasetId: null,
      caseId: config.caseId ?? syllabus.courseSlug,
      reasons: ["The case notes and lesson association passed validation. Publication still needs admin approval."],
      missing: [],
      learnerNote: "Case materials are saved for this course. Nothing is executed.",
    }
  }

  if (chosen === "sql-lab") {
    const owner = config.datasetId ? RESERVED_DATASETS[config.datasetId] : undefined
    if (!owner || owner !== syllabus.courseSlug) {
      return {
        ...recommendation,
        status: "needs_review",
        adapterId: chosen,
        href: null,
        datasetId: null,
        lessonIds: [],
        reasons: ["This course has no executable dataset of its own. Northwind is not assigned as a fallback."],
        learnerNote: "No SQL lab is approved for this course. An existing course lab is not reused.",
      }
    }
    return {
      ...recommendation,
      status: "ready",
      adapterId: chosen,
      lessonIds,
      href: null,
      datasetId: config.datasetId,
      reasons: ["The dataset is approved for this course. Publication still needs admin approval."],
      missing: [],
      learnerNote: recommendation.learnerNote,
    }
  }

  return {
    ...recommendation,
    adapterId: chosen,
    href: null,
    lessonIds: [],
    reasons: recommendation.reasons,
  }
}

async function writeRevision(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  revision: number,
  status: PracticeWorkspaceStatus,
  manifest: WorkspaceManifest,
  config: WorkspaceConfig,
  actorId: string,
  action: string,
  note?: string,
) {
  await tx.practiceWorkspaceRevision.create({
    data: {
      workspaceId,
      revision,
      status,
      manifest: json(manifest),
      config: json(config),
      actorId,
      action,
      note: note ?? null,
    },
  })
}

function present(row: {
  id: string
  courseSlug: string
  programmeSlug: string | null
  status: PracticeWorkspaceStatus
  adapterId: string | null
  revision: number
  syllabus: Prisma.JsonValue
  manifest: Prisma.JsonValue
  config: Prisma.JsonValue
  approvedAt: Date | null
  publishedAt: Date | null
  updatedAt: Date
}) {
  const manifest = asManifest(row.manifest)
  return {
    id: row.id,
    courseSlug: row.courseSlug,
    programmeSlug: row.programmeSlug,
    status: row.status,
    adapterId: row.adapterId,
    revision: row.revision,
    syllabus: row.syllabus,
    manifest,
    config: asConfig(row.config),
    scores: rankWorkspaceAdapters(row.syllabus as unknown as CourseSyllabus),
    approvedAt: row.approvedAt?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    validationErrors: validateManifest(manifest),
  }
}

export async function createPracticeWorkspace(actorId: string, syllabus: CourseSyllabus) {
  const existingBinding = publishedBindingFor(syllabus.courseSlug)
  if (existingBinding) {
    throw new PracticeWorkspaceError("This course already has a published workspace. It is not replaced by a new recommendation.", 409)
  }
  const recommendation = provisionCourse(syllabus)
  if (recommendation.status === "published") {
    throw new PracticeWorkspaceError("A syllabus match cannot publish a workspace.", 409)
  }
  const config = emptyConfig()
  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.practiceWorkspace.create({
      data: {
        courseSlug: syllabus.courseSlug,
        programmeSlug: syllabus.programmeSlug ?? null,
        syllabus: json(syllabus),
        manifest: json(recommendation),
        config: json(config),
        status: recommendation.status,
        adapterId: recommendation.adapterId,
        revision: 1,
      },
    })
    await writeRevision(tx, row.id, 1, recommendation.status, recommendation, config, actorId, "recommend")
    return row
  })
  return present(created)
}

export async function listPracticeWorkspaces() {
  const rows = await prisma.practiceWorkspace.findMany({ orderBy: { updatedAt: "desc" } })
  return rows.map((row) => present(row))
}

export async function getPracticeWorkspace(id: string) {
  const row = await prisma.practiceWorkspace.findUnique({ where: { id } })
  if (!row) throw new PracticeWorkspaceError("Workspace not found", 404)
  return present(row)
}

export async function configurePracticeWorkspace(actorId: string, id: string, patch: Partial<WorkspaceConfig>) {
  const current = await prisma.practiceWorkspace.findUnique({ where: { id } })
  if (!current) throw new PracticeWorkspaceError("Workspace not found", 404)
  if (current.status === "published") {
    throw new PracticeWorkspaceError("Unpublish this workspace before changing its configuration.", 409)
  }
  const config = { ...asConfig(current.config), ...patch }
  const manifest = evaluateWorkspace(current.syllabus as unknown as CourseSyllabus, config)
  const errors = validateManifest({ ...manifest, status: manifest.status === "ready" ? "needs_review" : manifest.status })
  if (errors.length) throw new PracticeWorkspaceError(errors[0], 400)
  const revision = current.revision + 1
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.practiceWorkspace.update({
      where: { id },
      data: {
        manifest: json(manifest),
        config: json(config),
        status: manifest.status,
        adapterId: manifest.adapterId,
        revision,
        approvedAt: null,
        approvedById: null,
        publishedAt: null,
      },
    })
    await writeRevision(tx, id, revision, manifest.status, manifest, config, actorId, "configure")
    return row
  })
  return present(updated)
}

export async function approvePracticeWorkspace(actorId: string, id: string) {
  const current = await prisma.practiceWorkspace.findUnique({ where: { id } })
  if (!current) throw new PracticeWorkspaceError("Workspace not found", 404)
  if (current.status !== "ready") {
    throw new PracticeWorkspaceError("Only a workspace that has passed validation can be approved.", 409)
  }
  const manifest = evaluateWorkspace(current.syllabus as unknown as CourseSyllabus, asConfig(current.config))
  if (manifest.status !== "ready") {
    throw new PracticeWorkspaceError(manifest.learnerNote, 409)
  }
  const revision = current.revision + 1
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.practiceWorkspace.update({
      where: { id },
      data: { approvedAt: new Date(), approvedById: actorId, revision, manifest: json(manifest) },
    })
    await writeRevision(tx, id, revision, "ready", manifest, asConfig(current.config), actorId, "approve")
    return row
  })
  return present(updated)
}

export async function publishPracticeWorkspace(actorId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.practiceWorkspace.findUnique({ where: { id } })
    if (!current) throw new PracticeWorkspaceError("Workspace not found", 404)
    if (!current.approvedAt || !current.approvedById) {
      throw new PracticeWorkspaceError("Approve the validated workspace before publishing it.", 409)
    }
    const config = asConfig(current.config)
    const manifest = evaluateWorkspace(current.syllabus as unknown as CourseSyllabus, config)
    if (manifest.status !== "ready") throw new PracticeWorkspaceError(manifest.learnerNote, 409)
    const published: WorkspaceManifest = {
      ...manifest,
      status: "published",
      href: `/os/practice/${current.courseSlug}`,
      reasons: ["An admin approved this configuration."],
    }
    const errors = validateManifest(published)
    if (errors.length) throw new PracticeWorkspaceError(errors[0], 400)
    const revision = current.revision + 1
    const row = await tx.practiceWorkspace.update({
      where: { id },
      data: {
        status: "published",
        manifest: json(published),
        publishedAt: new Date(),
        revision,
      },
    })
    await writeRevision(tx, id, revision, "published", published, config, actorId, "publish")
    return present(row)
  })
}

export async function rejectPracticeWorkspace(actorId: string, id: string, note: string) {
  const current = await prisma.practiceWorkspace.findUnique({ where: { id } })
  if (!current) throw new PracticeWorkspaceError("Workspace not found", 404)
  if (current.status === "published") throw new PracticeWorkspaceError("Unpublish this workspace before rejecting it.", 409)
  const manifest = { ...asManifest(current.manifest), status: "needs_review" as const, href: null, learnerNote: note }
  const revision = current.revision + 1
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.practiceWorkspace.update({
      where: { id },
      data: {
        status: "needs_review",
        manifest: json(manifest),
        approvedAt: null,
        approvedById: null,
        publishedAt: null,
        revision,
      },
    })
    await writeRevision(tx, id, revision, "needs_review", manifest, asConfig(current.config), actorId, "reject", note)
    return row
  })
  return present(updated)
}

export async function unpublishPracticeWorkspace(actorId: string, id: string) {
  const current = await prisma.practiceWorkspace.findUnique({ where: { id } })
  if (!current) throw new PracticeWorkspaceError("Workspace not found", 404)
  if (current.status !== "published") throw new PracticeWorkspaceError("This workspace is not published.", 409)
  const manifest = { ...asManifest(current.manifest), status: "ready" as const, href: null }
  const revision = current.revision + 1
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.practiceWorkspace.update({
      where: { id },
      data: { status: "ready", publishedAt: null, manifest: json(manifest), revision },
    })
    await writeRevision(tx, id, revision, "ready", manifest, asConfig(current.config), actorId, "unpublish")
    return row
  })
  return present(updated)
}

export async function revalidatePracticeWorkspace(actorId: string, id: string) {
  const current = await prisma.practiceWorkspace.findUnique({ where: { id } })
  if (!current) throw new PracticeWorkspaceError("Workspace not found", 404)
  const config = asConfig(current.config)
  const manifest = evaluateWorkspace(current.syllabus as unknown as CourseSyllabus, config)
  const nextStatus = manifest.status === "ready" && current.status === "published" && current.approvedAt ? "published" : manifest.status
  const stored = nextStatus === "published" ? { ...manifest, status: "published" as const, href: `/os/practice/${current.courseSlug}` } : { ...manifest, href: null }
  if (nextStatus === "published") {
    const errors = validateManifest(stored)
    if (errors.length) throw new PracticeWorkspaceError(errors[0], 400)
  }
  const revision = current.revision + 1
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.practiceWorkspace.update({
      where: { id },
      data: {
        status: nextStatus,
        manifest: json(stored),
        adapterId: stored.adapterId,
        publishedAt: nextStatus === "published" ? current.publishedAt : null,
        approvedAt: nextStatus === "ready" || nextStatus === "published" ? current.approvedAt : null,
        approvedById: nextStatus === "ready" || nextStatus === "published" ? current.approvedById : null,
        revision,
      },
    })
    await writeRevision(tx, id, revision, nextStatus, stored, config, actorId, "revalidate")
    return row
  })
  return present(updated)
}

export function testPracticeWorkspace(row: ReturnType<typeof present>) {
  if (row.status === "pending_infrastructure") {
    return { ok: false, detail: row.manifest.missing[0] ?? row.manifest.learnerNote }
  }
  if (row.adapterId === "sql-lab") {
    return { ok: false, detail: "This course has no isolated SQL dataset to execute. The test did not run a query." }
  }
  if (row.adapterId === "case-studio" && row.config.caseNotes.trim().length >= 40) {
    return { ok: true, detail: "Case notes are present. Learner writing can be saved after publication. Nothing was executed." }
  }
  return { ok: false, detail: row.manifest.learnerNote }
}

export async function learnerPracticeWorkspace(userId: string, courseSlug: string) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  if (!course) throw new PracticeWorkspaceError("Course not found", 404)
  const enrollment = await resolveCourseEnrollment(userId, course.id)
  if (!enrollment) throw new PracticeWorkspaceError("Enrol in this course to open its workspace.", 403)
  const row = await prisma.practiceWorkspace.findUnique({ where: { courseSlug } })
  if (!row || row.status !== "published") throw new PracticeWorkspaceError("This course has no published workspace.", 404)
  const config = asConfig(row.config)
  const manifest = asManifest(row.manifest)
  return {
    courseSlug,
    courseTitle: course.title,
    adapterId: row.adapterId,
    title: manifest.title,
    learnerNote: manifest.learnerNote,
    lessonIds: manifest.lessonIds,
    href: manifest.href,
    caseTitle: config.caseTitle,
    caseNotes: config.caseNotes,
  }
}

export async function saveLearnerPracticeResponse(userId: string, courseSlug: string, lessonId: string, body: string) {
  const visible = await learnerPracticeWorkspace(userId, courseSlug)
  if (visible.adapterId !== "case-studio") {
    throw new PracticeWorkspaceError("This workspace does not save a written response.", 409)
  }
  if (!visible.lessonIds.includes(lessonId)) {
    throw new PracticeWorkspaceError("That lesson is not part of this workspace.", 403)
  }
  const workspace = await prisma.practiceWorkspace.findUnique({ where: { courseSlug } })
  if (!workspace) throw new PracticeWorkspaceError("This course has no published workspace.", 404)
  const saved = await prisma.practiceWorkspaceResponse.upsert({
    where: { workspaceId_userId_lessonId: { workspaceId: workspace.id, userId, lessonId } },
    create: { workspaceId: workspace.id, userId, lessonId, body },
    update: { body },
  })
  return { lessonId: saved.lessonId, body: saved.body, updatedAt: saved.updatedAt.toISOString() }
}
