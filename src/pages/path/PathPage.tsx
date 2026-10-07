import { useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { ArrowRight } from "../../components/skylent/primitives"
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
import { completePathDiagnosis, loadPathState, resetPathState, savePathDraft } from "../../lib/path/storage"
import { resolvePathFormBootstrap } from "../../lib/path/nav"
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
import { PathProgress, PathSummary, PathTruthNote, type PathSummaryRow } from "./PathJourneyVisual"
import { PATH_V2_INTRO, PATH_V2_STAGE_HEADLINE } from "./pathV2Copy"
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

function labelOf<T extends string>(options: { value: T; label: string }[], value: T | undefined): string {
  return options.find((row) => row.value === value)?.label ?? ""
}

/**
 * Rows for the "what you have told us so far" card. Only stages the learner has
 * continued past are listed, so a pre-selected option never reads as an answer.
 */
function summaryRows(step: number, draft: PathFlowDraft): PathSummaryRow[] {
  const rows: PathSummaryRow[] = []
  PATH_STAGES.slice(0, step).forEach((stage) => {
    const label = PATH_V2_STAGE_HEADLINE[stage.id].short
    let value = ""
    let note = ""
    switch (stage.id) {
      case "academic":
        value = [labelOf(ACADEMIC_OPTIONS, draft.academicBackground), labelOf(EDUCATION_OPTIONS, draft.currentEducation)]
          .filter(Boolean)
          .join(" · ")
        break
      case "interests":
        value = (draft.interests ?? []).map((row) => labelOf(INTEREST_OPTIONS, row)).filter(Boolean).join(", ")
        break
      case "skills":
        value = labelOf(SKILL_OPTIONS, draft.existingSkills)
        note = draft.strengths?.trim() ? `Strengths: ${draft.strengths.trim()}` : ""
        break
      case "direction":
        value = labelOf(DIRECTION_OPTIONS, draft.careerDirection)
        note = draft.directionDetail?.trim() ?? ""
        break
      case "gaps":
        value = (draft.gaps ?? []).join(", ")
        note = draft.gapDetail?.trim() ?? ""
        if (!value) {
          value = note
          note = ""
        }
        break
      case "outcome":
        value = labelOf(OUTCOME_OPTIONS, draft.targetOutcome)
        break
      case "timeline":
        value = labelOf(TIMELINE_OPTIONS, draft.timeline)
        break
    }
    if (value) rows.push({ n: stage.number, label, value, note: note || undefined })
  })
  return rows
}

function PathChoiceRow({
  selected,
  onClick,
  children,
  hint,
  multi = false,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  hint?: string
  /** Square mark for "pick any", round mark for "pick one". Visual only. */
  multi?: boolean
}) {
  return (
    <button
      type="button"
      className={`path-v2-choice${selected ? " is-selected" : ""}${multi ? " is-multi" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="path-v2-choice__mark" aria-hidden="true">
        {selected ? (
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        ) : null}
      </span>
      <span className="path-v2-choice__body">
        <span className="path-v2-choice__label">{children}</span>
        {hint ? <span className="path-v2-choice__hint">{hint}</span> : null}
      </span>
    </button>
  )
}

export default function PathPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<PathFlowDraft>(DEFAULT_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [stageVisible, setStageVisible] = useState(true)

  useEffect(() => {
    const stored = loadPathState()
    const { draft: bootDraft, flowStep } = resolvePathFormBootstrap(stored)
    setDraft(mergeDraft(bootDraft))
    setStep(flowStep)
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
  const editorial = PATH_V2_STAGE_HEADLINE[stage.id]
  const stored = ready ? loadPathState() : null
  const hasSavedResult = Boolean(stored?.roadmap && stored?.diagnosis)

  const transitionToStep = useCallback(
    (nextStep: number, nextDraft: PathFlowDraft) => {
      setStageVisible(false)
      window.setTimeout(() => {
        setStep(nextStep)
        persist(nextStep, nextDraft)
        setStageVisible(true)
      }, 120)
    },
    [persist],
  )

  function goBack() {
    if (step === 0) return
    setError(null)
    transitionToStep(step - 1, draft)
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
    setError(null)
    transitionToStep(step + 1, draft)
  }

  function restartFlow() {
    resetPathState()
    const reset = { ...DEFAULT_DRAFT }
    setDraft(reset)
    setStep(0)
    setError(null)
  }

  function handleMainKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" || event.metaKey || event.ctrlKey || event.altKey) return
    const tag = (event.target as HTMLElement)?.tagName
    if (tag === "TEXTAREA") return
    event.preventDefault()
    goNext()
  }

  if (!ready) {
    return (
      <PageShell aurora={false}>
        <main className="path-v2" aria-busy="true">
          <div className="path-v2__shell">
            <p className="sky-label">Find my path</p>
            <p className="path-v2__loading">Loading your answers…</p>
          </div>
        </main>
      </PageShell>
    )
  }

  const isLast = step >= PATH_STAGES.length - 1
  const answered = summaryRows(step, draft)

  return (
    <PageShell aurora={false}>
      <main className="path-v2" onKeyDown={handleMainKeyDown}>
        <div className="site-light path-v2__shell">
          <header className="path-v2__top">
            <p className="sky-label">Find my path</p>
            <PathTruthNote />
          </header>

          {hasSavedResult ? (
            <div className="path-v2__resume">
              <span>You already have a path saved in this browser.</span>
              <Link to="/path/result">View your path</Link>
              <button type="button" onClick={restartFlow}>
                Start fresh
              </button>
            </div>
          ) : null}

          <PathProgress step={step} />

          <div className="path-v2__layout">
            <div className="path-v2__main">
              <header className="path-v2__hero">
                <p className="path-v2__eyebrow" aria-live="polite">
                  <b>
                    Stage {String(stage.number).padStart(2, "0")} of {String(PATH_STAGES.length).padStart(2, "0")}
                  </b>
                  <span aria-hidden="true"> / </span>
                  {editorial.short}
                </p>
                <h1 id="path-v2-question" className="path-v2__question">
                  {editorial.lines.join(" ")}
                </h1>
                <p className="path-v2__lede">{editorial.lede}</p>
                {step === 0 ? <p className="path-v2__note">{PATH_V2_INTRO.note}</p> : null}
              </header>

              <div
                className={`path-v2__stage${stageVisible ? " is-visible" : ""}`}
                key={stage.id}
                aria-labelledby="path-v2-question"
              >

              {stage.id === "academic" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Your situation <span>Pick one</span></p>
                  <div className="path-v2__choices" role="group" aria-label="Academic background">
                    {ACADEMIC_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        selected={draft.academicBackground === option.value}
                        hint={option.hint}
                        onClick={() => updateDraft({ academicBackground: option.value as AcademicBackground })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                  <p className="path-v2__group-label">Current education <span>Pick one</span></p>
                  <div className="path-v2__choices" role="group" aria-label="Current education">
                    {EDUCATION_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        selected={draft.currentEducation === option.value}
                        onClick={() => updateDraft({ currentEducation: option.value as CurrentEducation })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                </div>
              ) : null}

              {stage.id === "interests" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Interests <span>Pick any that apply</span></p>
                  <div className="path-v2__choices" role="group" aria-label="Interests">
                    {INTEREST_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        multi
                        selected={Boolean(draft.interests?.includes(option.value))}
                        onClick={() => updateDraft({ interests: toggleInterest(draft.interests ?? [], option.value) })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                </div>
              ) : null}

              {stage.id === "skills" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Your level today <span>Pick one</span></p>
                  <div className="path-v2__choices" role="radiogroup" aria-label="Existing skills">
                    {SKILL_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        selected={draft.existingSkills === option.value}
                        hint={option.hint}
                        onClick={() => updateDraft({ existingSkills: option.value as SkillLevel })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                  <label className="path-v2__group-label" htmlFor="path-strengths">
                    Strengths you already have (optional)
                  </label>
                  <input
                    id="path-strengths"
                    className="path-v2__input"
                    value={draft.strengths ?? ""}
                    onChange={(event) => updateDraft({ strengths: event.target.value })}
                    placeholder="For example: writing, analysis, teaching, sales"
                    maxLength={200}
                  />
                </div>
              ) : null}

              {stage.id === "direction" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Kind of direction <span>Pick one</span></p>
                  <div className="path-v2__choices" role="radiogroup" aria-label="Career direction">
                    {DIRECTION_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        selected={draft.careerDirection === option.value}
                        onClick={() => updateDraft({ careerDirection: option.value as CareerDirection })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                  <label className="path-v2__group-label" htmlFor="path-direction-detail">
                    In your words
                  </label>
                  <input
                    id="path-direction-detail"
                    className="path-v2__input"
                    value={draft.directionDetail ?? ""}
                    onChange={(event) => updateDraft({ directionDetail: event.target.value })}
                    placeholder="For example: data analyst, product, UPSC, a research question"
                    maxLength={160}
                  />
                </div>
              ) : null}

              {stage.id === "gaps" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Gap themes <span>Pick any that apply</span></p>
                  <div className="path-v2__choices" role="group" aria-label="Gap themes">
                    {GAP_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option}
                        multi
                        selected={Boolean(draft.gaps?.includes(option))}
                        onClick={() => updateDraft({ gaps: toggleGap(draft.gaps ?? [], option) })}
                      >
                        {option}
                      </PathChoiceRow>
                    ))}
                  </div>
                  <label className="path-v2__group-label" htmlFor="path-gap-detail">
                    Anything else? (optional)
                  </label>
                  <textarea
                    id="path-gap-detail"
                    className="path-v2__textarea"
                    value={draft.gapDetail ?? ""}
                    onChange={(event) => updateDraft({ gapDetail: event.target.value })}
                    placeholder="What feels missing when you compare yourself to where you want to be?"
                    maxLength={400}
                  />
                </div>
              ) : null}

              {stage.id === "outcome" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Outcome <span>Pick one</span></p>
                  <div className="path-v2__choices" role="radiogroup" aria-label="Target outcome">
                    {OUTCOME_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        selected={draft.targetOutcome === option.value}
                        onClick={() => updateDraft({ targetOutcome: option.value as TargetOutcome })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                </div>
              ) : null}

              {stage.id === "timeline" ? (
                <div className="path-v2__answers">
                  <p className="path-v2__group-label">Timeline <span>Pick one</span></p>
                  <div className="path-v2__choices" role="radiogroup" aria-label="Timeline">
                    {TIMELINE_OPTIONS.map((option) => (
                      <PathChoiceRow
                        key={option.value}
                        selected={draft.timeline === option.value}
                        onClick={() => updateDraft({ timeline: option.value as TimelineConstraint })}
                      >
                        {option.label}
                      </PathChoiceRow>
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? <div className="path-v2__error" role="alert">{error}</div> : null}
              </div>

              <footer className="path-v2__foot">
                {step > 0 ? (
                  <button type="button" className="sk-btn sk-btn-secondary path-v2__back" onClick={goBack}>
                    Back
                  </button>
                ) : null}
                <button type="button" className="sk-btn sk-btn-primary path-v2__continue" onClick={goNext} disabled={submitting}>
                  {isLast ? "Build my path" : "Continue"}
                  <ArrowRight />
                </button>
                <button type="button" className="path-v2__restart" onClick={restartFlow}>
                  Restart
                </button>
              </footer>
            </div>

            <aside className="path-v2__aside">
              <PathSummary rows={answered} total={PATH_STAGES.length} />
            </aside>
          </div>
        </div>
      </main>
    </PageShell>
  )
}
