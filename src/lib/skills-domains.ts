import { courses, programs, workshops, type Course, type Program, type Workshop } from "../data"

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

export type ResolvedSkillDomain = SkillDomainDef & {
  programs: Program[]
  courses: Course[]
  workshops: Workshop[]
  learnTopics: string[]
  formatSummary: string | null
  levelSummary: string | null
  certificateSummary: string | null
  hasCatalog: boolean
  projectBased: boolean
}

const SKILLS_PROGRAM_TYPES = new Set(["PROFESSIONAL", "CERTIFICATE"])

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
    programSlugs: ["data-analytics-pro"],
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

function extractLearnTopics(def: SkillDomainDef, resolvedPrograms: Program[], resolvedCourses: Course[]): string[] {
  const fromPrograms = resolvedPrograms.flatMap((program) => program.whatYouWillLearn ?? []).slice(0, 6)
  const fromModules = resolvedPrograms
    .flatMap((program) => program.curriculumDetail ?? [])
    .flatMap((module) => module.topics ?? [])
    .slice(0, 8)
  const fromCourseModules = resolvedCourses.flatMap((course) => course.modules.map((module) => module.title)).slice(0, 6)
  const hints = def.learnTopicHints ?? []

  const combined = uniqueStrings([...hints, ...fromModules, ...fromCourseModules, ...fromPrograms])
  return combined.slice(0, 8)
}

function summarizeLevels(items: Array<{ level: string }>): string | null {
  const levels = uniqueStrings(items.map((item) => item.level))
  if (levels.length === 0) return null
  if (levels.length === 1) return levels[0]
  return levels.join(" · ")
}

function summarizeFormats(items: Array<{ format: string }>): string | null {
  const formats = uniqueStrings(items.map((item) => item.format))
  if (formats.length === 0) return null
  return formats.join(" · ")
}

function summarizeCertificates(resolvedPrograms: Program[]): string | null {
  const certs = uniqueStrings(resolvedPrograms.map((program) => program.cert))
  if (certs.length === 0) return null
  return certs.join(" · ")
}

export function resolveSkillDomain(def: SkillDomainDef): ResolvedSkillDomain {
  const resolvedPrograms = bySlug(
    programs.filter((program) => SKILLS_PROGRAM_TYPES.has(program.programType)),
    def.programSlugs,
  )
  const resolvedCourses = bySlug(courses, def.courseSlugs)
  const resolvedWorkshops = bySlug(workshops, def.workshopSlugs)
  const learnTopics = extractLearnTopics(def, resolvedPrograms, resolvedCourses)
  const hasCatalog = resolvedPrograms.length > 0 || resolvedCourses.length > 0 || resolvedWorkshops.length > 0
  const projectBased = resolvedPrograms.some((program) => program.projects > 0) || resolvedCourses.some((course) => course.projects > 0)

  return {
    ...def,
    programs: resolvedPrograms,
    courses: resolvedCourses,
    workshops: resolvedWorkshops,
    learnTopics,
    formatSummary: summarizeFormats(resolvedPrograms),
    levelSummary: summarizeLevels([...resolvedPrograms, ...resolvedCourses]),
    certificateSummary: summarizeCertificates(resolvedPrograms),
    hasCatalog,
    projectBased,
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
