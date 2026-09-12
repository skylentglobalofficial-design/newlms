import { courses, programs, workshops, type Course, type Program, type Workshop } from "../data"
import { getWorkshopAvailability } from "./catalogue-status"

export type SkillDomainId =
  | "data-science"
  | "data-analytics"
  | "artificial-intelligence"
  | "machine-learning"
  | "web-development"
  | "app-development"
  | "ui-ux-design"
  | "digital-marketing"
  | "business-management"

export type SkillDomainDef = {
  id: SkillDomainId
  label: string
  tagline: string
  programSlugs: string[]
  courseSlugs: string[]
  workshopSlugs: string[]
  learnTopicHints?: string[]
}

export type SkillCatalogItemKind = "program" | "course" | "workshop"

export type SkillCatalogItem = {
  kind: SkillCatalogItemKind
  slug: string
  title: string
  href: string
  typeLabel: string
  description: string
  level: string | null
  duration: string | null
  format: string | null
  certificate: string | null
  projects: number | null
  status: string | null
}

export type SkillDomainCta = {
  label: string
  href: string
}

export type ResolvedSkillDomain = SkillDomainDef & {
  catalogItems: SkillCatalogItem[]
  learnTopics: string[]
  hasCatalog: boolean
  cta: SkillDomainCta
}

const SKILLS_PROGRAM_TYPES = new Set(["PROFESSIONAL", "CERTIFICATE"])

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  PROFESSIONAL: "Professional Program",
  CERTIFICATE: "Certificate Program",
}

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  open: "Open for enrollment",
  waitlist: "Waitlist",
  coming_soon: "Coming soon",
}

export const SKILL_DOMAIN_DEFS: SkillDomainDef[] = [
  {
    id: "data-science",
    label: "Data Science",
    tagline: "Build practical data science skills from foundations to deployment.",
    programSlugs: ["data-science-ai"],
    courseSlugs: ["data-analytics", "python-programming"],
    workshopSlugs: [],
    learnTopicHints: ["Python", "Statistics", "Machine Learning", "Deep Learning"],
  },
  {
    id: "data-analytics",
    label: "Data Analytics",
    tagline: "Turn data into decisions with SQL, BI, and analytics workflows.",
    programSlugs: ["data-analytics-pro", "sql-certificate"],
    courseSlugs: ["data-analytics", "power-bi"],
    workshopSlugs: ["power-bi-workshop"],
    learnTopicHints: ["SQL", "Excel", "Power BI", "Python"],
  },
  {
    id: "artificial-intelligence",
    label: "Artificial Intelligence",
    tagline: "Learn applied AI — from LLMs to production-ready workflows.",
    programSlugs: ["generative-ai-program"],
    courseSlugs: ["generative-ai"],
    workshopSlugs: ["ai-for-business", "prompt-engineering"],
    learnTopicHints: ["LLMs", "Prompt Engineering", "RAG", "AI Applications"],
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    tagline: "Supervised, unsupervised, and applied ML for real datasets.",
    programSlugs: ["data-science-ai"],
    courseSlugs: ["python-programming"],
    workshopSlugs: [],
    learnTopicHints: ["Regression", "Classification", "Ensemble Methods", "Model Evaluation"],
  },
  {
    id: "web-development",
    label: "Web Development",
    tagline: "Front-end to full-stack web development with project work.",
    programSlugs: ["full-stack"],
    courseSlugs: ["full-stack-web"],
    workshopSlugs: [],
    learnTopicHints: ["HTML & CSS", "JavaScript", "React", "APIs"],
  },
  {
    id: "app-development",
    label: "App Development",
    tagline: "Build and ship applications with modern full-stack skills.",
    programSlugs: ["full-stack"],
    courseSlugs: ["full-stack-web"],
    workshopSlugs: [],
    learnTopicHints: ["React", "Back-end APIs", "Databases", "Deployment"],
  },
  {
    id: "ui-ux-design",
    label: "UI/UX Design",
    tagline: "Design skills for product interfaces and user experience.",
    programSlugs: [],
    courseSlugs: [],
    workshopSlugs: [],
  },
  {
    id: "digital-marketing",
    label: "Digital Marketing",
    tagline: "Growth, campaigns, and digital channels for modern businesses.",
    programSlugs: [],
    courseSlugs: [],
    workshopSlugs: [],
  },
  {
    id: "business-management",
    label: "Business / Management",
    tagline: "Product thinking, strategy, and management skills for builders.",
    programSlugs: ["product-management"],
    courseSlugs: ["product-management"],
    workshopSlugs: ["ai-for-business"],
    learnTopicHints: ["Product Strategy", "Roadmapping", "Stakeholder Management"],
  },
]

function bySlug<T extends { slug: string }>(items: T[], slugs: string[]): T[] {
  const map = new Map(items.map((item) => [item.slug, item]))
  return slugs.map((slug) => map.get(slug)).filter((item): item is T => Boolean(item))
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }
  return result
}

