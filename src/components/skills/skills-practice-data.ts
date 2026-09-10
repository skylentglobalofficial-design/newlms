/**
 * Skills Scroll 3 — hands-on practice.
 * Domains and CTAs map to Scroll 2 capabilities / real catalogue routes.
 * Content is illustrative practice, not exams or client data.
 */

export type SkillsPracticeDomainId = 'data-ai' | 'coding' | 'business'

export type SkillsPracticeOption = {
  id: string
  label: string
  /** Teaching feedback shown after selection */
  feedback: string
  /** Stronger first move for this scenario */
  preferred?: boolean
}

export type SkillsPracticeActivity = {
  id: SkillsPracticeDomainId
  index: string
  label: string
  /** Scroll 2 capability this practice represents */
  capability: string
  interaction: 'interpret' | 'debug' | 'decide'
  contextKicker: string
  contextTitle: string
  contextLines: string[]
  task: string
  options: SkillsPracticeOption[]
  catalogueKind: 'Programme' | 'Certificate' | 'Course'
  catalogueTitle: string
  cta: string
  to: string
  source: string
}

export const SKILLS_PRACTICE_ACTIVITIES: SkillsPracticeActivity[] = [
  {
    id: 'data-ai',
    index: '01',
    label: 'Data & AI',
    capability: 'Analyse data',
    interaction: 'interpret',
    contextKicker: 'Metric observation',
    contextTitle: 'Traffic rose. Returns fell.',
    contextLines: [
      'Weekly sessions  +18%',
      'Return visits    −11%',
      'New sign-ups     +9%',
      'Support tickets  flat',
    ],
    task: 'What would you investigate first?',
    options: [
      {
        id: 'acquisition',
        label: 'Acquisition channels',
        feedback:
          'Useful later. New sign-ups are already up — the sharper signal is fewer returning visitors, so start with retention behaviour before you rebuild the funnel.',
      },
      {
        id: 'retention',
        label: 'Retention cohorts',
        preferred: true,
        feedback:
          'Strong first cut. The story is about returning behaviour, not acquisition volume — cohort drop-off and days-since-visit usually explain this pattern.',
      },
      {
        id: 'pricing',
        label: 'Pricing changes',
        feedback:
          'Only if pricing moved in the same window. With traffic up and returns down, check retention first; price is a secondary hypothesis.',
      },
    ],
    catalogueKind: 'Programme',
    catalogueTitle: 'Data Analytics with Gen AI',
    cta: 'Learn through Data Analytics',
    to: '/programs/data-analytics-pro',
    source: 'capability:Analyse data · program:data-analytics-pro',
  },
  {
    id: 'coding',
    index: '02',
    label: 'Coding',
    capability: 'Build full-stack applications',
    interaction: 'debug',
    contextKicker: 'API review',
    contextTitle: 'Orders endpoint ships — but something is wrong.',
    contextLines: [
      'app.get("/api/orders", async (req, res) => {',
      '  const orders = await db.orders.findMany()',
      '  res.json(orders)',
      '})',
    ],
    task: 'What would you change first?',
    options: [
      {
        id: 'paginate',
        label: 'Add pagination',
        feedback:
          'Helpful for scale, but not the critical bug. Without scoping to the signed-in user, every caller can see every order.',
      },
      {
        id: 'filter-user',
        label: 'Filter by the signed-in user',
        preferred: true,
        feedback:
          'Correct priority. Auth without authorization leaks data — scope the query to req.user.id (or equivalent) before polishing pagination or caching.',
      },
      {
        id: 'cache',
        label: 'Cache the full response',
        feedback:
          'Caching an unscoped list would make the leak faster and stickier. Fix ownership first, then consider cache keys per user.',
      },
      {
        id: 'post',
        label: 'Switch the route to POST',
        feedback:
          'Method choice is not the defect. The query returns all orders; start by filtering to the authenticated user.',
      },
    ],
    catalogueKind: 'Programme',
    catalogueTitle: 'Full Stack Development',
    cta: 'Learn through Full Stack',
    to: '/programs/full-stack',
    source: 'capability:Build full-stack applications · program:full-stack',
  },
  {
    id: 'business',
    index: '03',
    label: 'Business',
    capability: 'Make product decisions',
    interaction: 'decide',
    contextKicker: 'Product signals',
    contextTitle: 'Three signals. One next test.',
    contextLines: [
      'Feature requests: dark mode is the loudest ask',
      'Support: checkout failures spiked this week',
      'Growth: wants a referral programme this quarter',
      'Constraint: one focused experiment next',
    ],
    task: 'Which decision would you test first?',
    options: [
      {
        id: 'dark-mode',
        label: 'Ship dark mode',
        feedback:
          'High request volume is not the same as highest risk. Cosmetic demand can wait when the purchase path is failing.',
      },
      {
        id: 'checkout',
        label: 'Fix checkout reliability',
        preferred: true,
        feedback:
          'Strong call. A broken core loop blocks revenue and trust — diagnose and test the checkout failure before growth bets or polish features.',
      },
      {
        id: 'referral',
        label: 'Launch referral programme',
        feedback:
          'Growth on a leaking funnel burns spend. Stabilise checkout first, then test referral once conversion is trustworthy.',
      },
    ],
    catalogueKind: 'Programme',
    catalogueTitle: 'Product Management',
    cta: 'Learn through Product Management',
    to: '/programs/product-management',
    source: 'capability:Make product decisions · program:product-management',
  },
]
