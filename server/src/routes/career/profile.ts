import { Router } from "express"
import { z } from "zod"
import {
  CareerEmploymentType,
  CareerLinkType,
  CareerProfileVisibility,
  CareerSkillProficiency,
  CareerWorkMode,
  ResumeVersionStatus,
} from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import {
  assertOwnedEducation,
  assertOwnedExperience,
  assertOwnedLink,
  assertOwnedProject,
  assertOwnedResumeVersion,
  assertOwnedSkill,
  computeProfileCompleteness,
  getOrCreateProfile,
  reloadProfile,
  serializeEducation,
  serializeExperience,
  serializeLink,
  serializeProject,
  serializeResumeVersion,
  serializeSkill,
} from "../../lib/career/profile.js"
import { parseOptionalDate, validationError } from "../../lib/career/shared.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"

export const profileRouter = Router()
const uuidSchema = z.string().uuid()

const profileBodySchema = z.object({
  headline: z.string().trim().max(160).nullable().optional(),
  summary: z.string().trim().max(4000).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  preferredRole: z.string().trim().max(120).nullable().optional(),
  preferredWorkMode: z.nativeEnum(CareerWorkMode).nullable().optional(),
  visibility: z.nativeEnum(CareerProfileVisibility).optional(),
})

const educationSchema = z.object({
  institution: z.string().trim().min(1).max(200),
  degree: z.string().trim().min(1).max(200),
  fieldOfStudy: z.string().trim().max(200).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  currentlyStudying: z.boolean().optional(),
  grade: z.string().trim().max(40).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

const experienceSchema = z.object({
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  employmentType: z.nativeEnum(CareerEmploymentType).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  currentlyWorking: z.boolean().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().max(80).nullable().optional(),
  proficiency: z.nativeEnum(CareerSkillProficiency).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

const projectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable().optional(),
  technologies: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  projectUrl: z.string().trim().url().max(500).nullable().optional(),
  repositoryUrl: z.string().trim().url().max(500).nullable().optional(),
  outcome: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

const linkSchema = z.object({
  type: z.nativeEnum(CareerLinkType),
  label: z.string().trim().max(80).nullable().optional(),
  url: z.string().trim().url().max(500),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

const resumeSchema = z.object({
  label: z.string().trim().min(1).max(120),
  version: z.number().int().min(1).max(999).optional(),
  fileName: z.string().trim().max(255).nullable().optional(),
  mimeType: z.string().trim().max(120).nullable().optional(),
  byteSize: z.number().int().min(0).max(50_000_000).nullable().optional(),
  storageProvider: z.string().trim().max(40).nullable().optional(),
  storageKey: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  status: z.nativeEnum(ResumeVersionStatus).optional(),
  isPrimary: z.boolean().optional(),
})

async function updateProfileFields(userId: string, body: z.infer<typeof profileBodySchema>) {
  const profile = await getOrCreateProfile(userId)
  const updates: Record<string, unknown> = {}
  if (body.headline !== undefined) updates.headline = body.headline
  if (body.summary !== undefined) updates.summary = body.summary
  if (body.location !== undefined) updates.location = body.location
  if (body.phone !== undefined) updates.phone = body.phone
  if (body.preferredRole !== undefined) updates.preferredRole = body.preferredRole
  if (body.preferredWorkMode !== undefined) updates.preferredWorkMode = body.preferredWorkMode
  if (body.visibility !== undefined) updates.profileVisibility = body.visibility
  if (Object.keys(updates).length) {
    await prisma.careerProfile.update({ where: { id: profile.id }, data: updates })
  }
  return reloadProfile(userId)
}

profileRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await getOrCreateProfile(req.auth!.user.id)
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    console.error("Failed to load career profile:", error)
    res.status(500).json({ error: "Failed to load career profile" })
  }
})

profileRouter.get("/completeness", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await getOrCreateProfile(req.auth!.user.id)
    const completeness = computeProfileCompleteness(profile)
    res.json({ data: completeness })
  } catch (error) {
    console.error("Failed to compute completeness:", error)
    res.status(500).json({ error: "Failed to compute profile completeness" })
  }
})

profileRouter.put("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = profileBodySchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    res.json({ data: await updateProfileFields(req.auth!.user.id, parsed.data) })
  } catch (error) {
    console.error("Failed to update career profile:", error)
    res.status(500).json({ error: "Failed to update career profile" })
  }
})

profileRouter.patch("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = profileBodySchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    res.json({ data: await updateProfileFields(req.auth!.user.id, parsed.data) })
  } catch (error) {
    console.error("Failed to patch career profile:", error)
    res.status(500).json({ error: "Failed to update career profile" })
  }
})

