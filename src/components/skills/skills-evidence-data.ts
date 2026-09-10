/**
 * Skills Scroll 5 — evidence / prove preview.
 * Maps to the same catalogue projects as Scroll 4.
 * Illustrative product concept only — not verified evidence storage.
 */

export type SkillsEvidenceDomainId = 'data-ai' | 'coding' | 'business'
export type SkillsEvidenceStageId = 'work' | 'reasoning' | 'evidence'

export type SkillsEvidenceField = {
  label: string
  value: string
}

export type SkillsEvidenceStage = {
  id: SkillsEvidenceStageId
  label: string
  question: string
  kicker: string
  title: string
  lines: string[]
  /** Structured evidence record fields (evidence stage) */
  fields?: SkillsEvidenceField[]
  note?: string
  surface: 'artifact' | 'annotation' | 'record'
}

export type SkillsEvidenceItem = {
  id: SkillsEvidenceDomainId
  index: string
  label: string
  capability: string
  projectTitle: string
  catalogueKind: 'Programme'
  catalogueTitle: string
  to: string
  cta: string
  source: string
  stages: SkillsEvidenceStage[]
}

export const SKILLS_EVIDENCE_STAGES: SkillsEvidenceStageId[] = [
  'work',
  'reasoning',
  'evidence',
]

