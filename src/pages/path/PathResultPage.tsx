import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { ArrowRight, SectionIndex, SpecSheet, type SpecRow } from "../../components/skylent/primitives"
import { programmeDiscoveryCards } from "../../lib/programme-discovery"
import { TIMELINE_OPTIONS } from "../../lib/path/constants"
import type { PathEvidenceKind, PathEvidenceRecord, PathPhaseKey, PersonalRoadmap, RoadmapPhase } from "../../lib/path/types"
import type { PathExecutionSnapshot } from "../../lib/path/storage"
import { trustLabel } from "../../lib/path/evidence"
import {
  clearPathState,
  completePathPhase,
  getPathEvidenceLog,
  getPathExecutionSnapshot,
  getPathExecutionProgress,
  loadPathState,
  resetPathExecutionProgress,
  startPathPhase,
  tryCompletePathPhaseFromLms,
} from "../../lib/path/storage"
import { PathClosingBand, PathTruthNote } from "./PathJourneyVisual"
import { PATH_V2_HOW_IT_WORKS } from "./pathV2Copy"
import "./PathPages.css"
import "../cine.css"

const PHASE_ORDER: { key: PathPhaseKey; label: string }[] = [
  { key: "foundation", label: "Foundation" },
  { key: "skills", label: "Skills" },
  { key: "practice", label: "Practice" },
  { key: "build", label: "Build" },
  { key: "proof", label: "Proof" },
  { key: "opportunity", label: "Opportunity" },
]

const EVIDENCE_KIND_LABEL: Record<PathEvidenceKind, string> = {
  learning_completed: "Learning completed",
  quiz_passed: "Quiz passed",
  lab_completed: "Lab work saved",
  project_completed: "Project completed",
  project_artifact: "Assignment submitted",
  portfolio_evidence: "Career OS evidence",
}

function formatPathDate(iso: string | undefined): string {
  if (!iso) return ""
  try {
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(iso))
  } catch {
    return ""
  }
}

function refreshFromStorage(): {
  roadmap: PersonalRoadmap | null
  snapshot: PathExecutionSnapshot | null
  evidence: PathEvidenceRecord[]
} {
  const stored = loadPathState()
  return {
    roadmap: stored.roadmap,
    snapshot: stored.roadmap ? getPathExecutionSnapshot() : null,
    evidence: getPathEvidenceLog().entries,
  }
}

function phaseState(
  key: PathPhaseKey,
  current: PathPhaseKey | null,
  progress: ReturnType<typeof getPathExecutionProgress>,
): "complete" | "current" | "upcoming" {
  const status = progress.phases[key].status
  if (status === "completed") return "complete"
  if (current === key) return "current"
  return "upcoming"
}

