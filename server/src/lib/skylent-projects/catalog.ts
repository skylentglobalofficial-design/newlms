export const NORTHWIND_PROJECT_TYPE = "northwind-commercial-review" as const
export const NORTHWIND_PROJECT_COURSE = "data-analytics"
export const NORTHWIND_PROJECT_LAB = "northwind"

export const PROJECT_REFLECTION_MIN = 2
export const PROJECT_REFLECTION_MAX = 1500

export const PROJECT_TASK_KEYS = [
  "validate_data",
  "category_revenue",
  "monthly_trend",
  "finding",
  "why_it_matters",
  "recommendation",
] as const

export type ProjectTaskKey = string
export type ProjectStatus = "not_started" | "in_progress" | "saved" | "ready_to_review"
export type ProjectTaskStatus = "open" | "complete"
export type ProjectTool = "analysis" | "sql" | "evidence" | "reflection"
export type ReflectionField = "finding" | "whyItMatters" | "recommendation"

export type ProjectTaskDefinition = {
  key: ProjectTaskKey
  number: string
  title: string
  summary: string
  tool: ProjectTool
  toolLabel: string
  completion: "explicit" | "lab_work" | "reflection"
  reflectionField?: ReflectionField
  labMode?: "analysis" | "sql"
  exampleId?: "valid_rows" | "revenue_by_category" | "monthly_revenue"
  evidenceHint: string
}

