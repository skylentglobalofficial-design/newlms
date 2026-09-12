import { programs, type Program } from "../data"

export type EducationPathwayId =
  | "schooling"
  | "undergraduate"
  | "postgraduate"
  | "competitive-exams"

export type EducationPathwayDef = {
  id: EducationPathwayId
  label: string
  sub: string
  tagline: string
  description: string
  programSlugs: string[]
  formats: string[]
  levels: string[]
  preparationWorkflow: string[]
}

export type EducationCatalogItem = {
  slug: string
  title: string
  href: string
  typeLabel: string
  description: string
  level: string | null
  duration: string | null
  format: string | null
  certificate: string | null
  outcome: string | null
  examName: string | null
  examPattern: string | null
  examSections: string[]
  preparationSteps: string[]
  status: string | null
}

export type EducationPathwayCta = {
  label: string
  href: string
}

export type ResolvedEducationPathway = EducationPathwayDef & {
  catalogItems: EducationCatalogItem[]
  examNames: string[]
  preparationTopics: string[]
  hasCatalog: boolean
  cta: EducationPathwayCta
}

const EDUCATION_PROGRAM_TYPES = new Set(["SCHOOLING", "UNDERGRADUATE", "POSTGRADUATE", "EXAM_PREP"])

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  open: "Open for enrollment",
  waitlist: "Waitlist",
  coming_soon: "Coming soon",
}

const EXAM_NAME_BY_SLUG: Record<string, string> = {
  "jee-advanced-prep": "JEE Advanced",
  "cat-prep": "CAT",
}

export const EDUCATION_PATHWAY_DEFS: EducationPathwayDef[] = [
  {
    id: "schooling",
    label: "Schooling",
    sub: "Grades 1–12",
    tagline: "Learning that builds confidence from primary through senior secondary.",
    description:
      "For school students and parents. Curriculum-aligned delivery with lesson rhythm, activities, assessments, and visible progress across grade bands.",
    programSlugs: [],
    formats: ["Self-paced", "School-aligned curriculum"],
    levels: ["Primary", "Middle", "Secondary", "Senior Secondary"],
    preparationWorkflow: ["Grade", "Subject", "Chapter", "Lesson", "Activity", "Assessment", "Progress"],
  },
  {
    id: "undergraduate",
    label: "Undergraduate",
    sub: "Degree-aligned",
    tagline: "Degree study paired with skills, projects, and career direction.",
    description:
      "Undergraduate learners get structured programmes beside their degree — professional skills, project work, and a path into Career OS where supported.",
    programSlugs: [],
    formats: ["Self-paced", "Degree-aligned"],
    levels: ["Foundation", "Intermediate", "Advanced"],
    preparationWorkflow: ["Program", "Modules", "Projects", "Assessments", "Career readiness"],
  },
  {
    id: "postgraduate",
    label: "Postgraduate",
    sub: "Specialisation",
    tagline: "Specialisation tracks with cases, projects, and professional outcomes.",
    description:
      "Postgraduate pathways focus on depth — advanced modules and applied project work for learners moving into specialist roles.",
    programSlugs: [],
    formats: ["Self-paced", "Specialist tracks"],
    levels: ["Advanced", "Professional"],
    preparationWorkflow: ["Specialisation", "Cases", "Projects", "Assessment", "Career support"],
  },
  {
    id: "competitive-exams",
    label: "Competitive / Entrance Exams",
    sub: "Exam preparation",
    tagline: "Exam preparation organised around the published exam pattern and syllabus.",
    description:
      "Entrance exam programmes organised around exam patterns and subject mastery. No practice tests or mock exams are in the platform yet.",
    programSlugs: ["jee-advanced-prep", "cat-prep"],
    formats: ["Self-paced", "Exam-pattern aligned"],
    levels: ["Exam prep"],
    preparationWorkflow: ["Syllabus", "Lessons", "Notes", "Quizzes", "Revision"],
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

function programToCatalogItem(program: Program): EducationCatalogItem {
  return {
    slug: program.slug,
    title: program.name,
    href: `/programs/${program.slug}`,
    typeLabel: "Exam preparation",
    description: program.desc,
    level: program.level ?? null,
    duration: program.duration ?? null,
    format: program.format ?? null,
    certificate: program.cert ?? null,
    outcome: program.outcome ?? null,
    examName: EXAM_NAME_BY_SLUG[program.slug] ?? null,
    examPattern: program.examPattern ?? null,
    examSections: program.examSections ?? [],
    preparationSteps: program.learningExperience ?? [],
    status: program.enrollmentStatus
      ? ENROLLMENT_STATUS_LABELS[program.enrollmentStatus] ?? program.enrollmentStatus
      : null,
  }
}

function buildCatalogItems(def: EducationPathwayDef): EducationCatalogItem[] {
  const resolvedPrograms = bySlug(
    programs.filter((program) => EDUCATION_PROGRAM_TYPES.has(program.programType)),
    def.programSlugs,
  )
  return resolvedPrograms.map(programToCatalogItem)
}

function extractPreparationTopics(catalogItems: EducationCatalogItem[]): string[] {
  const fromSections = catalogItems.flatMap((item) => item.examSections)
  const fromCurriculum = catalogItems.flatMap((item) => {
    const program = programs.find((entry) => entry.slug === item.slug)
    return program?.curriculumDetail?.flatMap((module) => module.topics ?? []) ?? []
  })
  return uniqueStrings([...fromSections, ...fromCurriculum]).slice(0, 10)
}

function buildPathwayCta(pathway: EducationPathwayDef, catalogItems: EducationCatalogItem[]): EducationPathwayCta {
  if (catalogItems.length === 0) {
    if (pathway.id === "schooling") {
      return { label: "Partner with Skylent", href: "/institutions" }
    }
    if (pathway.id === "undergraduate" || pathway.id === "postgraduate") {
      return { label: "Register interest", href: "/contact" }
    }
    return { label: "Browse programs", href: "/programs" }
  }

  if (catalogItems.length === 1) {
    return { label: "View program", href: catalogItems[0].href }
  }

  return { label: `Explore ${pathway.label} programs`, href: "/programs" }
}

export function resolveEducationPathway(def: EducationPathwayDef): ResolvedEducationPathway {
  const catalogItems = buildCatalogItems(def)
  const examNames = uniqueStrings(
    catalogItems.map((item) => item.examName).filter((name): name is string => Boolean(name)),
  )
  const preparationTopics = extractPreparationTopics(catalogItems)

  return {
    ...def,
    catalogItems,
    examNames,
    preparationTopics,
    hasCatalog: catalogItems.length > 0,
    cta: buildPathwayCta(def, catalogItems),
  }
}

export function getEducationPathways(): ResolvedEducationPathway[] {
  return EDUCATION_PATHWAY_DEFS.map(resolveEducationPathway)
}

export function getDefaultEducationPathwayId(): EducationPathwayId {
  const firstWithCatalog = getEducationPathways().find((pathway) => pathway.hasCatalog)
  return firstWithCatalog?.id ?? "schooling"
}

export function getEducationPathwayById(id: EducationPathwayId): ResolvedEducationPathway {
  const def = EDUCATION_PATHWAY_DEFS.find((pathway) => pathway.id === id)
  if (!def) return resolveEducationPathway(EDUCATION_PATHWAY_DEFS[0])
  return resolveEducationPathway(def)
}
