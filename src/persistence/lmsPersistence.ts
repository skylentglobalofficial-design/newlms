// ─── LMS PERSISTENCE (localStorage foundation) ─────────────────────────────────
//
// A small, swappable persistence layer for `Enrollment` and `LessonProgress`
// (see `src/types/lms.ts`), keyed by `userId`. Today it reads/writes
// localStorage. No page consumes this yet — this is groundwork so a future
// backend (Supabase/API) can replace the storage functions below without
// changing the exported function signatures that pages will eventually call.
//
// Deliberately excluded from this module: Supabase/API calls, database code,
// auth, payments, video hosting. Auth stays entirely in
// `src/context/authProvider.ts` — this module only takes a `userId` string.

import type { Enrollment, EnrollmentStatus, EntityId, LessonProgress } from '../types/lms'

const ENROLLMENTS_KEY = 'skylent_enrollments'
const LESSON_PROGRESS_KEY = 'skylent_lesson_progress'

// Records are stored as a map of userId -> that user's records. This keeps
// per-user reads O(1) and mirrors how a real API would scope data by user.
type ByUser<T> = Record<EntityId, T[]>

function readMap<T>(storageKey: string): ByUser<T> {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as ByUser<T>) : {}
  } catch {
    // ignore corrupt storage
    return {}
  }
}

function writeMap<T>(storageKey: string, map: ByUser<T>): void {
  localStorage.setItem(storageKey, JSON.stringify(map))
}

function generateId(prefix: string): EntityId {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}_${rand}`
}

// ─── ENROLLMENTS ────────────────────────────────────────────────────────────
/** Returns all enrollments for a given user (empty array if none). */
export function getEnrollments(userId: EntityId): Enrollment[] {
  const byUser = readMap<Enrollment>(ENROLLMENTS_KEY)
  return byUser[userId] ?? []
}

export type CreateEnrollmentInput = {
  courseId?: EntityId
  programId?: EntityId
  status?: EnrollmentStatus
}

/** Creates and persists a new enrollment for the given user, and returns it. */
export function createEnrollment(userId: EntityId, input: CreateEnrollmentInput): Enrollment {
  const enrollment: Enrollment = {
    id: generateId('enr'),
    userId,
    courseId: input.courseId,
    programId: input.programId,
    status: input.status ?? 'active',
    enrolledAt: new Date().toISOString(),
  }

  const byUser = readMap<Enrollment>(ENROLLMENTS_KEY)
  byUser[userId] = [...(byUser[userId] ?? []), enrollment]
  writeMap(ENROLLMENTS_KEY, byUser)

  return enrollment
}

// ─── LESSON PROGRESS ────────────────────────────────────────────────────────
/**
 * Returns lesson progress records for a user. Pass `lessonId` to scope to a
 * single lesson (returns at most one record, since progress is unique per
 * user+lesson+enrollment).
 */
export function getLessonProgress(userId: EntityId, lessonId?: EntityId): LessonProgress[] {
  const byUser = readMap<LessonProgress>(LESSON_PROGRESS_KEY)
  const records = byUser[userId] ?? []
  return lessonId ? records.filter(r => r.lessonId === lessonId) : records
}

export type SaveLessonProgressInput = {
  lessonId: EntityId
  enrollmentId: EntityId
  startedAt?: string
  completedAt?: string
  quizScorePercentage?: number
  assignmentSubmittedAt?: string
}

/**
 * Creates or updates the lesson progress record for a user's given
 * lesson+enrollment (upsert). Existing fields are preserved unless
 * overwritten by `input`.
 */
export function saveLessonProgress(userId: EntityId, input: SaveLessonProgressInput): LessonProgress {
  const byUser = readMap<LessonProgress>(LESSON_PROGRESS_KEY)
  const records = byUser[userId] ?? []

  const existingIndex = records.findIndex(
    r => r.lessonId === input.lessonId && r.enrollmentId === input.enrollmentId,
  )

  const updated: LessonProgress = existingIndex >= 0
    ? { ...records[existingIndex], ...input }
    : {
        id: generateId('lp'),
        userId,
        startedAt: new Date().toISOString(),
        ...input,
      }

  const nextRecords = existingIndex >= 0
    ? records.map((r, i) => (i === existingIndex ? updated : r))
    : [...records, updated]

  byUser[userId] = nextRecords
  writeMap(LESSON_PROGRESS_KEY, byUser)

  return updated
}
