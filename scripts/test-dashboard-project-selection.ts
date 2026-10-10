import { findProjectForCourse, type ProjectSummary } from "../src/lib/projects-api.ts"

const projects: ProjectSummary[] = [
  {
    id: "project-pm",
    projectType: "harbor-desk-case",
    courseSlug: "product-management",
    title: "Harbor Desk product case",
    status: "in_progress",
    progress: { complete: 2, total: 6 },
    updatedAt: "2026-10-10T09:00:00.000Z",
  },
  {
    id: "project-da",
    projectType: "northwind-commercial-review",
    courseSlug: "data-analytics",
    title: "Northwind Commercial Review",
    status: "in_progress",
    progress: { complete: 3, total: 6 },
    updatedAt: "2026-10-10T10:00:00.000Z",
  },
]

if (findProjectForCourse(projects, "data-analytics")?.id !== "project-da") {
  throw new Error("Dashboard should select the project for its active course")
}

if (findProjectForCourse(projects, "python-programming") !== null) {
  throw new Error("Dashboard must not show a project from another course")
}

console.log("dashboard-project-selection ok")