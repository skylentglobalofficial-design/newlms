export type FacultyDoubtTicket = {
  id: string
  userId: string
  learnerName: string
  courseSlug: string
  lessonKey: string
  lessonTitle: string
  question: string
  status: "open" | "resolved"
  slaMinutes: number
  createdAt: string
  resolvedAt: string | null
  resolvedById: string | null
  resolutionNote: string | null
}

export const FACULTY_DOUBT_SLA_MINUTES = 20

const doubtStore = new Map<string, FacultyDoubtTicket>()

export function createFacultyDoubtTicket(input: {
  userId: string
  learnerName: string
  courseSlug: string
  lessonKey: string
  lessonTitle?: string | null
  question?: string | null
}): FacultyDoubtTicket {
  const existingKey = `${input.userId}:${input.courseSlug}:${input.lessonKey}`
  for (const ticket of doubtStore.values()) {
    if (
      ticket.status === "open" &&
      `${ticket.userId}:${ticket.courseSlug}:${ticket.lessonKey}` === existingKey
    ) {
      if (input.question?.trim()) {
        ticket.question = input.question.trim().slice(0, 1000)
      }
      return ticket
    }
  }
  const id = `dbt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const ticket: FacultyDoubtTicket = {
    id,
    userId: input.userId,
    learnerName: input.learnerName.trim() || "Learner",
    courseSlug: input.courseSlug.trim(),
    lessonKey: input.lessonKey.trim(),
    lessonTitle: input.lessonTitle?.trim() || input.lessonKey.trim(),
    question: input.question?.trim().slice(0, 1000) || "Learner requested 20-minute Faculty TA review on this lesson step.",
    status: "open",
    slaMinutes: FACULTY_DOUBT_SLA_MINUTES,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedById: null,
    resolutionNote: null,
  }
  doubtStore.set(id, ticket)
  return ticket
}

export function listFacultyDoubtTickets(courseSlugs?: readonly string[] | null): FacultyDoubtTicket[] {
  const allowed = courseSlugs ? new Set(courseSlugs) : null
  return [...doubtStore.values()]
    .filter((t) => !allowed || allowed.has(t.courseSlug))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function resolveFacultyDoubtTicket(
  id: string,
  actorId: string,
  resolutionNote?: string | null,
): FacultyDoubtTicket | null {
  const ticket = doubtStore.get(id)
  if (!ticket) return null
  ticket.status = "resolved"
  ticket.resolvedAt = new Date().toISOString()
  ticket.resolvedById = actorId
  ticket.resolutionNote = resolutionNote?.trim().slice(0, 1000) || "Resolved by Faculty TA."
  return ticket
}

export function clearFacultyDoubtStoreForTests(): void {
  doubtStore.clear()
}
