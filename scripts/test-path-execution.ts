import { buildRoadmap } from "../src/lib/path/buildRoadmap.ts"
import { resolvePhaseExecutionAction } from "../src/lib/path/actionBindings.ts"
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
  buildExecutionSnapshot,
} from "../src/lib/path/execution.ts"
import {
  isPathActionVerifiedComplete,
  isResourceCompleteInSnapshot,
} from "../src/lib/path/lmsVerification.ts"
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

// real resource bindings (data analytics)
const dataDiag = baseDiagnosis({})
const skillsAction = resolvePhaseExecutionAction(dataDiag, roadmap, "skills")
assert(skillsAction.completionMode === "skylent_resource", "data skills links to Skylent resource")
assert(skillsAction.resource?.type === "lms_lesson", "data skills is an LMS lesson")
assert(skillsAction.resource?.href === "/learn/data-analytics/l7", "data skills opens SQL lesson")

const practiceAction = resolvePhaseExecutionAction(dataDiag, roadmap, "practice")
assert(practiceAction.resource?.type === "lms_lab", "data practice links to Northwind lab")
assert(practiceAction.resource?.href.includes("/os/labs/data-analytics/northwind"), "northwind lab href")

// manual fallback (exam track)
const examRoadmap = buildRoadmap(
  baseDiagnosis({
    interests: ["competitive_exams"],
    careerDirection: "exam_path",
    targetOutcome: "pass_exam",
    directionDetail: "CAT 2027",
  }),
)
const examDiag = baseDiagnosis({
  interests: ["competitive_exams"],
  careerDirection: "exam_path",
  targetOutcome: "pass_exam",
  directionDetail: "CAT 2027",
})
const examPractice = resolvePhaseExecutionAction(examDiag, examRoadmap, "practice")
assert(examPractice.completionMode === "manual_only", "exam practice stays manual")
assert(!examPractice.resource || examPractice.resource.type !== "lms_lesson", "exam has no fake lesson id")

// verified vs manual completion metadata
const foundationAction = resolvePhaseExecutionAction(dataDiag, roadmap, "foundation")
const withResource = startPhase(initial, "foundation", NOW, foundationAction)
const verifiedDone = completePhase(withResource, "foundation", NOW, "lms_verified")
assert(verifiedDone.phases.foundation.completionSource === "lms_verified", "stores lms_verified source")
const manualDone = completePhase(withResource, "foundation", NOW, "manual")
assert(manualDone.phases.foundation.completionSource === "manual", "stores manual source")

// pure LMS verification helper
const lessonCompleteSnapshot = {
  lessonStatesByCourse: {
    "data-analytics": {
      l7: {
        started: true,
        complete: true,
        locked: false,
        videoWatched: true,
        quizPassed: false,
        assignmentSubmitted: false,
      },
    },
  },
  projects: [],
  northwindLabWorkCount: 0,
}
assert(
  isResourceCompleteInSnapshot(skillsAction.resource!, lessonCompleteSnapshot),
  "lesson complete in LMS snapshot verifies resource",
)
assert(
  !isPathActionVerifiedComplete({ label: "x", completionMode: "manual_only" }, lessonCompleteSnapshot),
  "manual-only action never verifies via LMS",
)

const snap = buildExecutionSnapshot(initial, roadmap, dataDiag)
assert(snap.action?.resource?.courseSlug === "data-analytics", "snapshot includes bound action")

console.log("test-path-execution: all assertions passed")