export const SKILLS_EVIDENCE_ITEMS: SkillsEvidenceItem[] = [
  {
    id: 'data-ai',
    index: '01',
    label: 'Data & AI',
    capability: 'Analyse data',
    projectTitle: 'Customer Segmentation Analysis',
    catalogueKind: 'Programme',
    catalogueTitle: 'Data Analytics with Gen AI',
    to: '/programs/data-analytics-pro',
    cta: 'Explore the programme',
    source: 'program:data-analytics-pro projectsDetail:Customer Segmentation Analysis',
    stages: [
      {
        id: 'work',
        label: 'Work',
        question: 'What was built?',
        kicker: 'Analytical deliverable',
        title: 'Quiet-customer segmentation memo',
        surface: 'artifact',
        lines: [
          'Question: Which customers are going quiet — and where?',
          'Work: SQL cohorts by region and days_since_visit.',
          'Finding: West, 15–28 days quiet — largest share of drop-off.',
          'Recommendation: priority win-back to that cohort this week.',
        ],
      },
      {
        id: 'reasoning',
        label: 'Reasoning',
        question: 'What decisions shaped it?',
        kicker: 'Analysis decisions',
        title: 'Why retention first — and this cut',
        surface: 'annotation',
        lines: [
          'Chose days_since_visit over acquisition channel — returns fell while traffic rose.',
          'Grouped by region so ops could act on a place, not a vague chart.',
          'Threshold > 14 days: separates “busy week” noise from quiet behaviour.',
          'One recommendation only — keeps the memo decision-ready.',
        ],
        note: 'The analysis is useful. The reasoning behind it makes the capability visible.',
      },
      {
        id: 'evidence',
        label: 'Evidence',
        question: 'What does it demonstrate?',
        kicker: 'Evidence record',
        title: 'Capability made inspectable',
        surface: 'record',
        fields: [
          { label: 'Capability', value: 'Analyse data' },
          {
            label: 'What the work demonstrates',
            value: 'Turning a metric shift into a segmented finding and a concrete next action.',
          },
          {
            label: 'What was actually done',
            value: 'Behavioural SQL segmentation, ranked quiet cohorts, written recommendation.',
          },
          {
            label: 'Why the evidence matters',
            value: 'Shows judgment under ambiguity — not only that a query ran.',
          },
        ],
        lines: [],
        note: 'Evidence is the work plus the reasoning — not a score.',
      },
    ],
  },
  {
    id: 'coding',
    index: '02',
    label: 'Coding',
    capability: 'Build full-stack applications',
    projectTitle: 'E-Commerce Platform · order management',
    catalogueKind: 'Programme',
    catalogueTitle: 'Full Stack Development',
    to: '/programs/full-stack',
    cta: 'Explore the programme',
    source: 'program:full-stack projectsDetail:E-Commerce Platform + REST API Service',
    stages: [
      {
        id: 'work',
        label: 'Work',
        question: 'What was built?',
        kicker: 'Shipped feature',
        title: 'Auth-scoped orders list',
        surface: 'artifact',
        lines: [
          'Requirement: each shopper sees only their own orders.',
          'API: GET /api/orders filtered by signed-in userId.',
          'UI: OrderTable bound to the scoped response.',
          'Result: cross-account order leak closed.',
        ],
      },
      {
        id: 'reasoning',
        label: 'Reasoning',
        question: 'What decisions shaped it?',
        kicker: 'Implementation trade-offs',
        title: 'Authorization before polish',
        surface: 'annotation',
        lines: [
          'Filtered in the query — not only in the UI — so the list cannot leak via the API.',
          'Deferred pagination and caching until ownership was correct.',
          'Kept requireAuth on the route so anonymous callers get a clear failure.',
          'Documented the userId filter as the acceptance check.',
        ],
        note: 'A working screen is unfinished evidence until the hard decision is visible.',
      },
      {
        id: 'evidence',
        label: 'Evidence',
        question: 'What does it demonstrate?',
        kicker: 'Evidence record',
        title: 'Capability made inspectable',
        surface: 'record',
        fields: [
          { label: 'Capability', value: 'Build full-stack applications' },
          {
            label: 'What the work demonstrates',
            value: 'Shipping an API + UI feature with correct authz, not only a rendered list.',
          },
          {
            label: 'What was actually done',
            value: 'Auth-gated endpoint, user-scoped query, React table, acceptance note.',
          },
          {
            label: 'Why the evidence matters',
            value: 'Shows production judgment: security and ownership before growth features.',
          },
        ],
        lines: [],
        note: 'Evidence is the work plus the reasoning — not a score.',
      },
    ],
  },
  {
    id: 'business',
    index: '03',
    label: 'Business',
    capability: 'Make product decisions',
    projectTitle: 'Case Study Portfolio · metrics',
    catalogueKind: 'Programme',
    catalogueTitle: 'Product Management',
    to: '/programs/product-management',
    cta: 'Explore the programme',
    source: 'program:product-management projectsDetail:Case Study Portfolio (metrics) + Metrics & Analytics curriculum',
    stages: [
      {
        id: 'work',
        label: 'Work',
        question: 'What was built?',
        kicker: 'Decision memo',
        title: 'Checkout reliability experiment brief',
        surface: 'artifact',
        lines: [
          'Problem: completion fell after a checkout redesign.',
          'Hypothesis: payment-step friction — not demand — explains the drop.',
          'Experiment: restore prior payment step for 50% of sessions.',
          'Decision: hold referral programme until completion is stable.',
        ],
      },
      {
        id: 'reasoning',
        label: 'Reasoning',
        question: 'What decisions shaped it?',
        kicker: 'Product trade-offs',
        title: 'Fix the loop before growth',
        surface: 'annotation',
        lines: [
          'Prioritised support signal (payment errors) over loud feature requests (dark mode).',
          'Chose one focused A/B instead of stacking a referral launch on a leaking funnel.',
          'Defined success as completion recovering toward the prior baseline.',
          'Wrote the hold on growth so stakeholders see the sequence, not only the test.',
        ],
        note: 'A polished recommendation without trade-offs is marketing — not product evidence.',
      },
      {
        id: 'evidence',
        label: 'Evidence',
        question: 'What does it demonstrate?',
        kicker: 'Evidence record',
        title: 'Capability made inspectable',
        surface: 'record',
        fields: [
          { label: 'Capability', value: 'Make product decisions' },
          {
            label: 'What the work demonstrates',
            value: 'Framing a metric drop, choosing one experiment, and defending the sequence.',
          },
          {
            label: 'What was actually done',
            value: 'Problem brief, hypothesis, A/B design, success signal, growth hold.',
          },
          {
            label: 'Why the evidence matters',
            value: 'Shows decision quality under competing signals — not just a preferred option.',
          },
        ],
        lines: [],
        note: 'Evidence is the work plus the reasoning — not a score.',
      },
    ],
  },
]
