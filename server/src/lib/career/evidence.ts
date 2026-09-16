import { prisma } from "../prisma.js"
import { getOrCreateProfile } from "./profile.js"
import { findProjectDefinition } from "../skylent-projects/catalog.js"
import {
  hydrateProjectLabEvidence,
  isLearnerProjectComplete,
  parseProjectReflection,
  parseStoredProjectTasks,
  ProjectServiceError,
  getLearnerProject,
} from "../skylent-projects/service.js"
import type { ProjectReflection } from "../skylent-projects/types.js"

export class CareerEvidenceError extends Error {
  constructor(
    readonly code: "not_found" | "forbidden" | "invalid_request" | "incomplete",
    message: string,
  ) {
    super(message)
    this.name = "CareerEvidenceError"
  }
}

export const INCOMPLETE_CAREER_MESSAGE = "Finish the project before adding it to Career OS."
export const INCOMPLETE_LINKED_MESSAGE =
  "This project is no longer complete. Finish the project to present it as evidence."

export type CareerEvidenceItem = {
  key: string
  title: string
  source: string
  viewHref: string
}

export type CareerEvidenceProject = {
  id: string
  title: string
  projectType: string
  context: string
  summary: string
  dataset: string
  workDemonstrated: string[]
  skills: string[]
  evidence: CareerEvidenceItem[]
  evidenceCount: number
  reflection: ProjectReflection
  reflectionLabels: { finding: string; whyItMatters: string; recommendation: string }
  completedTasks: Array<{ key: string; title: string; number: string }>
  eligible: boolean
  incompleteMessage: string | null
  projectHref: string
  createdAt: string
  updatedAt: string
}

export type CareerEvidenceSummary = {
  id: string
  title: string
  projectType: string
  context: string
  skills: string[]
  evidenceCount: number
  eligible: boolean
  incompleteMessage: string | null
  projectHref: string
  href: string
  createdAt: string
  updatedAt: string
}

function toCareerError(error: unknown): never {
  if (error instanceof ProjectServiceError) {
    throw new CareerEvidenceError(error.code, error.message)
  }
  throw error
}

function emptyReflection(): ProjectReflection {
  return { finding: "", whyItMatters: "", recommendation: "" }
}

