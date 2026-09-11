import { programs, type Program, type ProgramType } from './data'
import type { AuroraThemeId } from './aurora-themes'

export type WorldId = 'learn' | 'exams' | 'schooling' | 'university' | 'career' | 'institutions'

export type WorldDoor = {
  id: WorldId
  label: string
  href: string
  question: string
  promise: string
}

export const WORLD_DOORS: WorldDoor[] = [
  {
    id: 'learn',
    label: 'Learn',
    href: '/skills',
    question: 'Build a skill you can show.',
    promise: 'Programmes, projects, practice, evidence.',
  },
  {
    id: 'exams',
    label: 'Exams',
    href: '/exams',
    question: 'Prepare for the exam you are taking.',
    promise: 'Syllabus, practice, tests, review.',
  },
  {
    id: 'schooling',
    label: 'Schooling',
    href: '/junior',
    question: 'Choose your class, then learn.',
    promise: 'Grades, subjects, concepts, experiments.',
  },
  {
    id: 'university',
    label: 'University',
    href: '/degrees',
    question: 'Study a degree, not a slogan.',
    promise: 'Undergraduate and postgraduate studios.',
  },
  {
    id: 'career',
    label: 'Career',
    href: '/career',
    question: 'What can I do next?',
    promise: 'Jobs, interviews, evidence, CareerOS.',
  },
  {
    id: 'institutions',
    label: 'Institutions',
    href: '/institutions',
    question: 'Run learning as an operation.',
    promise: 'Programmes, delivery, Skylent OS.',
  },
]

export const WORLD_THEME: Record<WorldId, AuroraThemeId> = {
  learn: 'professional',
  exams: 'jee',
  schooling: 'schooling',
  university: 'undergraduate',
  career: 'career',
  institutions: 'institution',
}

export const WORLD_PROGRAM_TYPES: Record<WorldId, ProgramType[]> = {
  learn: ['PROFESSIONAL', 'CERTIFICATE', 'WEBINAR'],
  exams: ['EXAM_PREP'],
  schooling: ['SCHOOLING'],
  university: ['UNDERGRADUATE', 'POSTGRADUATE'],
  career: [],
  institutions: [],
}

export function worldForProgramType(type: ProgramType): WorldId {
  if (type === 'EXAM_PREP') return 'exams'
  if (type === 'SCHOOLING') return 'schooling'
  if (type === 'UNDERGRADUATE' || type === 'POSTGRADUATE') return 'university'
  return 'learn'
}

export function programsForWorld(world: WorldId): Program[] {
  const types = WORLD_PROGRAM_TYPES[world]
  if (!types.length) return []
  return programs.filter((program) => types.includes(program.programType))
}

export function programsByType(type: ProgramType): Program[] {
  return programs.filter((program) => program.programType === type)
}

export const PUBLISHED_EXAMS = [
  {
    id: 'jee',
    name: 'JEE',
    full: 'Joint Entrance Examination',
    target: 'Engineering admissions',
    slug: 'jee-advanced-prep',
    published: true as const,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
  },
  {
    id: 'cat',
    name: 'CAT',
    full: 'Common Admission Test',
    target: 'Management admissions',
    slug: 'cat-prep',
    published: true as const,
    subjects: ['VARC', 'DILR', 'Quantitative Aptitude'],
  },
] as const

export const UNPUBLISHED_EXAMS = [
  {
    id: 'neet',
    name: 'NEET',
    full: 'National Eligibility cum Entrance Test',
    target: 'Medical admissions',
    slug: null,
    published: false as const,
    subjects: ['Biology', 'Chemistry', 'Physics'],
  },
] as const

export const OTHER_EXAMS_UNPUBLISHED = ['CUET', 'CLAT', 'GMAT', 'GRE', 'UPSC'] as const

export const SCHOOL_BANDS = [
  {
    id: 'foundational',
    grades: [1, 2, 3, 4, 5],
    label: 'Classes 1–5',
    stage: 'Foundational',
    subjects: ['Language', 'Mathematics', 'Environmental studies', 'Art & making', 'Physical activity'],
    focus: 'Curiosity, concepts, and habits of attention — not a miniature college.',
  },
  {
    id: 'middle',
    grades: [6, 7, 8],
    label: 'Classes 6–8',
    stage: 'Middle school',
    subjects: ['Mathematics', 'Science', 'Languages', 'Social science', 'Computers'],
    focus: 'Experiments, explanations, and practice that make ideas usable.',
  },
  {
    id: 'secondary',
    grades: [9, 10],
    label: 'Classes 9–10',
    stage: 'Secondary',
    subjects: ['Mathematics', 'Science', 'Languages', 'Social science', 'Information technology'],
    focus: 'Board-aligned subjects, labs, and projects with clear progression.',
  },
  {
    id: 'senior',
    grades: [11, 12],
    label: 'Classes 11–12',
    stage: 'Senior secondary',
    subjects: ['Science stream', 'Commerce stream', 'Humanities stream', 'Labs & projects'],
    focus: 'Stream choice, deeper concepts, and honest exam or degree next steps.',
  },
] as const

export function schoolBandForGrade(grade: number) {
  return SCHOOL_BANDS.find((band) => (band.grades as readonly number[]).includes(grade)) ?? SCHOOL_BANDS[0]
}

export const UG_STUDIO = {
  id: 'undergraduate',
  label: 'Undergraduate',
  model: ['Degrees', 'Programmes', 'Departments', 'Curriculum', 'Projects', 'Labs', 'Internships', 'Skills', 'Progression'],
}

export const PG_STUDIO = {
  id: 'postgraduate',
  label: 'Postgraduate',
  model: ['Specialisation', 'Advanced coursework', 'Research', 'Dissertation / capstone', 'Advanced projects', 'Faculty', 'Academic & industry pathways'],
}

export const EDUCATION_HASH_REDIRECTS: Record<string, string> = {
  schooling: '/junior',
  undergraduate: '/degrees#undergraduate',
  postgraduate: '/degrees#postgraduate',
  'competitive-exams': '/exams',
  jee: '/exams#jee',
  neet: '/exams#neet',
  cat: '/exams#cat',
}

export function catalogTypeFromSearch(value: string | null): ProgramType | 'All' {
  const allowed: ProgramType[] = [
    'PROFESSIONAL',
    'CERTIFICATE',
    'WEBINAR',
    'EXAM_PREP',
    'SCHOOLING',
    'UNDERGRADUATE',
    'POSTGRADUATE',
  ]
  if (value && (allowed as string[]).includes(value)) return value as ProgramType
  return 'All'
}
