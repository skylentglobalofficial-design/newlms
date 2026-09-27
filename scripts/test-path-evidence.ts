import { buildRoadmap } from "../src/lib/path/buildRoadmap.ts"
import { resolvePhaseExecutionAction } from "../src/lib/path/actionBindings.ts"
import {
  buildManualEvidenceRecord,
  buildVerifiedEvidenceRecords,
  lessonEvidenceKind,
  resolveVerifiedCompletionSource,
  verifiedEvidenceMatchesSnapshot,
} from "../src/lib/path/evidence.ts"
import type { PathLmsVerificationSnapshot } from "../src/lib/path/lmsVerification.ts"
import { isResourceCompleteInSnapshot } from "../src/lib/path/lmsVerification.ts"
import type { PathDiagnosis } from "../src/lib/path/types.ts"
import type { CareerEvidenceSummary } from "../src/lib/career-api.ts"

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

const diagnosis = baseDiagnosis({})
const roadmap = buildRoadmap(diagnosis)
const skillsAction = resolvePhaseExecutionAction(diagnosis, roadmap, "skills")
const buildAction = resolvePhaseExecutionAction(diagnosis, roadmap, "build")
const practiceAction = resolvePhaseExecutionAction(diagnosis, roadmap, "practice")

const incompleteLessonSnapshot: PathLmsVerificationSnapshot = {
  lessonStatesByCourse: {
    "data-analytics": {
      l7: {
        started: true,
        complete: false,
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
  !isResourceCompleteInSnapshot(skillsAction.resource!, incompleteLessonSnapshot),
  "incomplete lesson must not verify",
)
assert(
  resolveVerifiedCompletionSource(skillsAction.resource!, incompleteLessonSnapshot) === null,
  "no verified completion source when lesson incomplete",
)

const completeSqlSnapshot: PathLmsVerificationSnapshot = {
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
  lessonEvidenceKind("data-analytics", "l7", completeSqlSnapshot.lessonStatesByCourse["data-analytics"].l7) ===
    "learning_completed",
  "notes lesson maps to learning_completed",
)

const lessonRecords = buildVerifiedEvidenceRecords({
  action: skillsAction,
  phaseKey: "skills",
  resource: skillsAction.resource!,
  snapshot: completeSqlSnapshot,
  careerProjects: [],
  completionSource: "lms_verified",
  recordedAt: "2026-01-01T00:00:00.000Z",
})

assert(lessonRecords.length === 1, "one LMS lesson evidence row")
assert(lessonRecords[0].trust === "lms_verified", "lesson evidence is LMS verified")
assert(lessonRecords[0].kind === "learning_completed", "SQL notes evidence kind")

const quizSnapshot: PathLmsVerificationSnapshot = {
  lessonStatesByCourse: {
    "data-analytics": {
      l9: {
        started: true,
        complete: true,
        locked: false,
        videoWatched: false,
        quizPassed: true,
        assignmentSubmitted: false,
      },
    },
  },
  projects: [],
  northwindLabWorkCount: 0,
}

const quizAction = resolvePhaseExecutionAction(
  baseDiagnosis({ existingSkills: "starting" }),
  buildRoadmap(baseDiagnosis({ existingSkills: "starting" })),
  "skills",
)

// starting skills bind to l4 — test quiz on l9 separately with synthetic resource
const quizResource = {
  type: "lms_lesson" as const,
  resourceId: "lms_lesson:data-analytics:l9",
  href: "/learn/data-analytics/l9",
  courseSlug: "data-analytics",
  lessonId: "l9",
}

assert(
  lessonEvidenceKind("data-analytics", "l9", quizSnapshot.lessonStatesByCourse["data-analytics"].l9) === "quiz_passed",
  "quiz lesson maps to quiz_passed",
)

const labSnapshot: PathLmsVerificationSnapshot = {
  lessonStatesByCourse: {},
  projects: [],
  northwindLabWorkCount: 2,
}

const labRecords = buildVerifiedEvidenceRecords({
  action: practiceAction,
  phaseKey: "practice",
  resource: practiceAction.resource!,
  snapshot: labSnapshot,
  careerProjects: [],
  completionSource: "lms_verified",
  recordedAt: "2026-01-01T00:00:00.000Z",
})

assert(labRecords[0]?.kind === "lab_completed", "lab evidence kind")

const projectSnapshot: PathLmsVerificationSnapshot = {
  lessonStatesByCourse: {},
  projects: [
    {
      id: "p1",
      projectType: "northwind-commercial-review",
      courseSlug: "data-analytics",
      title: "Northwind Commercial Review",
      status: "ready_to_review",
      progress: { complete: 6, total: 6 },
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  northwindLabWorkCount: 0,
}

assert(
  resolveVerifiedCompletionSource(buildAction.resource!, projectSnapshot) === "project_verified",
  "completed learner project uses project_verified source",
)

const careerRow: CareerEvidenceSummary = {
  id: "ce-1",
  title: "Northwind review",
  projectType: "northwind-commercial-review",
  context: "Retail",
  skills: ["SQL"],
  evidenceCount: 2,
  eligible: true,
  incompleteMessage: null,
  projectHref: "/os/projects/data-analytics/northwind-commercial-review",
  href: "/career-os/projects/ce-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const projectRecords = buildVerifiedEvidenceRecords({
  action: buildAction,
  phaseKey: "build",
  resource: buildAction.resource!,
  snapshot: projectSnapshot,
  careerProjects: [careerRow],
  completionSource: "project_verified",
  recordedAt: "2026-01-01T00:00:00.000Z",
})

assert(projectRecords.some((row) => row.kind === "project_completed"), "project_completed evidence")
assert(
  projectRecords.some((row) => row.trust === "career_evidence" && row.kind === "portfolio_evidence"),
  "career OS portfolio evidence when eligible",
)

const manual = buildManualEvidenceRecord({
  action: skillsAction,
  phaseKey: "skills",
  recordedAt: "2026-01-02T00:00:00.000Z",
})

assert(manual.trust === "manual", "manual fallback trust class")
assert(manual.demonstrated.includes("self-reported"), "manual evidence labeled self-reported")

assert(
  verifiedEvidenceMatchesSnapshot(lessonRecords, skillsAction.resource!, completeSqlSnapshot),
  "verified records match complete snapshot",
)
assert(
  !verifiedEvidenceMatchesSnapshot(lessonRecords, skillsAction.resource!, incompleteLessonSnapshot),
  "no false positive when snapshot incomplete",
)

void quizAction
void quizResource

console.log("test-path-evidence: all assertions passed")
