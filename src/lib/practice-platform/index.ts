/**
 * Learner and test entry. The canonical module lives with the API so publication
 * checks and the admin workflow share one implementation.
 */
export type {
  CourseSyllabus,
  ExerciseKind,
  PublishedBinding,
  SyllabusLesson,
  WorkspaceAdapter,
  WorkspaceManifest,
  WorkspaceStatus,
} from "../../../server/src/lib/practice-platform/types.ts"
export { WORKSPACE_MANIFEST_VERSION } from "../../../server/src/lib/practice-platform/types.ts"
export { PRACTICE_CAPABILITIES, capabilityById, missingCapabilities } from "../../../server/src/lib/practice-platform/capabilities.ts"
export {
  CASE_STUDIO_ADAPTER,
  EXAM_ADAPTER,
  FRONTEND_ADAPTER,
  NOTEBOOK_ADAPTER,
  PROMPT_ADAPTER,
  SQL_LAB_ADAPTER,
  defaultWorkspaceAdapters,
} from "../../../server/src/lib/practice-platform/adapters.ts"
export { PUBLISHED_BINDINGS, publishedBindingFor, publishedBindingForProgramme } from "../../../server/src/lib/practice-platform/bindings.ts"
export { provisionCourse, rankWorkspaceAdapters, validateManifest } from "../../../server/src/lib/practice-platform/provision.ts"
export { CATALOGUE_SYLLABI, provisionCatalogue } from "../../../server/src/lib/practice-platform/catalogue.ts"
