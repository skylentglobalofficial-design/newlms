import type {
  CareerEducation,
  CareerExperience,
  CareerLink,
  CareerProfile,
  CareerProject,
  CareerResumeVersion,
  CareerSkill,
} from "@prisma/client"
import { prisma } from "../prisma.js"
import { hasText } from "./shared.js"

export const PROFILE_INCLUDE = {
  education: { orderBy: { sortOrder: "asc" } },
  experience: { orderBy: { sortOrder: "asc" } },
  skills: { orderBy: { sortOrder: "asc" } },
  projects: { orderBy: { sortOrder: "asc" } },
  links: { orderBy: { sortOrder: "asc" } },
  resumeVersions: { orderBy: { createdAt: "desc" } },
} as const

export type CareerProfileFull = CareerProfile & {
  education: CareerEducation[]
  experience: CareerExperience[]
  skills: CareerSkill[]
  projects: CareerProject[]
  links: CareerLink[]
  resumeVersions: CareerResumeVersion[]
}

export type CompletenessItem = {
  key: string
  label: string
  section: string
  complete: boolean
  weight: number
}

export type ProfileCompleteness = {
  percent: number
  completed: string[]
  missing: string[]
  nextRecommended: string | null
  items: CompletenessItem[]
}

export function computeProfileCompleteness(profile: CareerProfileFull): ProfileCompleteness {
  const educationComplete = profile.education.some(
    (e) => hasText(e.institution) && hasText(e.degree) && (e.startDate !== null || e.currentlyStudying),
  )
  const experienceComplete = profile.experience.some(
    (e) => hasText(e.company) && hasText(e.role) && (e.startDate !== null || e.currentlyWorking),
  )
  const skillsComplete = profile.skills.filter((s) => hasText(s.name)).length >= 3
  const projectComplete = profile.projects.some(
    (p) => hasText(p.title) && (hasText(p.description) || hasText(p.outcome)),
  )
  const linkComplete = profile.links.some((l) => hasText(l.url))

  const items: CompletenessItem[] = [
    { key: "headline", label: "Professional headline", section: "basics", complete: hasText(profile.headline), weight: 10 },
    { key: "summary", label: "Profile summary", section: "basics", complete: hasText(profile.summary), weight: 15 },
    { key: "location", label: "Location", section: "basics", complete: hasText(profile.location), weight: 5 },
    { key: "preferredRole", label: "Preferred role", section: "basics", complete: hasText(profile.preferredRole), weight: 10 },
    { key: "preferredWorkMode", label: "Preferred work mode", section: "basics", complete: profile.preferredWorkMode !== null, weight: 5 },
    { key: "phone", label: "Phone number", section: "basics", complete: hasText(profile.phone), weight: 5 },
    { key: "education", label: "Education entry", section: "education", complete: educationComplete, weight: 15 },
    { key: "experience", label: "Work experience", section: "experience", complete: experienceComplete, weight: 15 },
    { key: "skills", label: "At least 3 skills", section: "skills", complete: skillsComplete, weight: 10 },
    { key: "projects", label: "Project proof", section: "projects", complete: projectComplete, weight: 5 },
    { key: "links", label: "Professional link", section: "links", complete: linkComplete, weight: 5 },
  ]

  const percent = items.reduce((sum, item) => sum + (item.complete ? item.weight : 0), 0)
  const completed = items.filter((i) => i.complete).map((i) => i.label)
  const missing = items.filter((i) => !i.complete).map((i) => i.label)

  return {
    percent,
    completed,
    missing,
    nextRecommended: missing[0] ?? null,
    items,
  }
}

export async function getOrCreateProfile(userId: string): Promise<CareerProfileFull> {
  const existing = await prisma.careerProfile.findUnique({ where: { userId }, include: PROFILE_INCLUDE })
  if (existing) return existing
  return prisma.careerProfile.create({ data: { userId }, include: PROFILE_INCLUDE })
}

export async function loadProfileForUser(userId: string) {
  return prisma.careerProfile.findUnique({ where: { userId }, include: PROFILE_INCLUDE })
}

export async function reloadProfile(userId: string) {
  const profile = await loadProfileForUser(userId)
  if (!profile) throw new Error("Profile not found")
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } })
  return serializeProfile(profile, user?.displayName)
}

