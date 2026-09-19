import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { HarborDeskWorkspace, NorthwindWorkspace } from "../components/product/ProductLanguage"
import { courses } from "../data"
import { courseLessonStats, coursePracticeGroups } from "../lib/catalog-maturity"
import { courseProductProfile } from "../lib/course-product"
import {
  LEARN_INTENTS,
  capabilitiesForIntent,
  isLearnIntentId,
  liveMatchesForIntent,
  type LearnIntentId,
  type LiveMatch,
} from "../lib/live-intents"
import "./SkillsPage.css"

const STAGES = [
  { step: "01", label: "Capability", ask: "What do you want to be able to do?" },
  { step: "02", label: "Learning", ask: "What do you open to learn it?" },
  { step: "03", label: "Practice", ask: "Where do you try it for real?" },
  { step: "04", label: "Evidence", ask: "What do you have afterwards?" },
] as const

/**
 * The four stages resolved against real content for one intent. Every field comes
 * from an authored course; when an intent has no authored course the stages stay
 * empty on purpose rather than borrowing another direction's material.
 */
function intentJourney(id: LearnIntentId) {
  const matches = liveMatchesForIntent(id)
  const authored = matches.find((match) => match.depth === "authored") ?? null
  const course = authored ? courses.find((row) => row.slug === authored.slug) : null
  const profile = course ? courseProductProfile(course.slug) : null
  const stats = course ? courseLessonStats(course) : null
  const groups = course ? coursePracticeGroups(course) : null
  const capstone = groups?.capstone[0] ?? null

  return {
    capabilities: capabilitiesForIntent(id),
    authored,
    course,
    profile,
    stats,
    checks: groups?.practice.length ?? 0,
    assignments: groups?.assignments.length ?? 0,
    lab: profile?.lab ?? null,
    labOmission: profile?.labOmission ?? null,
    evidence: capstone ? capstone.title.replace(/^capstone\s*[—–-]\s*/i, "") : null,
    material: profile?.datasets[0]?.filename ?? null,
    listings: matches.filter((match) => match.depth !== "authored"),
  }
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
        const authored = liveMatchesForIntent(item.id).some((match) => match.depth === "authored")
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
            <span className="sk-intent-label">{item.label}</span>
            <span className="sk-intent-question">{item.question}</span>
            <span className={authored ? "sk-intent-state is-ready" : "sk-intent-state"}>
              {authored ? "Authored course" : "Catalogue listing only"}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function StageHead({ index }: { index: number }) {
  const stage = STAGES[index]
  return (
    <header className="sk-stage-head">
      <p className="sk-stage-step">{stage.step}</p>
      <p className="sk-stage-label">{stage.label}</p>
    </header>
  )
}

/** The progression with nothing chosen yet: explains the model without faking content. */
function StageModel() {
  return (
    <ol className="sk-stages is-model" aria-label="How a skill becomes evidence">
      {STAGES.map((stage, index) => (
        <li className="sk-stage" key={stage.step}>
          <StageHead index={index} />
          <p className="sk-stage-ask">{stage.ask}</p>
        </li>
      ))}
    </ol>
  )
}

function IntentJourney({ intentId }: { intentId: LearnIntentId }) {
  const intent = LEARN_INTENTS.find((item) => item.id === intentId)
  const journey = intentJourney(intentId)
  const { authored, course, stats } = journey

  return (
    <div className="sk-journey" id="your-direction">
      <header className="sk-journey-head">
        <h2 id="selected-intent-heading">{intent?.label}</h2>
        <p className="sk-journey-ask">{intent?.question}</p>
      </header>

      <ol className="sk-stages" aria-labelledby="selected-intent-heading">
        <li className="sk-stage">
          <StageHead index={0} />
          {journey.capabilities.length > 0 ? (
            <ul className="sk-stage-caps">
              {journey.capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="sk-stage-empty">No curriculum statements are attached to this direction yet.</p>
          )}
          <p className="sk-stage-source">
            {authored ? `From the ${authored.title} course outcomes.` : "From catalogue listings."}
          </p>
        </li>

        <li className="sk-stage">
          <StageHead index={1} />
          {authored && course && stats ? (
            <>
              <p className="sk-stage-title">{authored.title}</p>
              <dl className="sk-stage-facts">
                <div>
                  <dt>Modules</dt>
                  <dd>{stats.moduleCount}</dd>
                </div>
                <div>
                  <dt>Lessons</dt>
                  <dd>{stats.lessonCount}</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>{course.level}</dd>
                </div>
              </dl>
              <Link className="sk-btn sk-btn-primary" to={authored.to}>
                Open this course
              </Link>
            </>
          ) : (
            <p className="sk-stage-empty">
              Nothing authored end to end yet. The catalogue lists outlines for this direction, not finished
              teaching.
            </p>
          )}
        </li>

        <li className="sk-stage">
          <StageHead index={2} />
          {authored ? (
            <>
              <ul className="sk-stage-list">
                <li>
                  <strong>{journey.checks}</strong> knowledge checks
                </li>
                <li>
                  <strong>{journey.assignments}</strong> applied assignments
                </li>
              </ul>
              {journey.lab ? (
                <p className="sk-stage-note">
                  <span>Lab in Skylent OS · after enrol</span>
                  {journey.lab.note}
                </p>
              ) : journey.labOmission ? (
                <p className="sk-stage-note is-quiet">{journey.labOmission}</p>
              ) : null}
            </>
          ) : (
            <p className="sk-stage-empty">Practice is only built where a course is authored.</p>
          )}
        </li>

        <li className="sk-stage">
          <StageHead index={3} />
          {journey.evidence ? (
            <>
              <p className="sk-stage-title">{journey.evidence}</p>
              {journey.material ? (
                <p className="sk-stage-note is-quiet">
                  Produced against <code>{journey.material}</code>
                </p>
              ) : null}
              <p className="sk-stage-source">
                Kept in your workspace and can be carried into Career OS.
              </p>
            </>
          ) : (
            <p className="sk-stage-empty">No work sample exists for this direction yet.</p>
          )}
        </li>
      </ol>

      {authored && journey.profile ? (
        <div className="sk-specimen">
          <p className="sk-specimen-caption">The work sample you finish with</p>
          {journey.profile.visual === "harbor-desk" ? (
            <HarborDeskWorkspace compact meta="harbor-desk-case.md · 4 interviews" />
          ) : (
            <NorthwindWorkspace compact />
          )}
        </div>
      ) : null}

      {journey.listings.length > 0 ? (
        <section className="sk-also" aria-labelledby="sk-also-title">
          <h3 id="sk-also-title">Also listed for this direction</h3>
          <p className="sk-fine">
            Catalogue outlines. They open a syllabus, not the authored teaching shown above.
          </p>
          <ul className="sk-also-list">
            {journey.listings.map((match: LiveMatch) => (
              <li key={`${match.kind}-${match.slug}`}>
                <Link to={match.to}>
                  <span className="sk-also-kind">{match.kind === "programme" ? "Programme" : "Course"}</span>
                  <strong>{match.title}</strong>
                  <span className="sk-also-note">{match.duration}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
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
            <p className="sk-eyebrow">START FROM A GOAL</p>
            <h1>What do you want to be able to do?</h1>
            <p className="sk-hero-lead">
              Pick a direction. Skylent shows what you would learn, where you would practise it, and what you
              would have to show afterwards &mdash; using only the teaching that exists today.
            </p>
            <IntentPicker value={intentId} onChange={selectIntent} />
          </div>
        </section>

        <section className="sk-panel">
          <div className="sk-rail">
            {intentId ? (
              <IntentJourney intentId={intentId} />
            ) : (
              <div className="sk-idle">
                <h2 id="idle-heading" className="sk-idle-title">
                  Every direction runs through the same four stages.
                </h2>
                <p className="sk-fine sk-idle-lead">
                  Choose a direction above to see it filled in with the real course, the real practice, and the
                  real work sample. Two of the four directions have authored teaching today.
                </p>
                <StageModel />
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
