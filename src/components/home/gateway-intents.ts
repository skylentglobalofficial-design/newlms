export type GatewayIntentId = 'learn' | 'exams' | 'schooling' | 'university' | 'career' | 'institutions'

export type GatewayIntent = {
  id: GatewayIntentId
  index: string
  label: string
  cta: string
  to: string
  accent: string
}

export const GATEWAY_INTENTS: GatewayIntent[] = [
  { id: 'learn', index: '01', label: 'Learn', cta: 'Open Learn', to: '/skills', accent: '#245A43' },
  { id: 'exams', index: '02', label: 'Exams', cta: 'Open Exams', to: '/exams', accent: '#8A4B12' },
  { id: 'schooling', index: '03', label: 'Schooling', cta: 'Open Schooling', to: '/junior', accent: '#1F5F68' },
  { id: 'university', index: '04', label: 'University', cta: 'Open University', to: '/degrees', accent: '#3A4570' },
  { id: 'career', index: '05', label: 'Career', cta: 'Open Career', to: '/career', accent: '#1E4A6E' },
  { id: 'institutions', index: '06', label: 'Institutions', cta: 'Open Institutions', to: '/institutions', accent: '#2F4740' },
]