export function serializeProfile(profile: CareerProfileFull, displayName?: string | null) {
  const completeness = computeProfileCompleteness(profile)
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: displayName ?? null,
    headline: profile.headline,
    summary: profile.summary,
    location: profile.location,
    phone: profile.phone,
    preferredRole: profile.preferredRole,
    preferredWorkMode: profile.preferredWorkMode,
    visibility: profile.profileVisibility,
    education: profile.education.map(serializeEducation),
    experience: profile.experience.map(serializeExperience),
    skills: profile.skills.map(serializeSkill),
    projects: profile.projects.map(serializeProject),
    links: profile.links.map(serializeLink),
    resumeVersions: profile.resumeVersions.map(serializeResumeVersion),
    completeness,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  }
}

export function serializeEducation(entry: CareerEducation) {
  return {
    id: entry.id,
    institution: entry.institution,
    degree: entry.degree,
    fieldOfStudy: entry.fieldOfStudy,
    startDate: entry.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: entry.endDate?.toISOString().slice(0, 10) ?? null,
    currentlyStudying: entry.currentlyStudying,
    grade: entry.grade,
    sortOrder: entry.sortOrder,
  }
}

export function serializeExperience(entry: CareerExperience) {
  return {
    id: entry.id,
    company: entry.company,
    role: entry.role,
    employmentType: entry.employmentType,
    location: entry.location,
    startDate: entry.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: entry.endDate?.toISOString().slice(0, 10) ?? null,
    currentlyWorking: entry.currentlyWorking,
    description: entry.description,
    sortOrder: entry.sortOrder,
  }
}

export function serializeSkill(entry: CareerSkill) {
  return { id: entry.id, name: entry.name, category: entry.category, proficiency: entry.proficiency, sortOrder: entry.sortOrder }
}

export function serializeProject(entry: CareerProject) {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    technologies: entry.technologies,
    projectUrl: entry.projectUrl,
    repositoryUrl: entry.repositoryUrl,
    outcome: entry.outcome,
    sortOrder: entry.sortOrder,
  }
}

export function serializeLink(entry: CareerLink) {
  return { id: entry.id, type: entry.type, label: entry.label, url: entry.url, sortOrder: entry.sortOrder }
}

export function serializeResumeVersion(entry: CareerResumeVersion) {
  return {
    id: entry.id,
    label: entry.label,
    version: entry.version,
    fileName: entry.fileName,
    mimeType: entry.mimeType,
    byteSize: entry.byteSize,
    storageProvider: entry.storageProvider,
    storageKey: entry.storageKey,
    notes: entry.notes,
    status: entry.status,
    isPrimary: entry.isPrimary,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }
}

export async function assertOwnedEducation(userId: string, id: string) {
  const entry = await prisma.careerEducation.findUnique({ where: { id }, include: { profile: true } })
  return entry?.profile.userId === userId ? entry : null
}

export async function assertOwnedExperience(userId: string, id: string) {
  const entry = await prisma.careerExperience.findUnique({ where: { id }, include: { profile: true } })
  return entry?.profile.userId === userId ? entry : null
}

export async function assertOwnedSkill(userId: string, id: string) {
  const entry = await prisma.careerSkill.findUnique({ where: { id }, include: { profile: true } })
  return entry?.profile.userId === userId ? entry : null
}

export async function assertOwnedProject(userId: string, id: string) {
  const entry = await prisma.careerProject.findUnique({ where: { id }, include: { profile: true } })
  return entry?.profile.userId === userId ? entry : null
}

export async function assertOwnedLink(userId: string, id: string) {
  const entry = await prisma.careerLink.findUnique({ where: { id }, include: { profile: true } })
  return entry?.profile.userId === userId ? entry : null
}

export async function assertOwnedResumeVersion(userId: string, id: string) {
  const entry = await prisma.careerResumeVersion.findUnique({ where: { id }, include: { profile: true } })
  return entry?.profile.userId === userId ? entry : null
}

export async function assertOwnedApplication(userId: string, id: string) {
  const entry = await prisma.jobApplication.findUnique({ where: { id } })
  return entry?.userId === userId ? entry : null
}

export async function assertOwnedInterviewRound(userId: string, id: string) {
  const entry = await prisma.interviewRound.findUnique({ where: { id } })
  return entry?.userId === userId ? entry : null
}

export async function assertOwnedPractice(userId: string, id: string) {
  const entry = await prisma.interviewPractice.findUnique({ where: { id } })
  return entry?.userId === userId ? entry : null
}

export async function assertOwnedSupportRequest(userId: string, id: string) {
  const entry = await prisma.careerSupportRequest.findUnique({ where: { id } })
  return entry?.userId === userId ? entry : null
}
