import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { courses } from '../data'
import type { LabExperimentStatus } from '../data'
import { getDefaultDemoState, loadDemoState, saveDemoState } from './storage'
import type { DemoApplication, DemoEnrollment, DemoState, LessonState } from './types'

export const EMPTY_LESSON_STATE: LessonState = {
  videoWatched: false,
  quizPassed: false,
  assignmentSubmitted: false,
  complete: false,
}

function seedLessonStates(courseSlug: string): Record<string, LessonState> {
  const course = courses.find(c => c.slug === courseSlug)
  if (!course) return {}
  const states: Record<string, LessonState> = {}
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      states[l.id] = l.completed
        ? { videoWatched: true, quizPassed: true, assignmentSubmitted: true, complete: true }
        : { ...EMPTY_LESSON_STATE }
    })
  })
  return states
}

export type LmsSummary = {
  courseSlug: string
  courseTitle: string
  progressPct: number
  completedCount: number
  totalLessons: number
  currentLessonId: string
  currentLessonTitle: string
  currentModuleTitle: string
  moduleIndex: number
  moduleTotal: number
  nextLessonTitle: string | null
}

type DemoStateContextValue = {
  ready: boolean
  isDemo: true
  getLessonStates: (courseSlug: string) => Record<string, LessonState>
  updateLesson: (courseSlug: string, lessonId: string, patch: Partial<LessonState>) => void
  getLmsSummary: (courseSlug: string) => LmsSummary | null
  getLabProgress: (labId: string) => { launched: boolean; complete: boolean; experiments: Record<string, LabExperimentStatus> }
  setLabLaunched: (labId: string) => void
  setLabComplete: (labId: string) => void
  setExperimentStatus: (labId: string, experimentId: string, status: LabExperimentStatus) => void
  enroll: (item: Omit<DemoEnrollment, 'enrolledAt'>) => void
  enrollments: DemoEnrollment[]
  isEnrolled: (itemId: string) => boolean
  applyToJob: (job: { id: string; role: string; company: string }) => boolean
  applications: DemoApplication[]
  hasApplied: (jobId: string) => boolean
  shortlist: string[]
  toggleShortlist: (name: string) => void
  isShortlisted: (name: string) => boolean
}