export const NORTHWIND_PROJECT_DEF = {
  projectType: NORTHWIND_PROJECT_TYPE,
  courseSlug: NORTHWIND_PROJECT_COURSE,
  labSlug: NORTHWIND_PROJECT_LAB,
  title: "Northwind Commercial Review",
  goal: "Review the fictional Northwind sales extract and produce a concise, evidence-based commercial summary.",
  dataset: "northwind_sales.csv",
  disclaimer:
    "This is learner work on a fictional Northwind Retail extract. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Confirm the valid-row rule.",
    "Analyse revenue by category.",
    "Analyse a time trend.",
    "Identify one important finding.",
    "Explain why the finding matters.",
    "Write one recommendation supported by the data.",
  ],
  context:
    "Use the Northwind Lab to inspect the dataset and run queries. Attach the work you saved, then write the commercial summary in your own words. This brief does not contain the answer.",
  careerContext: "Data Analytics",
  careerSummary: "A practical analysis of a fictional Northwind sales extract.",
  workspaceHref: "/os/projects/data-analytics/northwind-commercial-review",
  courseTitle: "Data Analytics",
  caseHref: null as string | null,
  reflectionLabels: {
    finding: "Finding",
    whyItMatters: "Why it matters",
    recommendation: "Recommendation",
  },
  reflectionHints: {
    finding: "What did the data show?",
    whyItMatters: "Why should someone care?",
    recommendation: "What action would you suggest based on the evidence?",
  },
  demonstratedWork: [
    "data validation",
    "SQL analysis",
    "category revenue analysis",
    "monthly trend analysis",
    "chart interpretation",
    "evidence-based recommendation",
  ],
  demonstratedSkills: ["SQL", "Data analysis", "Data interpretation", "Business communication"],
  careerEvidence: [
    { taskKey: "category_revenue", title: "Revenue by category" },
    { taskKey: "monthly_trend", title: "Monthly revenue" },
  ] as const,
  tasks: [
    {
      key: "validate_data",
      number: "01",
      title: "Validate the data",
      summary: "Confirm which rows count as valid sales before you interpret totals.",
      tool: "analysis",
      toolLabel: "Quick analysis / dataset",
      completion: "explicit",
      labMode: "analysis",
      evidenceHint: "Open the lab, inspect the valid-row rule, then mark this task complete.",
    },
    {
      key: "category_revenue",
      number: "02",
      title: "Analyse revenue by category",
      summary: "Run a category revenue query, inspect the table and chart, then attach the saved work.",
      tool: "sql",
      toolLabel: "Northwind SQL + Chart",
      completion: "lab_work",
      labMode: "sql",
      exampleId: "revenue_by_category",
      evidenceHint: "Attach saved Northwind SQL work that shows a category label and a numeric value.",
    },
    {
      key: "monthly_trend",
      number: "03",
      title: "Analyse monthly trend",
      summary: "Run a monthly revenue query, inspect the trend, then attach the saved work.",
      tool: "sql",
      toolLabel: "Northwind SQL + Chart",
      completion: "lab_work",
      labMode: "sql",
      exampleId: "monthly_revenue",
      evidenceHint: "Attach saved Northwind SQL work that shows a month or date label and a numeric value.",
    },
    {
      key: "finding",
      number: "04",
      title: "Identify a finding",
      summary: "What did the data show?",
      tool: "evidence",
      toolLabel: "Saved evidence",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Write one finding grounded in the work you attached.",
    },
    {
      key: "why_it_matters",
      number: "05",
      title: "Explain why it matters",
      summary: "Why should someone care?",
      tool: "reflection",
      toolLabel: "Reflection",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Explain the commercial implication of your finding.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Write a recommendation",
      summary: "What action would you suggest based on the evidence?",
      tool: "reflection",
      toolLabel: "Reflection",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Recommend one action a commercial lead could take next.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const HARBOR_DESK_PROJECT_TYPE = "harbor-desk-case" as const
export const HARBOR_DESK_PROJECT_COURSE = "product-management"

export const HARBOR_DESK_PROJECT_DEF = {
  projectType: HARBOR_DESK_PROJECT_TYPE,
  courseSlug: HARBOR_DESK_PROJECT_COURSE,
  labSlug: null,
  title: "Harbor Desk product case",
  goal: "Frame the Harbor Retail operations problem and recommend one constrained product bet, with a spec someone could implement.",
  dataset: "harbor-desk-case.md",
  disclaimer:
    "This is learner work on a fictional Harbor Retail operations case. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Read the Harbor Desk case notes.",
    "Frame the problem from store jobs, not from Gmail.",
    "Write the evidence-backed problem.",
    "Name the user job and outcome.",
    "Choose one bet under the six-week constraint.",
    "Write the recommendation / spec-level bet.",
  ],
  context:
    "Use the case notes in the course. There is no SQL lab on this project. Write the product case in your own words. This brief does not contain the answer.",
  careerContext: "Product Management",
  careerSummary: "A product case on a fictional Harbor Retail operations problem.",
  workspaceHref: "/os/projects/product-management/harbor-desk-case",
  courseTitle: "Product Management",
  caseHref: "/content/product-management/harbor-desk-case.md",
  reflectionLabels: {
    finding: "Problem and evidence",
    whyItMatters: "User job and outcome",
    recommendation: "The bet",
  },
  reflectionHints: {
    finding: "What problem did the case actually support?",
    whyItMatters: "Whose job gets easier, and how would you know?",
    recommendation: "Which one bet fits two engineers and six weeks — and what will you not build?",
  },
  demonstratedWork: [
    "interview synthesis",
    "problem framing",
    "prioritisation under a constraint",
    "thin specification",
    "evidence-based recommendation",
  ],
  demonstratedSkills: ["Product discovery", "Problem framing", "Prioritisation", "Business communication"],
  careerEvidence: [
    { taskKey: "finding", title: "Problem and evidence" },
    { taskKey: "recommendation", title: "Product bet" },
  ] as const,
  tasks: [
    {
      key: "read_case",
      number: "01",
      title: "Read the case",
      summary: "Open the Harbor Desk notes. Do not invent interviews.",
      tool: "evidence",
      toolLabel: "Case notes",
      completion: "explicit",
      evidenceHint: "Read harbor-desk-case.md, then mark this task complete.",
    },
    {
      key: "frame_problem",
      number: "02",
      title: "Frame the problem",
      summary: "Separate store jobs from the requested Gmail solution.",
      tool: "evidence",
      toolLabel: "Framing",
      completion: "explicit",
      evidenceHint: "Name the user and the job without saying inbox, then mark complete.",
    },
    {
      key: "finding",
      number: "03",
      title: "Write the problem and evidence",
      summary: "What did the notes and exception log actually show?",
      tool: "reflection",
      toolLabel: "Product case",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Cite quotes or exception IDs. Do not invent revenue.",
    },
    {
      key: "why_it_matters",
      number: "04",
      title: "Name the job and outcome",
      summary: "Whose work gets easier, and how would you know?",
      tool: "reflection",
      toolLabel: "Product case",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Write a job and a countable outcome.",
    },
    {
      key: "one_bet",
      number: "05",
      title: "Choose one bet",
      summary: "Pick one option under two engineers and six weeks.",
      tool: "evidence",
      toolLabel: "Prioritisation",
      completion: "explicit",
      evidenceHint: "Name the bet and a non-goal, then mark complete.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Write the recommendation",
      summary: "What should Harbor Retail do next, and what is out of scope?",
      tool: "reflection",
      toolLabel: "Product case",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Recommend one action that fits the constraint.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const PROJECT_DEFS = [NORTHWIND_PROJECT_DEF, HARBOR_DESK_PROJECT_DEF] as const

export function findProjectDefinition(projectType: string) {
  return PROJECT_DEFS.find((row) => row.projectType === projectType) ?? null
}

export function findProjectByCourse(courseSlug: string) {
  return PROJECT_DEFS.find((row) => row.courseSlug === courseSlug) ?? null
}

export function findProjectTask(projectType: string, taskKey: string) {
  const definition = findProjectDefinition(projectType)
  return definition?.tasks.find((task) => task.key === taskKey) ?? null
}

export function isProjectTaskKey(value: string): boolean {
  return PROJECT_DEFS.some((definition) => definition.tasks.some((task) => task.key === value))
}

export function projectWorkspacePath(courseSlug: string, projectType: string) {
  return `/os/projects/${courseSlug}/${projectType}`
}
