import { ProductVisual } from "../product/ProductVisuals"
import type { ProgrammeDiscoveryCard } from "../../lib/programme-discovery"
import "./ProgramsHero.css"

export default function ProgramsHero({
  live,
  catalogReady = true,
}: {
  live: ProgrammeDiscoveryCard[]
  catalogReady?: boolean
}) {
  const readyCount = live.length
  const selfPaced = live.length > 0 && live.every((row) => row.format === "Self-paced")
  const projectBased = live.length > 0 && live.every((row) => Boolean(row.capstone))
  const showMeta = catalogReady || live.length > 0

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
            Skylent programmes connect structured learning, practice, and real work. You study written lessons,
            check your understanding, and finish a project you keep — in Skylent OS, not a live classroom.
          </p>
          <p className="pg-hero-actions">
            <a className="pg-hero-cta" href="#pg-catalogue">
              Explore programmes
              <span className="pg-hero-cta-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </p>
          {showMeta ? (
            <ul className="pg-hero-meta">
              {catalogReady ? <li>{readyCount} ready to start</li> : null}
              {selfPaced ? <li>Self-paced</li> : null}
              {projectBased ? <li>Project-based</li> : null}
            </ul>
          ) : null}
        </div>

        <figure className="pg-hero-figure">
          <div className="pg-hero-photo">
            <ProductVisual id="catalog-browser" className="pg-hero-product-visual" label="Programmes · catalogue" />
          </div>
          <figcaption>Study, not a live stream</figcaption>
        </figure>
      </div>
    </section>
  )
}
