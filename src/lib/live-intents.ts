import { courses, programs } from "../data"
import { AUTHORED_COURSE_SLUG, isAuthoredCourse } from "./authored-courses"

export { AUTHORED_COURSE_SLUG, isAuthoredCourse }
export type LearnIntentId = "data" | "software" | "ai" | "product"

export type LearnIntent = {
  id: LearnIntentId
  label: string
  question: string
}

export const LEARN_INTENTS: LearnIntent[] = [
  { id: "data", label: "Work with data", question: "Analyse, model, and present information." },
  { id: "software", label: "Build software", question: "Ship interfaces, APIs, and systems." },
  { id: "ai", label: "Work with AI", question: "Apply models to a real task." },
  { id: "product", label: "Shape products", question: "Decide what to build and why." },
]

export function isLearnIntentId(value: string | null | undefined): value is LearnIntentId {
  return LEARN_INTENTS.some((item) => item.id === value)
}

const COURSE_MATCH: Record<LearnIntentId, RegExp> = {
  data: /data|sql|analytics|power.?bi/i,
  software: /full.?stack|\bweb\b/i,
  ai: /ai|generative/i,
  product: /product/i,
}

const PROGRAM_MATCH: Record<LearnIntentId, RegExp> = {
  data: /data|analytics/i,
  software: /full.?stack/i,
  ai: /ai|generative/i,
  product: /product/i,
}

export type LiveMatchDepth = "authored" | "listing"

export type LiveMatch = {
  kind: "course" | "programme"
  slug: string
  title: string
  to: string
  note: string
  duration: string
  availability: string
  capability: string
  capabilities: string[]
  actionLabel: string
  depth: LiveMatchDepth
  summary: string
}

function courseHaystack(course: { title: string; category: string; slug: string }) {
  return `${course.title} ${course.category} ${course.slug}`
}

function courseFitsIntent(id: LearnIntentId, haystack: string): boolean {
  if (!COURSE_MATCH[id].test(haystack)) return false
  // Data-oriented Python/SQL courses must not appear under "Build software".
  if (id === "software" && COURSE_MATCH.data.test(haystack)) return false
  return true
}

function uniqueStatements(values: Array<string | undefined>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const text = value?.trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
  }
  return out
}

function matchRank(item: LiveMatch): number {
  if (item.kind === "course" && item.depth === "authored") return 0
  if (item.kind === "course") return 1
  return 2
}

export function liveMatchesForIntent(id: LearnIntentId): LiveMatch[] {
  const courseHits: LiveMatch[] = courses
    .filter((course) => courseFitsIntent(id, courseHaystack(course)))
    .map((course) => {
      const authored = isAuthoredCourse(course.slug)
      const capabilities = uniqueStatements(course.outcomes.length ? course.outcomes : [course.desc])
      return {
        kind: "course" as const,
        slug: course.slug,
        title: course.title,
        to: `/courses/${course.slug}`,
        note: authored ? "Ready to start" : "Catalogue listing",
        duration: course.duration,
        availability: authored ? "Ready to start" : "Catalogue listing",
        capability: capabilities[0] ?? course.desc,
        capabilities,
        actionLabel: authored ? "Start with this course" : "View course",
        depth: authored ? "authored" : "listing",
        summary: course.desc,
      }
    })

  const programHits: LiveMatch[] = programs
    .filter(
      (program) =>
        program.enrollmentStatus === "open" &&
        PROGRAM_MATCH[id].test(`${program.name} ${program.slug}`),
    )
    .map((program) => {
      const capabilities = uniqueStatements(
        program.whatYouWillLearn?.length ? program.whatYouWillLearn : [program.desc],
      )
      return {
        kind: "programme" as const,
        slug: program.slug,
        title: program.name,
        to: `/programs/${program.slug}`,
        note: "Open programme",
        duration: program.duration,
        availability: "Open",
        capability: capabilities[0] ?? program.desc,
        capabilities,
        actionLabel: "View programme",
        depth: "listing" as const,
        summary: program.desc,
      }
    })

  const seen = new Set<string>()
  const merged: LiveMatch[] = []
  for (const item of [...courseHits, ...programHits]) {
    const key = `${item.kind}:${item.slug}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }
  merged.sort((a, b) => matchRank(a) - matchRank(b))
  return merged.slice(0, 4)
}

function collectCapabilities(matches: LiveMatch[], limit = 4): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const rounds = Math.max(0, ...matches.map((match) => match.capabilities.length))
  for (let round = 0; round < rounds && out.length < limit; round++) {
    for (const match of matches) {
      const statement = match.capabilities[round]
      if (!statement) continue
      const key = statement.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(statement)
      if (out.length >= limit) return out
    }
  }
  return out
}

export function capabilitiesForIntent(id: LearnIntentId): string[] {
  const matches = liveMatchesForIntent(id)
  const authored = matches.filter((match) => match.depth === "authored")
  if (authored.length) return collectCapabilities(authored)
  const coursesOnly = matches.filter((match) => match.kind === "course")
  if (coursesOnly.length) return collectCapabilities(coursesOnly)
  return collectCapabilities(matches)
}
