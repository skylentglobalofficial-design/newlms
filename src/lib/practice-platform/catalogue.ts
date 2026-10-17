import type { CourseSyllabus } from "./types"
import { provisionCourse } from "./provision"
import type { WorkspaceManifest } from "./types"

/** Syllabi the platform can classify today. These are authored inputs, not inferred marketing copy. */
export const CATALOGUE_SYLLABI: readonly CourseSyllabus[] = [
  {
    courseSlug: "data-analytics",
    programmeSlug: "data-analytics-pro",
    title: "Data Analytics",
    outcomes: ["Write practical SQL queries against business tables"],
    tools: ["SQL", "Spreadsheets"],
    datasets: ["northwind_sales.csv"],
    lessons: [
      { id: "l1", title: "What is Data Analytics?", type: "notes", exercise: "written" },
      { id: "l4", title: "Spreadsheet tables, types, and filters", type: "notes", exercise: "spreadsheet" },
      { id: "l6", title: "Spreadsheet analysis", type: "assignment", exercise: "spreadsheet" },
      { id: "l7", title: "SQL SELECT, WHERE, and aggregates", type: "notes", exercise: "sql" },
      { id: "l8", title: "SQL joins and data-quality checks", type: "notes", exercise: "sql" },
      { id: "l9", title: "SQL check", type: "quiz", exercise: "sql" },
      { id: "l10", title: "Dashboards that answer one question", type: "notes", exercise: "dashboard" },
      { id: "l12", title: "Dashboard assignment", type: "assignment", exercise: "dashboard" },
      { id: "l13", title: "SQL analysis", type: "assignment", exercise: "sql" },
      { id: "l14", title: "Capstone", type: "assignment", exercise: "sql" },
    ],
  },
  {
    courseSlug: "product-management",
    programmeSlug: "product-management",
    title: "Product Management",
    outcomes: ["Frame a product problem with evidence"],
    tools: ["case notes"],
    lessons: [
      { id: "l1", title: "What product management is for", type: "notes", exercise: "written" },
      { id: "l6", title: "Research note", type: "assignment", exercise: "case" },
      { id: "l7", title: "Problem statements", type: "notes", exercise: "case" },
      { id: "l12", title: "Priority memo", type: "assignment", exercise: "case" },
      { id: "l14", title: "Harbor Desk product case", type: "assignment", exercise: "case" },
    ],
  },
  {
    courseSlug: "data-science-ai",
    programmeSlug: "data-science-ai",
    title: "Data Science & AI",
    outcomes: ["Explore a dataset and evaluate a model"],
    tools: ["Python", "pandas", "notebook"],
    lessons: [{ id: "l1", title: "Exploratory analysis", type: "assignment", exercise: "notebook" }],
  },
  {
    courseSlug: "full-stack",
    programmeSlug: "full-stack",
    title: "Full Stack Development",
    outcomes: ["Build a page and call an API"],
    tools: ["HTML", "CSS", "JavaScript playground"],
    lessons: [{ id: "l1", title: "Layout exercise", type: "assignment", exercise: "frontend" }],
  },
  {
    courseSlug: "generative-ai-program",
    programmeSlug: "generative-ai-program",
    title: "Generative AI",
    outcomes: ["Run a prompt experiment"],
    tools: ["generative model"],
    lessons: [{ id: "l1", title: "Prompt experiment", type: "assignment", exercise: "prompt" }],
  },
  {
    courseSlug: "sql-certificate",
    programmeSlug: "sql-certificate",
    title: "SQL for Business Analytics",
    outcomes: ["Write SQL against a business table"],
    tools: ["SQL"],
    lessons: [{ id: "l1", title: "SELECT practice", type: "assignment", exercise: "sql" }],
    datasets: [],
  },
]

export function provisionCatalogue(): WorkspaceManifest[] {
  return CATALOGUE_SYLLABI.map((syllabus) => provisionCourse(syllabus))
}
