import type { LabExperimentStatus } from '../data'

/** Per-lesson LMS progress — synced from backend API. */
export type LessonState = {
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  complete: boolean
  locked?: boolean
  requiredLessonKey?: string | null
}

export type LabProgress = {
  launched?: boolean
  complete?: boolean
  experiments?: Record<string, LabExperimentStatus>
}

export type DemoEnrollment = {
  itemId: string
  type: 'course' | 'program' | 'workshop'
  title: string
  enrolledAt: string
}

/** Single persisted demo-state document — labs/career demo only; LMS uses backend. */
export type DemoState = {
  version: 1
  labs: Record<string, LabProgress>
  enrollments: DemoEnrollment[]
  shortlist: string[]
}

export type BatchLearner = {
  name: string
  completion: number
  issue: string
}
