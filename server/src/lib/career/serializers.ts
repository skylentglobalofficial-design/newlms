import type { Employer, Job, JobApplication, ApplicationEvent, InterviewRound, InterviewQuestion, InterviewPractice, CareerSupportRequest, CareerSupportTask, SavedJob } from "@prisma/client"
import { isoDate, isoDateTime } from "./shared.js"

export type JobSkillMatch = {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

function cleanDemoText(value: string | null | undefined, fallback = ""): string {
  if (!value) return fallback
  return value
    .replace(/\bSkylent Demo Employer\b/gi, "Skylent Hiring Network")
    .replace(/\s*\(Demo\)/gi, "")
    .trim()
}

/**
 * Deterministic skill-gap and job-match calculator (Scaler/AlmaX benchmark).
 * Compares a job's required skills against a learner's verified profile and project skills.
 */
export function computeJobSkillMatch(
  jobSkills: readonly string[] | null | undefined,
  learnerSkills: readonly string[] | null | undefined,
): JobSkillMatch {
  const required = (jobSkills ?? []).map((s) => s.trim()).filter(Boolean)
  if (required.length === 0) {
    return { matchScore: 100, matchedSkills: [], missingSkills: [] }
  }
  const normalizedLearner = new Set(
    (learnerSkills ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean),
  )
  const matchedSkills: string[] = []
  const missingSkills: string[] = []
  for (const skill of required) {
    if (normalizedLearner.has(skill.toLowerCase())) {
      matchedSkills.push(skill)
    } else {
      missingSkills.push(skill)
    }
  }
  const matchScore = Math.round((matchedSkills.length / required.length) * 100)
  return { matchScore, matchedSkills, missingSkills }
}

export function serializeEmployer(employer: Employer) {
  return {
    id: employer.id,
    name: cleanDemoText(employer.name, employer.name),
    slug: employer.slug,
    description: employer.description,
    website: employer.website,
    logoRef: employer.logoRef,
    location: employer.location,
    verificationStatus: employer.verificationStatus,
    createdAt: employer.createdAt.toISOString(),
    updatedAt: employer.updatedAt.toISOString(),
  }
}

export function serializeJob(
  job: Job & { employer?: Employer },
  saved?: boolean,
  skillMatch?: JobSkillMatch,
) {
  return {
    id: job.id,
    employerId: job.employerId,
    employer: job.employer ? serializeEmployer(job.employer) : undefined,
    title: cleanDemoText(job.title, job.title),
    slug: job.slug,
    description: job.description,
    employmentType: job.employmentType,
    workMode: job.workMode,
    location: job.location,
    experienceMin: job.experienceMin,
    experienceMax: job.experienceMax,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    skills: job.skills,
    category: job.category,
    status: job.status,
    applicationUrl: job.applicationUrl,
    postedAt: isoDateTime(job.postedAt),
    expiresAt: isoDateTime(job.expiresAt),
    saved: saved ?? false,
    ...(skillMatch ? { skillMatch } : {}),
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }
}

export function serializeSavedJob(entry: SavedJob & { job: Job & { employer: Employer } }) {
  return {
    id: entry.id,
    jobId: entry.jobId,
    createdAt: entry.createdAt.toISOString(),
    job: serializeJob(entry.job, true),
  }
}

export function serializeApplication(app: JobApplication & { job?: Job | null; employer?: Employer | null }) {
  return {
    id: app.id,
    jobId: app.jobId,
    employerId: app.employerId,
    roleTitle: cleanDemoText(app.roleTitle, app.roleTitle ?? ""),
    status: app.status,
    appliedAt: isoDateTime(app.appliedAt),
    nextActionAt: isoDateTime(app.nextActionAt),
    notes: app.notes,
    source: app.source,
    sharedWithEmployer: app.sharedWithEmployer,
    job: app.job ? serializeJob(app.job) : null,
    employer: app.employer ? serializeEmployer(app.employer) : null,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  }
}

export function serializeApplicationEvent(event: ApplicationEvent) {
  return {
    id: event.id,
    applicationId: event.applicationId,
    type: event.type,
    title: event.title,
    description: event.description,
    occurredAt: event.occurredAt.toISOString(),
    metadata: event.metadata,
    createdAt: event.createdAt.toISOString(),
  }
}

export function serializeInterviewRound(round: InterviewRound) {
  return {
    id: round.id,
    applicationId: round.applicationId,
    type: round.type,
    title: round.title,
    scheduledAt: isoDateTime(round.scheduledAt),
    status: round.status,
    notes: round.notes,
    createdAt: round.createdAt.toISOString(),
    updatedAt: round.updatedAt.toISOString(),
  }
}

export function serializeInterviewQuestion(q: InterviewQuestion) {
  return {
    id: q.id,
    category: q.category,
    question: q.question,
    difficulty: q.difficulty,
    roleTag: q.roleTag,
    active: q.active,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  }
}

export function serializeInterviewPractice(
  p: InterviewPractice & {
    question?: InterviewQuestion | null
    responseText?: string | null
    selfRating?: number | null
    status?: string | null
  },
) {
  return {
    id: p.id,
    userId: p.userId,
    questionId: p.questionId,
    interviewRoundId: p.interviewRoundId,
    answer: p.answer,
    score: p.score,
    feedback: p.feedback,
    responseText: p.responseText ?? p.answer ?? null,
    selfRating: p.selfRating ?? p.score ?? null,
    status: p.status ?? "COMPLETED",
    practicedAt: isoDateTime(p.practicedAt),
    question: p.question ? serializeInterviewQuestion(p.question) : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export function serializeSupportTask(
  task: CareerSupportTask & {
    dueDate?: Date | null
    sortOrder?: number | null
  },
) {
  return {
    id: task.id,
    requestId: task.requestId,
    title: task.title,
    description: task.description,
    status: task.status,
    dueAt: isoDateTime(task.dueAt),
    dueDate: isoDate(task.dueDate ?? task.dueAt),
    completedAt: isoDateTime(task.completedAt),
    sortOrder: task.sortOrder ?? 0,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

export function serializeSupportRequest(
  req: CareerSupportRequest & {
    tasks?: CareerSupportTask[]
    category?: string | null
    details?: string | null
    targetRole?: string | null
    mentorNotes?: string | null
  },
) {
  return {
    id: req.id,
    userId: req.userId,
    type: req.type,
    category: req.category ?? req.type,
    subject: req.subject,
    description: req.description,
    details: req.details ?? req.description,
    priority: req.priority,
    assignedTo: req.assignedTo,
    targetRole: req.targetRole ?? null,
    status: req.status,
    mentorNotes: req.mentorNotes ?? null,
    tasks: (req.tasks ?? []).map(serializeSupportTask),
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }
}
