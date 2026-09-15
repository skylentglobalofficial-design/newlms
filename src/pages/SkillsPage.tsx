import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import {
  LEARN_INTENTS,
  capabilitiesForIntent,
  isLearnIntentId,
  liveMatchesForIntent,
  type LearnIntentId,
  type LiveMatch,
} from "../lib/live-intents"
import "./SkillsPage.css"

const NEXT_STEPS = [
  { label: "Choose", detail: "Pick the skill you want to build." },
  { label: "Learn", detail: "Open the matching course." },
  { label: "Practise", detail: "Try the ideas on real tasks." },
  { label: "Keep the work", detail: "Save what you produce as you go." },
] as const

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
            <span className="sk-intent-mark" aria-hidden="true">
              {selected ? "●" : "○"}
            </span>
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
  const honesty =
    match.depth === "authored"
      ? null
      : match.kind === "programme"
        ? "Programme listing — live teaching is thinner than advertised."
        : "Catalogue listing — thinner than Data Analytics."

  return (
    <article className={featured ? "sk-match sk-match-featured" : "sk-match"}>
      <div className="sk-match-body">
        <p className="sk-match-meta">
          <span>{kindLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{match.note}</span>
        </p>
        <h3 className="sk-match-title">{match.title}</h3>
        <p className="sk-match-summary">{match.summary}</p>
        {honesty ? <p className="sk-match-honesty">{honesty}</p> : null}
      </div>
      <Link className={featured ? "sk-btn sk-btn-primary" : "sk-btn sk-btn-ghost"} to={match.to}>
        {match.actionLabel}
      </Link>
    </article>
  )
}

function IntentResults({ intentId }: { intentId: LearnIntentId }) {
  const intent = LEARN_INTENTS.find((item) => item.id === intentId)
  const matches = liveMatchesForIntent(intentId)
  const capabilities = capabilitiesForIntent(intentId)
  const ready = matches.filter((match) => match.depth === "authored")
  const listings = matches.filter((match) => match.depth !== "authored")
  const fromAuthored = ready.length > 0

  return (
    <div className="sk-results" id="your-direction">
      <section className="sk-explain" aria-labelledby="selected-intent-heading">
        <p className="sk-label">What you want to do</p>
        <h2 id="selected-intent-heading">{intent?.label}</h2>
        <p className="sk-lead">{intent?.question}</p>

        <p className="sk-label sk-label-follow">What that means you need to learn</p>
        {capabilities.length > 0 ? (
          <>
            <p className="sk-cap-intro">
              {fromAuthored
                ? "Build confidence with:"
                : "The catalogue lists these capabilities:"}
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
        <p className="sk-label">Matching learning</p>
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
            <p className="sk-label">Learn</p>
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
            <p className="sk-label">What happens next</p>
            <h2 id="next-heading">Choose → Learn → Practise → Keep the work</h2>
            <ol className="sk-next-row">
              {NEXT_STEPS.map((step) => (
                <li key={step.label}>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
