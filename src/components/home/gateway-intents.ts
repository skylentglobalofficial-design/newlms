export type GatewayIntentId = 'skills' | 'exams' | 'schooling' | 'university' | 'career'

export type GatewayRouteStatus = 'live'

export type GatewayIntent = {
  id: GatewayIntentId
  label: string
  question: string
  promise: string
  steps: [string, string, string]
  cta: string
  to: string
  routeStatus: GatewayRouteStatus
  routeNote: string
  accent: string
}

export const GATEWAY_INTENTS: GatewayIntent[] = [
  {
    id: 'skills',
    label: 'Build skills',
    question: 'What do you want to be able to do?',
    promise: 'Practice, build, and show capability — not just completion.',
    steps: ['Choose a skill', 'Build through practice', 'Show your proof'],
    cta: 'Explore Skills',
    to: '/skills',
    routeStatus: 'live',
    routeNote: 'Option A — dedicated /skills route',
    accent: '#6D58D9',
  },
  {
    id: 'exams',
    label: 'Prepare for exams',
    question: 'How ready do you want to be?',
    promise: 'Diagnose weak areas, practise with intent, and improve before exam day.',
    steps: ['Diagnose gaps', 'Targeted practice', 'Track improvement'],
    cta: 'Explore exam prep',
    to: '/education#competitive-exams',
    routeStatus: 'live',
    routeNote: 'Option A — /education#competitive-exams (no /exams route yet)',
    accent: '#3478D4',
  },
  {
    id: 'schooling',
    label: 'Schooling',
    question: 'What are you curious about?',
    promise: 'Explore concepts, try experiments, and build understanding step by step.',
    steps: ['Explore a concept', 'Try it yourself', 'Explain what you found'],
    cta: 'Explore schooling',
    to: '/education#schooling',
    routeStatus: 'live',
    routeNote: 'Option A — /education#schooling (no /junior route yet)',
    accent: '#168C83',
  },
  {
    id: 'university',
    label: 'University',
    question: 'What do you want to understand and apply?',
    promise: 'Degree-aligned study with projects, application, and academic depth.',
    steps: ['Study the core', 'Apply it', 'Build a project'],
    cta: 'Explore university',
    to: '/education#undergraduate',
    routeStatus: 'live',
    routeNote: 'Option A — /education#undergraduate (no /degrees route yet)',
    accent: '#B87918',
  },
  {
    id: 'career',
    label: 'Career',
    question: 'What can you show you have done?',
    promise: 'Collect evidence, shape your profile, and move toward opportunity.',
    steps: ['Gather proof', 'Shape your profile', 'Take the next step'],
    cta: 'Explore CareerOS',
    to: '/career-os',
    routeStatus: 'live',
    routeNote: 'Option A — dedicated /career-os route',
    accent: '#2E73C8',
  },
]
