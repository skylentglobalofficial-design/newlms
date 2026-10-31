import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import { getMultiTrackPracticePrompt, isMultiTrackAuthoredCourse } from "./multi-track-packs"

/** First-question prompts for showcase copy only — no answer keys or explanations. */
const PRACTICE_PROMPTS: Record<string, Record<string, string>> = {
  [FLAGSHIP_COURSE_SLUG]: {
    l3: 'A store lead asks: “Are we doing well?” Why is that a weak analytics question for northwind_sales.csv?',
  },
  [PRODUCT_MANAGEMENT_SLUG]: {
    l3: 'A store lead says: “Build us a shared inbox.” Why is that a weak product brief for Harbor Desk?',
  },
}

export function getPracticeQuizPrompt(
  courseSlug: string | undefined,
  lessonId: string | undefined,
): string | null {
  if (!courseSlug || !lessonId) return null
  if (isMultiTrackAuthoredCourse(courseSlug)) return getMultiTrackPracticePrompt(courseSlug, lessonId)
  return PRACTICE_PROMPTS[courseSlug]?.[lessonId] ?? null
}
