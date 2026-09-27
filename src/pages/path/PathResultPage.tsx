import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { programmeDiscoveryCards } from "../../lib/programme-discovery"
import type { PersonalRoadmap, RoadmapPhase } from "../../lib/path/types"
import { clearPathState, loadPathState } from "../../lib/path/storage"
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

export default function PathResultPage() {
  const [ready, setReady] = useState(false)
  const [roadmap, setRoadmap] = useState<PersonalRoadmap | null>(null)

  useEffect(() => {
    const stored = loadPathState()
    setRoadmap(stored.roadmap)
    setReady(true)
  }, [])

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
                }}
              >
                Clear saved path
              </button>
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

          <div className="skylent-path-result__next">
            <span>Next action</span>
            <p>{roadmap.nextAction}</p>
          </div>

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
              Sign in to save progress
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
