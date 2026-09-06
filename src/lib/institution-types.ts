import { programs, type Program } from "../data"

export type InstitutionTypeId = "schools" | "colleges" | "universities"

export type InstitutionCapabilityId =
  | "education"
  | "skills"
  | "programs"
  | "assessments"
  | "learner-development"
  | "career-employability"
  | "analytics"
  | "institutional-workflows"

export type InstitutionCapabilityStatus = "available" | "inquiry" | "concept"

export type InstitutionCapabilityDef = {
  id: InstitutionCapabilityId
  label: string
  description: string
  status: InstitutionCapabilityStatus
}

export type InstitutionTypeDef = {
  id: InstitutionTypeId
  label: string
  sub: string
  tagline: string
  problem: string
  value: string
  description: string
  workflow: string[]
  programSlugs: string[]
  capabilities: InstitutionCapabilityDef[]
}

export type InstitutionProgramItem = {
  slug: string
  title: string
  href: string
  typeLabel: string
  duration: string | null
  format: string | null
}

export type InstitutionTypeCta = {
  label: string
  href: string
}

export type ResolvedInstitutionType = InstitutionTypeDef & {
  programItems: InstitutionProgramItem[]
  availableCapabilities: InstitutionCapabilityDef[]
  inquiryCapabilities: InstitutionCapabilityDef[]
  conceptCapabilities: InstitutionCapabilityDef[]
  cta: InstitutionTypeCta
}

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  PROFESSIONAL: "Professional Program",
  CERTIFICATE: "Certificate Program",
  EXAM_PREP: "Exam preparation",
}

const DEPLOYABLE_PROGRAM_TYPES = new Set(["PROFESSIONAL", "CERTIFICATE", "EXAM_PREP"])

export const INSTITUTION_TYPE_DEFS: InstitutionTypeDef[] = [
  {
    id: "schools",
    label: "Schools",
    sub: "K–12 · Secondary · Senior Secondary",
    tagline: "Structured learning with visibility for teachers, students, and parents.",
    problem: "Academic progress is hard for parents and teachers to see in one place.",
    value: "Students, teachers, classes, assessments, parent visibility, and progress in a schooling workflow.",
    description:
      "Introduce structured learning, activities, and career awareness before higher education — delivered through Skylent OS institutional workflows, not a generic corporate LMS.",
    workflow: ["Students", "Teachers", "Classes", "Assessments", "Parent view", "Progress"],
    programSlugs: [],
    capabilities: [
      {
        id: "education",
        label: "Education",
        description: "Schooling pathways, grade-band curriculum, and lesson delivery aligned to academic stages.",
        status: "inquiry",
      },
      {
        id: "skills",
        label: "Skills",
        description: "Foundational and enrichment skills layered on the school calendar.",
        status: "inquiry",
      },
      {
        id: "programs",
        label: "Programs",
        description: "Co-designed schooling programs deployed on Skylent OS.",
        status: "inquiry",
      },
      {
        id: "assessments",
        label: "Assessments",
        description: "Activities, chapter tests, and progress checks within the schooling workflow.",
        status: "inquiry",
      },
      {
        id: "learner-development",
        label: "Learner development",
        description: "Lesson rhythm, activities, and visible progress across grade bands.",
        status: "concept",
      },
      {
        id: "career-employability",
        label: "Career / employability",
        description: "Career awareness and pathway exploration before higher education.",
        status: "concept",
      },
      {
        id: "analytics",
        label: "Analytics",
        description: "Institution-level progress and assessment visibility.",
        status: "inquiry",
      },
      {
        id: "institutional-workflows",
        label: "Institutional workflows",
        description: "Programs, batches, learners, faculty, curriculum, and assessments on Skylent OS.",
        status: "available",
      },
    ],
  },
  {
    id: "colleges",
    label: "Colleges",
    sub: "Degree colleges · Autonomous institutions",
    tagline: "Degree study paired with skills, projects, and career readiness.",
    problem: "Degrees finish. Employability does not arrive automatically.",
    value: "Programs, departments, LMS, skills, projects, and placement readiness alongside the academic calendar.",
    description:
      "Pair undergraduate study with professional programs, projects, and a path into Career OS for qualifying students — semester-aligned, not bolted on.",
    workflow: ["Programs", "Departments", "Students", "LMS", "Projects", "Career readiness"],
    programSlugs: ["full-stack", "data-analytics-pro", "sql-certificate"],
    capabilities: [
      {
        id: "education",
        label: "Education",
        description: "Degree-aligned pathways and undergraduate learning models beside the academic calendar.",
        status: "inquiry",
      },
      {
        id: "skills",
        label: "Skills",
        description: "Professional and certificate skills tracks students can take alongside their degree.",
        status: "available",
      },
      {
        id: "programs",
        label: "Programs",
        description: "Deploy catalog professional and certificate programs to college cohorts.",
        status: "available",
      },
      {
        id: "assessments",
        label: "Assessments",
        description: "Module quizzes, program assessments, and progress checks in the LMS.",
        status: "available",
      },
      {
        id: "learner-development",
        label: "Learner development",
        description: "Structured lessons, projects, and portfolio work for enrolled learners.",
        status: "available",
      },
      {
        id: "career-employability",
        label: "Career / employability",
        description: "Career OS for qualifying professional program completers — profile, jobs, applications.",
        status: "available",
      },
      {
        id: "analytics",
        label: "Analytics",
        description: "Learner progress, batch performance, and program completion visibility.",
        status: "available",
      },
      {
        id: "institutional-workflows",
        label: "Institutional workflows",
        description: "Programs, offerings, batches, learners, faculty, curriculum, and assessments.",
        status: "available",
      },
    ],
  },
  {
    id: "universities",
    label: "Universities",
    sub: "Multi-program · Research institutions",
    tagline: "Scale across departments without fragmenting the student lifecycle.",
    problem: "Scale across departments without fragmenting student lifecycle and outcomes.",
    value: "Multi-program curriculum, assessments, student lifecycle, and outcomes as shared infrastructure.",
    description:
      "Run Skylent OS as institutional infrastructure — curriculum enrichment, LMS, career readiness, and postgraduate-aligned professional programs.",
    workflow: ["Multi-program", "Departments", "Curriculum", "Assessments", "Lifecycle", "Career readiness"],
    programSlugs: ["data-science-ai", "product-management", "generative-ai-program"],
    capabilities: [
      {
        id: "education",
        label: "Education",
        description: "Postgraduate pathways and multi-department curriculum models via partnership.",
        status: "inquiry",
      },
      {
        id: "skills",
        label: "Skills",
        description: "Advanced skills and specialisation tracks for graduate learners.",
        status: "available",
      },
      {
        id: "programs",
        label: "Programs",
        description: "Professional programs deployable across departments and cohorts.",
        status: "available",
      },
      {
        id: "assessments",
        label: "Assessments",
        description: "Program evaluations, module tests, and institutional assessment workflows.",
        status: "available",
      },
      {
        id: "learner-development",
        label: "Learner development",
        description: "Advanced modules, projects, and portfolio evidence at graduate scale.",
        status: "available",
      },
      {
        id: "career-employability",
        label: "Career / employability",
        description: "Career OS career workspace for qualifying program graduates.",
        status: "available",
      },
      {
        id: "analytics",
        label: "Analytics",
        description: "Cross-program progress, batch analytics, and outcome visibility.",
        status: "available",
      },
      {
        id: "institutional-workflows",
        label: "Institutional workflows",
        description: "Full Skylent OS operations — programs through progress tracking.",
        status: "available",
      },
    ],
  },
]

