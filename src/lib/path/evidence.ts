import type { CareerEvidenceSummary } from "../career-api"
import type { ApiLessonState } from "../lms-api"
import type { PathLmsVerificationSnapshot } from "./lmsVerification"
import { isResourceCompleteInSnapshot } from "./lmsVerification"
import type {
  PathCompletionSource,
  PathEvidenceKind,
  PathEvidenceLog,
  PathEvidenceRecord,
  PathEvidenceTrustClass,
  PathExecutionResource,
  PathPhaseExecutionAction,
  PathPhaseKey,
} from "./types"

/** Authored quiz lesson keys — from seeded Data Analytics / Product Management curricula. */
const QUIZ_LESSON_IDS = new Set(["l3", "l9", "l15"])

/** Capstone / major assignment lessons tied to portfolio-style work samples. */
const ASSIGNMENT_ARTIFACT_LESSONS: Record<string, Set<string>> = {
  "data-analytics": new Set(["l6", "l12", "l13", "l14"]),
  "product-management": new Set(["l6", "l12", "l14"]),
}

export function emptyPathEvidenceLog(now = new Date(0).toISOString()): PathEvidenceLog {
  return { entries: [], updatedAt: now }
}

export function normalizePathEvidenceLog(raw: PathEvidenceLog | undefined): PathEvidenceLog {
  if (!raw?.entries?.length) return emptyPathEvidenceLog(raw?.updatedAt)
  return {
    entries: raw.entries.filter((row) => row.id && row.phaseKey && row.kind && row.trust),
    updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
  }
}

export function completionSourceToTrust(source: PathCompletionSource): PathEvidenceTrustClass {
  return source
}

export function trustLabel(trust: PathEvidenceTrustClass): string {
  switch (trust) {
    case "manual":
      return "Learner marked complete — not verified by Skylent"
    case "lms_verified":
      return "Verified by Skylent LMS"
    case "project_verified":
      return "Verified by Skylent learner project"
    case "career_evidence":
      return "Verified by Career OS evidence"
  }
}

function lessonState(
  snapshot: PathLmsVerificationSnapshot,
  courseSlug: string,
  lessonId: string,
): ApiLessonState | undefined {
  return snapshot.lessonStatesByCourse[courseSlug]?.[lessonId]
}

export function lessonEvidenceKind(courseSlug: string, lessonId: string, state: ApiLessonState): PathEvidenceKind {
  if (!state.complete) return "learning_completed"
  if (state.quizPassed || QUIZ_LESSON_IDS.has(lessonId)) {
    return "quiz_passed"
  }
  if (state.assignmentSubmitted || ASSIGNMENT_ARTIFACT_LESSONS[courseSlug]?.has(lessonId)) {
    return "project_artifact"
  }
  return "learning_completed"
}

export function demonstratedStatement(kind: PathEvidenceKind, action: PathPhaseExecutionAction): string {
  switch (kind) {
    case "quiz_passed":
      return "Passed a Skylent course check on the linked lesson."
    case "lab_completed":
      return "Saved work in the Northwind lab on Skylent."
    case "project_completed":
      return "Completed all tasks on the linked Skylent learner project."
    case "project_artifact":
      return "Submitted Skylent assignment work on the linked lesson."
    case "portfolio_evidence":
      return "Career OS holds eligible evidence from the linked project."
    case "learning_completed":
    default:
      return action.label
  }
}

export function resolveVerifiedCompletionSource(
  resource: PathExecutionResource,
  snapshot: PathLmsVerificationSnapshot,
): PathCompletionSource | null {
  if (!isResourceCompleteInSnapshot(resource, snapshot)) return null
  if (resource.type === "learner_project") return "project_verified"
  return "lms_verified"
}

export function findEligibleCareerEvidence(
  projectType: string,
  careerProjects: CareerEvidenceSummary[],
): CareerEvidenceSummary | undefined {
  return careerProjects.find((row) => row.projectType === projectType && row.eligible)
}

