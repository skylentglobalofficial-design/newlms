import type { AuroraThemeId } from '../aurora-themes'

/**
 * The six primary Skylent destinations. Every entry points at a route that
 * exists. Copy is honest about what is open today.
 */
export type Destination = {
  id: string
  label: string
  /** The question a visitor is actually asking when they pick this door. */
  question: string
  /** What they get, stated plainly. */
  promise: string
  to: string
  themeId: AuroraThemeId
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'programmes',
    label: 'Skills & programmes',
    question: 'I want a career-focused programme',
    promise: 'Professional and certificate programmes. Only two have published lessons today.',
    to: '/programs',
    themeId: 'professional',
  },
  {
    id: 'courses',
    label: 'Courses',
    question: 'I want to start learning today',
    promise: 'Self-paced courses that open in the learning platform when lessons exist.',
    to: '/courses',
    themeId: 'certificate',
  },
  {
    id: 'education',
    label: 'Schooling & degrees',
    question: 'I am studying at school, college or university',
    promise: 'Academic pathways. Schooling and degrees are mapped — none are open to enrol yet.',
    to: '/education',
    themeId: 'schooling',
  },
  {
    id: 'exams',
    label: 'Competitive exams',
    question: 'I am preparing for an entrance exam',
    promise: 'JEE Advanced and CAT only. Both are coming soon — no mocks, ranks or live batches.',
    to: '/exams',
    themeId: 'jee',
  },
  {
    id: 'career',
    label: 'Career OS',
    question: 'I need a career workspace',
    promise: 'Profile, applications and interview practice. Not a placement promise. The job board is empty.',
    to: '/career-os',
    themeId: 'career',
  },
  {
    id: 'institutions',
    label: 'Institutions',
    question: 'I run a school, college or training institute',
    promise: 'An operating layer for programmes, learners and faculty — starting with a conversation.',
    to: '/institutions',
    themeId: 'institution',
  },
]

export type NavGroup = {
  label: string
  to: string
  tagline: string
  /** Path prefixes that should mark this group as the current location. */
  match: string[]
  items: { label: string; sub: string; to: string }[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Learn',
    to: '/skills',
    match: ['/skills', '/programs', '/courses', '/workshops', '/labs'],
    tagline: 'Skills, courses, labs and programmes',
    items: [
      { label: 'Skills', sub: 'Learn by domain', to: '/skills' },
      { label: 'Professional programmes', sub: 'Long-form, career-focused', to: '/programs?type=PROFESSIONAL' },
      { label: 'Courses', sub: 'Self-paced, open in the platform', to: '/courses' },
      { label: 'Virtual labs', sub: 'Experiments you can run', to: '/labs' },
      { label: 'Webinars', sub: 'None scheduled yet', to: '/workshops' },
    ],
  },
  {
    label: 'Education',
    to: '/education',
    match: ['/education', '/exams', '/junior', '/degrees', '/certificates'],
    tagline: 'Schooling, degrees and exams',
    items: [
      { label: 'Schooling', sub: 'Junior — grades 1–12', to: '/junior' },
      { label: 'Degrees', sub: 'B.Tech · BCA · MBA · MCA', to: '/degrees' },
      { label: 'Competitive exams', sub: 'JEE Advanced · CAT', to: '/exams' },
      { label: 'Certificates', sub: 'Completion, not accreditation', to: '/certificates' },
    ],
  },
  {
    label: 'Career',
    to: '/career-os',
    match: ['/career-os', '/career'],
    tagline: 'The workspace after a programme',
    items: [
      { label: 'Career OS', sub: 'A workspace, not a placement desk', to: '/career-os' },
      { label: 'Profile', sub: 'Skills, projects and resume', to: '/career-os/app/profile' },
      { label: 'Job board', sub: 'Empty until an employer posts', to: '/career-os/app/jobs' },
      { label: 'Interview practice', sub: 'Structured question sets', to: '/career-os/app/interviews' },
    ],
  },
  {
    label: 'Institutions',
    to: '/institutions',
    match: ['/institutions', '/os'],
    tagline: 'Skylent for schools and colleges',
    items: [
      { label: 'For institutions', sub: 'Partnership, not checkout', to: '/institutions' },
      { label: 'Skylent OS', sub: 'The operating layer', to: '/os' },
    ],
  },
]
