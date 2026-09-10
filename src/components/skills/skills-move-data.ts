/**
 * Skills Scroll 6 — move / next-step preview.
 * Completes LEARN → PRACTICE → BUILD → PROVE → MOVE.
 * Same domain/project chain as Scrolls 4–5. Not CareerOS.
 */

export type SkillsMoveDomainId = 'data-ai' | 'coding' | 'business'
export type SkillsMoveDirectionId = 'deepen' | 'harder' | 'goal'

export type SkillsMoveDirection = {
  id: SkillsMoveDirectionId
  label: string
  question: string
  title: string
  body: string
  /** Optional catalogue-backed harder problem name */
  relatedWork?: string
  cta: string
  to: string
}

export type SkillsMoveItem = {
  id: SkillsMoveDomainId
  index: string
  label: string
  capability: string
  projectTitle: string
  evidenceSummary: string
  shows: string
  catalogueKind: 'Programme'
  catalogueTitle: string
  source: string
  directions: SkillsMoveDirection[]
}

export const SKILLS_MOVE_DIRECTIONS: SkillsMoveDirectionId[] = [
  'deepen',
  'harder',
  'goal',
]

export const SKILLS_MOVE_ITEMS: SkillsMoveItem[] = [
  {
    id: 'data-ai',
    index: '01',
    label: 'Data & AI',
    capability: 'Analyse data',
    projectTitle: 'Customer Segmentation Analysis',
    evidenceSummary:
      'Quiet-cohort segmentation with a retention-first cut and a concrete win-back recommendation.',
    shows:
      'You can turn a metric shift into a segmented finding and a next action — with the reasoning visible.',
    catalogueKind: 'Programme',
    catalogueTitle: 'Data Analytics with Gen AI',
    source: 'program:data-analytics-pro · projectsDetail:Customer Segmentation Analysis',
    directions: [
      {
        id: 'deepen',
        label: 'Go deeper',
        question: 'Strengthen the same capability',
        title: 'Add the next layer of analysis craft',
        body:
          'Strengthen SQL, storytelling, and BI workflows inside the same programme — so quieter cohorts become clearer decisions.',
        cta: 'Explore the programme',
        to: '/programs/data-analytics-pro',
      },
      {
        id: 'harder',
        label: 'Take on harder work',
        question: 'Apply it to a tougher problem',
        title: 'Move from a memo to a fuller analytics build',
        body:
          'Apply the same judgement to a broader deliverable — for example a sales performance dashboard from raw data through measures and drill-through.',
        relatedWork: 'Sales Performance Dashboard',
        cta: 'Explore the programme',
        to: '/programs/data-analytics-pro',
      },
      {
        id: 'goal',
        label: 'Move toward a goal',
        question: 'Carry the evidence forward',
        title: 'Use the work toward your next learning goal',
        body:
          'Keep the analysis as inspectable evidence of capability, then continue the Data Analytics programme toward the next project and review cycle.',
        cta: 'Explore the programme',
        to: '/programs/data-analytics-pro',
      },
    ],
  },
  {
    id: 'coding',
    index: '02',
    label: 'Coding',
    capability: 'Build full-stack applications',
    projectTitle: 'E-Commerce Platform · order management',
    evidenceSummary:
      'Auth-scoped orders list with query-level ownership and an explicit acceptance check.',
    shows:
      'You can ship an API + UI feature with authorization treated as part of the work — not a later patch.',
    catalogueKind: 'Programme',
    catalogueTitle: 'Full Stack Development',
    source: 'program:full-stack · projectsDetail:E-Commerce Platform + REST API Service',
    directions: [
      {
        id: 'deepen',
        label: 'Go deeper',
        question: 'Strengthen the same capability',
        title: 'Harden full-stack fundamentals',
        body:
          'Strengthen React, Node, PostgreSQL, and deployment practice inside the same programme — so ownership and auth stay first-class.',
        cta: 'Explore the programme',
        to: '/programs/full-stack',
      },
      {
        id: 'harder',
        label: 'Take on harder work',
        question: 'Apply it to a tougher problem',
        title: 'Move from one feature to a fuller product surface',
        body:
          'Apply the same discipline to a larger build — for example a task management app with collaboration and real-time updates.',
        relatedWork: 'Task Management App',
        cta: 'Explore the programme',
        to: '/programs/full-stack',
      },
      {
        id: 'goal',
        label: 'Move toward a goal',
        question: 'Carry the evidence forward',
        title: 'Use the work toward your next learning goal',
        body:
          'Keep the orders feature as inspectable evidence, then continue Full Stack toward the next client-grade project and code review.',
        cta: 'Explore the programme',
        to: '/programs/full-stack',
      },
    ],
  },
  {
    id: 'business',
    index: '03',
    label: 'Business',
    capability: 'Make product decisions',
    projectTitle: 'Case Study Portfolio · metrics',
    evidenceSummary:
      'Checkout reliability experiment with a growth hold until completion recovers.',
    shows:
      'You can choose one experiment under competing signals and defend the sequence — not only pick a preferred option.',
    catalogueKind: 'Programme',
    catalogueTitle: 'Product Management',
    source: 'program:product-management · projectsDetail:Case Study Portfolio (metrics)',
    directions: [
      {
        id: 'deepen',
        label: 'Go deeper',
        question: 'Strengthen the same capability',
        title: 'Sharpen product judgment',
        body:
          'Strengthen problem framing, metrics, and case practice inside the same programme — so trade-offs stay explicit.',
        cta: 'Explore the programme',
        to: '/programs/product-management',
      },
      {
        id: 'harder',
        label: 'Take on harder work',
        question: 'Apply it to a tougher problem',
        title: 'Move from one memo to a fuller product plan',
        body:
          'Apply the same decision quality to a broader deliverable — for example a six-month product roadmap with OKRs and stakeholder communication.',
        relatedWork: 'Product Roadmap',
        cta: 'Explore the programme',
        to: '/programs/product-management',
      },
      {
        id: 'goal',
        label: 'Move toward a goal',
        question: 'Carry the evidence forward',
        title: 'Use the work toward your next learning goal',
        body:
          'Keep the decision memo as inspectable evidence, then continue Product Management toward the next case and mentor review.',
        cta: 'Explore the programme',
        to: '/programs/product-management',
      },
    ],
  },
]
