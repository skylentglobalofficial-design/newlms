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
  video: { primary: '#8B5CF6', subtle: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)' },
  notes: { primary: '#3B82F6', subtle: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  quiz: { primary: '#F59E0B', subtle: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  assignment: { primary: '#22C55E', subtle: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  lab: { primary: '#06B6D4', subtle: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.35)' },
}

export function getRoleThemeId(role: UserRole): AuroraThemeId {
  return ROLE_THEME_MAP[role]
}

export type RoleAccent = ReturnType<typeof getDomainAccent>

export function getRoleAccent(role: UserRole): RoleAccent {
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
