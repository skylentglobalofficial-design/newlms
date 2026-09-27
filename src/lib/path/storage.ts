import { localPathRecommendationService } from "./recommendation"
import { listCareerEvidenceProjects } from "../career-api"
import { resolvePhaseExecutionAction } from "./actionBindings"
import {
  appendEvidenceEntries,
  buildManualEvidenceRecord,
  buildVerifiedEvidenceRecords,
  emptyPathEvidenceLog,
  evidenceForPhase,
  normalizePathEvidenceLog,
  resolveVerifiedCompletionSource,
} from "./evidence"
import { fetchLmsVerificationSnapshot } from "./lmsVerification"
import {
  completePhase,
  emptyExecutionProgress,
  getCurrentPhaseKey,
  normalizeExecutionProgress,
  resetExecutionProgress,
  startPhase,
  type PathExecutionSnapshot,
  buildExecutionSnapshot,
  nextActionAfterComplete,
} from "./execution"
import type {
  PathCompletionSource,
  PathDiagnosis,
  PathEvidenceRecord,
  PathExecutionProgress,
  PathFlowDraft,
  PathPhaseKey,
  PathStoredState,
  PersonalRoadmap,
} from "./types"

export {
  getCurrentPhaseKey,
  buildExecutionSnapshot,
  getExecutionSnapshot,
  getPhaseStatus,
  nextActionAfterComplete,
  PATH_PHASE_KEYS,
  PATH_PHASE_LABELS,
} from "./execution"
export { resolvePhaseExecutionAction } from "./actionBindings"
export {
  appendEvidenceEntries,
  buildManualEvidenceRecord,
  buildVerifiedEvidenceRecords,
  completionSourceToTrust,
  evidenceForPhase,
  latestEvidenceForPhase,
  normalizePathEvidenceLog,
  resolveVerifiedCompletionSource,
  trustLabel,
  verifiedEvidenceMatchesSnapshot,
} from "./evidence"
export type { PathEvidenceInputSnapshot } from "./evidence"
export { isPathActionVerifiedComplete, isResourceCompleteInSnapshot } from "./lmsVerification"
export type { PathLmsVerificationSnapshot } from "./lmsVerification"
export type { PathExecutionSnapshot } from "./execution"

export const SKYLENT_PATH_STORAGE_KEY = "skylent-path-v1"

export function emptyPathState(): PathStoredState {
  return {
    version: 1,
    diagnosis: null,
    roadmap: null,
    flowStep: 0,
    draft: {},
  }
}

export function loadPathState(): PathStoredState {
  try {
    const raw = localStorage.getItem(SKYLENT_PATH_STORAGE_KEY)
    if (!raw) return emptyPathState()
    const parsed = JSON.parse(raw) as PathStoredState
    if (parsed.version !== 1) return emptyPathState()
    return {
      ...emptyPathState(),
      ...parsed,
      draft: parsed.draft ?? {},
      execution: parsed.roadmap
        ? normalizeExecutionProgress(parsed.execution)
        : normalizeExecutionProgress(undefined),
      evidence: normalizePathEvidenceLog(parsed.evidence),
    }
  } catch {
    return emptyPathState()
  }
}

export function savePathState(state: PathStoredState): void {
  localStorage.setItem(SKYLENT_PATH_STORAGE_KEY, JSON.stringify(state))
}

export function savePathDraft(flowStep: number, draft: PathFlowDraft): void {
  const current = loadPathState()
  savePathState({
    ...current,
    flowStep,
    draft,
  })
}

/** Clears diagnosis, roadmap, draft, and flow step (full path reset). */
export function resetPathState(): void {
  savePathState(emptyPathState())
}

export function completePathDiagnosis(diagnosis: PathDiagnosis): PersonalRoadmap {
  const roadmap = localPathRecommendationService.buildRoadmap(diagnosis)
  savePathState({
    version: 1,
    diagnosis,
    roadmap,
    flowStep: 0,
    draft: {},
    execution: emptyExecutionProgress(),
    evidence: emptyPathEvidenceLog(),
  })
  return roadmap
}

function requireRoadmap(state: PathStoredState): PersonalRoadmap {
  if (!state.roadmap) throw new Error("No roadmap saved.")
  return state.roadmap
}

export function getPathExecutionProgress(): PathExecutionProgress {
  const state = loadPathState()
  return normalizeExecutionProgress(state.execution)
}