profileRouter.post("/education", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = educationSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const userId = req.auth!.user.id
    const profile = await getOrCreateProfile(userId)
    const entry = await prisma.careerEducation.create({
      data: {
        profileId: profile.id,
        institution: parsed.data.institution,
        degree: parsed.data.degree,
        fieldOfStudy: parsed.data.fieldOfStudy ?? null,
        startDate: parseOptionalDate(parsed.data.startDate),
        endDate: parseOptionalDate(parsed.data.endDate),
        currentlyStudying: parsed.data.currentlyStudying ?? false,
        grade: parsed.data.grade ?? null,
        sortOrder: parsed.data.sortOrder ?? profile.education.length,
      },
    })
    res.status(201).json({ data: serializeEducation(entry), profile: await reloadProfile(userId) })
  } catch (error) {
    console.error("Failed to create education:", error)
    res.status(500).json({ error: "Failed to create education entry" })
  }
})

profileRouter.patch("/education/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid education id" })
  const parsed = educationSchema.partial().safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  const entry = await assertOwnedEducation(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Education entry not found" })
  try {
    await prisma.careerEducation.update({
      where: { id: entry.id },
      data: {
        institution: parsed.data.institution,
        degree: parsed.data.degree,
        fieldOfStudy: parsed.data.fieldOfStudy,
        startDate: parsed.data.startDate === undefined ? undefined : parseOptionalDate(parsed.data.startDate),
        endDate: parsed.data.endDate === undefined ? undefined : parseOptionalDate(parsed.data.endDate),
        currentlyStudying: parsed.data.currentlyStudying,
        grade: parsed.data.grade,
        sortOrder: parsed.data.sortOrder,
      },
    })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    console.error("Failed to update education:", error)
    res.status(500).json({ error: "Failed to update education entry" })
  }
})

profileRouter.delete("/education/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid education id" })
  const entry = await assertOwnedEducation(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Education entry not found" })
  try {
    await prisma.careerEducation.delete({ where: { id: entry.id } })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete education entry" })
  }
})

profileRouter.post("/experience", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = experienceSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const userId = req.auth!.user.id
    const profile = await getOrCreateProfile(userId)
    await prisma.careerExperience.create({
      data: {
        profileId: profile.id,
        company: parsed.data.company,
        role: parsed.data.role,
        employmentType: parsed.data.employmentType ?? null,
        location: parsed.data.location ?? null,
        startDate: parseOptionalDate(parsed.data.startDate),
        endDate: parseOptionalDate(parsed.data.endDate),
        currentlyWorking: parsed.data.currentlyWorking ?? false,
        description: parsed.data.description ?? null,
        sortOrder: parsed.data.sortOrder ?? profile.experience.length,
      },
    })
    res.status(201).json({ data: await reloadProfile(userId) })
  } catch (error) {
    res.status(500).json({ error: "Failed to create experience entry" })
  }
})

profileRouter.patch("/experience/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid experience id" })
  const parsed = experienceSchema.partial().safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  const entry = await assertOwnedExperience(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Experience entry not found" })
  try {
    await prisma.careerExperience.update({
      where: { id: entry.id },
      data: {
        company: parsed.data.company,
        role: parsed.data.role,
        employmentType: parsed.data.employmentType,
        location: parsed.data.location,
        startDate: parsed.data.startDate === undefined ? undefined : parseOptionalDate(parsed.data.startDate),
        endDate: parsed.data.endDate === undefined ? undefined : parseOptionalDate(parsed.data.endDate),
        currentlyWorking: parsed.data.currentlyWorking,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
      },
    })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update experience entry" })
  }
})

profileRouter.delete("/experience/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid experience id" })
  const entry = await assertOwnedExperience(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Experience entry not found" })
  try {
    await prisma.careerExperience.delete({ where: { id: entry.id } })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete experience entry" })
  }
})

profileRouter.post("/skills", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = skillSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const userId = req.auth!.user.id
    const profile = await getOrCreateProfile(userId)
    await prisma.careerSkill.create({
      data: {
        profileId: profile.id,
        name: parsed.data.name,
        category: parsed.data.category ?? null,
        proficiency: parsed.data.proficiency ?? null,
        sortOrder: parsed.data.sortOrder ?? profile.skills.length,
      },
    })
    res.status(201).json({ data: await reloadProfile(userId) })
  } catch (error) {
    if (String(error).includes("Unique constraint")) return res.status(409).json({ error: "Skill already exists" })
    res.status(500).json({ error: "Failed to create skill" })
  }
})

profileRouter.patch("/skills/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid skill id" })
  const parsed = skillSchema.partial().safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  const entry = await assertOwnedSkill(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Skill not found" })
  try {
    await prisma.careerSkill.update({
      where: { id: entry.id },
      data: { name: parsed.data.name, category: parsed.data.category, proficiency: parsed.data.proficiency, sortOrder: parsed.data.sortOrder },
    })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update skill" })
  }
})

