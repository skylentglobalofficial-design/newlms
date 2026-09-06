import { getDomainAccent } from "../aurora-themes"

export type EcosystemPillarId = "education" | "skills" | "career" | "institutions"

export type EcosystemPillarDef = {
  id: EcosystemPillarId
  label: string
  sub: string
  tagline: string
  description: string
  whatYouCanDo: string[]
  relevantFor: string[]
  to: string
  themeId: "schooling" | "professional" | "career" | "institution"
}

export type ResolvedEcosystemPillar = EcosystemPillarDef & {
  theme: ReturnType<typeof getDomainAccent>
}

export const ECOSYSTEM_PILLAR_DEFS: EcosystemPillarDef[] = [
  {
    id: "education",
    label: "Education",
    sub: "School · UG · PG · Exams",
    tagline: "Academic pathways from schooling through entrance exams.",
    description:
      "Schooling, undergraduate, postgraduate, and competitive exam preparation — each with its own curriculum model, not one generic course catalog.",
    whatYouCanDo: [
      "Explore education pathways by academic stage",
      "Browse exam preparation programs where available in the catalog",
      "Understand how schooling connects to skills and career next steps",
    ],
    relevantFor: ["School students and parents", "College and university learners", "Entrance exam aspirants"],
    to: "/education",
    themeId: "schooling",
  },
  {
    id: "skills",
    label: "Skills",
    sub: "Webinars · Certificates · Professional Programs",
    tagline: "Credentialed upskilling with projects and practical learning.",
    description:
      "Webinars, certificate programs, and professional programs — organized by skill domain with real catalog offerings, projects, and credentials.",
    whatYouCanDo: [
      "Browse skill domains and catalog programs",
      "Compare certificate and professional program depth",
      "See which programs include Career OS access",
    ],
    relevantFor: ["Upskilling learners", "Working professionals", "Career switchers"],
    to: "/skills",
    themeId: "professional",
  },
  {
    id: "career",
    label: "Career OS",
    sub: "Profile · Jobs · Applications · Support",
    tagline: "A career workspace activated through qualifying programs.",
    description:
      "Profile, skills proof, opportunities, applications, interviews, and support — one workflow for learners who complete eligible professional programs.",
    whatYouCanDo: [
      "Preview the Career OS workflow before enrolling",
      "Open the workspace after program qualification",
      "Track applications and interview preparation in one place",
    ],
    relevantFor: ["Professional program graduates", "Job seekers building proof", "Learners ready to apply"],
    to: "/career-os",
    themeId: "career",
  },
  {
    id: "institutions",
    label: "Institutions",
    sub: "Schools · Colleges · Universities",
    tagline: "B2B delivery for education and skills at institutional scale.",
    description:
      "Skylent OS for schools, colleges, and universities — programs, learners, faculty, curriculum, assessments, and career readiness as deployable institutional workflows.",
    whatYouCanDo: [
      "See capabilities by institution type",
      "Review deployable programs for college and university partners",
      "Start a partnership inquiry for Skylent OS deployment",
    ],
    relevantFor: ["School administrators", "College and university leaders", "Institutional program heads"],
    to: "/institutions",
    themeId: "institution",
  },
]

export const ECOSYSTEM_FLOW_LABELS = ECOSYSTEM_PILLAR_DEFS.map((pillar) => pillar.label)

export function resolveEcosystemPillar(def: EcosystemPillarDef): ResolvedEcosystemPillar {
  return {
    ...def,
    theme: getDomainAccent(def.themeId),
  }
}

export function getEcosystemPillars(): ResolvedEcosystemPillar[] {
  return ECOSYSTEM_PILLAR_DEFS.map(resolveEcosystemPillar)
}

export function getDefaultEcosystemPillarId(): EcosystemPillarId {
  return "education"
}

export function getEcosystemPillarById(id: EcosystemPillarId): ResolvedEcosystemPillar {
  const def = ECOSYSTEM_PILLAR_DEFS.find((pillar) => pillar.id === id)
  if (!def) return resolveEcosystemPillar(ECOSYSTEM_PILLAR_DEFS[0])
  return resolveEcosystemPillar(def)
}
