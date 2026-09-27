import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
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
import "./PathPages.css"

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
            <p className="path-result-v2__kicker">Skylent Path</p>
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
          <div className="path-result-v2__shell path-result-v2__empty">
            <p className="path-result-v2__kicker">Skylent Path</p>
            <h1>No path saved yet</h1>
            <p>Complete the seven-stage diagnosis first. Skylent builds a deterministic direction from your answers — no invented placements.</p>
            <Link className="path-result-v2__btn is-primary" to="/path">
              Begin diagnosis
            </Link>
          </div>
        </main>
      </PageShell>
    )
  }

  const pathDate = formatPathDate(diagnosis?.completedAt ?? roadmap.generatedAt)
  const currentKey = execution?.currentPhaseKey ?? null

  return (
    <PageShell aurora={false}>
      <main className="path-result-v2">
        <div className="path-result-v2__shell">
          <header className="path-result-v2__hero">
            <div className="path-result-v2__hero-top">
              <p className="path-result-v2__kicker">Your Skylent Path</p>
              {pathDate ? <time className="path-result-v2__date">{pathDate}</time> : null}
            </div>
            <div className="path-result-v2__vectors">
              <div>
                <span className="path-result-v2__vector-label">From</span>
                <p>{roadmap.currentPosition}</p>
              </div>
              <div className="path-result-v2__vector-rule" aria-hidden="true" />
              <div>
                <span className="path-result-v2__vector-label">Toward</span>
                <p>{roadmap.target}</p>
              </div>
            </div>
            {timelineLabel ? (
              <p className="path-result-v2__meta">
                {timelineLabel}
                <span aria-hidden="true"> · </span>
                Self-paced execution on Skylent
              </p>
            ) : null}
            <div className="path-result-v2__toolbar">
              <Link to="/path">Edit diagnosis</Link>
              <button type="button" onClick={handleResetExecution}>
                Reset execution
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
          </header>

          <section className="path-result-v2__findings" aria-labelledby="path-findings-heading">
            <h2 id="path-findings-heading">What we found</h2>
            <div className="path-result-v2__findings-grid">
              <div>
                <h3>Already have</h3>
                <ul>
                  {strengthItems.length ? (
                    strengthItems.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>Foundations captured in your diagnosis — add strengths next time for sharper sequencing.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3>Need to build</h3>
                <ul>
                  {roadmap.gaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {provedEvidence.length ? (
            <section className="path-result-v2__proved" aria-labelledby="path-proved-heading">
              <h2 id="path-proved-heading">What you&apos;ve proved on Skylent</h2>
              <ul className="path-result-v2__proved-list">
                {provedEvidence.map((row) => (
                  <li key={row.id}>
                    <span className="path-result-v2__proved-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      <strong>{EVIDENCE_KIND_LABEL[row.kind]}</strong>
                      <em>{trustLabel(row.trust)}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="path-result-v2__journey" aria-label="Path journey">
            <h2 className="path-result-v2__journey-title">Your sequenced journey</h2>
            <ol className="path-result-v2__phases">
              {PHASE_ORDER.map((row, index) => {
                const phase: RoadmapPhase = roadmap[row.key]
                const state = progress ? phaseState(row.key, currentKey, progress) : "upcoming"
                const isCurrent = state === "current" && execution && !execution.allComplete

                return (
                  <li
                    key={row.key}
                    className={`path-result-v2__phase is-${state}${isCurrent ? " is-here" : ""}`}
                  >
                    <div className="path-result-v2__phase-rail">
                      <span className="path-result-v2__phase-num">{String(index + 1).padStart(2, "0")}</span>
                      <span className="path-result-v2__phase-line" aria-hidden="true" />
                    </div>
                    <div className="path-result-v2__phase-body">
                      {isCurrent ? <p className="path-result-v2__here">Currently here</p> : null}
                      <h3>{row.label}</h3>
                      <p className="path-result-v2__phase-title">{phase.title}</p>
                      <p className="path-result-v2__phase-summary">{phase.summary}</p>

                      {isCurrent ? (
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
                                  ? "Complete the linked Skylent activity, then check progress — verified completion only."
                                  : "Self-reported step — not verified by Skylent LMS."}
                              </p>
                              <div className="path-result-v2__exec-actions">
                                {openHref ? (
                                  <Link className="path-result-v2__btn is-secondary" to={openHref}>
                                    Open in Skylent
                                  </Link>
                                ) : null}
                                {skylentResource ? (
                                  <button
                                    type="button"
                                    className="path-result-v2__btn is-primary"
                                    onClick={handleVerifySkylentProgress}
                                    disabled={lmsChecking}
                                  >
                                    {lmsChecking ? "Checking…" : "Check Skylent progress"}
                                  </button>
                                ) : null}
                                {manualOnly ? (
                                  <button
                                    type="button"
                                    className="path-result-v2__btn is-primary"
                                    onClick={() => setManualConfirmOpen(true)}
                                  >
                                    Mark complete (self-reported)
                                  </button>
                                ) : null}
                              </div>
                              {manualConfirmOpen && manualOnly ? (
                                <div className="path-result-v2__manual-confirm" role="dialog" aria-label="Confirm self-reported completion">
                                  <p>This step is not verified by Skylent. Only continue if you completed the work honestly on this device.</p>
                                  <button type="button" className="path-result-v2__btn is-primary" onClick={handleCompletePhaseManual}>
                                    Confirm self-reported complete
                                  </button>
                                  <button type="button" className="path-result-v2__btn is-ghost" onClick={() => setManualConfirmOpen(false)}>
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
                              {openHref && execution.action?.resource?.type === "site_route" ? (
                                <Link className="path-result-v2__btn is-secondary" to={openHref}>
                                  Open link
                                </Link>
                              ) : null}
                              <button type="button" className="path-result-v2__btn is-primary" onClick={handleStartPhase}>
                                Start this phase
                              </button>
                            </>
                          )}
                          {phaseJustCompleted && execution.currentPhaseKey && execution.status === "not_started" ? (
                            <button type="button" className="path-result-v2__btn is-primary" onClick={handleStartPhase}>
                              Start next phase
                            </button>
                          ) : null}
                        </div>
                      ) : null}

                      <details className="path-result-v2__phase-details">
                        <summary>Actions in this phase</summary>
                        <ul>
                          {phase.actions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          {execution?.allComplete ? (
            <p className="path-result-v2__all-done">{execution.actionText}</p>
          ) : null}

          {programmes.length > 0 ? (
            <section className="path-result-v2__programmes" aria-labelledby="path-programmes-heading">
              <h2 id="path-programmes-heading">Optional catalogue programmes</h2>
              <p>Real programmes only — enrol when a gap maps to taught modules.</p>
              <div className="path-result-v2__programme-grid">
                {programmes.map((programme) => (
                  <Link key={programme.slug} className="path-result-v2__programme-card" to={programme.href}>
                    <strong>{programme.title}</strong>
                    <em>{programme.decisionLine}</em>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="path-result-v2__foot">
            <Link className="path-result-v2__btn is-primary" to="/path">
              Refine diagnosis
            </Link>
            <Link className="path-result-v2__btn is-secondary" to="/login">
              Sign in for LMS verification
            </Link>
          </footer>

          <p className="path-result-v2__disclaimer">
            This path is generated locally from your answers. It does not predict hiring outcomes. LMS and Career OS remain the source of truth for verified work.
          </p>
        </div>
      </main>
    </PageShell>
  )
}
