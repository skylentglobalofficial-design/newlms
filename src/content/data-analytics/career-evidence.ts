export type CareerEvidenceMap = {
  lessonId: string
  learning: string
  artifact: string
  skill: string
  evidence: string
}

/** What a learner can actually show. Career OS does not auto-create these. */
export const DA_CAREER_EVIDENCE: CareerEvidenceMap[] = [
  {
    lessonId: 'l6',
    learning: 'Spreadsheet analysis of a dirty sales export',
    artifact: 'Cleaning log + category/region tables + three recommendations',
    skill: 'Spreadsheet analysis, data cleaning, business interpretation',
    evidence: 'A hiring manager can see how dirty rows were treated and what you advised',
  },
  {
    lessonId: 'l12',
    learning: 'Dashboarding for a decision, not decoration',
    artifact: 'Dashboard file or layout write-up + insight box',
    skill: 'Dashboarding, measures vs dimensions, communication',
    evidence: 'A one-screen screenshot that answers a stated business question',
  },
  {
    lessonId: 'l13',
    learning: 'SQL analysis of a sales table',
    artifact: 'sql_analysis.sql (or pasted queries) + result tables + interpretation',
    skill: 'SQL, analytical reasoning, data-quality decisions',
    evidence: 'Queries a reviewer can re-run on the same CSV',
  },
  {
    lessonId: 'l14',
    learning: 'End-to-end commercial analysis',
    artifact: 'Capstone memo + dashboard + SQL/spreadsheet appendix',
    skill: 'Cleaning, SQL, spreadsheets, dashboarding, recommendations',
    evidence: 'A public work sample — not a certificate and not a placement',
  },
]
