import type { AuroraThemeId } from '../aurora-themes'

/**
 * The six primary Skylent destinations. Every entry points at a route that
 * exists and renders real inventory — nothing here is aspirational.
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
    promise: 'Professional programmes and certificates with published curriculum, duration and fees.',
    to: '/programs',
    themeId: 'professional',
  },
  {
    id: 'courses',
    label: 'Courses',
    question: 'I want to start learning today',
    promise: 'Self-paced courses that open in the learning platform as soon as you enrol.',
    to: '/courses',
    themeId: 'certificate',
  },
  {
    id: 'education',
    label: 'Schooling & degrees',
    question: 'I am studying at school, college or university',
    promise: 'Academic pathways for schooling, undergraduate and postgraduate study.',
    to: '/education',
    themeId: 'schooling',
  },
  {
    id: 'exams',
    label: 'Competitive exams',
    question: 'I am preparing for an entrance exam',
    promise: 'Exam preparation built around syllabus, practice and mocks.',
    to: '/education#competitive-exams',
    themeId: 'jee',
  },
  {
    id: 'career',
    label: 'Career OS',
    question: 'I am looking for a job',
    promise: 'Profile, job board, applications and interview practice in one workspace.',
    to: '/career-os',
    themeId: 'career',
  },
  {
    id: 'institutions',
    label: 'For institutions',
    question: 'I run a school, college or training institute',
    promise: 'Dashboards for programmes, learners, faculty and progress.',
    to: '/institutions',
    themeId: 'institution',
  },
]

export type NavGroup = {
  label: string
  to: string
  tagline: string
  items: { label: string; sub: string; to: string }[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Learn',
    to: '/programs',
    tagline: 'Programmes, certificates and courses',
    items: [
      { label: 'Professional programmes', sub: 'Long-form, career-focused', to: '/programs?type=PROFESSIONAL' },
      { label: 'Certificate programmes', sub: 'Focused credentials', to: '/programs?type=CERTIFICATE' },
      { label: 'Courses', sub: 'Self-paced, open in the platform', to: '/courses' },
      { label: 'Webinars', sub: 'Single live sessions', to: '/workshops' },
    ],
  },
  {
    label: 'Education',
    to: '/education',
    tagline: 'Schooling through postgraduate and exams',
    items: [
      { label: 'Schooling', sub: 'Grades 1–12', to: '/education#schooling' },
      { label: 'Undergraduate', sub: 'Degree-aligned study', to: '/education#undergraduate' },
      { label: 'Postgraduate', sub: 'Advanced specialisation', to: '/education#postgraduate' },
      { label: 'Competitive exams', sub: 'JEE · CAT', to: '/education#competitive-exams' },
    ],
  },
  {
    label: 'Career',
    to: '/career-os',
    tagline: 'The workspace after a programme',
    items: [
      { label: 'Profile', sub: 'Skills, projects and resume', to: '/career-os' },
      { label: 'Job board', sub: 'Roles you can apply to', to: '/career-os' },
      { label: 'Interview practice', sub: 'Structured question sets', to: '/career-os' },
    ],
  },
  {
    label: 'Institutions',
    to: '/institutions',
    tagline: 'Skylent for schools and colleges',
    items: [
      { label: 'Schools', sub: 'Learning and teacher tools', to: '/institutions' },
      { label: 'Colleges & universities', sub: 'Programmes and student lifecycle', to: '/institutions' },
      { label: 'Training institutes', sub: 'Batches and certification', to: '/institutions' },
    ],
  },
]