function recordEvidenceForPhaseComplete(
  state: PathStoredState,
  phaseKey: PathPhaseKey,
  completionSource: PathCompletionSource,
  options?: {
    snapshot?: import("./lmsVerification").PathLmsVerificationSnapshot
    careerProjects?: import("../career-api").CareerEvidenceSummary[]
  },
): PathStoredState {
  if (!state.diagnosis || !state.roadmap) return state
  const action = resolvePhaseExecutionAction(state.diagnosis, state.roadmap, phaseKey)
  const recordedAt = new Date().toISOString()
  let entries: PathEvidenceRecord[] = []

  if (completionSource === "manual") {
    entries = [buildManualEvidenceRecord({ action, phaseKey, recordedAt })]
  } else if (action.resource && options?.snapshot) {
    entries = buildVerifiedEvidenceRecords({
      action,
      phaseKey,
      resource: action.resource,
      snapshot: options.snapshot,
      careerProjects: options.careerProjects ?? [],
      completionSource,
      recordedAt,
    })
  }

  if (!entries.length) return state
  return {
    ...state,
    evidence: appendEvidenceEntries(normalizePathEvidenceLog(state.evidence), entries),
  }
}

export function getPathEvidenceLog(): import("./types").PathEvidenceLog {
  return normalizePathEvidenceLog(loadPathState().evidence)
}

function snapshotForState(state: PathStoredState): PathExecutionSnapshot | null {
  if (!state.roadmap) return null
  return buildExecutionSnapshot(
    normalizeExecutionProgress(state.execution),
    state.roadmap,
    state.diagnosis,
  )
}

export function getPathExecutionSnapshot(): PathExecutionSnapshot | null {
  return snapshotForState(loadPathState())
}

export function startPathPhase(phaseKey: PathPhaseKey): PathExecutionSnapshot {
  const state = loadPathState()
  const roadmap = requireRoadmap(state)
  if (!state.diagnosis) throw new Error("No path diagnosis saved.")
  const action = resolvePhaseExecutionAction(state.diagnosis, roadmap, phaseKey)
  const next = startPhase(getPathExecutionProgress(), phaseKey, new Date().toISOString(), action)
  savePathState({ ...state, execution: next })
  return buildExecutionSnapshot(next, roadmap, state.diagnosis)
}

export function completePathPhase(
  phaseKey: PathPhaseKey,
  completionSource: PathCompletionSource = "manual",
  evidenceContext?: {
    snapshot?: import("./lmsVerification").PathLmsVerificationSnapshot
    careerProjects?: import("../career-api").CareerEvidenceSummary[]
  },
): {
  snapshot: PathExecutionSnapshot
  followUp: string
  evidence: import("./types").PathEvidenceRecord[]
} {
  let state = loadPathState()
  const roadmap = requireRoadmap(state)
  const next = completePhase(getPathExecutionProgress(), phaseKey, new Date().toISOString(), completionSource)
  state = { ...state, execution: next }
  state = recordEvidenceForPhaseComplete(state, phaseKey, completionSource, evidenceContext)
  savePathState(state)
  const snapshot = buildExecutionSnapshot(next, roadmap, state.diagnosis)
  const log = normalizePathEvidenceLog(state.evidence)
  return {
    snapshot,
    followUp: nextActionAfterComplete(next, roadmap),
    evidence: evidenceForPhase(log, phaseKey),
  }
}

/** When LMS reports the linked resource complete, advance Path with lms_verified source. */
export async function tryCompletePathPhaseFromLms(phaseKey: PathPhaseKey): Promise<{
  verified: boolean
  snapshot: PathExecutionSnapshot | null
  followUp?: string
  evidence?: import("./types").PathEvidenceRecord[]
}> {
  const state = loadPathState()
  if (!state.roadmap || !state.diagnosis) return { verified: false, snapshot: null }
  const progress = getPathExecutionProgress()
  if (getCurrentPhaseKey(progress) !== phaseKey) return { verified: false, snapshot: snapshotForState(state) }
  if (progress.phases[phaseKey].status !== "in_progress") {
    return { verified: false, snapshot: snapshotForState(state) }
  }

  const action = resolvePhaseExecutionAction(state.diagnosis, state.roadmap, phaseKey)
  if (!action.resource) {
    return { verified: false, snapshot: snapshotForState(state) }
  }

  const lmsSnapshot = await fetchLmsVerificationSnapshot(action.resource)
  let careerProjects: import("../career-api").CareerEvidenceSummary[] = []
  try {
    careerProjects = await listCareerEvidenceProjects()
  } catch {
    careerProjects = []
  }

  const completionSource = resolveVerifiedCompletionSource(action.resource, lmsSnapshot)
  if (!completionSource) {
    return { verified: false, snapshot: snapshotForState(state) }
  }

  const result = completePathPhase(phaseKey, completionSource, { snapshot: lmsSnapshot, careerProjects })
  return {
    verified: true,
    snapshot: result.snapshot,
    followUp: result.followUp,
    evidence: result.evidence,
  }
}

export function resetPathExecutionProgress(): PathExecutionSnapshot | null {
  const state = loadPathState()
  if (!state.roadmap) return null
  const execution = resetExecutionProgress()
  savePathState({ ...state, execution, evidence: emptyPathEvidenceLog() })
  return buildExecutionSnapshot(execution, state.roadmap, state.diagnosis)
}

export function clearPathState(): void {
  resetPathState()
}
