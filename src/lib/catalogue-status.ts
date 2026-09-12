import type { Program } from '../data'
import { courses } from '../data'

/**
 * Programme → LMS course links that actually exist in the database.
 * Mirrors the `links` array in prisma/seed.ts. A programme is only ever
 * presented as learnable when it appears here AND the course is published,
 * so the catalogue cannot advertise inventory the LMS cannot deliver.
 */
export const LIVE_PROGRAM_COURSE_LINKS: ReadonlyArray<{ programSlug: string; courseSlug: string; sortOrder: number }> = [
  { programSlug: 'data-analytics-pro', courseSlug: 'data-analytics', sortOrder: 0 },
  { programSlug: 'data-science-ai', courseSlug: 'data-analytics', sortOrder: 0 },
  { programSlug: 'data-science-ai', courseSlug: 'python-programming', sortOrder: 1 },
]

export function liveCourseSlugsForProgram(programSlug: string): string[] {
  return LIVE_PROGRAM_COURSE_LINKS
    .filter(link => link.programSlug === programSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(link => link.courseSlug)
    .filter(slug => courses.some(course => course.slug === slug))
}

/** The inverse link: programmes that actually deliver this course. */
export function liveProgramSlugsForCourse(courseSlug: string): string[] {
  return LIVE_PROGRAM_COURSE_LINKS
    .filter(link => link.courseSlug === courseSlug)
    .map(link => link.programSlug)
}

export type AvailabilityId =
  | 'available'
  | 'enrolling'
  | 'interest-open'
  | 'coming-soon'
  | 'not-available'

export type AvailabilityTone = 'positive' | 'active' | 'neutral' | 'muted'

export type Availability = {
  id: AvailabilityId
  /** Short label for badges and cards. */
  label: string
  tone: AvailabilityTone
  /** One honest sentence about what a learner can do right now. */
  explanation: string
  /** Label for the primary action on cards and the programme page. */
  ctaLabel: string
  /** True only when course content exists and can be opened today. */
  canStartLearning: boolean
}

const AVAILABILITY: Record<AvailabilityId, Omit<Availability, 'explanation'>> = {
  available: {
    id: 'available',
    label: 'Available now',
    tone: 'positive',
    ctaLabel: 'Start learning',
    canStartLearning: true,
  },
  enrolling: {
    id: 'enrolling',
    label: 'Enrolling',
    tone: 'active',
    ctaLabel: 'Apply now',
    canStartLearning: false,
  },
  'interest-open': {
    id: 'interest-open',
    label: 'Interest open',
    tone: 'neutral',
    ctaLabel: 'Register interest',
    canStartLearning: false,
  },
  'coming-soon': {
    id: 'coming-soon',
    label: 'Coming soon',
    tone: 'muted',
    ctaLabel: 'Register interest',
    canStartLearning: false,
  },
  'not-available': {
    id: 'not-available',
    label: 'Not yet available',
    tone: 'muted',
    ctaLabel: 'Register interest',
    canStartLearning: false,
  },
}

/**
 * Status for something the platform intends to offer but has not built yet.
 * Callers supply the sentence so the reason is specific rather than generic.
 */
export function notYetAvailable(explanation: string): Availability {
  return { ...AVAILABILITY['not-available'], explanation }
}

/** Every listed webinar is a planned topic. None have a date, host or seats. */
export function getWorkshopAvailability(): Availability {
  return {
    ...AVAILABILITY['interest-open'],
    explanation:
      'No session is on the calendar. Registering interest starts a conversation — it does not book a seat or take payment.',
  }
}

/**
 * Resolves what a learner can genuinely do with a programme today.
 * Derived from live LMS links rather than the editorial status alone, so a
 * programme with no lessons behind it can never render as fully operational.
 */
export function getProgrammeAvailability(program: Program): Availability {
  const liveCourses = liveCourseSlugsForProgram(program.slug)
  const status = program.enrollmentStatus ?? 'coming_soon'

  if (liveCourses.length > 0 && status === 'open') {
    return {
      ...AVAILABILITY.available,
      explanation: `${liveCourses.length} course${liveCourses.length === 1 ? '' : 's'} from this programme ${liveCourses.length === 1 ? 'is' : 'are'} open in the learning platform today.`,
    }
  }

  if (status === 'open') {
    return {
      ...AVAILABILITY['interest-open'],
      explanation: 'Applications are open. Course material for this programme is not in the learning platform yet.',
    }
  }

  if (status === 'waitlist') {
    return {
      ...AVAILABILITY.enrolling,
      label: 'Waitlist',
      ctaLabel: 'Join waitlist',
      explanation: 'This programme is full. Join the waitlist to be contacted when a place opens.',
    }
  }

  return {
    ...AVAILABILITY['coming-soon'],
    explanation: 'This programme is still being built. Nothing is scheduled and no material is available yet.',
  }
}

export function getCourseAvailability(courseSlug: string): Availability {
  const course = courses.find(c => c.slug === courseSlug)
  const hasLessons = !!course && course.modules.some(m => m.lessons.length > 0)
  if (hasLessons) {
    return {
      ...AVAILABILITY.available,
      explanation: 'Lessons are open in the learning platform.',
    }
  }
  return {
    ...AVAILABILITY['not-available'],
    explanation: 'No lessons have been published for this course yet.',
  }
}

/** Real lesson count from published modules — never the marketing number. */
export function publishedLessonCount(courseSlug: string): number {
  const course = courses.find(c => c.slug === courseSlug)
  if (!course) return 0
  return course.modules.reduce((total, module) => total + module.lessons.length, 0)
}

/** Real module count from published curriculum detail. */
export function publishedModuleCount(program: Program): number {
  return program.curriculumDetail?.length ?? 0
}
