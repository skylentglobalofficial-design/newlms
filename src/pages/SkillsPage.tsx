import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseThumb, LearnFlow, PathwayThumb } from "../components/product/ProductLanguage"
import { courses } from "../data"
import { courseLessonStats } from "../lib/catalog-maturity"
import {
  LEARN_INTENTS,
  capabilitiesForIntent,
  isLearnIntentId,
  liveMatchesForIntent,
  type LearnIntentId,
  type LiveMatch,
} from "../lib/live-intents"
import "./SkillsPage.css"

const NEXT_FLOW = [
  { title: "Choose", copy: "Pick the skill you want to build.", kind: "learn" as const },
  { title: "Learn", copy: "Open the matching course.", kind: "practice" as const },
  { title: "Practise", copy: "Try the ideas on real tasks.", kind: "build" as const },
  { title: "Keep", copy: "Save what you produce as you go.", kind: "keep" as const },
]

function IntentVisual({ id }: { id: LearnIntentId }) {
  if (id === "data") {
    return (
      <span className="sk-intent-visual is-data" aria-hidden="true">
        <span style={{ height: "42%" }} />
        <span style={{ height: "70%" }} />
        <span style={{ height: "55%" }} />
        <span style={{ height: "88%" }} />
      </span>
    )
  }
  if (id === "software") {
    return (
      <span className="sk-intent-visual is-software" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    )
  }
  if (id === "ai") {
    return (
      <span className="sk-intent-visual is-ai" aria-hidden="true">
        <b />
        <b />
      </span>
    )
  }
  return (
    <span className="sk-intent-visual is-product" aria-hidden="true">
      <em />
      <em />
    </span>
  )
}