function bySlug<T extends { slug: string }>(items: T[], slugs: string[]): T[] {
  const map = new Map(items.map((item) => [item.slug, item]))
  return slugs.map((slug) => map.get(slug)).filter((item): item is T => Boolean(item))
}

function buildProgramItems(slugs: string[]): InstitutionProgramItem[] {
  const resolved = bySlug(
    programs.filter((program) => DEPLOYABLE_PROGRAM_TYPES.has(program.programType)),
    slugs,
  )
  return resolved.map((program: Program) => ({
    slug: program.slug,
    title: program.name,
    href: `/programs/${program.slug}`,
    typeLabel: PROGRAM_TYPE_LABELS[program.programType] ?? "Program",
    duration: program.duration ?? null,
    format: program.format ?? null,
  }))
}

function groupCapabilities(capabilities: InstitutionCapabilityDef[]) {
  return {
    availableCapabilities: capabilities.filter((cap) => cap.status === "available"),
    inquiryCapabilities: capabilities.filter((cap) => cap.status === "inquiry"),
    conceptCapabilities: capabilities.filter((cap) => cap.status === "concept"),
  }
}

export function resolveInstitutionType(def: InstitutionTypeDef): ResolvedInstitutionType {
  const programItems = buildProgramItems(def.programSlugs)
  const groups = groupCapabilities(def.capabilities)

  return {
    ...def,
    programItems,
    ...groups,
    cta: { label: "Discuss partnership", href: "/contact" },
  }
}

export function getInstitutionTypes(): ResolvedInstitutionType[] {
  return INSTITUTION_TYPE_DEFS.map(resolveInstitutionType)
}

export function getDefaultInstitutionTypeId(): InstitutionTypeId {
  return "colleges"
}

export function getInstitutionTypeById(id: InstitutionTypeId): ResolvedInstitutionType {
  const def = INSTITUTION_TYPE_DEFS.find((type) => type.id === id)
  if (!def) return resolveInstitutionType(INSTITUTION_TYPE_DEFS[0])
  return resolveInstitutionType(def)
}

export const INSTITUTION_CAPABILITY_STATUS_LABELS: Record<InstitutionCapabilityStatus, string> = {
  available: "Available",
  inquiry: "Partnership inquiry",
  concept: "Co-design area",
}