async function hydrateFromSource(options: {
  userId: string
  careerId: string
  createdAt: Date
  updatedAt: Date
  sourceLearnerProjectId: string | null
  storedTitle: string
}): Promise<CareerEvidenceProject> {
  if (!options.sourceLearnerProjectId) {
    throw new CareerEvidenceError("not_found", "Project not found")
  }

  const row = await prisma.learnerProject.findFirst({
    where: { id: options.sourceLearnerProjectId, userId: options.userId },
  })
  if (!row) {
    return {
      id: options.careerId,
      title: options.storedTitle,
      projectType: "",
      context: "",
      summary: "",
      dataset: "",
      workDemonstrated: [],
      skills: [],
      evidence: [],
      evidenceCount: 0,
      reflection: emptyReflection(),
      reflectionLabels: { finding: "Finding", whyItMatters: "Why it matters", recommendation: "Recommendation" },
      completedTasks: [],
      eligible: false,
      incompleteMessage: INCOMPLETE_LINKED_MESSAGE,
      projectHref: "",
      createdAt: options.createdAt.toISOString(),
      updatedAt: options.updatedAt.toISOString(),
    }
  }

  const definition = findProjectDefinition(row.projectType)
  if (!definition) {
    throw new CareerEvidenceError("not_found", "Project not found")
  }

  const tasks = parseStoredProjectTasks(row.tasks, definition)
  const reflection = parseProjectReflection(row.reflection)
  const eligible = isLearnerProjectComplete(row.tasks, definition)
  const evidence: CareerEvidenceItem[] = []
  for (const item of definition.careerEvidence) {
    const stored = tasks.find((task) => task.key === item.taskKey)
    const lab = await hydrateProjectLabEvidence(
      options.userId,
      definition.courseSlug,
      definition.labSlug,
      stored?.labWorkId ?? null,
      definition.projectType,
    )
    if (lab) {
      evidence.push({
        key: item.taskKey,
        title: item.title,
        source: lab.source,
        viewHref: lab.viewHref,
      })
      continue
    }
    if (!definition.labSlug && stored?.status === "complete") {
      evidence.push({
        key: item.taskKey,
        title: item.title,
        source: "Written project",
        viewHref: definition.workspaceHref,
      })
    }
  }

  const hasReflection = Boolean(
    reflection.finding.trim() || reflection.whyItMatters.trim() || reflection.recommendation.trim(),
  )
  const evidenceCount = evidence.length + (hasReflection ? 1 : 0)
  const completedTasks = definition.tasks
    .filter((_, index) => tasks[index]?.status === "complete")
    .map((task) => ({ key: task.key, title: task.title, number: task.number }))

  return {
    id: options.careerId,
    title: definition.title,
    projectType: definition.projectType,
    context: definition.careerContext,
    summary: definition.careerSummary,
    dataset: definition.dataset,
    workDemonstrated: eligible ? [...definition.demonstratedWork] : [],
    skills: eligible ? [...definition.demonstratedSkills] : [],
    evidence,
    evidenceCount,
    reflection,
    reflectionLabels: definition.reflectionLabels,
    completedTasks,
    eligible,
    incompleteMessage: eligible ? null : INCOMPLETE_LINKED_MESSAGE,
    projectHref: definition.workspaceHref,
    createdAt: options.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toSummary(project: CareerEvidenceProject): CareerEvidenceSummary {
  return {
    id: project.id,
    title: project.title,
    projectType: project.projectType,
    context: project.context,
    skills: project.skills,
    evidenceCount: project.evidenceCount,
    eligible: project.eligible,
    incompleteMessage: project.incompleteMessage,
    projectHref: project.projectHref,
    href: `/career-os/projects/${project.id}`,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

async function loadOwnedCareerProject(userId: string, careerProjectId: string) {
  const entry = await prisma.careerProject.findUnique({
    where: { id: careerProjectId },
    include: { profile: true },
  })
  if (!entry || entry.profile.userId !== userId || !entry.sourceLearnerProjectId) {
    throw new CareerEvidenceError("not_found", "Project not found")
  }
  return entry
}

export async function linkLearnerProjectToCareer(userId: string, learnerProjectId: string) {
  let workspace
  try {
    workspace = await getLearnerProject(userId, learnerProjectId)
  } catch (error) {
    toCareerError(error)
  }

  const definition = findProjectDefinition(workspace.projectType)
  if (!definition) throw new CareerEvidenceError("not_found", "Project not found")
  if (
    workspace.progress.complete !== workspace.progress.total ||
    workspace.tasks.some((task) => task.status !== "complete")
  ) {
    throw new CareerEvidenceError("incomplete", INCOMPLETE_CAREER_MESSAGE)
  }

  const profile = await getOrCreateProfile(userId)
  const existing = await prisma.careerProject.findUnique({
    where: { sourceLearnerProjectId: learnerProjectId },
  })
  if (existing) {
    if (existing.profileId !== profile.id) {
      throw new CareerEvidenceError("not_found", "Project not found")
    }
    const hydrated = await hydrateFromSource({
      userId,
      careerId: existing.id,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      sourceLearnerProjectId: existing.sourceLearnerProjectId,
      storedTitle: existing.title,
    })
    return { project: hydrated, created: false }
  }

  try {
    const created = await prisma.careerProject.create({
      data: {
        profileId: profile.id,
        title: definition.title,
        description: definition.careerSummary,
        technologies: [...definition.demonstratedSkills],
        sourceLearnerProjectId: learnerProjectId,
        sortOrder: profile.projects.length,
      },
    })
    const hydrated = await hydrateFromSource({
      userId,
      careerId: created.id,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      sourceLearnerProjectId: created.sourceLearnerProjectId,
      storedTitle: created.title,
    })
    return { project: hydrated, created: true }
  } catch (error) {
    const duplicate = await prisma.careerProject.findUnique({
      where: { sourceLearnerProjectId: learnerProjectId },
    })
    if (duplicate && duplicate.profileId === profile.id) {
      const hydrated = await hydrateFromSource({
        userId,
        careerId: duplicate.id,
        createdAt: duplicate.createdAt,
        updatedAt: duplicate.updatedAt,
        sourceLearnerProjectId: duplicate.sourceLearnerProjectId,
        storedTitle: duplicate.title,
      })
      return { project: hydrated, created: false }
    }
    throw error
  }
}

export async function listCareerEvidenceProjects(userId: string): Promise<CareerEvidenceSummary[]> {
  await getOrCreateProfile(userId)
  const rows = await prisma.careerProject.findMany({
    where: {
      profile: { userId },
      sourceLearnerProjectId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
  })
  const projects = await Promise.all(
    rows.map((row) =>
      hydrateFromSource({
        userId,
        careerId: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        sourceLearnerProjectId: row.sourceLearnerProjectId,
        storedTitle: row.title,
      }),
    ),
  )
  return projects.map(toSummary)
}

export async function getCareerEvidenceProject(userId: string, careerProjectId: string) {
  const entry = await loadOwnedCareerProject(userId, careerProjectId)
  return hydrateFromSource({
    userId,
    careerId: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    sourceLearnerProjectId: entry.sourceLearnerProjectId,
    storedTitle: entry.title,
  })
}

export async function unlinkCareerEvidenceProject(userId: string, careerProjectId: string) {
  const entry = await loadOwnedCareerProject(userId, careerProjectId)
  await prisma.careerProject.delete({ where: { id: entry.id } })
  return { id: entry.id, unlinked: true }
}

export async function findCareerLinkForLearnerProject(userId: string, learnerProjectId: string) {
  const entry = await prisma.careerProject.findFirst({
    where: {
      sourceLearnerProjectId: learnerProjectId,
      profile: { userId },
    },
  })
  if (!entry) return null
  return {
    id: entry.id,
    href: `/career-os/projects/${entry.id}`,
  }
}
