import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { programmeDiscoveryCards } from "../../lib/programme-discovery"
import type { PersonalRoadmap, RoadmapPhase, PathEvidenceRecord } from "../../lib/path/types"
import type { PathExecutionSnapshot } from "../../lib/path/storage"
import { trustLabel } from "../../lib/path/evidence"
import {
  clearPathState,
  completePathPhase,
  getPathExecutionSnapshot,
  loadPathState,
  resetPathExecutionProgress,
  startPathPhase,
  tryCompletePathPhaseFromLms,
} from "../../lib/path/storage"
import "./PathPages.css"

const PHASE_ORDER: { key: keyof Pick<PersonalRoadmap, "foundation" | "skills" | "practice" | "build" | "proof" | "opportunity">; label: string }[] = [
  { key: "foundation", label: "Foundation" },
  { key: "skills", label: "Skills" },
  { key: "practice", label: "Practice" },
  { key: "build", label: "Build" },
  { key: "proof", label: "Proof" },
  { key: "opportunity", label: "Opportunity" },
]

function PhaseBlock({ index, label, phase }: { index: number; label: string; phase: RoadmapPhase }) {
  return (
    <article className="skylent-path-result__phase">
      <div className="skylent-path-result__phase-label">
        {String(index + 1).padStart(2, "0")} · {label}
      </div>
      <div>
        <h3>{phase.title}</h3>
        <p>{phase.summary}</p>
        <ul>
          {phase.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function refreshFromStorage(): { roadmap: PersonalRoadmap | null; snapshot: PathExecutionSnapshot | null } {
  const stored = loadPathState()
  return {
    roadmap: stored.roadmap,
    snapshot: stored.roadmap ? getPathExecutionSnapshot() : null,
  }
}

export default function PathResultPage() {
  const [ready, setReady] = useState(false)
  const [roadmap, setRoadmap] = useState<PersonalRoadmap | null>(null)
  const [execution, setExecution] = useState<PathExecutionSnapshot | null>(null)
  const [phaseJustCompleted, setPhaseJustCompleted] = useState<string | null>(null)
  const [lmsCheckMessage, setLmsCheckMessage] = useState<string | null>(null)
  const [lmsChecking, setLmsChecking] = useState(false)
  const [recordedEvidence, setRecordedEvidence] = useState<PathEvidenceRecord[] | null>(null)

  useEffect(() => {
    const next = refreshFromStorage()
    setRoadmap(next.roadmap)
    setExecution(next.snapshot)
    setReady(true)
  }, [])

  const handleStartPhase = () => {
    const key = execution?.currentPhaseKey
    if (!key) return
    setPhaseJustCompleted(null)
    setRecordedEvidence(null)
    setExecution(startPathPhase(key))
  }

  const handleCompletePhase = () => {
    const key = execution?.currentPhaseKey
    if (!key) return
    const result = completePathPhase(key, "manual")
    setExecution(result.snapshot)
    setPhaseJustCompleted(result.followUp)
    setRecordedEvidence(result.evidence)
    setLmsCheckMessage(null)
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
        setLmsCheckMessage("Verified by Skylent — phase advanced from your LMS progress.")
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
    if (snap) setExecution(snap)
  }

  const programmes = useMemo(() => {
    if (!roadmap?.suggestedProgrammeSlugs.length) return []
    const cards = programmeDiscoveryCards()
    return roadmap.suggestedProgrammeSlugs
      .map((slug) => cards.find((row) => row.slug === slug))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
  }, [roadmap])

  if (!ready) {
    return (
      <PageShell aurora={false}>
        <main className="skylent-path-result" aria-busy="true">
          <div className="skylent-path-result__rail">
            <p className="skylent-path-result__kicker">Skylent Path</p>
            <p style={{ color: "#5b5d61", marginTop: 16 }}>Loading your path…</p>
          </div>
        </main>
      </PageShell>
    )
  }

  if (!roadmap) {
    return (
      <PageShell aurora={false}>
        <main className="skylent-path-result">
          <div className="skylent-path-result__rail skylent-path-result__empty">
            <p className="skylent-path-result__kicker">Skylent Path</p>
            <h1 className="skylent-path-result__headline">No path saved yet</h1>
            <p>
              Complete the seven-stage diagnostic first. Skylent will build a deterministic roadmap from your answers — no fake AI, no invented placements.
            </p>
            <Link className="skylent-path-result__btn is-primary" to="/path">
              Start your path
            </Link>
          </div>
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell aurora={false}>
      <main className="skylent-path-result">
        <div className="skylent-path-result__rail">
          <div className="skylent-path-result__toolbar">
            <p className="skylent-path-result__kicker">Skylent Path · Your roadmap</p>
            <div>
              <Link to="/path">Edit answers</Link>
              {" · "}
              <button
                type="button"
                onClick={() => {
                  clearPathState()
                  setRoadmap(null)
                  setExecution(null)
                  setPhaseJustCompleted(null)
                }}
              >
                Clear saved path
              </button>
              {roadmap ? (
                <>
                  {" · "}
                  <button type="button" onClick={handleResetExecution}>
                    Reset execution progress
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <h1 className="skylent-path-result__headline">Your path, sequenced from what you told us.</h1>

          <div className="skylent-path-result__summary-grid">
            <div className="skylent-path-result__summary-card">
              <span>Your current position</span>
              <p>{roadmap.currentPosition}</p>
            </div>
            <div className="skylent-path-result__summary-card">
              <span>Target</span>
              <p>{roadmap.target}</p>
            </div>
            <div className="skylent-path-result__summary-card">
              <span>What is missing</span>
              <ul className="skylent-path-result__gaps">
                {roadmap.gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>

          {execution ? (
            <section
              className="skylent-path-result__next skylent-path-result__execution"
              aria-label="Your next action"
            >
              <span>{execution.allComplete ? "Path execution" : "Your next action"}</span>
              {!execution.allComplete ? (
                <p className="skylent-path-result__exec-phase">
                  Current phase · {execution.currentPhaseLabel}
                </p>
              ) : null}
              {!execution.allComplete && execution.action ? (
                <p className="skylent-path-result__exec-verify">
                  {skylentResource
                    ? "Verified by Skylent when your linked course, lab, or project progress shows complete."
                    : "Learner marked complete — not verified by Skylent."}
                </p>
              ) : null}
              {phaseJustCompleted ? (
                <>
                  <p className="skylent-path-result__exec-status is-complete">Completed</p>
                  <p className="skylent-path-result__exec-follow">→ {phaseJustCompleted}</p>
                  {recordedEvidence?.length ? (
                    <p className="skylent-path-result__exec-hint">
                      Evidence: {recordedEvidence.map((row) => trustLabel(row.trust)).join(" · ")}
                    </p>
                  ) : null}
                </>
              ) : execution.allComplete ? (
                <p>{execution.actionText}</p>
              ) : execution.status === "in_progress" ? (
                <>
                  <p className="skylent-path-result__exec-status is-active">In progress</p>
                  <p className="skylent-path-result__exec-action">→ {execution.actionText}</p>
                  {openHref ? (
                    <Link className="skylent-path-result__btn is-secondary skylent-path-result__exec-btn" to={openHref}>
                      Open in Skylent
                    </Link>
                  ) : null}
                  {skylentResource ? (
                    <button
                      type="button"
                      className="skylent-path-result__btn is-primary skylent-path-result__exec-btn"
                      onClick={handleVerifySkylentProgress}
                      disabled={lmsChecking}
                    >
                      {lmsChecking ? "Checking…" : "Check Skylent progress"}
                    </button>
                  ) : null}
                  {manualOnly || skylentResource ? (
                    <button
                      type="button"
                      className="skylent-path-result__btn is-ghost skylent-path-result__exec-btn"
                      onClick={handleCompletePhase}
                    >
                      Mark complete (not verified by Skylent)
                    </button>
                  ) : null}
                  {lmsCheckMessage ? (
                    <p className="skylent-path-result__exec-hint" role="status">
                      {lmsCheckMessage}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="skylent-path-result__exec-action">→ {execution.actionText}</p>
                  {openHref && execution.action?.resource?.type === "site_route" ? (
                    <Link className="skylent-path-result__btn is-secondary skylent-path-result__exec-btn" to={openHref}>
                      Open link
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="skylent-path-result__btn is-primary skylent-path-result__exec-btn"
                    onClick={() => handleStartPhase()}
                  >
                    Start
                  </button>
                </>
              )}
              {phaseJustCompleted && execution.currentPhaseKey && execution.status === "not_started" ? (
                <>
                  <p className="skylent-path-result__exec-action" style={{ marginTop: 16 }}>
                    → {execution.actionText}
                  </p>
                  <button
                    type="button"
                    className="skylent-path-result__btn is-primary skylent-path-result__exec-btn"
                    onClick={handleStartPhase}
                  >
                    Start
                  </button>
                </>
              ) : null}
            </section>
          ) : null}

          <section className="skylent-path-result__chain" aria-label="Your path">
            <p className="skylent-path-result__kicker" style={{ marginTop: 8 }}>
              Your path
            </p>
            {PHASE_ORDER.map((row, index) => (
              <PhaseBlock
                key={row.key}
                index={index}
                label={row.label}
                phase={roadmap[row.key]}
              />
            ))}
          </section>

          {programmes.length > 0 ? (
            <section className="skylent-path-result__programmes" aria-labelledby="path-programmes-heading">
              <p className="skylent-path-result__kicker">Execution options</p>
              <h2 id="path-programmes-heading">Skylent programmes that match this path</h2>
              <p>
                These are real catalogue programmes — optional building blocks, not a sales funnel. Enrol only if the gap list says you need structured learning.
              </p>
              <div className="skylent-path-result__programme-grid">
                {programmes.map((programme) => (
                  <Link
                    key={programme.slug}
                    className="skylent-path-result__programme-card"
                    to={programme.href}
                  >
                    <strong>{programme.title}</strong>
                    <em>{programme.decisionLine}</em>
                    <span style={{ fontSize: 12, color: "#85878b" }}>
                      {programme.taughtModules} taught modules · {programme.brochureDuration}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div className="skylent-path-result__actions">
            <Link className="skylent-path-result__btn is-primary" to="/path">
              Continue path
            </Link>
            <Link className="skylent-path-result__btn is-secondary" to="/programmes">
              Explore programmes
            </Link>
            <Link className="skylent-path-result__btn is-ghost" to="/login">
              Sign in
            </Link>
          </div>

          <p style={{ marginTop: 28, fontSize: 11, color: "#85878b", lineHeight: 1.55, maxWidth: 640 }}>
            This roadmap is generated locally from your answers. It does not predict hiring outcomes or guarantee placement. Sign in connects your account to enrolled work over time; the path itself stays on this device until account sync ships.
          </p>
        </div>
      </main>
    </PageShell>
  )
}
