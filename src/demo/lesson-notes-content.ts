/** Seed-source copy for demo lesson notes (DB is authoritative at runtime). */
export const DEMO_LESSON_NOTES: Record<string, Record<string, { title: string; paragraphs: string[] }>> = {
  "data-analytics": {
    l2: {
      title: "The Analytics Mindset",
      paragraphs: [
        "Data analytics is not only about tools — it is a way of thinking. Analysts start with a clear business question, identify what evidence would answer it, and only then choose spreadsheets, SQL, or dashboards.",
        "A strong analytics mindset balances curiosity with skepticism. You question data quality, define metrics carefully, and separate correlation from causation before recommending action.",
        "In this demo lesson, use the reading notes below and any instructor materials to reflect on how you would frame an analytics problem for a retail or operations team.",
      ],
    },
    l8: {
      title: "SQL Notes & Reference",
      paragraphs: [
        "SQL (Structured Query Language) is the standard way to query relational databases. SELECT retrieves columns, WHERE filters rows, and JOIN combines tables on shared keys.",
        "Common patterns for analysts include aggregations (COUNT, SUM, AVG), GROUP BY for summaries, and HAVING to filter grouped results.",
        "Practice writing queries that answer one business question at a time — for example, monthly revenue by product category or customers with repeat purchases.",
      ],
    },
  },
}

export function getDemoLessonNotes(courseSlug: string, lessonKey: string) {
  return DEMO_LESSON_NOTES[courseSlug]?.[lessonKey] ?? null
}

/** @deprecated Runtime learner delivery uses DB-backed notes via LMS API. */
