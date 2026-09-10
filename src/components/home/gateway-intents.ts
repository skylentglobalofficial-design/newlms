export type GatewayIntentId = 'skills' | 'exams' | 'schooling' | 'university' | 'career'

export type GatewayIntent = {
  id: GatewayIntentId
  index: string
  label: string
  cta: string
  to: string
  accent: string
  stageLabel: string
}

export const GATEWAY_INTENTS: GatewayIntent[] = [
  {
    id: 'skills',
    index: '01',
    label: 'Build skills',
    cta: 'Explore Skills',
    to: '/skills',
    accent: '#6D58D9',
    stageLabel: 'Skills · Build',
  },
  {
    id: 'exams',
    index: '02',
    label: 'Prepare for exams',
    cta: 'Explore exam prep',
    to: '/education#competitive-exams',
    accent: '#3478D4',
    stageLabel: 'Exams · Practice',
  },
  {
    id: 'schooling',
    index: '03',
    label: 'Schooling',
    cta: 'Explore schooling',
    to: '/education#schooling',
    accent: '#168C83',
    stageLabel: 'Schooling · Explore',
  },
  {
    id: 'university',
    index: '04',
    label: 'University',
    cta: 'Explore university',
    to: '/education#undergraduate',
    accent: '#B87918',
    stageLabel: 'University · Apply',
  },
  {
    id: 'career',
    index: '05',
    label: 'Career',
    cta: 'Explore CareerOS',
    to: '/career-os',
    accent: '#2E73C8',
    stageLabel: 'Career · Evidence',
  },
]
