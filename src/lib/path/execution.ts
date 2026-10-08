import type {
  PathPhaseKey,
  PathPhaseStatus,
  PathExecutionProgress,
  PersonalRoadmap,
  PathCompletionSource,
  PathPhaseExecutionAction,
} from "./types"
import { resolvePhaseExecutionAction, primaryRoadmapActionLabel } from "./actionBindings"
import type { PathDiagnosis } from "./types"

export const PATH_PHASE_KEYS: PathPhaseKey[] = [
  "foundation",
  "skills",
  "practice",
  "build",
  "proof",
  "opportunity",
]

export const PATH_PHASE_LABELS: Record<PathPhaseKey, string> = {
  foundation: "Foundation",
  skills: "Skills",
  practice: "Practice",
  build: "Build",
  proof: "Proof",
  opportunity: "Opportunity",
}

export function emptyExecutionProgress(): PathExecutionProgress {
  const phases = {} as PathExecutionProgress["phases"]
  for (const key of PATH_PHASE_KEYS) {
    phases[key] = { status: "not_started" }
  }
  return {
    phases,
    updatedAt: new Date(0).toISOString(),
  }
}

export function normalizeExecutionProgress(raw: PathExecutionProgress | undefined): PathExecutionProgress {
  if (!raw?.phases) return emptyExecutionProgress()
  const phases = emptyExecutionProgress().phases
  for (const key of PATH_PHASE_KEYS) {
    const row = raw.phases[key]
    if (!row?.status) continue
    phases[key] = {
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      completionSource: row.completionSource,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
    }
  }
  return { phases, updatedAt: raw.updatedAt ?? new Date(0).toISOString() }
}

/** First phase that is not completed — the active step in the journey. */
export function getCurrentPhaseKey(progress: PathExecutionProgress): PathPhaseKey | null {
  for (const key of PATH_PHASE_KEYS) {
    if (progress.phases[key].status !== "completed") return key
  }
  return null
}

export function getPhaseStatus(progress: PathExecutionProgress, key: PathPhaseKey): PathPhaseStatus {
  return progress.phases[key]?.status ?? "not_started"
}

function primaryActionForPhase(roadmap: PersonalRoadmap, key: PathPhaseKey): string {
  return primaryRoadmapActionLabel(roadmap, key)
}

export type PathExecutionSnapshot = {
  currentPhaseKey: PathPhaseKey | null
  currentPhaseLabel: string
  status: PathPhaseStatus | "all_complete"
  actionText: string
  action: PathPhaseExecutionAction | null
  allComplete: boolean
}

export function buildExecutionSnapshot(
  progress: PathExecutionProgress,
  roadmap: PersonalRoadmap,
  diagnosis: PathDiagnosis | null,
): PathExecutionSnapshot {
  const base = getExecutionSnapshot(progress, roadmap)
  if (!diagnosis || !base.currentPhaseKey) {
    return { ...base, action: null }
  }
  const action = resolvePhaseExecutionAction(diagnosis, roadmap, base.currentPhaseKey)
  return {
    ...base,
    actionText: action.label,
    action,
  }
}

/**
 * One clear next action for the learner. Text comes from roadmap phase actions — not hiring outcomes.
 */
export function getExecutionSnapshot(
  progress: PathExecutionProgress,
  roadmap: PersonalRoadmap,
): PathExecutionSnapshot {
  const currentPhaseKey = getCurrentPhaseKey(progress)

  if (!currentPhaseKey) {
    return {
      currentPhaseKey: null,
      currentPhaseLabel: "Opportunity",
      status: "all_complete",
      actionText:
        "You marked every Skylent path phase complete on this device. Review execution options below or edit your path if your situation changed.",
      allComplete: true,
      action: null,
    }
  }

  const status = getPhaseStatus(progress, currentPhaseKey)
  const label = PATH_PHASE_LABELS[currentPhaseKey]
  const action = primaryActionForPhase(roadmap, currentPhaseKey)

  if (status === "not_started") {
    return {
      currentPhaseKey,
      currentPhaseLabel: label,
      status,
      actionText: action,
      allComplete: false,
      action: null,
    }
  }

  if (status === "in_progress") {
    return {
      currentPhaseKey,
      currentPhaseLabel: label,
      status,
      actionText: action,
      allComplete: false,
      action: null,
    }
  }

  return {
    currentPhaseKey,
    currentPhaseLabel: label,
    status: "not_started",
    actionText: action,
    allComplete: false,
    action: null,
  }
}

export function startPhase(
  progress: PathExecutionProgress,
  key: PathPhaseKey,
  now = new Date().toISOString(),
  action?: PathPhaseExecutionAction,
): PathExecutionProgress {
  const current = getCurrentPhaseKey(progress)
  if (current !== key) {
    throw new Error(`Can only start the current phase (${current ?? "none"}), not ${key}.`)
  }
  if (progress.phases[key].status !== "not_started") {
    throw new Error(`Phase ${key} is not in not_started state.`)
  }
  const resource = action?.resource
  return {
    phases: {
      ...progress.phases,
      [key]: {
        status: "in_progress",
        startedAt: now,
        resourceType: resource?.type,
        resourceId: resource?.resourceId,
      },
    },
    updatedAt: now,
  }
}

export function completePhase(
  progress: PathExecutionProgress,
  key: PathPhaseKey,
  now = new Date().toISOString(),
  completionSource: PathCompletionSource = "manual",
): PathExecutionProgress {
  const current = getCurrentPhaseKey(progress)
  if (current !== key) {
    throw new Error(`Can only complete the current phase (${current ?? "none"}), not ${key}.`)
  }
  if (progress.phases[key].status !== "in_progress") {
    throw new Error(`Phase ${key} must be in_progress before completing.`)
  }

  const nextProgress: PathExecutionProgress = {
    phases: {
      ...progress.phases,
      [key]: {
        status: "completed",
        startedAt: progress.phases[key].startedAt,
        completedAt: now,
        completionSource,
        resourceType: progress.phases[key].resourceType,
        resourceId: progress.phases[key].resourceId,
      },
    },
    updatedAt: now,
  }

  return nextProgress
}

/** Action label after completing a phase — points at the next phase's first task. */
export function nextActionAfterComplete(
  progress: PathExecutionProgress,
  roadmap: PersonalRoadmap,
): string {
  const nextKey = getCurrentPhaseKey(progress)
  if (!nextKey) {
    return "All phases marked complete in Skylent — choose your next move from the roadmap below."
  }
  const nextAction = primaryActionForPhase(roadmap, nextKey)
  return `Next: ${PATH_PHASE_LABELS[nextKey]} — ${nextAction}`
}

export function resetExecutionProgress(now = new Date().toISOString()): PathExecutionProgress {
  return { ...emptyExecutionProgress(), updatedAt: now }
}