export default function PathResultPage() {
  const [ready, setReady] = useState(false)
  const [roadmap, setRoadmap] = useState<PersonalRoadmap | null>(null)
  const [execution, setExecution] = useState<PathExecutionSnapshot | null>(null)
  const [evidenceRows, setEvidenceRows] = useState<PathEvidenceRecord[]>([])
  const [phaseJustCompleted, setPhaseJustCompleted] = useState<string | null>(null)
  const [lmsCheckMessage, setLmsCheckMessage] = useState<string | null>(null)
  const [lmsChecking, setLmsChecking] = useState(false)
  const [recordedEvidence, setRecordedEvidence] = useState<PathEvidenceRecord[] | null>(null)
  const [manualConfirmOpen, setManualConfirmOpen] = useState(false)

  const stored = ready ? loadPathState() : null
  const diagnosis = stored?.diagnosis
  const progress = useMemo(() => (ready ? getPathExecutionProgress() : null), [ready, execution])

  useEffect(() => {
    const next = refreshFromStorage()
    setRoadmap(next.roadmap)
    setExecution(next.snapshot)
    setEvidenceRows(next.evidence)
    setReady(true)
  }, [])

  const handleStartPhase = () => {
    const key = execution?.currentPhaseKey
    if (!key) return
    setPhaseJustCompleted(null)
    setRecordedEvidence(null)
    setExecution(startPathPhase(key))
    setEvidenceRows(getPathEvidenceLog().entries)
  }

  const handleCompletePhaseManual = () => {
    const key = execution?.currentPhaseKey
    if (!key) return
    const result = completePathPhase(key, "manual")
    setExecution(result.snapshot)
    setPhaseJustCompleted(result.followUp)
    setRecordedEvidence(result.evidence)
    setEvidenceRows(getPathEvidenceLog().entries)
    setLmsCheckMessage(null)
    setManualConfirmOpen(false)
  }

  const handleVerifySkylentProgress = async () => {
    const key = execution?.currentPhaseKey
    if (!key || !execution?.action) return
    setLmsChecking(true)
    setLmsCheckMessage(null)
    try {
      const result = await tryCompletePathPhaseFromLms(key)
      if (result.snapshot) setExecution(result.snapshot)
      if (result.verified && result.followUp) {
        setPhaseJustCompleted(result.followUp)
        setRecordedEvidence(result.evidence ?? null)
        setLmsCheckMessage("Verified by Skylent — phase advanced from your recorded progress.")
        setEvidenceRows(getPathEvidenceLog().entries)
      } else {
        setLmsCheckMessage(
          "Skylent has not recorded completion for this step yet. Finish the linked activity while signed in, then check again.",
        )
      }
    } finally {
      setLmsChecking(false)
    }
  }

  const skylentResource = execution?.action?.completionMode === "skylent_resource"
  const manualOnly = execution?.action?.completionMode === "manual_only"
  const openHref = execution?.action?.resource?.href

  const handleResetExecution = () => {
    const snap = resetPathExecutionProgress()
    setPhaseJustCompleted(null)
    setRecordedEvidence(null)
    setEvidenceRows([])
    if (snap) setExecution(snap)
  }

  const programmes = useMemo(() => {
    if (!roadmap?.suggestedProgrammeSlugs.length) return []
    const cards = programmeDiscoveryCards()
    return roadmap.suggestedProgrammeSlugs
      .map((slug) => cards.find((row) => row.slug === slug))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
  }, [roadmap])

  const timelineLabel = useMemo(() => {
    if (!diagnosis) return ""
    return TIMELINE_OPTIONS.find((row) => row.value === diagnosis.timeline)?.label ?? ""
  }, [diagnosis])

  const strengthItems = useMemo(() => {
    const fromDiagnosis = diagnosis?.strengths
      ?.split(/[,;]\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (fromDiagnosis?.length) return fromDiagnosis
    const fromPosition = roadmap?.currentPosition.includes("Strength:")
      ? [roadmap.currentPosition.split("Strength:")[1]?.trim()].filter(Boolean)
      : []
    return fromPosition as string[]
  }, [diagnosis, roadmap])

  const provedEvidence = evidenceRows.filter((row) => row.trust !== "manual")

  if (!ready) {
    return (
      <PageShell aurora={false}>
        <main className="path-result-v2" aria-busy="true">
          <div className="path-result-v2__shell">
            <p className="sky-label">Find my path</p>
            <p className="path-result-v2__loading">Loading your path…</p>
          </div>
        </main>
      </PageShell>
    )
  }

  if (!roadmap) {
    return (
      <PageShell aurora={false}>
        <main className="path-result-v2">
          <div className="site-light">
            <div className="path-result-v2__shell path-result-v2__empty">
              <div className="path-result-v2__empty-copy">
                <p className="sky-label cine-in cine-in--fade">Find my path · Your result</p>
                <h1 className="path-result-v2__title cine-in cine-d1">No path saved yet</h1>
                <p className="path-result-v2__intro">
                  There is no path in this browser. Answer the seven stages and your path appears on this page. If you
                  built one on another device or cleared your browser data, it will not be here.
                </p>
                <PathTruthNote />
                <div className="path-result-v2__empty-actions">
                  <Link className="sk-btn sk-btn-primary" to="/path">
                    Start find my path
                    <ArrowRight />
                  </Link>
                </div>
              </div>
              <section className="path-result-v2__how cine-in cine-in--plate cine-d3" aria-labelledby="path-how-title">
                <p className="sky-label">How it works</p>
                <h2 id="path-how-title" className="path-result-v2__how-title">
                  What the tool does, in three steps
                </h2>
                <ol className="sky-steps">
                  {PATH_V2_HOW_IT_WORKS.map((row, index) => (
                    <li key={row.title} className="sky-step">
                      <div className="sky-step__rail">
                        <span className="sky-step__node">{String(index + 1).padStart(2, "0")}</span>
                        {index < PATH_V2_HOW_IT_WORKS.length - 1 ? <span className="sky-step__line" /> : null}
                      </div>
                      <div className="sky-step__body">
                        <h3>{row.title}</h3>
                        <p>{row.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <PathClosingBand title="Prefer to browse first? Start with what Skylent offers." />
          </div>
        </main>
      </PageShell>
    )
  }

  const pathDate = formatPathDate(diagnosis?.completedAt ?? roadmap.generatedAt)
  const currentKey = execution?.currentPhaseKey ?? null
  const currentIndex = PHASE_ORDER.findIndex((row) => row.key === currentKey)
  const gapsWereSelected = Boolean(diagnosis?.gaps.length)

  const diagnosisRows: SpecRow[] = [
    { label: "From", value: roadmap.currentPosition },
    { label: "Toward", value: roadmap.target },
    { label: "Timeline", value: timelineLabel },
    {
      label: "Already have",
      value: strengthItems.length ? (
        <ul className="path-result-v2__spec-list">
          {strengthItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        "Insufficient information."
      ),
      note: strengthItems.length
        ? undefined
        : "You did not list any strengths, so the rules have nothing to state here. Add them under Edit answers.",
    },
    {
      label: "Need to build",
      value: roadmap.gaps.length ? (
        <ul className="path-result-v2__spec-list">
          {roadmap.gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      ) : (
        "Insufficient information."
      ),
      note:
        roadmap.gaps.length && !gapsWereSelected
          ? "You did not select gap themes, so these were set by rule from your other answers."
          : undefined,
    },
    { label: "Answered", value: pathDate },
  ]

  return (
    <PageShell aurora={false}>
      <main className="path-result-v2">
        <div className="site-light">
          <div className="path-result-v2__shell">
            <header className="path-result-v2__hero">
              <p className="sky-label cine-in cine-in--fade">Find my path · Your result</p>
              <h1 className="path-result-v2__title cine-in cine-d1">Your path, built from your answers</h1>
              <div className="cine-in cine-in--fade cine-d2">
                <PathTruthNote />
              </div>
            </header>

            <div className="path-result-v2__top">
              <section className="path-result-v2__findings cine-in cine-d3" aria-labelledby="path-findings-heading">
                <SectionIndex n="01" label="Diagnosis" />
                <h2 id="path-findings-heading">What your answers say</h2>
                <SpecSheet rows={diagnosisRows} className="path-result-v2__spec" />
                <div className="path-result-v2__toolbar">
                  <Link to="/path">Edit answers</Link>
                  <button type="button" onClick={handleResetExecution}>
                    Reset progress
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearPathState()
                      setRoadmap(null)
                      setExecution(null)
                      setEvidenceRows([])
                    }}
                  >
                    Clear path
                  </button>
                </div>
              </section>

              <section className="path-result-v2__next cine-in cine-in--plate cine-d4" aria-labelledby="path-next-heading">
                <p className="sky-label">
                  {execution?.allComplete || currentIndex < 0
                    ? "Next action"
                    : `Next action · Phase ${String(currentIndex + 1).padStart(2, "0")} ${PHASE_ORDER[currentIndex].label}`}
                </p>
                <h2 id="path-next-heading">Your next action</h2>
                {!execution ? (
                  <p className="path-result-v2__exec-action">
                    {roadmap.nextAction || "Insufficient information to name a next action from these answers."}
                  </p>
                ) : execution.allComplete ? (
                  <p className="path-result-v2__exec-action">{execution.actionText}</p>
                ) : (
                  <div className="path-result-v2__exec">
                    {phaseJustCompleted ? (
                      <>
                        <p className="path-result-v2__exec-done">Phase complete</p>
                        <p className="path-result-v2__exec-next">{phaseJustCompleted}</p>
                        {recordedEvidence?.length ? (
                          <p className="path-result-v2__exec-trust">
                            {recordedEvidence.map((r) => trustLabel(r.trust)).join(" · ")}
                          </p>
                        ) : null}
                      </>
                    ) : execution.status === "in_progress" ? (
                      <>
                        <p className="path-result-v2__exec-action">{execution.actionText}</p>
                        <p className="path-result-v2__exec-trust">
                          {skylentResource
                            ? "Complete the linked Skylent activity, then check progress. Verified completion only."
                            : "Self-reported step. Not verified by the Skylent LMS."}
                        </p>
                        <div className="path-result-v2__exec-actions">
                          {skylentResource ? (
                            <button
                              type="button"
                              className="sk-btn sk-btn-primary"
                              onClick={handleVerifySkylentProgress}
                              disabled={lmsChecking}
                            >
                              {lmsChecking ? "Checking…" : "Check Skylent progress"}
                            </button>
                          ) : null}
                          {manualOnly ? (
                            <button type="button" className="sk-btn sk-btn-primary" onClick={() => setManualConfirmOpen(true)}>
                              Mark complete (self-reported)
                            </button>
                          ) : null}
                          {openHref ? (
                            <Link className="sk-btn sk-btn-secondary" to={openHref}>
                              Open in Skylent
                            </Link>
                          ) : null}
                        </div>
                        {manualConfirmOpen && manualOnly ? (
                          <div className="path-result-v2__manual-confirm" role="dialog" aria-label="Confirm self-reported completion">
                            <p>This step is not verified by Skylent. Only continue if you completed the work honestly on this device.</p>
                            <button type="button" className="sk-btn sk-btn-primary" onClick={handleCompletePhaseManual}>
                              Confirm self-reported complete
                            </button>
                            <button type="button" className="sk-btn sk-btn-secondary" onClick={() => setManualConfirmOpen(false)}>
                              Cancel
                            </button>
                          </div>
                        ) : null}
                        {lmsCheckMessage ? (
                          <p className="path-result-v2__exec-message" role="status">
                            {lmsCheckMessage}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="path-result-v2__exec-action">{execution.actionText}</p>
                        <div className="path-result-v2__exec-actions">
                          <button type="button" className="sk-btn sk-btn-primary" onClick={handleStartPhase}>
                            Start this phase
                            <ArrowRight />
                          </button>
                          {openHref && execution.action?.resource?.type === "site_route" ? (
                            <Link className="sk-btn sk-btn-secondary" to={openHref}>
                              Open link
                            </Link>
                          ) : null}
                        </div>
                      </>
                    )}
                    {phaseJustCompleted && execution.currentPhaseKey && execution.status === "not_started" ? (
                      <div className="path-result-v2__exec-actions">
                        <button type="button" className="sk-btn sk-btn-primary" onClick={handleStartPhase}>
                          Start next phase
                          <ArrowRight />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
                <p className="path-result-v2__next-foot">
                  Progress on this page is kept in this browser. <Link to="/login">Sign in</Link> to check steps against
                  your Skylent learning record.
                </p>
              </section>

              <section className="path-result-v2__journey cine-in cine-d5" aria-labelledby="path-journey-heading">
                <SectionIndex n="02" label="Recommended path" />
                <h2 id="path-journey-heading" className="path-result-v2__journey-title">
                  Six phases, in order
                </h2>
                <ol className="path-result-v2__phases">
                  {PHASE_ORDER.map((row, index) => {
                    const phase: RoadmapPhase = roadmap[row.key]
                    const state = progress ? phaseState(row.key, currentKey, progress) : "upcoming"
                    const isCurrent = state === "current" && execution && !execution.allComplete

                    return (
                      <li key={row.key} className={`path-result-v2__phase is-${state}${isCurrent ? " is-here" : ""}`}>
                        <div className="path-result-v2__phase-rail" aria-hidden="true">
                          <span className="path-result-v2__phase-num">{String(index + 1).padStart(2, "0")}</span>
                          <span className="path-result-v2__phase-line" />
                        </div>
                        <div className="path-result-v2__phase-body">
                          <p className="path-result-v2__phase-kicker">
                            {phase.title.trim().toLowerCase() === row.label.toLowerCase() ? `Phase ${index + 1} of ${PHASE_ORDER.length}` : row.label}
                            {isCurrent ? <span className="path-result-v2__here">You are here</span> : null}
                            {state === "complete" ? <span className="path-result-v2__donetag">Done</span> : null}
                          </p>
                          <h3>{phase.title}</h3>
                          <p className="path-result-v2__phase-summary">{phase.summary}</p>
                          {phase.actions.length ? (
                            <details className="path-result-v2__phase-details">
                              <summary>Actions in this phase ({phase.actions.length})</summary>
                              <ul>
                                {phase.actions.map((action) => (
                                  <li key={action}>{action}</li>
                                ))}
                              </ul>
                            </details>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            </div>

            {provedEvidence.length ? (
              <section className="path-result-v2__proved" aria-labelledby="path-proved-heading">
                <SectionIndex n="03" label="Evidence" />
                <h2 id="path-proved-heading">What you have proved on Skylent</h2>
                <ul className="path-result-v2__proved-list">
                  {provedEvidence.map((row) => (
                    <li key={row.id}>
                      <strong>{EVIDENCE_KIND_LABEL[row.kind]}</strong>
                      <span className="path-result-v2__trust-tag">{trustLabel(row.trust)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="path-result-v2__programmes" aria-labelledby="path-programmes-heading">
              <SectionIndex n={provedEvidence.length ? "04" : "03"} label="Catalogue" />
              <h2 id="path-programmes-heading">Programmes that match</h2>
              {programmes.length > 0 ? (
                <>
                  <p>Optional. These are real catalogue programmes; enrol only when a gap maps to taught modules.</p>
                  <div className="path-result-v2__programme-grid">
                    {programmes.map((programme) => (
                      <Link key={programme.slug} className="path-result-v2__programme-card" to={programme.href}>
                        <strong>{programme.title}</strong>
                        <em>{programme.decisionLine}</em>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  Insufficient information to suggest a programme. Your answers do not map to a programme in the current
                  catalogue under the rules, so none is recommended.
                </p>
              )}
            </section>

            <p className="path-result-v2__disclaimer">
              This path is produced in your browser from your answers by fixed rules. It does not predict hiring or
              admission outcomes. The LMS and Career OS remain the source of truth for verified work.
            </p>
          </div>

          <PathClosingBand title="Ready to act on it? Choose what to study next." />
        </div>
      </main>
    </PageShell>
  )
}