/** Build evidence rows from LMS/project/Career signals — does not write storage. */
export function buildVerifiedEvidenceRecords(options: {
  action: PathPhaseExecutionAction
  phaseKey: PathPhaseKey
  resource: PathExecutionResource
  snapshot: PathLmsVerificationSnapshot
  careerProjects: CareerEvidenceSummary[]
  completionSource: PathCompletionSource
  recordedAt: string
}): PathEvidenceRecord[] {
  const { action, phaseKey, resource, snapshot, careerProjects, completionSource, recordedAt } = options
  const trust = completionSourceToTrust(completionSource)
  const records: PathEvidenceRecord[] = []

  if (resource.type === "lms_lesson" && resource.courseSlug && resource.lessonId) {
    const state = lessonState(snapshot, resource.courseSlug, resource.lessonId)
    if (!state?.complete) return records
    const kind = lessonEvidenceKind(resource.courseSlug, resource.lessonId, state)
    records.push({
      id: `${resource.resourceId}:${trust}:${kind}`,
      phaseKey,
      kind,
      trust,
      demonstrated: demonstratedStatement(kind, action),
      resourceId: resource.resourceId,
      href: resource.href,
      recordedAt,
    })
    return records
  }

  if (resource.type === "lms_lab") {
    if (snapshot.northwindLabWorkCount <= 0) return records
    records.push({
      id: `${resource.resourceId}:${trust}:lab_completed`,
      phaseKey,
      kind: "lab_completed",
      trust,
      demonstrated: demonstratedStatement("lab_completed", action),
      resourceId: resource.resourceId,
      href: resource.href,
      recordedAt,
    })
    return records
  }

  if (resource.type === "learner_project" && resource.projectType) {
    const row = snapshot.projects.find((p) => p.projectType === resource.projectType)
    if (!row || row.progress.total <= 0 || row.progress.complete !== row.progress.total) {
      return records
    }
    records.push({
      id: `${resource.resourceId}:${trust}:project_completed`,
      phaseKey,
      kind: "project_completed",
      trust,
      demonstrated: demonstratedStatement("project_completed", action),
      resourceId: resource.resourceId,
      href: resource.href,
      recordedAt,
    })

    const career = findEligibleCareerEvidence(resource.projectType, careerProjects)
    if (career) {
      records.push({
        id: `career:${career.id}:portfolio_evidence`,
        phaseKey,
        kind: "portfolio_evidence",
        trust: "career_evidence",
        demonstrated: demonstratedStatement("portfolio_evidence", action),
        resourceId: resource.resourceId,
        href: career.href,
        sourceRef: career.id,
        recordedAt,
      })
    }
    return records
  }

  return records
}

export function buildManualEvidenceRecord(options: {
  action: PathPhaseExecutionAction
  phaseKey: PathPhaseKey
  recordedAt: string
}): PathEvidenceRecord {
  const { action, phaseKey, recordedAt } = options
  const resource = action.resource
  const kind: PathEvidenceKind = resource
    ? resource.type === "lms_lab"
      ? "lab_completed"
      : resource.type === "learner_project"
        ? "project_completed"
        : "learning_completed"
    : "learning_completed"

  return {
    id: `manual:${phaseKey}:${recordedAt}`,
    phaseKey,
    kind,
    trust: "manual",
    demonstrated: `${action.label} (self-reported on this device)`,
    resourceId: resource?.resourceId,
    href: resource?.href,
    recordedAt,
  }
}

export function appendEvidenceEntries(log: PathEvidenceLog, entries: PathEvidenceRecord[]): PathEvidenceLog {
  if (!entries.length) return log
  const existing = new Set(log.entries.map((row) => row.id))
  const merged = [...log.entries]
  for (const entry of entries) {
    if (existing.has(entry.id)) continue
    merged.push(entry)
    existing.add(entry.id)
  }
  return { entries: merged, updatedAt: entries[entries.length - 1]?.recordedAt ?? log.updatedAt }
}

/** Guard: incomplete LMS state must not produce verified evidence. */
export function verifiedEvidenceMatchesSnapshot(
  records: PathEvidenceRecord[],
  resource: PathExecutionResource,
  snapshot: PathLmsVerificationSnapshot,
): boolean {
  if (!records.length) return false
  if (records.some((row) => row.trust === "manual")) return true
  return resolveVerifiedCompletionSource(resource, snapshot) !== null
}

export function evidenceForPhase(log: PathEvidenceLog, phaseKey: PathPhaseKey): PathEvidenceRecord[] {
  return log.entries.filter((row) => row.phaseKey === phaseKey)
}

export function latestEvidenceForPhase(log: PathEvidenceLog, phaseKey: PathPhaseKey): PathEvidenceRecord | null {
  const rows = evidenceForPhase(log, phaseKey)
  return rows.length ? rows[rows.length - 1] : null
}

export type PathEvidenceInputSnapshot = PathLmsVerificationSnapshot & {
  careerProjects: CareerEvidenceSummary[]
}
