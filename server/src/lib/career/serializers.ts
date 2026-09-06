import type { Employer, Job, JobApplication, ApplicationEvent, InterviewRound, InterviewQuestion, InterviewPractice, CareerSupportRequest, CareerSupportTask, SavedJob } from "@prisma/client"
import { isoDate, isoDateTime } from "./shared.js"

export function serializeEmployer(employer: Employer) {
  return {
    id: employer.id,
    name: employer.name,
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

export function serializeJob(job: Job & { employer?: Employer }, saved?: boolean) {
  return {
    id: job.id,
    employerId: job.employerId,
    employer: job.employer ? serializeEmployer(job.employer) : undefined,
    title: job.title,
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
    roleTitle: app.roleTitle,
    status: app.status,
    appliedAt: isoDateTime(app.appliedAt),
    nextActionAt: isoDateTime(app.nextActionAt),
    notes: app.notes,
    source: app.source,
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

export function serializeInterviewPractice(p: InterviewPractice) {
  return {
    id: p.id,
    questionId: p.questionId,
    interviewRoundId: p.interviewRoundId,
    answer: p.answer,
    score: p.score,
    practicedAt: p.practicedAt.toISOString(),
    feedback: p.feedback,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export function serializeSupportRequest(req: CareerSupportRequest & { tasks?: CareerSupportTask[] }) {
  return {
    id: req.id,
    type: req.type,
    subject: req.subject,
    description: req.description,
    status: req.status,
    priority: req.priority,
    assignedTo: req.assignedTo,
    tasks: req.tasks?.map(serializeSupportTask) ?? [],
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }
}

export function serializeSupportTask(task: CareerSupportTask) {
  return {
    id: task.id,
    requestId: task.requestId,
    title: task.title,
    description: task.description,
    status: task.status,
    dueAt: isoDateTime(task.dueAt),
    completedAt: isoDateTime(task.completedAt),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
