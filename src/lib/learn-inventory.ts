import { courses, programs, workshops } from '../data'
import {
  getCourseAvailability,
  getProgrammeAvailability,
  getWorkshopAvailability,
  type Availability,
  type AvailabilityId,
} from './catalogue-status'
import { getSkillDomains, type SkillCatalogItemKind, type SkillDomainId } from './skills-domains'
import { labsForCourse, labsForProgram } from './virtual-labs'

export type LearnKind = SkillCatalogItemKind
export type LearnAvailabilityGroup = 'available' | 'interest' | 'coming-soon'
export type LearnDurationBucket = 'under-8' | '8-16' | '16-plus' | 'unspecified'
export type LearnSort = 'recommended' | 'title' | 'duration'

export type LearnInventoryItem = {
  id: string
  kind: LearnKind
  kindLabel: string
  slug: string
  title: string
  href: string
  ctaLabel: string
  domains: { id: SkillDomainId; label: string }[]
  description: string
  forWhom: string | null
  outcomes: string[]
  level: string | null
  duration: string | null
  durationWeeks: number | null
  durationBucket: LearnDurationBucket
  format: string | null
  availability: Availability
  availabilityGroup: LearnAvailabilityGroup
  labCount: number
}

const KIND_LABEL: Record<LearnKind, string> = {
  program: 'Programme',
  course: 'Course',
  workshop: 'Webinar',
}

const KIND_CTA: Record<LearnKind, string> = {
  program: 'View programme',
  course: 'View course',
  workshop: 'View webinar',
}

export function availabilityGroup(id: AvailabilityId): LearnAvailabilityGroup {
  if (id === 'available') return 'available'
  if (id === 'interest-open' || id === 'enrolling') return 'interest'
  return 'coming-soon'
}

export function parseDurationWeeks(duration: string | null | undefined): number | null {
  if (!duration) return null
  const weeks = duration.match(/(\d+(?:\.\d+)?)\s*weeks?/i)
  if (weeks) return Number(weeks[1])
  const months = duration.match(/(\d+(?:\.\d+)?)\s*months?/i)
  if (months) return Number(months[1]) * 4
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*hours?/i)
  if (hours) return Number(hours[1]) / 8
  return null
}

export function durationBucket(duration: string | null | undefined): LearnDurationBucket {
  const weeks = parseDurationWeeks(duration)
  if (weeks == null) return 'unspecified'
  if (weeks < 8) return 'under-8'
  if (weeks <= 16) return '8-16'
  return '16-plus'
}

function buildItem(kind: LearnKind, slug: string, domain: { id: SkillDomainId; label: string }): LearnInventoryItem | null {
  if (kind === 'program') {
    const program = programs.find(entry => entry.slug === slug)
    if (!program) return null
    const availability = getProgrammeAvailability(program)
    return {
      id: `program:${slug}`,
      kind,
      kindLabel: KIND_LABEL[kind],
      slug,
      title: program.name,
      href: `/programs/${slug}`,
      ctaLabel: KIND_CTA[kind],
      domains: [domain],
      description: program.desc,
      forWhom: program.whoIsItFor?.[0] ?? null,
      outcomes: (program.whatYouWillLearn ?? []).slice(0, 3),
      level: program.level ?? null,
      duration: program.duration ?? null,
      durationWeeks: parseDurationWeeks(program.duration),
      durationBucket: durationBucket(program.duration),
      format: program.format ?? null,
      availability,
      availabilityGroup: availabilityGroup(availability.id),
      labCount: labsForProgram(slug).length,
    }
  }

  if (kind === 'course') {
    const course = courses.find(entry => entry.slug === slug)
    if (!course) return null
    const availability = getCourseAvailability(slug)
    return {
      id: `course:${slug}`,
      kind,
      kindLabel: KIND_LABEL[kind],
      slug,
      title: course.title,
      href: `/courses/${slug}`,
      ctaLabel: KIND_CTA[kind],
      domains: [domain],
      description: course.desc,
      forWhom: course.forWhom?.[0] ?? null,
      outcomes: (course.outcomes ?? []).slice(0, 3),
      level: course.level ?? null,
      duration: course.duration ?? null,
      durationWeeks: parseDurationWeeks(course.duration),
      durationBucket: durationBucket(course.duration),
      format: course.mode ?? null,
      availability,
      availabilityGroup: availabilityGroup(availability.id),
      labCount: labsForCourse(slug).length,
    }
  }

  const workshop = workshops.find(entry => entry.slug === slug)
  if (!workshop) return null
  const availability = getWorkshopAvailability()
  return {
    id: `workshop:${slug}`,
    kind,
    kindLabel: KIND_LABEL[kind],
    slug,
    title: workshop.title,
    href: `/workshops/${slug}`,
    ctaLabel: KIND_CTA[kind],
    domains: [domain],
    description: workshop.desc,
    forWhom: null,
    outcomes: [],
    level: null,
    duration: workshop.duration ?? null,
    durationWeeks: parseDurationWeeks(workshop.duration),
    durationBucket: durationBucket(workshop.duration),
    format: workshop.mode ?? null,
    availability,
    availabilityGroup: availabilityGroup(availability.id),
    labCount: 0,
  }
}

