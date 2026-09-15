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
  video: { primary: '#4F46E5', subtle: 'rgba(79,70,229,0.10)', border: 'rgba(79,70,229,0.28)' },
  notes: { primary: '#2563EB', subtle: 'rgba(37,99,235,0.10)', border: 'rgba(37,99,235,0.28)' },
  quiz: { primary: '#F97316', subtle: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.28)' },
  assignment: { primary: '#15803D', subtle: 'rgba(21,128,61,0.10)', border: 'rgba(21,128,61,0.28)' },
  lab: { primary: '#4F46E5', subtle: 'rgba(79,70,229,0.10)', border: 'rgba(79,70,229,0.28)' },
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

/** Resolve LMS role accent from auth user, defaulting to learner violet/indigo. */
export function getLmsRoleAccent(role?: UserRole | null) {
  if (role === 'faculty') return getRoleAccent('faculty')
  if (role === 'organisation') return getRoleAccent('organisation')
  if (role === 'superadmin') return getRoleAccent('superadmin')
  return getRoleAccent('student')
}
