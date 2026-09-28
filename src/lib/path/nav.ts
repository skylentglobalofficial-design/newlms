import { loadPathState } from "./storage"
import type { PathDiagnosis, PathFlowDraft, PathStoredState } from "./types"

export function hasCompletedPath(state: PathStoredState = loadPathState()): boolean {
  return Boolean(state.roadmap && state.diagnosis)
}

export function pathPrimaryCta(state: PathStoredState = loadPathState()): { label: string; to: string } {
  if (hasCompletedPath(state)) {
    return { label: "Continue Your Path", to: "/path/result" }
  }
  return { label: "Start Your Path", to: "/path" }
}

export function diagnosisToFlowDraft(diagnosis: PathDiagnosis): PathFlowDraft {
  return {
    academicBackground: diagnosis.academicBackground,
    currentEducation: diagnosis.currentEducation,
    interests: [...diagnosis.interests],
    existingSkills: diagnosis.existingSkills,
    careerDirection: diagnosis.careerDirection,
    strengths: diagnosis.strengths,
    gaps: [...diagnosis.gaps],
    gapDetail: diagnosis.gapDetail,
    directionDetail: diagnosis.directionDetail,
    targetOutcome: diagnosis.targetOutcome,
    timeline: diagnosis.timeline,
  }
}

/** Prefer in-progress draft; otherwise hydrate from last completed diagnosis. */
export function resolvePathFormBootstrap(stored: PathStoredState): { draft: PathFlowDraft; flowStep: number } {
  const draft = stored.draft ?? {}
  const hasDraftContent = Object.keys(draft).length > 0
  const flowStep = Math.min(Math.max(stored.flowStep, 0), 6)

  if (hasDraftContent || flowStep > 0) {
    return { draft, flowStep }
  }

  if (stored.diagnosis) {
    return { draft: diagnosisToFlowDraft(stored.diagnosis), flowStep: 0 }
  }

  return { draft: {}, flowStep: 0 }
}
