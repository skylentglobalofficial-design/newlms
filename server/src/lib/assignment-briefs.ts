/**
 * First-party assignment briefs used for Career OS evidence.
 * Keys are `${courseSlug}:${lessonKey}`. Copy matches src/components/lms/AssignmentBrief.tsx.
 */
export type AssignmentBriefRecord = {
  objective: string
  skills: string[]
}

const BRIEFS: Record<string, AssignmentBriefRecord> = {
  "data-analytics:l6": {
    objective: "Build a multi-year financial model in Excel with scenario analysis and dynamic visualisations.",
    skills: ["Excel", "Financial Modelling", "Data Visualisation"],
  },
  "data-analytics:l12": {
    objective: "Build an end-to-end Power BI dashboard from a raw sales dataset, including DAX measures and drill-through pages.",
    skills: ["Power BI", "DAX", "Data Modelling"],
  },
  "data-analytics:l13": {
    objective: "Analyse a sales dataset and present performance by region, product, and time — the same brief as the programme Sales Performance Dashboard.",
    skills: ["Power BI", "DAX", "Data Modelling"],
  },
  "data-analytics:l14": {
    objective: "Query an HR dataset to produce headcount, attrition, tenure, and department-level reports. This is the published HR Analytics Dashboard brief.",
    skills: ["GROUP BY", "Subqueries", "Date functions", "Aggregation"],
  },
}

export function assignmentBriefFor(courseSlug: string, lessonKey: string): AssignmentBriefRecord | null {
  return BRIEFS[`${courseSlug}:${lessonKey}`] ?? null
}
