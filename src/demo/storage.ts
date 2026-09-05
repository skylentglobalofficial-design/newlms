import type { DemoState } from './types'

export const DEMO_STATE_KEY = 'skylent_demo_state'

export function getDefaultDemoState(): DemoState {
  return {
    version: 1,
    lms: {},
    labs: {},
    enrollments: [],
    applications: [],
    shortlist: ['Rohan Mehta'],
  }
}

export function loadDemoState(): DemoState {
  try {
    const raw = localStorage.getItem(DEMO_STATE_KEY)
    if (!raw) return getDefaultDemoState()
    const parsed = JSON.parse(raw) as DemoState
    if (parsed.version !== 1) return getDefaultDemoState()
    return {
      ...getDefaultDemoState(),
      ...parsed,
      lms: parsed.lms ?? {},
      labs: parsed.labs ?? {},
      enrollments: parsed.enrollments ?? [],
      applications: parsed.applications ?? [],
      shortlist: parsed.shortlist ?? ['Rohan Mehta'],
    }
  } catch {
    return getDefaultDemoState()
  }
}

export function saveDemoState(state: DemoState): void {
  localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state))
}