profileRouter.delete("/skills/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid skill id" })
  const entry = await assertOwnedSkill(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Skill not found" })
  try {
    await prisma.careerSkill.delete({ where: { id: entry.id } })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete skill" })
  }
})

profileRouter.post("/projects", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = projectSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const userId = req.auth!.user.id
    const profile = await getOrCreateProfile(userId)
    await prisma.careerProject.create({
      data: {
        profileId: profile.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        technologies: parsed.data.technologies ?? [],
        projectUrl: parsed.data.projectUrl ?? null,
        repositoryUrl: parsed.data.repositoryUrl ?? null,
        outcome: parsed.data.outcome ?? null,
        sortOrder: parsed.data.sortOrder ?? profile.projects.length,
      },
    })
    res.status(201).json({ data: await reloadProfile(userId) })
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" })
  }
})

profileRouter.patch("/projects/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid project id" })
  const parsed = projectSchema.partial().safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  const entry = await assertOwnedProject(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Project not found" })
  try {
    await prisma.careerProject.update({
      where: { id: entry.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        technologies: parsed.data.technologies,
        projectUrl: parsed.data.projectUrl,
        repositoryUrl: parsed.data.repositoryUrl,
        outcome: parsed.data.outcome,
        sortOrder: parsed.data.sortOrder,
      },
    })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" })
  }
})

profileRouter.delete("/projects/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid project id" })
  const entry = await assertOwnedProject(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Project not found" })
  try {
    await prisma.careerProject.delete({ where: { id: entry.id } })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" })
  }
})

profileRouter.post("/links", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = linkSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const userId = req.auth!.user.id
    const profile = await getOrCreateProfile(userId)
    await prisma.careerLink.create({
      data: {
        profileId: profile.id,
        type: parsed.data.type,
        label: parsed.data.label ?? null,
        url: parsed.data.url,
        sortOrder: parsed.data.sortOrder ?? profile.links.length,
      },
    })
    res.status(201).json({ data: await reloadProfile(userId) })
  } catch (error) {
    res.status(500).json({ error: "Failed to create link" })
  }
})

profileRouter.patch("/links/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid link id" })
  const parsed = linkSchema.partial().safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  const entry = await assertOwnedLink(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Link not found" })
  try {
    await prisma.careerLink.update({
      where: { id: entry.id },
      data: { type: parsed.data.type, label: parsed.data.label, url: parsed.data.url, sortOrder: parsed.data.sortOrder },
    })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update link" })
  }
})

profileRouter.delete("/links/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid link id" })
  const entry = await assertOwnedLink(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Link not found" })
  try {
    await prisma.careerLink.delete({ where: { id: entry.id } })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete link" })
  }
})

profileRouter.get("/resumes", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await getOrCreateProfile(req.auth!.user.id)
    res.json({ data: profile.resumeVersions.map(serializeResumeVersion) })
  } catch (error) {
    res.status(500).json({ error: "Failed to list resume versions" })
  }
})

profileRouter.post("/resumes", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = resumeSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const userId = req.auth!.user.id
    const profile = await getOrCreateProfile(userId)
    if (parsed.data.isPrimary) {
      await prisma.careerResumeVersion.updateMany({ where: { profileId: profile.id, isPrimary: true }, data: { isPrimary: false } })
    }
    const entry = await prisma.careerResumeVersion.create({
      data: {
        profileId: profile.id,
        label: parsed.data.label,
        version: parsed.data.version ?? profile.resumeVersions.length + 1,
        fileName: parsed.data.fileName ?? null,
        mimeType: parsed.data.mimeType ?? null,
        byteSize: parsed.data.byteSize ?? null,
        storageProvider: parsed.data.storageProvider ?? null,
        storageKey: parsed.data.storageKey ?? null,
        notes: parsed.data.notes ?? null,
        status: parsed.data.status ?? "DRAFT",
        isPrimary: parsed.data.isPrimary ?? profile.resumeVersions.length === 0,
      },
    })
    res.status(201).json({ data: serializeResumeVersion(entry), profile: await reloadProfile(userId) })
  } catch (error) {
    res.status(500).json({ error: "Failed to create resume version" })
  }
})

profileRouter.delete("/resumes/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid resume id" })
  const entry = await assertOwnedResumeVersion(req.auth!.user.id, idParsed.data)
  if (!entry) return res.status(404).json({ error: "Resume version not found" })
  try {
    await prisma.careerResumeVersion.delete({ where: { id: entry.id } })
    res.json({ data: await reloadProfile(req.auth!.user.id) })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resume version" })
  }
})
