import type { ApiLessonState } from "../lms-api"
import { fetchCourseWorkspace } from "../lms-api"
import { listNorthwindLabWork } from "../labs-api"
import { listLearnerProjects, type ProjectSummary } from "../projects-api"
import type { PathExecutionResource, PathPhaseExecutionAction } from "./types"

export type PathLmsVerificationSnapshot = {
  lessonStatesByCourse: Record<string, Record<string, ApiLessonState>>
  projects: ProjectSummary[]
  northwindLabWorkCount: number
}

export function isResourceCompleteInSnapshot(
  resource: PathExecutionResource,
  snapshot: PathLmsVerificationSnapshot,
): boolean {
  switch (resource.type) {
    case "lms_lesson": {
      const courseSlug = resource.courseSlug
      const lessonId = resource.lessonId
      if (!courseSlug || !lessonId) return false
      return snapshot.lessonStatesByCourse[courseSlug]?.[lessonId]?.complete === true
    }
    case "lms_lab":
      return snapshot.northwindLabWorkCount > 0
    case "learner_project": {
      const projectType = resource.projectType
      if (!projectType) return false
      const row = snapshot.projects.find((p) => p.projectType === projectType)
      if (!row) return false
      return row.progress.total > 0 && row.progress.complete === row.progress.total
    }
    case "site_route":
      return false
    default:
      return false
  }
}

export function isPathActionVerifiedComplete(
  action: PathPhaseExecutionAction,
  snapshot: PathLmsVerificationSnapshot,
): boolean {
  if (action.completionMode !== "skylent_resource" || !action.resource) return false
  if (action.resource.type === "site_route") return false
  return isResourceCompleteInSnapshot(action.resource, snapshot)
}

/** Pull LMS truth for the linked resource (requires signed-in learner + enrolment where applicable). */
export async function fetchLmsVerificationSnapshot(
  resource: PathExecutionResource,
  signal?: AbortSignal,
): Promise<PathLmsVerificationSnapshot> {
  const snapshot: PathLmsVerificationSnapshot = {
    lessonStatesByCourse: {},
    projects: [],
    northwindLabWorkCount: 0,
  }

  if (resource.type === "lms_lesson" && resource.courseSlug) {
    try {
      const workspace = await fetchCourseWorkspace(resource.courseSlug)
      snapshot.lessonStatesByCourse[resource.courseSlug] = workspace.lessonStates
    } catch {
      // Not enrolled or not signed in — verification stays false.
    }
  }

  if (resource.type === "lms_lab") {
    try {
      const work = await listNorthwindLabWork(signal)
      snapshot.northwindLabWorkCount = work.length
    } catch {
      snapshot.northwindLabWorkCount = 0
    }
  }

  if (resource.type === "learner_project") {
    try {
      snapshot.projects = await listLearnerProjects(signal)
    } catch {
      snapshot.projects = []
    }
  }

  return snapshot
}

export async function verifyPathActionOnServer(
  action: PathPhaseExecutionAction,
  signal?: AbortSignal,
): Promise<boolean> {
  if (action.completionMode !== "skylent_resource" || !action.resource) return false
  if (action.resource.type === "site_route") return false
  const snapshot = await fetchLmsVerificationSnapshot(action.resource, signal)
  return isPathActionVerifiedComplete(action, snapshot)
}
