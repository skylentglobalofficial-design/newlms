import type { CourseSyllabus, WorkspaceAdapter } from "./types.js"

function textOf(syllabus: CourseSyllabus): string {
  return [syllabus.title, ...syllabus.outcomes, ...syllabus.tools, ...syllabus.lessons.map((lesson) => `${lesson.title} ${lesson.exercise ?? ""}`)]
    .join(" ")
    .toLowerCase()
}

function exerciseCount(syllabus: CourseSyllabus, exercise: string): number {
  return syllabus.lessons.filter((lesson) => lesson.exercise === exercise).length
}

export const SQL_LAB_ADAPTER: WorkspaceAdapter = {
  id: "sql-lab",
  label: "Read-only SQL lab",
  requiredCapabilities: ["sql.readonly"],
  score(syllabus) {
    const exercises = exerciseCount(syllabus, "sql")
    const named = /\bsql\b/.test(textOf(syllabus)) ? 1 : 0
    return exercises * 3 + named
  },
}

export const CASE_STUDIO_ADAPTER: WorkspaceAdapter = {
  id: "case-studio",
  label: "Written case studio",
  requiredCapabilities: ["case.authored"],
  score(syllabus) {
    const exercises = exerciseCount(syllabus, "case")
    const named = /case notes|product case|problem framing|harbor desk/.test(textOf(syllabus)) ? 1 : 0
    return exercises * 3 + named
  },
}

export const NOTEBOOK_ADAPTER: WorkspaceAdapter = {
  id: "python-notebook",
  label: "Python notebook",
  requiredCapabilities: ["runtime.python"],
  score(syllabus) {
    const exercises = exerciseCount(syllabus, "notebook")
    const named = /python|pandas|numpy|notebook|jupyter/.test(textOf(syllabus)) ? 1 : 0
    return exercises * 3 + named
  },
}

export const FRONTEND_ADAPTER: WorkspaceAdapter = {
  id: "frontend-playground",
  label: "Frontend playground",
  requiredCapabilities: ["runtime.javascript"],
  score(syllabus) {
    const exercises = exerciseCount(syllabus, "frontend") + exerciseCount(syllabus, "api")
    const named = /html|css|javascript playground|react|api runner|full stack/.test(textOf(syllabus)) ? 1 : 0
    return exercises * 3 + named
  },
}

export const PROMPT_ADAPTER: WorkspaceAdapter = {
  id: "prompt-lab",
  label: "Prompt experiment",
  requiredCapabilities: ["runtime.model"],
  score(syllabus) {
    const exercises = exerciseCount(syllabus, "prompt")
    const named = /generative|large language|prompt experiment|\bllm\b/.test(textOf(syllabus)) ? 1 : 0
    return exercises * 3 + named
  },
}

export const EXAM_ADAPTER: WorkspaceAdapter = {
  id: "exam-bank",
  label: "Timed assessment",
  requiredCapabilities: ["assessment.timed"],
  score(syllabus) {
    const exercises = exerciseCount(syllabus, "exam")
    const named = /timed mock|question bank|exam preparation/.test(textOf(syllabus)) ? 1 : 0
    return exercises * 3 + named
  },
}

export function defaultWorkspaceAdapters(): WorkspaceAdapter[] {
  return [SQL_LAB_ADAPTER, CASE_STUDIO_ADAPTER, NOTEBOOK_ADAPTER, FRONTEND_ADAPTER, PROMPT_ADAPTER, EXAM_ADAPTER]
}
