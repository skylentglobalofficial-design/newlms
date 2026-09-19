import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { LabExperimentStatus } from '../data'
import { getDefaultDemoState, loadDemoState, saveDemoState } from './storage'
import type { DemoEnrollment, DemoState } from './types'

type DemoStateContextValue = {
  ready: boolean
  isDemo: true
  getLabProgress: (labId: string) => { launched: boolean; complete: boolean; experiments: Record<string, LabExperimentStatus> }
  setLabLaunched: (labId: string) => void
  setLabComplete: (labId: string) => void
  setExperimentStatus: (labId: string, experimentId: string, status: LabExperimentStatus) => void
  enroll: (item: Omit<DemoEnrollment, 'enrolledAt'>) => void
  enrollments: DemoEnrollment[]
  isEnrolled: (itemId: string) => boolean
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

  const toggleShortlist = useCallback((name: string) => {
    const next = state.shortlist.includes(name)
      ? state.shortlist.filter(n => n !== name)
      : [...state.shortlist, name]
    persist({ ...state, shortlist: next })
  }, [state, persist])

  const value = useMemo<DemoStateContextValue>(() => ({
    ready,
    isDemo: true,
    getLabProgress,
    setLabLaunched,
    setLabComplete,
    setExperimentStatus,
    enroll,
    enrollments: state.enrollments,
    isEnrolled: (itemId: string) => state.enrollments.some(e => e.itemId === itemId),
    shortlist: state.shortlist,
    toggleShortlist,
    isShortlisted: (name: string) => state.shortlist.includes(name),
  }), [
    ready, getLabProgress, setLabLaunched, setLabComplete, setExperimentStatus, enroll, state.enrollments,
    state.shortlist, toggleShortlist,
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
  getLabProgress: () => ({ launched: false, complete: false, experiments: {} }),
  setLabLaunched: () => {},
  setLabComplete: () => {},
  setExperimentStatus: () => {},
  enroll: () => {},
  enrollments: [],
  isEnrolled: () => false,
  shortlist: [],
  toggleShortlist: () => {},
  isShortlisted: () => false,
}

export function useDemoState(): DemoStateContextValue {
  const ctx = useContext(DemoStateContext)
  return ctx ?? SAFE_DEFAULT
}

/** Shared empty lesson state for LMS UI fallbacks. */
export const EMPTY_LESSON_STATE = {
  videoWatched: false,
  quizPassed: false,
  assignmentSubmitted: false,
  complete: false,
  locked: false,
}
