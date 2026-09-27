import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PageShell } from "../../components/shared"
import {
  ACADEMIC_OPTIONS,
  DIRECTION_OPTIONS,
  EDUCATION_OPTIONS,
  GAP_OPTIONS,
  INTEREST_OPTIONS,
  OUTCOME_OPTIONS,
  PATH_STAGES,
  SKILL_OPTIONS,
  TIMELINE_OPTIONS,
} from "../../lib/path/constants"
import { completePathDiagnosis, loadPathState, savePathDraft } from "../../lib/path/storage"
import type {
  AcademicBackground,
  CareerDirection,
  CurrentEducation,
  InterestArea,
  PathDiagnosis,
  PathFlowDraft,
  SkillLevel,
  TargetOutcome,
  TimelineConstraint,
} from "../../lib/path/types"
import "./PathPages.css"

const DEFAULT_DRAFT: PathFlowDraft = {
  academicBackground: "college",
  currentEducation: "undergraduate",
  interests: [],
  existingSkills: "some_exposure",
  careerDirection: "professional_role",
  strengths: "",
  gaps: [],
  gapDetail: "",
  directionDetail: "",
  targetOutcome: "decide_next_step",
  timeline: "six_months",
}

function mergeDraft(stored: PathFlowDraft): PathFlowDraft {
  return { ...DEFAULT_DRAFT, ...stored, interests: stored.interests ?? [], gaps: stored.gaps ?? [] }
}

function toggleInterest(list: InterestArea[], value: InterestArea): InterestArea[] {
  if (value === "still_exploring") return ["still_exploring"]
  const withoutExplore = list.filter((row) => row !== "still_exploring")
  if (withoutExplore.includes(value)) {
    return withoutExplore.filter((row) => row !== value)
  }
  return [...withoutExplore, value]
}

function toggleGap(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((row) => row !== value) : [...list, value]
}

function stageValid(step: number, draft: PathFlowDraft): string | null {
  const stage = PATH_STAGES[step]
  if (!stage) return "Unknown step"
  switch (stage.id) {
    case "academic":
      if (!draft.academicBackground || !draft.currentEducation) return "Choose your academic context."
      return null
    case "interests":
      if (!draft.interests?.length) return "Select at least one interest."
      return null
    case "skills":
      if (!draft.existingSkills) return "Choose the option closest to your ability today."
      return null
    case "direction":
      if (!draft.careerDirection) return "Choose a direction type."
      if (!draft.directionDetail?.trim()) return "Add a few words about where you want to go."
      return null
    case "gaps":
      if (!draft.gaps?.length && !draft.gapDetail?.trim()) {
        return "Select gap themes or describe what feels missing."
      }
      return null
    case "outcome":
      if (!draft.targetOutcome) return "Choose a target outcome."
      return null
    case "timeline":
      if (!draft.timeline) return "Choose a timeline."
      return null
    default:
      return null
  }
}

function draftToDiagnosis(draft: PathFlowDraft): PathDiagnosis {
  return {
    academicBackground: draft.academicBackground ?? "college",
    currentEducation: draft.currentEducation ?? "undergraduate",
    interests: draft.interests ?? [],
    existingSkills: draft.existingSkills ?? "some_exposure",
    careerDirection: draft.careerDirection ?? "professional_role",
    strengths: draft.strengths?.trim() ?? "",
    gaps: draft.gaps ?? [],
    gapDetail: draft.gapDetail?.trim() ?? "",
    directionDetail: draft.directionDetail?.trim() ?? "",
    targetOutcome: draft.targetOutcome ?? "decide_next_step",
    timeline: draft.timeline ?? "six_months",
    completedAt: new Date().toISOString(),
  }
}

