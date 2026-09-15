export type AssignmentBrief = {
  id: string;
  title: string;
  scenario: string;
  objective: string;
  datasetHref: string;
  datasetName: string;
  instructions: string[];
  requiredOutput: string[];
  submissionFormat: string;
  evaluationCriteria: { criterion: string; weight: string; description: string }[];
  commonMistakes: string[];
  extension: string;
  careerEvidence: {
    learning: string;
    artifact: string;
    skill: string;
    evidence: string;
  };
};

const pasteNote =
  'This LMS records a text submission only. Paste tables, SQL, dashboard notes, and a public file link if you have one. There is no file upload, no live Excel/SQL runtime, and no faculty grading in this pilot.';

export const DA_ASSIGNMENTS: Record<string, AssignmentBrief> = {
  l6: {
    id: 'l6',
    title: 'Spreadsheet analysis — Northwind Q1–Q2 sales',
    scenario:
      'You are the first analyst at Northwind Retail, a fictional 2026 store network. The commercial lead wants to know which categories and regions actually made money after discounts and returns — not just which rows exist in the export.',
    objective:
      'Clean the sales table, compute net revenue, and answer three business questions in a spreadsheet.',
    datasetHref: '/content/data-analytics/northwind_sales.csv',
    datasetName: 'northwind_sales.csv',
    instructions: [
      'Download northwind_sales.csv and open it in Google Sheets or Excel.',
      'Create a working tab. Do not overwrite the raw export.',
      'Document every quality issue you find (blank region, category aliases, negative units, zero price, duplicate order_id).',
      'Define net_revenue = units × unit_price × (1 − discount_pct/100) on rows you treat as valid sales (typical rule: units > 0, unit_price > 0, returned = no).',
      'Build a category summary: valid orders, units, net revenue, average discount.',
      'Build a region summary. Keep “Unknown” for blank region rather than dropping it silently.',
      'Answer: (1) top 3 categories by net revenue, (2) the region with the lowest net revenue among named regions, (3) whether duplicate NW-10013 should be one order or two.',
      'Write three sentences a commercial lead can act on.',
    ],
    requiredOutput: [
      'A cleaning log (what you changed or excluded, and why).',
      'Category and region summary tables.',
      'Answers to the three questions with numbers.',
      'Three business recommendations.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Cleaning is explicit',
        weight: '25%',
        description: 'Quality issues are named. Exclusions have rules, not vibes.',
      },
      {
        criterion: 'Revenue formula is correct',
        weight: '25%',
        description: 'Net revenue uses units, price, and discount. Returns and invalid rows are handled.',
      },
      {
        criterion: 'Summaries match the data',
        weight: '25%',
        description: 'Category and region tables can be rebuilt from the CSV with the stated rules.',
      },
      {
        criterion: 'Recommendations follow the numbers',
        weight: '25%',
        description: 'Advice cites a category, region, or quality issue from this file.',
      },
    ],
    commonMistakes: [
      'Summing unit_price instead of units × price.',
      'Keeping returned = yes rows in revenue.',
      'Merging Electronics aliases without a log.',
      'Dropping blank region so the totals no longer match the file.',
    ],
    extension:
      'Add a month column from order_date and show month-over-month net revenue for Electronics only.',
    careerEvidence: {
      learning: 'Spreadsheet analysis of a dirty sales export',
      artifact: 'Cleaning log + category/region tables + three recommendations (paste or linked sheet)',
      skill: 'Spreadsheet analysis, data cleaning, business interpretation',
      evidence: 'A hiring manager can see how you treated dirty rows and what you advised',
    },
  },
  l12: {
    id: 'l12',
    title: 'Dashboard — one question Northwind can act on',
    scenario:
      'The operations lead will look at your dashboard for sixty seconds in a stand-up. They will not read a 12-page slide deck. You must pick one question the sales file can answer and design for that question.',
    objective:
      'Build a one-screen dashboard (Sheets or Power BI Desktop) that answers a single stated question with filters, a KPI, a comparison, and a trend.',
    datasetHref: '/content/data-analytics/northwind_sales.csv',
    datasetName: 'northwind_sales.csv (cleaned using your l6 rules)',
    instructions: [
      'Write the dashboard question in one sentence (example: “Which categories and regions drove net revenue in Jan–Jun 2026 after excluding invalid rows?”).',
      'Use a cleaned copy of northwind_sales.csv. State the cleaning rules on the dashboard or in a notes box.',
      'Include: (1) KPI for total net revenue, (2) comparison by category or region, (3) trend by month, (4) at least one filter (region, category, or channel).',
      'Default view must be readable without scrolling on a laptop. No decoration charts.',
      'Add a three-bullet insight box: what happened, why it might have happened, what to check next.',
    ],
    requiredOutput: [
      'The one-sentence question.',
      'Description of each visual and the field it uses.',
      'The insight box.',
      'A public link to the sheet/pbix if you have one, otherwise a structured text walkthrough of the layout.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'One question',
        weight: '20%',
        description: 'The dashboard is titled as a question, not “Sales Dashboard v3”.',
      },
      {
        criterion: 'KPI + comparison + trend + filter',
        weight: '30%',
        description: 'All four elements are present and use net revenue or a stated related measure.',
      },
      {
        criterion: 'Cleaning is visible',
        weight: '20%',
        description: 'The viewer can see what rows were excluded.',
      },
      {
        criterion: 'Insight is specific',
        weight: '30%',
        description: 'Bullets name a category, region, or month from this dataset.',
      },
    ],
    commonMistakes: [
      'Six unrelated charts.',
      'Using units as if they were revenue.',
      'No filter, so the stand-up cannot slice.',
      'Hiding the duplicate order and blank region.',
    ],
    extension:
      'Add a toggle or second page that isolates returned = yes rows so operations can see reverse-logistics volume separately.',
    careerEvidence: {
      learning: 'Dashboarding for a decision, not decoration',
      artifact: 'Dashboard file or layout write-up + insight box',
      skill: 'Dashboarding, measures vs dimensions, communication',
      evidence: 'A portfolio screenshot that answers one business question',
    },
  },
  l13: {
    id: 'l13',
    title: 'SQL analysis — Northwind sales questions',
    scenario:
      'Finance asked for a reproducible SQL notebook, not a screenshot of a pivot. They want queries they can re-run when July lands.',
    objective:
      'Load northwind_sales.csv into SQLite (or equivalent) and answer four questions with SQL you can paste and explain.',
    datasetHref: '/content/data-analytics/northwind_sales.csv',
    datasetName: 'northwind_sales.csv',
    instructions: [
      'Create a table sales with the CSV columns. Document your import (SQLite .mode csv, or a GUI).',
      'Write Q1: count of rows, distinct order_id, and count of duplicate order_id values.',
      'Write Q2: net revenue by category after mapping Elec. and electronics to Electronics, excluding units <= 0, unit_price <= 0, and returned = yes.',
      'Write Q3: net revenue by region, with blank region labelled Unknown.',
      'Write Q4: monthly net revenue (YYYY-MM from order_date) using the same valid-row rule as Q2.',
      'For each query: paste SQL, paste the result table, and write two sentences on what it means for the business.',
    ],
    requiredOutput: [
      'Four SQL queries.',
      'Four result tables.',
      'Business interpretation for each.',
      'A short note on how you handled category aliases and blank region.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Queries run as written',
        weight: '30%',
        description: 'SQL is complete enough to re-run on the CSV.',
      },
      {
        criterion: 'Valid-row rule is consistent',
        weight: '25%',
        description: 'Q2–Q4 use the same exclusions.',
      },
      {
        criterion: 'Duplicates and aliases are addressed',
        weight: '20%',
        description: 'Q1 finds the duplicate; Q2 maps category aliases.',
      },
      {
        criterion: 'Interpretation is commercial',
        weight: '25%',
        description: 'Comments talk about revenue and operations, not only SQL syntax.',
      },
    ],
    commonMistakes: [
      'SELECT * with no aggregation, then describing it as an analysis.',
      'JOIN when there is only one table.',
      'Filtering returned in Q2 but not Q4.',
      'Treating order_id as unique without checking.',
    ],
    extension:
      'Using a CASE channel bucket, compare online vs store net revenue by month.',
    careerEvidence: {
      learning: 'SQL analysis of a sales table',
      artifact: 'sql_analysis.sql (or pasted queries) + result tables + interpretation',
      skill: 'SQL, analytical reasoning, data-quality decisions',
      evidence: 'Reproducible queries a reviewer can run on the same CSV',
    },
  },
  l14: {
    id: 'l14',
    title: 'Capstone — Northwind commercial review (Jan–Jun 2026)',
    scenario:
      'Northwind’s managing director wants a 10-minute commercial review covering sales performance and whether the people structure (HR export) shows concentration risk. You are the analyst. There is no data-science team behind you. You must clean, analyse, visualise, and recommend — then produce a document you could show a hiring manager as a work sample. This is not a job offer and not a placement programme.',
    objective:
      'Deliver an end-to-end analyst pack: cleaning, spreadsheet and SQL evidence, a dashboard, findings, and recommendations.',
    datasetHref: '/content/data-analytics/northwind_sales.csv',
    datasetName: 'northwind_sales.csv and northwind_hr.csv',
    instructions: [
      'Reuse your cleaning rules from l6 and queries from l13. Improve them if you found errors.',
      'Sales questions you must answer: category mix of net revenue; region mix including Unknown; monthly trend; channel mix; effect of returns and invalid rows on headline revenue.',
      'HR questions you must answer: headcount by department (including blank); salary quality issues; whether any department is a single-person bottleneck among active staff.',
      'Do not invent attrition models. The HR file has no termination dates.',
      'Build or update a one-screen sales dashboard (from l12) and add a small HR snapshot table (headcount by department).',
      'Write a 1–2 page findings memo: situation, analysis, recommendations (three, each owned by a function: commercial, operations, people).',
      'Optional appendix: SQL and spreadsheet screenshots or pasted tables.',
    ],
    requiredOutput: [
      'Cleaning log for both files.',
      'Sales analysis tables (category, region, month, channel).',
      'HR snapshot table.',
      'Dashboard (file or layout write-up).',
      'Findings memo with three recommendations.',
      'A one-paragraph “what this work sample shows” blurb for Career OS.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'End-to-end coverage',
        weight: '20%',
        description: 'Cleaning, analysis, visual, and memo are all present.',
      },
      {
        criterion: 'Sales numbers are internally consistent',
        weight: '25%',
        description: 'Category + region + month views use the same valid-row definition.',
      },
      {
        criterion: 'HR is honest',
        weight: '15%',
        description: 'Quality issues are stated. No fake attrition or diversity claims.',
      },
      {
        criterion: 'Recommendations are actionable',
        weight: '25%',
        description: 'Each recommendation names an owner and a next measurement.',
      },
      {
        criterion: 'Portfolio clarity',
        weight: '15%',
        description: 'A stranger can understand the business question in the first paragraph.',
      },
    ],
    commonMistakes: [
      'Copy-pasting l6 without addressing HR.',
      'Promising machine learning.',
      'Recommendations that ignore the duplicate order and blank region.',
      'A dashboard with no memo, or a memo with no numbers.',
    ],
    extension:
      'Add a “if we had July data” section listing the three queries you would re-run on day one of next month.',
    careerEvidence: {
      learning: 'End-to-end commercial analysis',
      artifact:
        'Capstone memo + dashboard + SQL/spreadsheet appendix (the set you would send a hiring manager)',
      skill: 'Cleaning, SQL, spreadsheets, dashboarding, recommendations, presentation',
      evidence: 'A public work sample — not a certificate and not a placement',
    },
  },
};

export function getDaAssignment(lessonId: string): AssignmentBrief | undefined {
  return DA_ASSIGNMENTS[lessonId];
}
