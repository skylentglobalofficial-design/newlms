export type GatewayIntentId = 'skills' | 'exams' | 'schooling' | 'university' | 'career'

export type GatewayIntent = {
  id: GatewayIntentId
  index: string
  label: string
  cta: string
  to: string
  accent: string
}

export const GATEWAY_INTENTS: GatewayIntent[] = [
  {
    id: 'skills',
    index: '01',
    label: 'Build skills',
    cta: 'Explore Skills',
    to: '/skills',
    accent: '#6D58D9',
  },
  {
    id: 'exams',
    index: '02',
    label: 'Prepare for exams',
    cta: 'Explore exam prep',
    to: '/exams',
    accent: '#3478D4',
  },
  {
    id: 'schooling',
    index: '03',
    label: 'Schooling',
    cta: 'Explore schooling',
    to: '/junior',
    accent: '#168C83',
  },
  {
    id: 'university',
    index: '04',
    label: 'University',
    cta: 'Explore university',
    to: '/degrees',
    accent: '#B87918',
  },
  {
    id: 'career',
    index: '05',
    label: 'Career',
    cta: 'Explore CareerOS',
    to: '/career-os',
    accent: '#2E73C8',
  },
]