export default function PathPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<PathFlowDraft>(DEFAULT_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = loadPathState()
    setDraft(mergeDraft(stored.draft))
    setStep(Math.min(Math.max(stored.flowStep, 0), PATH_STAGES.length - 1))
    setReady(true)
  }, [])

  const persist = useCallback((nextStep: number, nextDraft: PathFlowDraft) => {
    savePathDraft(nextStep, nextDraft)
  }, [])

  const updateDraft = useCallback(
    (patch: Partial<PathFlowDraft>) => {
      setDraft((current) => {
        const next = { ...current, ...patch }
        persist(step, next)
        return next
      })
      setError(null)
    },
    [persist, step],
  )

  const stage = PATH_STAGES[step]
  const progressPct = useMemo(() => ((step + 1) / PATH_STAGES.length) * 100, [step])
  const stored = ready ? loadPathState() : null
  const hasSavedResult = Boolean(stored?.roadmap && stored?.diagnosis)

  function goBack() {
    if (step === 0) return
    const nextStep = step - 1
    setStep(nextStep)
    persist(nextStep, draft)
    setError(null)
  }

  function goNext() {
    const validation = stageValid(step, draft)
    if (validation) {
      setError(validation)
      return
    }
    if (step >= PATH_STAGES.length - 1) {
      setSubmitting(true)
      const diagnosis = draftToDiagnosis(draft)
      completePathDiagnosis(diagnosis)
      navigate("/path/result")
      return
    }
    const nextStep = step + 1
    setStep(nextStep)
    persist(nextStep, draft)
    setError(null)
  }

  function restartFlow() {
    const reset = { ...DEFAULT_DRAFT }
    setDraft(reset)
    setStep(0)
    persist(0, reset)
    setError(null)
  }

  if (!ready) {
    return (
      <PageShell aurora={false}>
        <main className="skylent-path-flow" aria-busy="true">
          <div className="skylent-path-flow__rail">
            <p className="skylent-path-flow__kicker">Skylent Path</p>
            <p style={{ color: "#5b5d61", marginTop: 16 }}>Loading your path…</p>
          </div>
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell aurora={false}>
      <main className="skylent-path-flow">
        <div className="skylent-path-flow__rail">
          <div className="skylent-path-flow__top">
            <p className="skylent-path-flow__kicker">Skylent Path · Diagnose</p>
            <div className="skylent-path-flow__progress" aria-label="Progress">
              <div className="skylent-path-flow__progress-meta">
                <span>
                  Stage {stage.number} of {PATH_STAGES.length}
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="skylent-path-flow__progress-bar">
                <i style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {hasSavedResult ? (
            <div className="skylent-path-flow__resume">
              You already have a path saved.{" "}
              <Link to="/path/result">View your result</Link>
              {" · "}
              <button type="button" className="skylent-path-flow__restart" onClick={restartFlow}>
                Start fresh
              </button>
            </div>
          ) : null}

          <div className="skylent-path-flow__card" key={stage.id}>
            <p className="skylent-path-flow__kicker">Stage {String(stage.number).padStart(2, "0")}</p>
            <h1>{stage.title}</h1>
            <p>{stage.subtitle}</p>

            {stage.id === "academic" ? (
              <>
                <span className="skylent-path-flow__field-label">Context</span>
                <div className="skylent-path-flow__chips" role="group" aria-label="Academic background">
                  {ACADEMIC_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`skylent-path-flow__chip${draft.academicBackground === option.value ? " is-selected" : ""}`}
                      aria-pressed={draft.academicBackground === option.value}
                      onClick={() => updateDraft({ academicBackground: option.value as AcademicBackground })}
                    >
                      {option.label}
                      <small>{option.hint}</small>
                    </button>
                  ))}
                </div>
                <span className="skylent-path-flow__field-label">Current education</span>
                <div className="skylent-path-flow__chips" role="group" aria-label="Current education">
                  {EDUCATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`skylent-path-flow__chip${draft.currentEducation === option.value ? " is-selected" : ""}`}
                      aria-pressed={draft.currentEducation === option.value}
                      onClick={() => updateDraft({ currentEducation: option.value as CurrentEducation })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {stage.id === "interests" ? (
              <div className="skylent-path-flow__chips" role="group" aria-label="Interests">
                {INTEREST_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`skylent-path-flow__chip${draft.interests?.includes(option.value) ? " is-selected" : ""}`}
                    aria-pressed={draft.interests?.includes(option.value)}
                    onClick={() =>
                      updateDraft({ interests: toggleInterest(draft.interests ?? [], option.value) })
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {stage.id === "skills" ? (
              <>
                <div className="skylent-path-flow__chips" role="radiogroup" aria-label="Existing skills">
                  {SKILL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`skylent-path-flow__chip${draft.existingSkills === option.value ? " is-selected" : ""}`}
                      aria-pressed={draft.existingSkills === option.value}
                      onClick={() => updateDraft({ existingSkills: option.value as SkillLevel })}
                    >
                      {option.label}
                      <small>{option.hint}</small>
                    </button>
                  ))}
                </div>
                <label className="skylent-path-flow__field-label" htmlFor="path-strengths">
                  Strengths (optional)
                </label>
                <input
                  id="path-strengths"
                  className="skylent-path-flow__input"
                  value={draft.strengths ?? ""}
                  onChange={(event) => updateDraft({ strengths: event.target.value })}
                  placeholder="e.g. writing, maths, teaching, sales, coding basics…"
                  maxLength={200}
                />
              </>
            ) : null}

            {stage.id === "direction" ? (
              <>
                <div className="skylent-path-flow__chips" role="radiogroup" aria-label="Career direction">
                  {DIRECTION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`skylent-path-flow__chip${draft.careerDirection === option.value ? " is-selected" : ""}`}
                      aria-pressed={draft.careerDirection === option.value}
                      onClick={() => updateDraft({ careerDirection: option.value as CareerDirection })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <label className="skylent-path-flow__field-label" htmlFor="path-direction-detail">
                  In your words
                </label>
                <input
                  id="path-direction-detail"
                  className="skylent-path-flow__input"
                  value={draft.directionDetail ?? ""}
                  onChange={(event) => updateDraft({ directionDetail: event.target.value })}
                  placeholder="e.g. data analyst, UPSC, AI research, my own SaaS…"
                  maxLength={160}
                />
              </>
            ) : null}

            {stage.id === "gaps" ? (
              <>
                <div className="skylent-path-flow__chips" role="group" aria-label="Gap themes">
                  {GAP_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`skylent-path-flow__chip${draft.gaps?.includes(option) ? " is-selected" : ""}`}
                      aria-pressed={draft.gaps?.includes(option)}
                      onClick={() => updateDraft({ gaps: toggleGap(draft.gaps ?? [], option) })}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <label className="skylent-path-flow__field-label" htmlFor="path-gap-detail">
                  Anything else? (optional)
                </label>
                <textarea
                  id="path-gap-detail"
                  className="skylent-path-flow__textarea"
                  value={draft.gapDetail ?? ""}
                  onChange={(event) => updateDraft({ gapDetail: event.target.value })}
                  placeholder="What feels missing when you compare yourself to where you want to be?"
                  maxLength={400}
                />
              </>
            ) : null}

            {stage.id === "outcome" ? (
              <div className="skylent-path-flow__chips" role="radiogroup" aria-label="Target outcome">
                {OUTCOME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`skylent-path-flow__chip${draft.targetOutcome === option.value ? " is-selected" : ""}`}
                    aria-pressed={draft.targetOutcome === option.value}
                    onClick={() => updateDraft({ targetOutcome: option.value as TargetOutcome })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {stage.id === "timeline" ? (
              <div className="skylent-path-flow__chips" role="radiogroup" aria-label="Timeline">
                {TIMELINE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`skylent-path-flow__chip${draft.timeline === option.value ? " is-selected" : ""}`}
                    aria-pressed={draft.timeline === option.value}
                    onClick={() => updateDraft({ timeline: option.value as TimelineConstraint })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {error ? <div className="skylent-path-flow__error">{error}</div> : null}

            <div className="skylent-path-flow__nav">
              {step > 0 ? (
                <button type="button" className="skylent-path-flow__back" onClick={goBack}>
                  Back
                </button>
              ) : null}
              <button
                type="button"
                className="skylent-path-flow__next"
                onClick={goNext}
                disabled={submitting}
              >
                {step >= PATH_STAGES.length - 1 ? "Build my path" : "Continue"}
                <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="skylent-path-flow__restart" onClick={restartFlow}>
                Restart
              </button>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  )
}
