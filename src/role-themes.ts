import type { UserRole } from './context/AuthContext'
import { getDomainAccent, type AuroraThemeId } from './aurora-themes'

/** Canonical role → visual theme mapping for authenticated surfaces. */
export const ROLE_THEME_MAP: Record<UserRole, AuroraThemeId> = {
  student: 'data-science',
  faculty: 'data-analytics',
  organisation: 'institution',
  recruiter: 'career',
  superadmin: 'superadmin',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Learner',
  faculty: 'Faculty',
  organisation: 'Institution',
  recruiter: 'Recruiter',
  superadmin: 'Super Admin',
}

export type LmsTabId = 'video' | 'notes' | 'quiz' | 'assignment' | 'lab'

/** Contextual micro-accents for LMS tabs — do not recolor the whole app. */
export const LMS_TAB_ACCENTS: Record<LmsTabId, { primary: string; subtle: string; border: string }> = {
  video: { primary: '#5142B5', subtle: 'rgba(81,66,181,0.10)', border: 'rgba(81,66,181,0.28)' },
  notes: { primary: '#5142B5', subtle: 'rgba(81,66,181,0.10)', border: 'rgba(81,66,181,0.28)' },
  quiz: { primary: '#5142B5', subtle: 'rgba(81,66,181,0.10)', border: 'rgba(81,66,181,0.28)' },
  assignment: { primary: '#5142B5', subtle: 'rgba(81,66,181,0.10)', border: 'rgba(81,66,181,0.28)' },
  lab: { primary: '#5142B5', subtle: 'rgba(81,66,181,0.10)', border: 'rgba(81,66,181,0.28)' },
}

export function getRoleThemeId(role: UserRole): AuroraThemeId {
  return ROLE_THEME_MAP[role]
}

export function getRoleAccent(role: UserRole) {
  return getDomainAccent(getRoleThemeId(role))
}

export function getLmsTabAccent(tab: LmsTabId) {
  return LMS_TAB_ACCENTS[tab]
}

/** Resolve LMS role accent from auth user, defaulting to the shared violet accent. */
export function getLmsRoleAccent(role?: UserRole | null) {
  if (role === 'faculty') return getRoleAccent('faculty')
  if (role === 'organisation') return getRoleAccent('organisation')
  if (role === 'superadmin') return getRoleAccent('superadmin')
  return getRoleAccent('student')
}