function programToCatalogItem(program: Program): SkillCatalogItem {
  return {
    kind: "program",
    slug: program.slug,
    title: program.name,
    href: `/programs/${program.slug}`,
    typeLabel: PROGRAM_TYPE_LABELS[program.programType] ?? "Program",
    description: program.desc,
    level: program.level ?? null,
    duration: program.duration ?? null,
    format: program.format ?? null,
    certificate: program.cert ?? null,
    projects: program.projects > 0 ? program.projects : null,
    status: program.enrollmentStatus
      ? ENROLLMENT_STATUS_LABELS[program.enrollmentStatus] ?? program.enrollmentStatus
      : null,
  }
}

function courseToCatalogItem(course: Course): SkillCatalogItem {
  return {
    kind: "course",
    slug: course.slug,
    title: course.title,
    href: `/courses/${course.slug}`,
    typeLabel: "Course",
    description: course.desc,
    level: course.level ?? null,
    duration: course.duration ?? null,
    format: course.mode ?? null,
    certificate: null,
    projects: course.projects > 0 ? course.projects : null,
    status: null,
  }
}

function workshopToCatalogItem(workshop: Workshop): SkillCatalogItem {
  const availability = getWorkshopAvailability()
  return {
    kind: "workshop",
    slug: workshop.slug,
    title: workshop.title,
    href: `/workshops/${workshop.slug}`,
    typeLabel: "Webinar",
    description: workshop.desc,
    level: null,
    duration: workshop.duration ?? null,
    format: workshop.mode ?? null,
    certificate: null,
    projects: null,
    status: availability.label,
  }
}

function buildCatalogItems(def: SkillDomainDef): SkillCatalogItem[] {
  const resolvedPrograms = bySlug(
    programs.filter((program) => SKILLS_PROGRAM_TYPES.has(program.programType)),
    def.programSlugs,
  )
  const resolvedCourses = bySlug(courses, def.courseSlugs)
  const resolvedWorkshops = bySlug(workshops, def.workshopSlugs)

  return [
    ...resolvedPrograms.map(programToCatalogItem),
    ...resolvedCourses.map(courseToCatalogItem),
    ...resolvedWorkshops.map(workshopToCatalogItem),
  ]
}

function extractLearnTopics(def: SkillDomainDef, catalogItems: SkillCatalogItem[]): string[] {
  const programSlugs = catalogItems.filter((item) => item.kind === "program").map((item) => item.slug)
  const courseSlugs = catalogItems.filter((item) => item.kind === "course").map((item) => item.slug)

  const resolvedPrograms = bySlug(
    programs.filter((program) => SKILLS_PROGRAM_TYPES.has(program.programType)),
    programSlugs,
  )
  const resolvedCourses = bySlug(courses, courseSlugs)

  const fromPrograms = resolvedPrograms.flatMap((program) => program.whatYouWillLearn ?? []).slice(0, 6)
  const fromModules = resolvedPrograms
    .flatMap((program) => program.curriculumDetail ?? [])
    .flatMap((module) => module.topics ?? [])
    .slice(0, 8)
  const fromCourseModules = resolvedCourses.flatMap((course) => course.modules.map((module) => module.title)).slice(0, 6)
  const hints = def.learnTopicHints ?? []

  return uniqueStrings([...hints, ...fromModules, ...fromCourseModules, ...fromPrograms]).slice(0, 8)
}

function buildDomainCta(domain: SkillDomainDef, catalogItems: SkillCatalogItem[]): SkillDomainCta {
  if (catalogItems.length === 0) {
    return { label: "Browse programs", href: "/programs" }
  }

  const programsOnly = catalogItems.filter((item) => item.kind === "program")
  if (programsOnly.length === 1) {
    return { label: "View program", href: programsOnly[0].href }
  }
  if (programsOnly.length > 1) {
    return { label: `Explore all ${domain.label} programs`, href: "/programs" }
  }

  if (catalogItems.length === 1) {
    const item = catalogItems[0]
    const label =
      item.kind === "workshop" ? `View ${item.title}` :
      item.kind === "course" ? "View course" :
      "View program"
    return { label, href: item.href }
  }

  return { label: `Explore ${domain.label}`, href: catalogItems[0].href }
}

export function resolveSkillDomain(def: SkillDomainDef): ResolvedSkillDomain {
  const catalogItems = buildCatalogItems(def)
  const learnTopics = extractLearnTopics(def, catalogItems)

  return {
    ...def,
    catalogItems,
    learnTopics,
    hasCatalog: catalogItems.length > 0,
    cta: buildDomainCta(def, catalogItems),
  }
}

export function getSkillDomains(): ResolvedSkillDomain[] {
  return SKILL_DOMAIN_DEFS.map(resolveSkillDomain)
}

export function getDefaultSkillDomainId(): SkillDomainId {
  const firstWithCatalog = getSkillDomains().find((domain) => domain.hasCatalog)
  return firstWithCatalog?.id ?? "data-science"
}

export function getSkillDomainById(id: SkillDomainId): ResolvedSkillDomain {
  const def = SKILL_DOMAIN_DEFS.find((domain) => domain.id === id)
  if (!def) return resolveSkillDomain(SKILL_DOMAIN_DEFS[0])
  return resolveSkillDomain(def)
}
