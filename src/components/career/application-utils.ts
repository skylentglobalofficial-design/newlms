import type { JobApplicationStatus } from "../../lib/career-api"

/** Mirrors server/src/routes/career/applications.ts VALID_TRANSITIONS */
export const APPLICATION_STATUS_TRANSITIONS: Record<JobApplicationStatus, JobApplicationStatus[]> = {
  SAVED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["SCREENING", "INTERVIEW", "REJECTED", "WITHDRAWN"],
  SCREENING: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["REJECTED", "WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
}

export const APPLICATION_STATUS_ORDER: JobApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]

export const APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
}

export function getNextStatuses(current: JobApplicationStatus): JobApplicationStatus[] {
  return APPLICATION_STATUS_TRANSITIONS[current] ?? []
}

export function formatStatusLabel(status: JobApplicationStatus): string {
  return APPLICATION_STATUS_LABELS[status] ?? status
}

export function formatApplicationDate(value: string | null): string | null {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return null
  }
}

export function formatApplicationDateTime(value: string | null): string | null {
  if (!value) return null
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return null
  }
}

export function applicationRoleTitle(app: { roleTitle: string | null; job?: { title: string } | null }): string {
  return app.roleTitle || app.job?.title || "Untitled role"
}

export function applicationEmployerName(app: {
  employer?: { name: string } | null
  job?: { employer?: { name: string } } | null
}): string | null {
  return app.employer?.name ?? app.job?.employer?.name ?? null
}

export function applicationLocation(app: { job?: { location: string | null } | null }): string | null {
  return app.job?.location ?? null
}

export function applicationWorkMode(app: { job?: { workMode: string | null } | null }): string | null {
  const mode = app.job?.workMode
  return mode ? mode.replace("_", " ") : null
}

export function groupApplicationsByStatus<T extends { status: JobApplicationStatus }>(
  applications: T[],
): Record<JobApplicationStatus, T[]> {
  const groups = Object.fromEntries(
    APPLICATION_STATUS_ORDER.map(status => [status, [] as T[]]),
  ) as Record<JobApplicationStatus, T[]>
  for (const app of applications) {
    groups[app.status].push(app)
  }
  return groups
}
