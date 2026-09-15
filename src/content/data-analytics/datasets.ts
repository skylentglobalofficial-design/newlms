export type DatasetSpec = {
  filename: string
  href: string
  rows: number
  columns: { name: string; meaning: string }[]
  qualityIssues: string[]
  usedIn: string[]
  analysisQuestions: string[]
}

export const DATA_ANALYTICS_DATASETS: DatasetSpec[] = [
  {
    filename: "northwind_sales.csv",
    href: "/content/data-analytics/northwind_sales.csv",
    rows: 180,
    columns: [
      { name: "order_id", meaning: "Order identifier. Should be unique; it is not." },
      { name: "order_date", meaning: "Order date (YYYY-MM-DD), January–June 2026." },
      { name: "region", meaning: "North / South / East / West. Some rows are blank." },
      { name: "city", meaning: "City inside the region." },
      { name: "category", meaning: "Product category. Watch for Elec. and electronics vs Electronics." },
      { name: "product", meaning: "SKU name." },
      { name: "units", meaning: "Units sold. One row is negative." },
      { name: "unit_price", meaning: "List price in INR. One row is 0." },
      { name: "discount_pct", meaning: "Percent discount (0, 5, 10, or 15)." },
      { name: "cost_per_unit", meaning: "Unit cost in INR for margin." },
      { name: "returned", meaning: "yes or no." },
      { name: "channel", meaning: "store or online. Deterministic from order_id (id % 3 === 0 → online)." },
    ],
    qualityIssues: [
      "NW-10024 and NW-10089 have a blank region.",
      "NW-10018 uses category Elec.; NW-10042 uses electronics (and Filter Coffee is mis-categorised).",
      "NW-10055 has units = -2.",
      "NW-10122 has unit_price = 0.",
      "order_id NW-10013 appears twice (Jan and March rows).",
    ],
    usedIn: ["l1", "l2", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12", "l13", "l14", "l15"],
    analysisQuestions: [
      "Which category has the largest net revenue after excluding returns and invalid units?",
      "Did any region’s net revenue fall from Q1 (Jan–Mar) to Q2 (Apr–Jun)?",
      "What is month-over-month net revenue?",
    ],
  },
  {
    filename: "northwind_hr.csv",
    href: "/content/data-analytics/northwind_hr.csv",
    rows: 56,
    columns: [
      { name: "employee_id", meaning: "Staff identifier." },
      { name: "department", meaning: "Team. One row is blank." },
      { name: "role", meaning: "Job title." },
      { name: "hire_date", meaning: "Hire date." },
      { name: "work_mode", meaning: "onsite, hybrid, or remote." },
      { name: "monthly_salary_inr", meaning: "Monthly pay. One row is text with a thousands comma." },
      { name: "performance_rating", meaning: "Usually 2–5. One row is N/A." },
      { name: "attrition", meaning: "yes if the person left in the last 12 months." },
      { name: "region", meaning: "Region aligned to the sales file." },
    ],
    qualityIssues: [
      "E-107 has a blank department.",
      "E-119 has performance_rating N/A.",
      "E-133 monthly_salary_inr is quoted text 46,250 instead of a number.",
    ],
    usedIn: ["l2", "l8", "l14"],
    analysisQuestions: [
      "Which department has the highest attrition rate after handling blanks?",
      "Is attrition higher in regions where Q2 sales slowed?",
    ],
  },
]

export function datasetByFilename(filename: string) {
  return DATA_ANALYTICS_DATASETS.find((item) => item.filename === filename) ?? null
}
