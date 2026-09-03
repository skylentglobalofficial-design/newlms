// ─── SKYLENT LMS — DOMAIN MODEL ────────────────────────────────────────────────
//
// This file defines the *target* frontend domain model for the LMS — the
// shape data should have once it is served from a real backend/database.
//
// It intentionally does NOT replace the existing shapes in `src/data.ts`
// (Course, Program, Workshop, Job, etc.) or `AuthUser` in
// `src/context/AuthContext.tsx`. Those remain the current sample/demo content
// contracts consumed by pages today. This module exists so that:
//
//   1. There is one place that describes the real entities Skylent's product
//      needs (User, Course, Enrollment, Progress, Certificate, ...) —
//      independent of how today's UI happens to be wired.
//   2. Future backend work (Phase 2+) can design tables/APIs directly against
//      these types instead of reverse-engineering them from page code.
//   3. Pages can be migrated incrementally from `data.ts` sample content to
//      real fetched data of these shapes, without a big-bang rewrite.
//
// No runtime behaviour depends on this file yet — it is a types-only,
// additive contract. See `plans` / the Phase 1 report for adoption notes.

// ─── SHARED PRIMITIVES ──────────────────────────────────────────────────────
/** ISO-8601 date-time string, e.g. new Date().toISOString(). */
export type ISODateString = string
export type EntityId = string

// ─── USER & ROLE ────────────────────────────────────────────────────────────
// `Role` mirrors `UserRole` from `src/context/AuthContext.tsx`. It is kept as
// its own union (rather than re-exported) so this module has no dependency
// on the auth layer, but the values MUST stay in sync.
export type Role = 'student' | 'faculty' | 'organisation' | 'recruiter' | 'superadmin'

export interface User {
  id: EntityId
  name: string
  email: string
  role: Role
  avatarUrl?: string
  institutionId?: EntityId
  createdAt: ISODateString
}

// ─── EDUCATION STAGE (supports schooling → PG → exams → professional) ──────
export type EducationStage =
  | 'schooling'
  | 'undergraduate'
  | 'postgraduate'
  | 'competitive_exam'
  | 'professional'
  | 'certificate'

// ─── COURSE / PROGRAM STRUCTURE ─────────────────────────────────────────────
// A `Program` is the enrollable, credentialed offering (e.g. "Data Science &
// AI", "JEE Advanced Preparation"). A `Course` is a single-subject learning
// unit that may stand alone or belong to a Program. Both are composed of
// `Module`s, which are composed of `Lesson`s.
export interface Program {
  id: EntityId
  slug: string
  name: string
  stage: EducationStage
  durationWeeks: number
  courseIds: EntityId[]
  institutionId?: EntityId
  createdAt: ISODateString
}

export interface Course {
  id: EntityId
  slug: string
  title: string
  stage: EducationStage
  programId?: EntityId
  moduleIds: EntityId[]
  createdAt: ISODateString
}

export interface Module {
  id: EntityId
  courseId: EntityId
  title: string
  order: number
  lessonIds: EntityId[]
}

// ─── LESSON CONTENT (video / notes / quiz / assignment) ─────────────────────
// `kind` is the discriminant used to render the right lesson content
// component. `content` is a discriminated union so each kind only carries
// the fields relevant to it — this is what keeps LearnPage's tab rendering
// swappable per type without a future rewrite.
export type LessonKind = 'video' | 'notes' | 'quiz' | 'assignment'

export interface VideoLessonContent {
  kind: 'video'
  /** Absolute URL once real video hosting is wired up (Phase 2+). Undefined = placeholder. */
  videoUrl?: string
  durationSeconds?: number
  transcript?: string
}

export interface NotesLessonContent {
  kind: 'notes'
  bodyMarkdown: string
}

export interface QuizQuestion {
  id: EntityId
  prompt: string
  options: string[]
  correctOptionIndex: number
}

export interface QuizLessonContent {
  kind: 'quiz'
  questions: QuizQuestion[]
  passPercentage: number
}

export interface AssignmentLessonContent {
  kind: 'assignment'
  instructions: string
  submissionType: 'text' | 'file_upload' | 'link'
}

export type LessonContent =
  | VideoLessonContent
  | NotesLessonContent
  | QuizLessonContent
  | AssignmentLessonContent

export interface Lesson {
  id: EntityId
  moduleId: EntityId
  title: string
  order: number
  content: LessonContent
}

// Convenience aliases kept for readability at call sites.
export type Quiz = QuizLessonContent
export type Assignment = AssignmentLessonContent

// ─── ENROLLMENT & PROGRESS ──────────────────────────────────────────────────
// Currently, enrollment "success" (see EnrollmentModal in shared.tsx) and
// lesson progress (see LearnPage's local LessonState) are ephemeral React
// state — nothing is persisted against a user. These types describe what
// should be persisted once a backend exists.
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled'

export interface Enrollment {
  id: EntityId
  userId: EntityId
  courseId?: EntityId
  programId?: EntityId
  status: EnrollmentStatus
  enrolledAt: ISODateString
}

export interface LessonProgress {
  id: EntityId
  userId: EntityId
  lessonId: EntityId
  enrollmentId: EntityId
  startedAt?: ISODateString
  completedAt?: ISODateString
  /** Only meaningful for quiz lessons. */
  quizScorePercentage?: number
  /** Only meaningful for assignment lessons. */
  assignmentSubmittedAt?: ISODateString
}

export interface CourseProgress {
  userId: EntityId
  courseId: EntityId
  enrollmentId: EntityId
  completedLessonIds: EntityId[]
  totalLessons: number
  percentComplete: number
  lastAccessedAt?: ISODateString
}

export interface Certificate {
  id: EntityId
  userId: EntityId
  courseId?: EntityId
  programId?: EntityId
  issuedAt: ISODateString
  credentialId: string
}

// ─── INSTITUTIONS / FACULTY / JOBS (for institutions & career-os features) ──
export interface Institution {
  id: EntityId
  name: string
  type: 'school' | 'college' | 'university' | 'corporate'
}

export interface FacultyProfile {
  id: EntityId
  userId: EntityId
  institutionId?: EntityId
  expertise: string[]
}

export interface JobListing {
  id: EntityId
  role: string
  employerId: EntityId
  postedAt: ISODateString
}
