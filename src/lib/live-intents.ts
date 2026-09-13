import { courses, programs } from "../data"

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

export function liveMatchesForIntent(id: LearnIntentId): LiveMatch[] {
  const courseHits: LiveMatch[] = courses
    .filter((course) => courseFitsIntent(id, courseHaystack(course)))
    .map((course) => {
      const capabilities = uniqueStatements(course.outcomes.length ? course.outcomes : [course.desc])
      return {
        kind: "course" as const,
        slug: course.slug,
        title: course.title,
        to: `/courses/${course.slug}`,
        note: `${course.level} · ${course.duration}`,
        duration: course.duration,
        availability: "Available",
        capability: capabilities[0] ?? course.desc,
        capabilities,
        actionLabel: "Start",
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
      }
    })

  const seen = new Set<string>()
  const merged: LiveMatch[] = []
  for (const item of [...programHits, ...courseHits]) {
    const key = `${item.kind}:${item.slug}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }
  return merged.slice(0, 4)
}

export function capabilitiesForIntent(id: LearnIntentId): string[] {
  const matches = liveMatchesForIntent(id)
  const seen = new Set<string>()
  const out: string[] = []
  const rounds = Math.max(0, ...matches.map((match) => match.capabilities.length))
  for (let round = 0; round < rounds && out.length < 4; round++) {
    for (const match of matches) {
      const statement = match.capabilities[round]
      if (!statement) continue
      const key = statement.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(statement)
      if (out.length >= 4) return out
    }
  }
  return out
}
