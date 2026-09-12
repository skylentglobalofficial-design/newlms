import type { AuroraThemeId } from '../aurora-themes'

/**
 * The six primary Skylent destinations. Every entry points at a route that
 * exists. Copy is honest about what is open today.
 */
export type DestinationRole = 'learn' | 'study' | 'exam' | 'school' | 'career' | 'institution'

export type Destination = {
  id: string
  label: string
  /** The question a visitor is actually asking when they pick this door. */
  question: string
  /** What they get, stated plainly. */
  promise: string
  to: string
  themeId: AuroraThemeId
  role: DestinationRole
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'learn',
    label: 'Learn',
    question: 'I want to find something useful to learn',
    promise: 'Search programmes, courses and webinars. Status on every result is real.',
    to: '/skills',
    themeId: 'professional',
    role: 'learn',
  },
  {
    id: 'education',
    label: 'Education',
    question: 'I am looking at undergraduate or postgraduate study',
    promise: 'An academic map — not a university. Skylent does not award degrees.',
    to: '/education',
    themeId: 'undergraduate',
    role: 'study',
  },
  {
    id: 'exams',
    label: 'Exams',
    question: 'I am preparing for an entrance exam',
    promise: 'JEE Advanced and CAT only. Both are coming soon — no mocks, ranks or live batches.',
    to: '/exams',
    themeId: 'jee',
    role: 'exam',
  },
  {
    id: 'schooling',
    label: 'Schooling',
    question: 'I am a student, parent or school',
    promise: 'A junior path by class and subject. No grade-band lessons are published yet.',
    to: '/junior',
    themeId: 'schooling',
    role: 'school',
  },
  {
    id: 'career',
    label: 'Career',
    question: 'I need a career workspace',
    promise: 'Profile, applications and interview practice. Not a placement promise. The job board is empty.',
    to: '/career-os',
    themeId: 'career',
    role: 'career',
  },
  {
    id: 'institutions',
    label: 'Institutions',
    question: 'I run a school, college or training institute',
    promise: 'An operating layer for programmes, learners and faculty — starting with a conversation.',
    to: '/institutions',
    themeId: 'institution',
    role: 'institution',
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
    tagline: 'Find a programme, course or lab',
    items: [
      { label: 'Find something to learn', sub: 'Search and filter real inventory', to: '/skills' },
      { label: 'Programmes', sub: 'Long-form and certificate programmes', to: '/programs' },
      { label: 'Courses', sub: 'Self-paced, open in the platform', to: '/courses' },
      { label: 'Virtual labs', sub: 'Browser experiments, subject-matched', to: '/labs' },
      { label: 'Webinars', sub: 'None scheduled yet', to: '/workshops' },
    ],
  },
  {
    label: 'Education',
    to: '/education',
    match: ['/education', '/exams', '/junior', '/degrees', '/certificates'],
    tagline: 'Schooling, degrees and exams',
    items: [
      { label: 'Education overview', sub: 'Schooling, degrees and exams', to: '/education' },
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
      { label: 'Open the workspace', sub: 'Requires sign-in', to: '/login?returnTo=%2Fcareer-os%2Fapp' },
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
