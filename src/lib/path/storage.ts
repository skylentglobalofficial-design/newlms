import { localPathRecommendationService } from "./recommendation"
import {
  completePhase,
  emptyExecutionProgress,
  normalizeExecutionProgress,
  resetExecutionProgress,
  startPhase,
  type PathExecutionSnapshot,
  getExecutionSnapshot,
  nextActionAfterComplete,
} from "./execution"
import type { PathDiagnosis, PathExecutionProgress, PathFlowDraft, PathPhaseKey, PathStoredState, PersonalRoadmap } from "./types"

export {
  getCurrentPhaseKey,
  getExecutionSnapshot,
  getPhaseStatus,
  nextActionAfterComplete,
  PATH_PHASE_KEYS,
  PATH_PHASE_LABELS,
} from "./execution"
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

export function getPathExecutionSnapshot(): PathExecutionSnapshot | null {
  const state = loadPathState()
  if (!state.roadmap) return null
  return getExecutionSnapshot(getPathExecutionProgress(), state.roadmap)
}

export function startPathPhase(phaseKey: PathPhaseKey): PathExecutionSnapshot {
  const state = loadPathState()
  const roadmap = requireRoadmap(state)
  const next = startPhase(getPathExecutionProgress(), phaseKey)
  savePathState({ ...state, execution: next })
  return getExecutionSnapshot(next, roadmap)
}

export function completePathPhase(phaseKey: PathPhaseKey): {
  snapshot: PathExecutionSnapshot
  followUp: string
} {
  const state = loadPathState()
  const roadmap = requireRoadmap(state)
  const next = completePhase(getPathExecutionProgress(), phaseKey)
  savePathState({ ...state, execution: next })
  return {
    snapshot: getExecutionSnapshot(next, roadmap),
    followUp: nextActionAfterComplete(next, roadmap),
  }
}

export function resetPathExecutionProgress(): PathExecutionSnapshot | null {
  const state = loadPathState()
  if (!state.roadmap) return null
  const execution = resetExecutionProgress()
  savePathState({ ...state, execution })
  return getExecutionSnapshot(execution, state.roadmap)
}

export function clearPathState(): void {
  resetPathState()
}
