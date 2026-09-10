/**
 * Skills Scroll 4 — build preview.
 * Artifacts map to real catalogue projects / programme work,
 * not learner portfolios or verified outcomes.
 */

export type SkillsBuildDomainId = 'data-ai' | 'coding' | 'business'
export type SkillsBuildStageId = 'brief' | 'work' | 'output'

export type SkillsBuildStage = {
  id: SkillsBuildStageId
  label: string
  question: string
  kicker: string
  title: string
  lines: string[]
  /** Optional callout on output stage */
  callout?: string
  surface: 'doc' | 'code' | 'memo'
}

export type SkillsBuildArtifact = {
  id: SkillsBuildDomainId
  index: string
  label: string
  capability: string
  /** Catalogue project title this preview is based on */
  projectTitle: string
  catalogueKind: 'Programme'
  catalogueTitle: string
  to: string
  cta: string
  source: string
  stages: SkillsBuildStage[]
}

export const SKILLS_BUILD_STAGES: SkillsBuildStageId[] = ['brief', 'work', 'output']

export const SKILLS_BUILD_ARTIFACTS: SkillsBuildArtifact[] = [
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
        id: 'brief',
        label: 'Brief',
        question: 'What are we trying to solve?',
        kicker: 'Business question',
        title: 'Which customers are going quiet?',
        surface: 'doc',
        lines: [
          'Return visits fell while new traffic rose.',
          'Ops needs segments they can act on — not a chart dump.',
          'Deliverable: a clear finding and one recommendation.',
        ],
      },
      {
        id: 'work',
        label: 'Work',
        question: 'What did we actually do?',
        kicker: 'Analysis surface',
        title: 'Segment by behaviour, then rank drop-off',
        surface: 'code',
        lines: [
          'WITH activity AS (',
          '  SELECT customer_id, region,',
          '    MAX(visit_date) AS last_visit',
          '  FROM visits GROUP BY 1, 2',
          ')',
          'SELECT region, days_since(last_visit),',
          '  COUNT(*) AS quiet_customers',
          'FROM activity',
          'WHERE days_since(last_visit) > 14',
          'GROUP BY 1, 2 ORDER BY 3 DESC;',
        ],
      },
      {
        id: 'output',
        label: 'Output',
        question: 'What can we show?',
        kicker: 'Finding · recommendation',
        title: 'Quiet cohort is concentrated, not random',
        surface: 'doc',
        lines: [
          'Finding: Region West, 15–28 days quiet — largest share of drop-off.',
          'Signal: days_since_visit beats acquisition channel for this pattern.',
          'Recommendation: priority win-back to West quiet cohort this week.',
        ],
        callout: 'A short analysis memo — the kind of work the programme develops.',
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
        id: 'brief',
        label: 'Brief',
        question: 'What are we trying to solve?',
        kicker: 'Requirement',
        title: 'Show each shopper only their orders',
        surface: 'doc',
        lines: [
          'After checkout, the buyer needs an orders list.',
          'The list must be scoped to the signed-in user.',
          'Ship: API + UI that refuse cross-user data.',
        ],
      },
      {
        id: 'work',
        label: 'Work',
        question: 'What did we actually do?',
        kicker: 'Implementation',
        title: 'Auth-scoped query + React list',
        surface: 'code',
        lines: [
          '// API',
          'app.get("/api/orders", requireAuth, async (req, res) => {',
          '  const orders = await db.orders.findMany({',
          '    where: { userId: req.user.id },',
          '  })',
          '  res.json(orders)',
          '})',
          '',
          '// UI',
          'const { data } = useOrders()',
          'return <OrderTable rows={data} />',
        ],
      },
      {
        id: 'output',
        label: 'Output',
        question: 'What can we show?',
        kicker: 'Working surface',
        title: 'Orders — scoped to you',
        surface: 'doc',
        lines: [
          'ORD-1842 · Paid · 2 items · delivered to saved address',
          'ORD-1831 · Processing · 1 item',
          'Empty for other accounts — query filtered by userId.',
        ],
        callout: 'A small shipped feature — not a full product clone.',
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
        id: 'brief',
        label: 'Brief',
        question: 'What are we trying to solve?',
        kicker: 'Problem',
        title: 'Checkout completion dropped after redesign',
        surface: 'doc',
        lines: [
          'Completion fell in the week after a checkout UI change.',
          'Growth wants a referral programme; support tickets cite payment errors.',
          'Decide the one experiment worth running next.',
        ],
      },
      {
        id: 'work',
        label: 'Work',
        question: 'What did we actually do?',
        kicker: 'Experiment design',
        title: 'Hypothesis before the growth bet',
        surface: 'memo',
        lines: [
          'Hypothesis: payment-step friction — not demand — explains the drop.',
          'Experiment: restore prior payment step for 50% of sessions.',
          'Hold: referral programme until completion is stable.',
          'Watch: completion rate, payment errors, support volume.',
        ],
      },
      {
        id: 'output',
        label: 'Output',
        question: 'What can we show?',
        kicker: 'Decision memo',
        title: 'Test reliability before acquisition',
        surface: 'memo',
        lines: [
          'Decision: run the payment-step A/B first.',
          'Success signal: completion recovers toward prior baseline.',
          'If flat: dig into gateway errors before any growth launch.',
        ],
        callout: 'A product decision document — interview-ready case style.',
      },
    ],
  },
]
