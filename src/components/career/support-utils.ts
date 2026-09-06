import type {
  CareerSupportPriority,
  CareerSupportRequest,
  CareerSupportRequestStatus,
  CareerSupportRequestType,
  CareerSupportTask,
  CareerSupportTaskStatus,
} from "../../lib/career-api"

export const REQUEST_TYPE_LABELS: Record<CareerSupportRequestType, string> = {
  RESUME_REVIEW: "Resume review",
  INTERVIEW_PREP: "Interview prep",
  JOB_SEARCH: "Job search",
  GENERAL: "General",
}

export const REQUEST_STATUS_LABELS: Record<CareerSupportRequestStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

export const PRIORITY_LABELS: Record<CareerSupportPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

export const TASK_STATUS_LABELS: Record<CareerSupportTaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export const ACTIVE_REQUEST_STATUSES: CareerSupportRequestStatus[] = ["OPEN", "IN_PROGRESS"]
export const OPEN_TASK_STATUSES: CareerSupportTaskStatus[] = ["PENDING", "IN_PROGRESS"]

export function formatRequestType(type: CareerSupportRequestType): string {
  return REQUEST_TYPE_LABELS[type] ?? type
}

export function formatRequestStatus(status: CareerSupportRequestStatus): string {
  return REQUEST_STATUS_LABELS[status] ?? status
}

export function formatPriority(priority: CareerSupportPriority): string {
  return PRIORITY_LABELS[priority] ?? priority
}

export function formatTaskStatus(status: CareerSupportTaskStatus): string {
  return TASK_STATUS_LABELS[status] ?? status
}

export function formatSupportDateTime(value: string | null): string | null {
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

export function isActiveRequest(request: Pick<CareerSupportRequest, "status">): boolean {
  return ACTIVE_REQUEST_STATUSES.includes(request.status)
}

export function isOpenTask(task: Pick<CareerSupportTask, "status">): boolean {
  return OPEN_TASK_STATUSES.includes(task.status)
}

export function countOpenTasks(requests: CareerSupportRequest[]): number {
  return requests.reduce((total, request) => {
    return total + request.tasks.filter(isOpenTask).length
  }, 0)
}

export function getNextOpenTask(requests: CareerSupportRequest[]): CareerSupportTask | null {
  for (const request of requests) {
    if (!isActiveRequest(request)) continue
    const next = request.tasks.find(isOpenTask)
    if (next) return next
  }
  return null
}
