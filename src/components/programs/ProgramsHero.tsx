import { useEffect, useState } from "react"
import { HarborDeskWorkspace } from "../product/ProductLanguage"
import { liveProgrammeCatalogue } from "../../lib/programme-catalogue"
import "./ProgramsHero.css"

function useCompactSpecimen() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const onChange = () => setCompact(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return compact
}

export default function ProgramsHero() {
  const live = liveProgrammeCatalogue()
  const readyCount = live.length
  const selfPaced = live.length > 0 && live.every((row) => row.format === "Self-paced")
  const projectBased = live.length > 0 && live.every((row) => Boolean(row.capstone))
  const compact = useCompactSpecimen()

  return (
    <section className="pg-hero" aria-labelledby="pg-hero-title">
      <div className="cat-rail pg-hero-stage">
        <div className="pg-hero-copy">
          <p className="pg-hero-eyebrow">
            <i aria-hidden="true" />
            Professional programmes
          </p>
          <h1 id="pg-hero-title">
            <span>Learn deeply.</span>
            <span>Build something real.</span>
          </h1>
          <p className="pg-hero-lead">
            Skylent programmes connect learning, practice, and real work. You study written lessons, check your
            understanding, and finish a project you keep — in Skylent OS, not a live classroom.
          </p>
          <p className="pg-hero-actions">
            <a className="pg-hero-cta" href="#pg-catalogue">
              Explore programmes
              <span className="pg-hero-cta-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </p>
          <ul className="pg-hero-meta">
            <li>{readyCount} ready to start</li>
            {selfPaced ? <li>Self-paced</li> : null}
            {projectBased ? <li>Project-based</li> : null}
          </ul>
        </div>

        <div className="pg-hero-specimen">
          <HarborDeskWorkspace compact={compact} meta="harbor-desk-case.md · 4 interviews" />
        </div>
      </div>
    </section>
  )
}
