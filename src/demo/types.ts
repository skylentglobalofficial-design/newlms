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

export type DemoApplication = {
  jobId: string
  role: string
  company: string
  status: 'Applied'
  appliedAt: string
}

/** Single persisted demo-state document — labs/career demo only; LMS uses backend. */
export type DemoState = {
  version: 1
  labs: Record<string, LabProgress>
  enrollments: DemoEnrollment[]
  applications: DemoApplication[]
  shortlist: string[]
}

export type BatchLearner = {
  name: string
  completion: number
  issue: string
}
