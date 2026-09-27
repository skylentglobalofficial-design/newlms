import { buildRoadmap } from "../src/lib/path/buildRoadmap.ts"
import {
  completePhase,
  emptyExecutionProgress,
  getCurrentPhaseKey,
  getExecutionSnapshot,
  getPhaseStatus,
  nextActionAfterComplete,
  normalizeExecutionProgress,
  resetExecutionProgress,
  startPhase,
} from "../src/lib/path/execution.ts"
import type { PathDiagnosis, PathExecutionProgress } from "../src/lib/path/types.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function baseDiagnosis(overrides: Partial<PathDiagnosis>): PathDiagnosis {
  return {
    academicBackground: "college",
    currentEducation: "undergraduate",
    interests: ["data_analytics"],
    existingSkills: "some_exposure",
    careerDirection: "technical_specialist",
    strengths: "",
    gaps: [],
    gapDetail: "",
    directionDetail: "junior data analyst",
    targetOutcome: "land_first_role",
    timeline: "six_months",
    completedAt: new Date(0).toISOString(),
    ...overrides,
  }
}

const roadmap = buildRoadmap(baseDiagnosis({}))
const NOW = "2026-01-15T12:00:00.000Z"

// initial state
const initial = emptyExecutionProgress()
assert(getCurrentPhaseKey(initial) === "foundation", "initial current phase is foundation")
assert(getPhaseStatus(initial, "foundation") === "not_started", "foundation not_started")
const initialSnap = getExecutionSnapshot(initial, roadmap)
assert(initialSnap.status === "not_started", "snapshot status not_started")
assert(initialSnap.actionText === roadmap.foundation.actions[0], "snapshot action is first foundation task")
assert(!initialSnap.allComplete, "journey not complete initially")

// start phase
const started = startPhase(initial, "foundation", NOW)
assert(getPhaseStatus(started, "foundation") === "in_progress", "foundation in_progress after start")
assert(started.phases.foundation.startedAt === NOW, "startedAt recorded")
const inProgressSnap = getExecutionSnapshot(started, roadmap)
assert(inProgressSnap.status === "in_progress", "snapshot in_progress")

// complete phase
const completedFoundation = completePhase(started, "foundation", NOW)
assert(getPhaseStatus(completedFoundation, "foundation") === "completed", "foundation completed")
assert(getCurrentPhaseKey(completedFoundation) === "skills", "next phase is skills after foundation complete")

const followUp = nextActionAfterComplete(completedFoundation, roadmap)
assert(followUp.startsWith("Next:"), "follow-up points at next phase")
assert(followUp.includes("Skills"), "follow-up names Skills phase")

// next phase selection through chain
let progress = completedFoundation
for (const key of ["skills", "practice", "build", "proof", "opportunity"] as const) {
  progress = startPhase(progress, key, NOW)
  progress = completePhase(progress, key, NOW)
}
assert(getCurrentPhaseKey(progress) === null, "all phases complete")
const allDoneSnap = getExecutionSnapshot(progress, roadmap)
assert(allDoneSnap.allComplete, "snapshot all_complete")
assert(allDoneSnap.status === "all_complete", "status all_complete")

// reset
const reset = resetExecutionProgress(NOW)
assert(getCurrentPhaseKey(reset) === "foundation", "reset returns to foundation")
assert(getPhaseStatus(reset, "opportunity") === "not_started", "all phases not_started after reset")

// persistence / rehydration
const mid: PathExecutionProgress = startPhase(
  completePhase(startPhase(initial, "foundation", NOW), "foundation", NOW),
  "skills",
  NOW,
)
const serialized = JSON.stringify(mid)
const parsed = JSON.parse(serialized) as PathExecutionProgress
const rehydrated = normalizeExecutionProgress(parsed)
assert(getCurrentPhaseKey(rehydrated) === "skills", "rehydrated current phase")
assert(getPhaseStatus(rehydrated, "foundation") === "completed", "rehydrated foundation completed")
assert(getPhaseStatus(rehydrated, "skills") === "in_progress", "rehydrated skills in_progress")

assert(normalizeExecutionProgress(undefined).phases.foundation.status === "not_started", "missing execution normalizes to empty")

// guard rails
let threw = false
try {
  startPhase(initial, "skills")
} catch {
  threw = true
}
assert(threw, "cannot start non-current phase")

threw = false
try {
  completePhase(initial, "foundation")
} catch {
  threw = true
}
assert(threw, "cannot complete before start")

console.log("test-path-execution: all assertions passed")