export function getLearnInventory(): LearnInventoryItem[] {
  const map = new Map<string, LearnInventoryItem>()

  for (const domain of getSkillDomains()) {
    for (const catalogItem of domain.catalogItems) {
      const existing = map.get(`${catalogItem.kind}:${catalogItem.slug}`)
      if (existing) {
        if (!existing.domains.some(entry => entry.id === domain.id)) {
          existing.domains.push({ id: domain.id, label: domain.label })
        }
        continue
      }
      const item = buildItem(catalogItem.kind, catalogItem.slug, { id: domain.id, label: domain.label })
      if (item) map.set(item.id, item)
    }
  }

  return [...map.values()]
}

export function uniqueLearnValues(
  items: LearnInventoryItem[],
  key: 'level' | 'format',
): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const value = item[key]?.trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result.sort((a, b) => a.localeCompare(b))
}

function kindRank(kind: LearnKind): number {
  if (kind === 'program') return 0
  if (kind === 'course') return 1
  return 2
}

export function sortLearnInventory(items: LearnInventoryItem[], sort: LearnSort): LearnInventoryItem[] {
  const copy = [...items]
  copy.sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title)
    if (sort === 'duration') {
      const aWeeks = a.durationWeeks ?? Number.POSITIVE_INFINITY
      const bWeeks = b.durationWeeks ?? Number.POSITIVE_INFINITY
      if (aWeeks !== bWeeks) return aWeeks - bWeeks
      return a.title.localeCompare(b.title)
    }
    if (Number(b.availability.canStartLearning) !== Number(a.availability.canStartLearning)) {
      return Number(b.availability.canStartLearning) - Number(a.availability.canStartLearning)
    }
    const groupRank = { available: 0, interest: 1, 'coming-soon': 2 } as const
    if (groupRank[a.availabilityGroup] !== groupRank[b.availabilityGroup]) {
      return groupRank[a.availabilityGroup] - groupRank[b.availabilityGroup]
    }
    if (kindRank(a.kind) !== kindRank(b.kind)) return kindRank(a.kind) - kindRank(b.kind)
    return a.title.localeCompare(b.title)
  })
  return copy
}

export function filterLearnInventory(
  items: LearnInventoryItem[],
  filters: {
    query: string
    domain: string
    kind: string
    level: string
    format: string
    duration: string
    availability: string
  },
): LearnInventoryItem[] {
  const needle = filters.query.trim().toLowerCase()
  return items.filter(item => {
    if (filters.domain !== 'all' && !item.domains.some(domain => domain.id === filters.domain)) return false
    if (filters.kind !== 'all' && item.kind !== filters.kind) return false
    if (filters.level !== 'all' && item.level !== filters.level) return false
    if (filters.format !== 'all' && item.format !== filters.format) return false
    if (filters.duration !== 'all' && item.durationBucket !== filters.duration) return false
    if (filters.availability !== 'all' && item.availabilityGroup !== filters.availability) return false
    if (!needle) return true
    const haystack = [
      item.title,
      item.description,
      item.forWhom,
      item.kindLabel,
      item.availability.label,
      ...item.domains.map(domain => domain.label),
      ...item.outcomes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}

export function getEmptyLearnDomains() {
  return getSkillDomains().filter(domain => !domain.hasCatalog)
}
