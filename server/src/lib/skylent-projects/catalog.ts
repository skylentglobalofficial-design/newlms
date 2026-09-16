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

export type ProjectTaskKey = (typeof PROJECT_TASK_KEYS)[number]
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

export function findProjectDefinition(projectType: string) {
  if (projectType === NORTHWIND_PROJECT_DEF.projectType) return NORTHWIND_PROJECT_DEF
  return null
}

export function findProjectTask(projectType: string, taskKey: string) {
  const definition = findProjectDefinition(projectType)
  return definition?.tasks.find((task) => task.key === taskKey) ?? null
}

export function isProjectTaskKey(value: string): value is ProjectTaskKey {
  return (PROJECT_TASK_KEYS as readonly string[]).includes(value)
}
