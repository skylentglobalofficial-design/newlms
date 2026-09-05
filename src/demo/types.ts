import type { LabExperimentStatus } from '../data'

/** Per-lesson LMS progress — frontend demo only, not authoritative. */
export type LessonState = {
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  complete: boolean
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

/** Single persisted demo-state document — separate from auth authority. */
export type DemoState = {
  version: 1
  lms: Record<string, Record<string, LessonState>>
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
