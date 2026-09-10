/**
 * Skills Scroll 2 capability discovery — derived from real catalogue entries
 * in src/data.ts (PROFESSIONAL / CERTIFICATE programs + related courses).
 * Design / Cyber / Cloud omitted: not represented in current Skills catalogue.
 */

export type SkillsDiscoveryDomainId = 'data-ai' | 'coding' | 'business'

export type SkillsDiscoveryCapability = {
  id: string
  /** Verb-led capability statement */
  action: string
  /** Short meaning */
  meaning: string
  /** What it enables */
  enables: string
  /** Supporting skills evidenced by whatYouWillLearn / curriculum */
  skills: string[]
  /** Catalogue title shown secondarily */
  catalogueTitle: string
  catalogueKind: 'Programme' | 'Certificate' | 'Course'
  to: string
  source: string
  artifact: {
    kicker: string
    title: string
    lines: string[]
    note: string
  }
}

export type SkillsDiscoveryDomain = {
  id: SkillsDiscoveryDomainId
  index: string
  label: string
  summary: string
  capabilities: SkillsDiscoveryCapability[]
}

export const SKILLS_DISCOVERY_DOMAINS: SkillsDiscoveryDomain[] = [
  {
    id: 'data-ai',
    index: '01',
    label: 'Data & AI',
    summary: 'Query, analyse, visualise, and apply AI to real data work.',
    capabilities: [
      {
        id: 'analyse-data',
        action: 'Analyse data',
        meaning: 'Turn messy activity into a clear finding and a next action.',
        enables: 'SQL analysis, dashboards, and data storytelling for decisions.',
        skills: ['SQL', 'Excel', 'Power BI', 'Python for analysis', 'Data storytelling'],
        catalogueTitle: 'Data Analytics with Gen AI',
        catalogueKind: 'Programme',
        to: '/programs/data-analytics-pro',
        source: 'program:data-analytics-pro whatYouWillLearn + course:data-analytics + course:power-bi + certificate:sql-certificate',
        artifact: {
          kicker: 'Analysis task',
          title: 'Segment quiet customers',
          lines: [
            'Join activity + region tables',
            'Filter days_since_visit > 14',
            'Rank cohorts by drop-off',
            'Write one recommendation',
          ],
          note: 'Representative activity · not a scored result',
        },
      },
      {
        id: 'query-with-sql',
        action: 'Query with SQL',
        meaning: 'Ask precise questions of relational data.',
        enables: 'Joins, window functions, and business reporting patterns.',
        skills: ['SELECT / JOIN', 'CTEs', 'Window functions', 'Cohorts & funnels'],
        catalogueTitle: 'SQL for Business Analytics',
        catalogueKind: 'Certificate',
        to: '/programs/sql-certificate',
        source: 'certificate:sql-certificate whatYouWillLearn',
        artifact: {
          kicker: 'SQL practice',
          title: 'Rolling 7-day return rate',
          lines: [
            'WITH daily AS (…) ',
            'SELECT region, AVG(return_rate)',
            'OVER (PARTITION BY region',
            'ORDER BY day ROWS 6 PRECEDING)',
          ],
          note: 'Representative query · not live learner work',
        },
      },
      {
        id: 'build-ml-models',
        action: 'Build ML models',
        meaning: 'Move from cleaned data to a tested predictive model.',
        enables: 'Supervised learning, evaluation, and applied NLP foundations.',
        skills: ['Statistics', 'Supervised learning', 'Feature engineering', 'Model evaluation'],
        catalogueTitle: 'Data Science & AI',
        catalogueKind: 'Programme',
        to: '/programs/data-science-ai',
        source: 'program:data-science-ai whatYouWillLearn',
        artifact: {
          kicker: 'Model workflow',
          title: 'Churn classifier draft',
          lines: [
            'Split train / validation',
            'Fit baseline + gradient boost',
            'Compare precision / recall',
            'Document one failure mode',
          ],
          note: 'Representative workflow · not a placement claim',
        },
      },
      {
        id: 'work-with-gen-ai',
        action: 'Work with generative AI',
        meaning: 'Design prompts and workflows that hold up under evaluation.',
        enables: 'Prompting, RAG patterns, and tested LLM applications.',
        skills: ['Prompt engineering', 'RAG', 'LangChain', 'LLM evaluation'],
        catalogueTitle: 'Generative AI',
        catalogueKind: 'Programme',
        to: '/programs/generative-ai-program',
        source: 'program:generative-ai-program whatYouWillLearn + course:generative-ai',
        artifact: {
          kicker: 'AI workflow',
          title: 'Grounded answer with sources',
          lines: [
            'Retrieve relevant chunks',
            'Prompt with citations required',
            'Score faithfulness',
            'Reject ungrounded replies',
          ],
          note: 'Representative pattern · not a production metric',
        },
      },
    ],
  },
  {
    id: 'coding',
    index: '02',
    label: 'Coding',
    summary: 'Build interfaces, APIs, and data-backed applications you can ship.',
    capabilities: [
      {
        id: 'build-fullstack-apps',
        action: 'Build full-stack applications',
        meaning: 'Ship a working product across frontend, API, and database.',
        enables: 'React interfaces, Node APIs, PostgreSQL, auth, and deployment.',
        skills: ['React', 'Node / Express', 'PostgreSQL', 'Auth & deployment'],
        catalogueTitle: 'Full Stack Development',
        catalogueKind: 'Programme',
        to: '/programs/full-stack',
        source: 'program:full-stack whatYouWillLearn + course:full-stack-web',
        artifact: {
          kicker: 'Build surface',
          title: 'Orders API + UI draft',
          lines: [
            'POST /api/orders',
            'Validate + persist',
            'Render status in React',
            'Cover the happy path test',
          ],
          note: 'Representative build · not a live repo',
        },
      },
      {
        id: 'write-python-for-data',
        action: 'Write Python for data work',
        meaning: 'Use Python as a practical tool for analysis and automation.',
        enables: 'pandas workflows, visualisation, and reproducible notebooks.',
        skills: ['Python fundamentals', 'pandas', 'matplotlib / seaborn'],
        catalogueTitle: 'Python for Data Science',
        catalogueKind: 'Course',
        to: '/courses/python-programming',
        source: 'course:python-programming (category Programming)',
        artifact: {
          kicker: 'Notebook task',
          title: 'Clean and plot a cohort',
          lines: [
            'Load CSV → DataFrame',
            'Handle missing values',
            'Group by week',
            'Plot retention curve',
          ],
          note: 'Representative notebook · not graded output',
        },
      },
    ],
  },
  {
    id: 'business',
    index: '03',
    label: 'Business',
    summary: 'Frame problems, decide trade-offs, and write product recommendations.',
    capabilities: [
      {
        id: 'make-product-decisions',
        action: 'Make product decisions',
        meaning: 'Size an opportunity, choose a path, and defend it.',
        enables: 'Problem framing, research synthesis, roadmaps, and PRDs.',
        skills: ['Problem framing', 'User research', 'Roadmapping', 'PRDs', 'Product metrics'],
        catalogueTitle: 'Product Management',
        catalogueKind: 'Programme',
        to: '/programs/product-management',
        source: 'program:product-management whatYouWillLearn + course:product-management',
        artifact: {
          kicker: 'Case brief',
          title: 'Pick the first launch path',
          lines: [
            'Constraint: 6-week window',
            'Option A — demand, higher risk',
            'Option B — lower cost, slower reach',
            'Write the recommendation',
          ],
          note: 'Representative case · not an institutional outcome',
        },
      },
    ],
  },
]
