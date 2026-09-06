import type { InterviewRoundStatus, InterviewRoundType, InterviewQuestionDifficulty } from "../../lib/career-api"

export const ROUND_TYPE_LABELS: Record<InterviewRoundType, string> = {
  TECHNICAL: "Technical",
  HR: "HR",
  MANAGERIAL: "Managerial",
  OTHER: "Other",
}

export const ROUND_STATUS_LABELS: Record<InterviewRoundStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
}

export const DIFFICULTY_LABELS: Record<InterviewQuestionDifficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
}

export const ACTIVE_ROUND_STATUSES: InterviewRoundStatus[] = ["SCHEDULED", "PENDING"]

export function formatRoundType(type: InterviewRoundType): string {
  return ROUND_TYPE_LABELS[type] ?? type
}

export function formatRoundStatus(status: InterviewRoundStatus): string {
  return ROUND_STATUS_LABELS[status] ?? status
}

export function formatDifficulty(difficulty: InterviewQuestionDifficulty): string {
  return DIFFICULTY_LABELS[difficulty] ?? difficulty
}

export function formatInterviewDateTime(value: string | null): string | null {
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

export function isUpcomingRound(round: { scheduledAt: string | null; status: InterviewRoundStatus }): boolean {
  if (!ACTIVE_ROUND_STATUSES.includes(round.status)) return false
  if (!round.scheduledAt) return round.status === "PENDING"
  return new Date(round.scheduledAt).getTime() >= Date.now()
}

export function sortRoundsBySchedule<T extends { scheduledAt: string | null; createdAt: string }>(rounds: T[]): T[] {
  return [...rounds].sort((a, b) => {
    const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
    const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
    if (aTime && bTime) return aTime - bTime
    if (aTime) return -1
    if (bTime) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
