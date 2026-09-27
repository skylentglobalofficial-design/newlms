import { localPathRecommendationService } from "./recommendation"
import { resolvePhaseExecutionAction } from "./actionBindings"
import { verifyPathActionOnServer } from "./lmsVerification"
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
): {
  snapshot: PathExecutionSnapshot
  followUp: string
} {
  const state = loadPathState()
  const roadmap = requireRoadmap(state)
  const next = completePhase(getPathExecutionProgress(), phaseKey, new Date().toISOString(), completionSource)
  savePathState({ ...state, execution: next })
  const snapshot = buildExecutionSnapshot(next, roadmap, state.diagnosis)
  return {
    snapshot,
    followUp: nextActionAfterComplete(next, roadmap),
  }
}

/** When LMS reports the linked resource complete, advance Path with lms_verified source. */
export async function tryCompletePathPhaseFromLms(phaseKey: PathPhaseKey): Promise<{
  verified: boolean
  snapshot: PathExecutionSnapshot | null
  followUp?: string
}> {
  const state = loadPathState()
  if (!state.roadmap || !state.diagnosis) return { verified: false, snapshot: null }
  const progress = getPathExecutionProgress()
  if (getCurrentPhaseKey(progress) !== phaseKey) return { verified: false, snapshot: snapshotForState(state) }
  if (progress.phases[phaseKey].status !== "in_progress") {
    return { verified: false, snapshot: snapshotForState(state) }
  }

  const action = resolvePhaseExecutionAction(state.diagnosis, state.roadmap, phaseKey)
  const verified = await verifyPathActionOnServer(action)
  if (!verified) {
    return { verified: false, snapshot: snapshotForState(state) }
  }

  const result = completePathPhase(phaseKey, "lms_verified")
  return { verified: true, snapshot: result.snapshot, followUp: result.followUp }
}

export function resetPathExecutionProgress(): PathExecutionSnapshot | null {
  const state = loadPathState()
  if (!state.roadmap) return null
  const execution = resetExecutionProgress()
  savePathState({ ...state, execution })
  return buildExecutionSnapshot(execution, state.roadmap, state.diagnosis)
}

export function clearPathState(): void {
  resetPathState()
}