function IntentPicker({
  value,
  onChange,
}: {
  value: LearnIntentId | null
  onChange: (id: LearnIntentId) => void
}) {
  function move(index: number, delta: number) {
    const nextIndex = (index + delta + LEARN_INTENTS.length) % LEARN_INTENTS.length
    const next = LEARN_INTENTS[nextIndex]
    onChange(next.id)
    document.getElementById(`intent-${next.id}`)?.focus()
  }

  return (
    <div className="sk-intents" role="radiogroup" aria-label="What do you want to be able to do?">
      {LEARN_INTENTS.map((item, index) => {
        const selected = value === item.id
        return (
          <button
            key={item.id}
            id={`intent-${item.id}`}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? "sk-intent is-selected" : "sk-intent"}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault()
                move(index, 1)
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault()
                move(index, -1)
              } else if (event.key === "Home") {
                event.preventDefault()
                move(index, -index)
              } else if (event.key === "End") {
                event.preventDefault()
                move(index, LEARN_INTENTS.length - 1 - index)
              }
            }}
          >
            <IntentVisual id={item.id} />
            <span className="sk-intent-copy">
              <span className="sk-intent-label">{item.label}</span>
              <span className="sk-intent-question">{item.question}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function MatchCard({ match, featured }: { match: LiveMatch; featured: boolean }) {
  const kindLabel = match.kind === "programme" ? "Programme" : "Course"
  const course = match.kind === "course" ? courses.find((item) => item.slug === match.slug) : null
  const stats = course ? courseLessonStats(course) : null
  const honesty =
    match.depth === "authored"
      ? null
      : match.kind === "programme"
        ? "Programme listing — live teaching is thinner than advertised."
        : "Catalogue listing — thinner than Data Analytics."

  return (
    <article className={featured ? "sk-product is-featured" : "sk-product"}>
      {match.kind === "course" ? (
        <CourseThumb authored={match.depth === "authored"} />
      ) : (
        <PathwayThumb />
      )}
      <div className="sk-product-body">
        <p className="sk-product-meta">
          <span>{kindLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{match.note}</span>
          {match.duration ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{match.duration}</span>
            </>
          ) : null}
        </p>
        <h3 className="sk-match-title">{match.title}</h3>
        <p className="sk-match-summary">{match.summary}</p>
        <ul className="sk-tags">
          <li>{kindLabel}</li>
          {course ? <li>{course.category}</li> : null}
          {course ? <li>{course.level}</li> : null}
          {match.depth === "authored" ? <li>Northwind project</li> : <li>{match.note}</li>}
        </ul>
        {stats && match.depth === "authored" ? (
          <p className="sk-product-stats">
            {stats.lessonCount} lessons · {stats.quizCount} quizzes · {stats.assignmentCount} assignments
          </p>
        ) : null}
        {honesty ? <p className="sk-match-honesty">{honesty}</p> : null}
        <Link className={featured ? "sk-btn sk-btn-primary" : "sk-btn sk-btn-ghost"} to={match.to}>
          {match.actionLabel}
        </Link>
      </div>
    </article>
  )
}

function IntentResults({ intentId }: { intentId: LearnIntentId }) {
  const intent = LEARN_INTENTS.find((item) => item.id === intentId)
  const matches = liveMatchesForIntent(intentId)
  const capabilities = capabilitiesForIntent(intentId)
  const ready = matches.filter((match) => match.depth === "authored")
  const listings = matches.filter((match) => {
    if (match.depth === "authored") return false
    if (ready.length > 0 && match.kind === "programme") return false
    return true
  })
  const fromAuthored = ready.length > 0

  return (
    <div className="sk-results" id="your-direction">
      <section className="sk-explain" aria-labelledby="selected-intent-heading">
        <h2 id="selected-intent-heading">{intent?.label}</h2>
        <p className="sk-lead">{intent?.question}</p>
        {capabilities.length > 0 ? (
          <>
            <p className="sk-cap-intro">
              {fromAuthored ? "Build confidence with:" : "The catalogue lists these capabilities:"}
            </p>
            <ul className="sk-caps">
              {capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {!fromAuthored ? (
              <p className="sk-fine">
                These statements come from catalogue listings. This path is not as complete as Data Analytics.
              </p>
            ) : (
              <p className="sk-fine">Taken from the Data Analytics course outcomes.</p>
            )}
          </>
        ) : (
          <p className="sk-fine">No live curriculum statements are attached to this intent yet.</p>
        )}
      </section>

      <section className="sk-learning" aria-labelledby="matching-learning-heading">
        <h2 id="matching-learning-heading">
          {ready.length > 0 ? "Start with this course" : "What is live for this path"}
        </h2>

        {matches.length === 0 ? (
          <div className="sk-empty">
            <p className="sk-empty-title">Nothing live for this path yet.</p>
            <p className="sk-empty-copy">
              There is no open course or programme in the catalogue for this direction.
            </p>
            <Link className="sk-btn sk-btn-primary" to="/courses">
              Explore all courses
            </Link>
          </div>
        ) : (
          <>
            {ready.length === 0 ? (
              <p className="sk-fine sk-learning-note">
                Nothing as complete as Data Analytics is live for this path yet. These catalogue listings exist:
              </p>
            ) : null}
            <div className="sk-match-list">
              {ready.map((match) => (
                <MatchCard key={`${match.kind}-${match.slug}`} match={match} featured />
              ))}
              {listings.map((match) => (
                <MatchCard key={`${match.kind}-${match.slug}`} match={match} featured={false} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const intentId = useMemo(() => {
    const value = searchParams.get("intent")
    return isLearnIntentId(value) ? value : null
  }, [searchParams])

  function selectIntent(id: LearnIntentId) {
    setSearchParams({ intent: id })
  }

  return (
    <PageShell aurora={false}>
      <div className="skills-p4">
        <section className="sk-hero">
          <div className="sk-rail">
            <h1>What do you want to be able to do?</h1>
            <p className="sk-hero-lead">
              Start with the skill you want to build. We'll show you the learning that actually matches it.
            </p>
            <IntentPicker value={intentId} onChange={selectIntent} />
          </div>
        </section>

        {intentId ? (
          <section className="sk-panel">
            <div className="sk-rail">
              <IntentResults intentId={intentId} />
            </div>
          </section>
        ) : (
          <section className="sk-panel sk-idle" aria-labelledby="idle-heading">
            <div className="sk-rail">
              <h2 id="idle-heading" className="sk-idle-title">
                Choose a direction to see what you would actually learn.
              </h2>
              <p className="sk-fine">
                Skills is a starting point, not a second course catalogue. Pick an intent, then open the matching course.
              </p>
              <Link className="sk-text-link" to="/courses">
                Explore all courses
              </Link>
            </div>
          </section>
        )}

        <section className="sk-next" aria-labelledby="next-heading">
          <div className="sk-rail">
            <h2 id="next-heading">Choose. Learn. Practise. Keep the work.</h2>
            <div className="sk-flow-wrap">
              <LearnFlow steps={NEXT_FLOW} />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
