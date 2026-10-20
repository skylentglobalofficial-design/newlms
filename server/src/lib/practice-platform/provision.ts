import { missingCapabilities } from "./capabilities.js"
import { defaultWorkspaceAdapters } from "./adapters.js"
import { publishedBindingFor } from "./bindings.js"
import {
  WORKSPACE_MANIFEST_VERSION,
  type CourseSyllabus,
  type WorkspaceAdapter,
  type WorkspaceManifest,
  type WorkspaceStatus,
} from "./types.js"

function blank(syllabus: CourseSyllabus, status: WorkspaceStatus, reasons: string[], missing: string[] = []): WorkspaceManifest {
  return {
    version: WORKSPACE_MANIFEST_VERSION,
    courseSlug: syllabus.courseSlug,
    programmeSlug: syllabus.programmeSlug ?? null,
    adapterId: null,
    status,
    title: syllabus.title,
    tools: [],
    lessonIds: [],
    href: null,
    datasetId: null,
    caseId: null,
    reasons,
    missing,
    learnerNote: reasons[0] ?? "This course has no practice workspace.",
  }
}

function ranked(syllabus: CourseSyllabus, adapters: readonly WorkspaceAdapter[]) {
  return adapters
    .map((adapter) => ({ adapter, score: adapter.score(syllabus) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.adapter.id.localeCompare(b.adapter.id))
}

export function rankWorkspaceAdapters(syllabus: CourseSyllabus, adapters: readonly WorkspaceAdapter[] = defaultWorkspaceAdapters()) {
  return ranked(syllabus, adapters).map((row) => ({ id: row.adapter.id, label: row.adapter.label, score: row.score }))
}

/**
 * Classify a syllabus and return a validated manifest.
 * A published workspace is returned only when an explicit binding exists for that course.
 * Another course's lab is never used as a fallback.
 */
export function provisionCourse(syllabus: CourseSyllabus, adapters: readonly WorkspaceAdapter[] = defaultWorkspaceAdapters()): WorkspaceManifest {
  if (!syllabus.courseSlug.trim() || syllabus.lessons.length === 0 && syllabus.tools.length === 0 && syllabus.outcomes.length === 0) {
    return blank(syllabus, "not_configured", ["The syllabus has no lessons, tools, or outcomes to classify."])
  }

  const matches = ranked(syllabus, adapters)
  if (matches.length === 0) {
    return blank(syllabus, "not_configured", ["No workspace adapter matched this syllabus."])
  }

  const [winner, second] = matches
  if (second && second.score === winner.score) {
    return blank(
      syllabus,
      "needs_review",
      [`${winner.adapter.label} and ${second.adapter.label} match equally. Choose one before a workspace can be published.`],
    )
  }

  const missing = missingCapabilities(winner.adapter.requiredCapabilities)
  if (missing.length > 0) {
    return {
      ...blank(
        syllabus,
        "pending_infrastructure",
        [`${winner.adapter.label} fits this syllabus, and the runtime it needs is not available.`],
        missing.map((row) => row.detail),
      ),
      adapterId: winner.adapter.id,
      tools: syllabus.tools,
      learnerNote: missing[0]?.detail ?? "The required runtime is not available.",
    }
  }

  const binding = publishedBindingFor(syllabus.courseSlug)
  if (!binding || binding.adapterId !== winner.adapter.id) {
    const owned = binding ? `The approved workspace for this course is ${binding.adapterId}, which does not match ${winner.adapter.id}.` : "No approved dataset, case, or runner is bound to this course."
    return {
      ...blank(syllabus, "needs_review", [owned, "An unrelated lab is not assigned while this is in review."]),
      adapterId: winner.adapter.id,
      tools: syllabus.tools,
      learnerNote: learnerNoteForUnbound(winner.adapter.id, syllabus),
    }
  }

  return {
    version: WORKSPACE_MANIFEST_VERSION,
    courseSlug: binding.courseSlug,
    programmeSlug: binding.programmeSlug,
    adapterId: binding.adapterId,
    status: "published",
    title: binding.title,
    tools: binding.tools,
    lessonIds: binding.lessonIds,
    href: binding.href,
    datasetId: binding.datasetId,
    caseId: binding.caseId,
    reasons: ["An approved binding matches the selected workspace type."],
    missing: [],
    learnerNote: binding.honesty,
  }
}

function learnerNoteForUnbound(adapterId: string, syllabus: CourseSyllabus): string {
  if (adapterId === "sql-lab") {
    return syllabus.courseSlug === "sql-certificate"
      ? "No SQL lab is attached to this certificate. Northwind Lab belongs to Data Analytics."
      : "No SQL lab is approved for this course. An existing course lab is not reused."
  }
  if (adapterId === "case-studio") return "No authored case is approved for this course."
  if (adapterId === "frontend-playground") return "No HTML, CSS, or JavaScript playground, and no API runner, is attached to this programme."
  if (adapterId === "python-notebook") return "No notebook, dataset runner, or model trainer is attached to this programme."
  if (adapterId === "prompt-lab") return "No model runner or experiment workspace is attached to this programme."
  if (adapterId === "exam-bank") return "No timed exam workspace is attached to this programme."
  return "This course does not have an approved practice workspace."
}

export function validateManifest(manifest: WorkspaceManifest): string[] {
  const errors: string[] = []
  if (manifest.version !== WORKSPACE_MANIFEST_VERSION) errors.push(`Manifest version ${manifest.version} is not supported.`)
  if (!manifest.courseSlug.trim()) errors.push("Manifest is missing a course slug.")
  if (manifest.status === "published") {
    if (!manifest.href) errors.push("A published workspace needs a learner route.")
    if (!manifest.adapterId) errors.push("A published workspace needs an adapter.")
    if (manifest.lessonIds.length === 0) errors.push("A published workspace needs at least one lesson.")
    if (manifest.missing.length > 0) errors.push("A published workspace cannot list missing infrastructure.")
  }
  if (manifest.status === "pending_infrastructure" && manifest.missing.length === 0) {
    errors.push("A pending workspace must name the missing infrastructure.")
  }
  if (manifest.status === "not_configured" && manifest.href) errors.push("An unconfigured course must not publish a route.")
  if (manifest.href && manifest.href.includes("northwind") && manifest.courseSlug !== "data-analytics") {
    errors.push("Northwind Lab cannot be attached to another course.")
  }
  if (manifest.href && manifest.href.includes("harbor-desk") && manifest.courseSlug !== "product-management") {
    errors.push("Harbor Desk cannot be attached to another course.")
  }
  return errors
}
