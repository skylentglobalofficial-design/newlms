type AssignmentBriefModel = {
  objective: string
  skills: string[]
  difficulty?: string
  submit: string
}

/**
 * First-party briefs only. Keys are `${courseSlug}:${lessonId}`.
 * Copy comes from programme `projectsDetail` already published in src/data.ts.
 */
const BRIEFS: Record<string, AssignmentBriefModel> = {
  'data-analytics:l6': {
    objective: 'Build a multi-year financial model in Excel with scenario analysis and dynamic visualisations.',
    skills: ['Excel', 'Financial Modelling', 'Data Visualisation'],
    difficulty: 'Beginner',
    submit: 'Upload the workbook or describe the model. There is no automated grade — this records that you submitted work.',
  },
  'data-analytics:l12': {
    objective: 'Build an end-to-end Power BI dashboard from a raw sales dataset, including DAX measures and drill-through pages.',
    skills: ['Power BI', 'DAX', 'Data Modelling'],
    difficulty: 'Intermediate',
    submit: 'Upload the .pbix file or a PDF export of the report. Faculty review is not automated on this surface.',
  },
  'data-analytics:l13': {
    objective: 'Analyse a sales dataset and present performance by region, product, and time — the same brief as the programme Sales Performance Dashboard.',
    skills: ['Power BI', 'DAX', 'Data Modelling'],
    difficulty: 'Intermediate',
    submit: 'Submit the dashboard plus a short note on the three insights you would take to a business stakeholder.',
  },
  'data-analytics:l14': {
    objective: 'Query an HR dataset to produce headcount, attrition, tenure, and department-level reports. This is the published HR Analytics Dashboard brief.',
    skills: ['GROUP BY', 'Subqueries', 'Date functions', 'Aggregation'],
    difficulty: 'Beginner',
    submit: 'Submit SQL and a dashboard or spreadsheet of the four reports. No invented headcount figures belong in the brief itself.',
  },
}

export function assignmentBriefFor(courseSlug: string | undefined, lessonId: string): AssignmentBriefModel | null {
  if (!courseSlug) return null
  return BRIEFS[`${courseSlug}:${lessonId}`] ?? null
}

export default function AssignmentBrief({
  courseSlug,
  lessonId,
}: {
  courseSlug?: string
  lessonId: string
}) {
  const brief = assignmentBriefFor(courseSlug, lessonId)
  if (!brief) {
    return (
      <div className="assignment-brief">
        <p>A structured brief is not published for this node yet. Submit the work named in the lesson title. Do not invent data or employers.</p>
      </div>
    )
  }

  return (
    <div className="assignment-brief">
      <p><strong>Objective.</strong> {brief.objective}</p>
      <p className="programme-meta" style={{ margin: '8px 0' }}>
        {brief.difficulty ? <span>{brief.difficulty}</span> : null}
        {brief.skills.map((skill) => <span key={skill}>{skill}</span>)}
      </p>
      <p><strong>Submit.</strong> {brief.submit}</p>
    </div>
  )
}