const DemoStateContext = createContext<DemoStateContextValue | null>(null)

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(getDefaultDemoState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(loadDemoState())
    setReady(true)
  }, [])

  const persist = useCallback((next: DemoState) => {
    setState(next)
    saveDemoState(next)
  }, [])

  const getLessonStates = useCallback((courseSlug: string) => {
    const seeded = seedLessonStates(courseSlug)
    const stored = state.lms[courseSlug] ?? {}
    const merged: Record<string, LessonState> = { ...seeded }
    Object.entries(stored).forEach(([id, s]) => {
      merged[id] = { ...seeded[id] ?? EMPTY_LESSON_STATE, ...s }
    })
    return merged
  }, [state.lms])

  const updateLesson = useCallback((courseSlug: string, lessonId: string, patch: Partial<LessonState>) => {
    const current = getLessonStates(courseSlug)
    const prev = current[lessonId] ?? EMPTY_LESSON_STATE
    const updated: LessonState = { ...prev, ...patch }
    if (updated.assignmentSubmitted) updated.complete = true
    persist({
      ...state,
      lms: {
        ...state.lms,
        [courseSlug]: { ...current, [lessonId]: updated },
      },
    })
  }, [state, persist, getLessonStates])

  const getLmsSummary = useCallback((courseSlug: string): LmsSummary | null => {
    const course = courses.find(c => c.slug === courseSlug)
    if (!course) return null
    const lessonStates = getLessonStates(courseSlug)
    const allLessons = course.modules.flatMap(m => m.lessons)
    const completedCount = allLessons.filter(l => lessonStates[l.id]?.complete).length
    const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0
    const currentLesson = allLessons.find(l => !lessonStates[l.id]?.complete) ?? allLessons[allLessons.length - 1]
    const currentModule = course.modules.find(m => m.lessons.some(l => l.id === currentLesson?.id)) ?? course.modules[0]
    const moduleIndex = course.modules.findIndex(m => m.id === currentModule?.id) + 1
    const currentIdx = allLessons.findIndex(l => l.id === currentLesson?.id)
    const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null
    return {
      courseSlug,
      courseTitle: course.title,
      progressPct,
      completedCount,
      totalLessons: allLessons.length,
      currentLessonId: currentLesson?.id ?? '',
      currentLessonTitle: currentLesson?.title ?? '',
      currentModuleTitle: currentModule?.title ?? '',
      moduleIndex,
      moduleTotal: course.modules.length,
      nextLessonTitle: nextLesson?.title ?? null,
    }
  }, [getLessonStates])

  const getLabProgress = useCallback((labId: string) => {
    const lab = state.labs[labId] ?? {}
    return {
      launched: lab.launched ?? false,
      complete: lab.complete ?? false,
      experiments: lab.experiments ?? {},
    }
  }, [state.labs])

  const setLabLaunched = useCallback((labId: string) => {
    const prev = state.labs[labId] ?? {}
    persist({ ...state, labs: { ...state.labs, [labId]: { ...prev, launched: true } } })
  }, [state, persist])

  const setLabComplete = useCallback((labId: string) => {
    const prev = state.labs[labId] ?? {}
    persist({ ...state, labs: { ...state.labs, [labId]: { ...prev, launched: true, complete: true } } })
  }, [state, persist])

  const setExperimentStatus = useCallback((labId: string, experimentId: string, status: LabExperimentStatus) => {
    const prev = state.labs[labId] ?? {}
    const experiments = { ...prev.experiments, [experimentId]: status }
    persist({ ...state, labs: { ...state.labs, [labId]: { ...prev, experiments } } })
  }, [state, persist])

  const enroll = useCallback((item: Omit<DemoEnrollment, 'enrolledAt'>) => {
    if (state.enrollments.some(e => e.itemId === item.itemId)) return
    persist({
      ...state,
      enrollments: [...state.enrollments, { ...item, enrolledAt: new Date().toISOString() }],
    })
  }, [state, persist])

  const applyToJob = useCallback((job: { id: string; role: string; company: string }) => {
    if (state.applications.some(a => a.jobId === job.id)) return false
    persist({
      ...state,
      applications: [
        ...state.applications,
        { jobId: job.id, role: job.role, company: job.company, status: 'Applied', appliedAt: new Date().toISOString() },
      ],
    })
    return true
  }, [state, persist])

  const toggleShortlist = useCallback((name: string) => {
    const next = state.shortlist.includes(name)
      ? state.shortlist.filter(n => n !== name)
      : [...state.shortlist, name]
    persist({ ...state, shortlist: next })
  }, [state, persist])

  const value = useMemo<DemoStateContextValue>(() => ({
    ready,
    isDemo: true,
    getLessonStates,
    updateLesson,
    getLmsSummary,
    getLabProgress,
    setLabLaunched,
    setLabComplete,
    setExperimentStatus,
    enroll,
    enrollments: state.enrollments,
    isEnrolled: (itemId: string) => state.enrollments.some(e => e.itemId === itemId),
    applyToJob,
    applications: state.applications,
    hasApplied: (jobId: string) => state.applications.some(a => a.jobId === jobId),
    shortlist: state.shortlist,
    toggleShortlist,
    isShortlisted: (name: string) => state.shortlist.includes(name),
  }), [
    ready, getLessonStates, updateLesson, getLmsSummary, getLabProgress,
    setLabLaunched, setLabComplete, setExperimentStatus, enroll, state.enrollments,
    applyToJob, state.applications, state.shortlist, toggleShortlist,
  ])

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  )
}

const SAFE_DEFAULT: DemoStateContextValue = {
  ready: true,
  isDemo: true,
  getLessonStates: () => ({}),
  updateLesson: () => {},
  getLmsSummary: () => null,
  getLabProgress: () => ({ launched: false, complete: false, experiments: {} }),
  setLabLaunched: () => {},
  setLabComplete: () => {},
  setExperimentStatus: () => {},
  enroll: () => {},
  enrollments: [],
  isEnrolled: () => false,
  applyToJob: () => false,
  applications: [],
  hasApplied: () => false,
  shortlist: [],
  toggleShortlist: () => {},
  isShortlisted: () => false,
}

export function useDemoState(): DemoStateContextValue {
  const ctx = useContext(DemoStateContext)
  return ctx ?? SAFE_DEFAULT
}
