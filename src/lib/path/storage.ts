import { localPathRecommendationService } from "./recommendation"
import type { PathDiagnosis, PathFlowDraft, PathStoredState, PersonalRoadmap } from "./types"

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
  const current = loadPathState()
  savePathState({
    version: 1,
    diagnosis,
    roadmap,
    flowStep: 0,
    draft: {},
  })
  return roadmap
}

export function clearPathState(): void {
  resetPathState()
}
