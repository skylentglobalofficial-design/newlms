/** Version of the workspace manifest contract. Validators reject any other version. */
export const WORKSPACE_MANIFEST_VERSION = 1 as const

export type WorkspaceStatus =
  | "not_configured"
  | "pending_infrastructure"
  | "needs_review"
  | "ready"
  | "published"

export type ExerciseKind =
  | "sql"
  | "spreadsheet"
  | "dashboard"
  | "case"
  | "notebook"
  | "frontend"
  | "api"
  | "prompt"
  | "exam"
  | "written"

export type SyllabusLesson = {
  id: string
  title: string
  type: "notes" | "quiz" | "assignment" | "video"
  exercise?: ExerciseKind
}

/**
 * Authored course input. Provisioning reads only these fields.
 * It does not infer a dataset, a runner, or a result that is not written here.
 */
export type CourseSyllabus = {
  courseSlug: string
  programmeSlug?: string
  title: string
  outcomes: readonly string[]
  tools: readonly string[]
  lessons: readonly SyllabusLesson[]
  /** Filenames the course text already names. An entry here is not an approval to execute it. */
  datasets?: readonly string[]
}

export type WorkspaceManifest = {
  version: typeof WORKSPACE_MANIFEST_VERSION
  courseSlug: string
  programmeSlug: string | null
  adapterId: string | null
  status: WorkspaceStatus
  title: string
  tools: readonly string[]
  /** Lessons that may open the workspace. Empty unless the manifest is published. */
  lessonIds: readonly string[]
  href: string | null
  datasetId: string | null
  caseId: string | null
  reasons: readonly string[]
  missing: readonly string[]
  learnerNote: string
}

export type WorkspaceAdapter = {
  id: string
  label: string
  /** Capability ids that must be available before this adapter can be published. */
  requiredCapabilities: readonly string[]
  /** Higher score wins. Equal top scores are a review, not a guess. */
  score: (syllabus: CourseSyllabus) => number
}

export type PublishedBinding = {
  courseSlug: string
  programmeSlug: string
  adapterId: string
  title: string
  tools: readonly string[]
  lessonIds: readonly string[]
  href: string
  datasetId: string | null
  caseId: string | null
  statusLabel: string
  summary: string
  honesty: string
  /** Lesson id to query string appended to href. */
  lessonQuery: (lessonId: string) => string | null
  learnerLabel: string
  learnerNote: string
}
