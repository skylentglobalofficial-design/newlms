import fs from "node:fs"
import path from "node:path"

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
const SNAPSHOT_FILE = path.resolve(process.cwd(), ".cache", "doubt-sla-tickets.json")

function shouldPersistToDisk(): boolean {
  return process.env.NODE_ENV !== "test"
}

function loadSnapshotFromDisk(): void {
  if (!shouldPersistToDisk()) return
  try {
    if (!fs.existsSync(SNAPSHOT_FILE)) return
    const raw = fs.readFileSync(SNAPSHOT_FILE, "utf8")
    const rows = JSON.parse(raw) as FacultyDoubtTicket[]
    if (!Array.isArray(rows)) return
    for (const row of rows) {
      if (row && typeof row.id === "string") {
        doubtStore.set(row.id, row)
      }
    }
  } catch {
    // Ignore corrupt or unreadable cache files
  }
}

function saveSnapshotToDisk(): void {
  if (!shouldPersistToDisk()) return
  try {
    const dir = path.dirname(SNAPSHOT_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(Array.from(doubtStore.values()), null, 2), "utf8")
  } catch {
    // Non-fatal in read-only or ephemeral environments
  }
}

loadSnapshotFromDisk()

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
        saveSnapshotToDisk()
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
  saveSnapshotToDisk()
  return ticket
}

export function listFacultyDoubtTickets(courseSlugs?: string[] | null): FacultyDoubtTicket[] {
  const allowed = courseSlugs ? new Set(courseSlugs.map((s) => s.toLowerCase())) : null
  return Array.from(doubtStore.values())
    .filter((t) => (allowed ? allowed.has(t.courseSlug.toLowerCase()) : true))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1
      return b.createdAt.localeCompare(a.createdAt)
    })
}

export function resolveFacultyDoubtTicket(
  id: string,
  resolvedById: string,
  resolutionNote?: string | null,
): FacultyDoubtTicket | null {
  const existing = doubtStore.get(id)
  if (!existing) return null
  const updated: FacultyDoubtTicket = {
    ...existing,
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    resolvedById,
    resolutionNote: resolutionNote?.trim().slice(0, 1000) || "Verified by Faculty TA within 20-min SLA.",
  }
  doubtStore.set(id, updated)
  saveSnapshotToDisk()
  return updated
}

export function listLearnerDoubtTickets(userId: string): FacultyDoubtTicket[] {
  const cleanId = userId.trim()
  if (!cleanId) return []
  return Array.from(doubtStore.values())
    .filter((t) => t.userId === cleanId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function clearFacultyDoubtStoreForTests(): void {
  doubtStore.clear()
}
