/**
 * The learning-player plate and its lab result, drawn from the authored Data Analytics course.
 * Used by the homepage "How learning works" section (home/Repolish.tsx).
 */
import { AiMark } from "@/components/skylent/primitives"
import { NORTHWIND_PREVIEW } from "@/lib/northwind-preview"
import { formatInr } from "./artefacts"
import { courseFacts, PLATE_LESSON_ID } from "./course-facts"

/* ── Learning player replica ───────────────────────────────────────────────── */

/** The clauses lesson 7 opens with (src/content/data-analytics/lesson-text/l7.md). */
const LESSON_7_CLAUSES = [
  ["FROM", "which table"],
  ["WHERE", "which rows survive"],
  ["GROUP BY", "how to bucket remaining rows"],
  ["HAVING", "which groups survive"],
  ["SELECT", "which columns to return"],
  ["ORDER BY", "sort the result"],
] as const

export function PlayerPlate() {
  const facts = courseFacts()
  if (!facts) return null
  return (
    <div
      className="hm-plate hm-player"
      role="img"
      aria-label={`The Skylent learning player open on ${facts.title}, lesson ${facts.lessonNumber}: ${facts.current.title}. ${facts.done} of ${facts.total} lessons complete.`}
    >
      <div className="hm-player__head">
        <div className="hm-player__where">
          <span className="hm-player__course">{facts.title}</span>
          <span className="hm-player__module">
            Module {facts.currentModuleNumber} of {facts.stats.modules} · {facts.currentModule.title}
          </span>
        </div>
        <div className="hm-player__progress">
          <span className="hm-player__count">
            {facts.done} of {facts.total} complete · {facts.percent}%
          </span>
          <span className="hm-player__track">
            <span className="hm-player__fill" style={{ width: `${facts.percent}%` }} />
          </span>
        </div>
      </div>
      <div className="hm-player__cols">
        <div className="hm-player__rail">
          {facts.modules.map((module) => (
            <div key={module.id} className={`hm-player__mod hm-player__mod--${module.state}`}>
              <div className="hm-player__modhead">
                <span className="hm-player__n">{module.label}</span>
                <span className="hm-player__modtitle">{module.title}</span>
                <span className="hm-player__modstate">
                  {module.state === "complete" ? "Done" : `${module.done}/${module.lessons.length}`}
                </span>
              </div>
              {module.state === "current" ? (
                <div className="hm-player__lessons">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className={lesson.id === PLATE_LESSON_ID ? "hm-player__lesson hm-player__lesson--on" : "hm-player__lesson"}>
                      <span className="hm-player__n">{lesson.label}</span>
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="hm-player__body">
          <div className="hm-art-label">
            Lesson {facts.lessonNumber} · {facts.current.kind} · {facts.current.duration}
          </div>
          <div className="hm-player__title">{facts.current.title}</div>
          <p className="hm-player__line">
            SQL is a language for asking a table questions. Core clauses, in the order the engine thinks:
          </p>
          <div className="hm-player__clauses">
            {LESSON_7_CLAUSES.map(([clause, meaning], i) => (
              <div key={clause} className="hm-player__clause">
                <span className="hm-player__step">{i + 1}</span>
                <span className="hm-player__kw">{clause}</span>
                <span className="hm-player__meaning">{meaning}</span>
              </div>
            ))}
          </div>
          <div className="hm-player__foot">
            <AiMark className="hm-player__ai" />
            <span className="hm-player__next">Complete and continue</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The lab result that lesson's query produces: the work, beside the person and the system. */
export function ResultCard() {
  const { categories, netRevenue, netRevenueLabel, validRows, rows } = NORTHWIND_PREVIEW
  const top = categories[0]
  const share = Math.round((top.value / netRevenue) * 100)
  return (
    <div
      className="hm-plate hm-result"
      role="img"
      aria-label={`Northwind Lab result. ${top.name} leads with ${formatInr(top.value)}, ${share}% of ${netRevenueLabel} valid net revenue, from ${validRows} of ${rows} valid rows.`}
    >
      <div className="hm-art-label">Northwind Lab · result</div>
      <div className="hm-result__figure">{formatInr(top.value)}</div>
      <div className="hm-result__what">
        {top.name}, {share}% of {netRevenueLabel} valid net revenue
      </div>
      <div className="hm-result__bars">
        {categories.map((c, i) => (
          <span key={c.name} className={i === 0 ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${((c.value / top.value) * 100).toFixed(1)}%` }} />
        ))}
      </div>
      <div className="hm-result__meta">
        {validRows} of {rows} rows valid
      </div>
    </div>
  )
}
