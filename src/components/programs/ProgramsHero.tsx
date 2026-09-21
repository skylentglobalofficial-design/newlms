import { Link } from "react-router-dom"
import { liveProgrammeCatalogue } from "../../lib/programme-catalogue"
import "./ProgramsHero.css"

const HERO_IMAGE =
  "https://images.pexels.com/photos/7742816/pexels-photo-7742816.jpeg?auto=compress&dpr=1&w=1600"

export default function ProgramsHero() {
  const live = liveProgrammeCatalogue()
  const readyCount = live.length

  return (
    <section className="pg-hero" aria-labelledby="pg-hero-title">
      <div className="cat-rail pg-hero-stage">
        <div className="pg-hero-copy">
          <p className="pg-hero-eyebrow">
            <i aria-hidden="true" />
            Professional programmes
          </p>
          <h1 id="pg-hero-title">
            Learn deeply.
            <br />
            Build something real.
          </h1>
          <p className="pg-hero-lead">
            Programmes built around the work, not the brochure. Learn through written lessons, practise what you
            understand, and leave with evidence you can keep.
          </p>
          <div className="pg-hero-actions">
            <a className="pg-hero-cta" href="#pg-programmes">
              Explore programmes
              <span aria-hidden="true">↗</span>
            </a>
            <Link className="pg-hero-text-link" to="/courses">
              Browse individual courses
            </Link>
          </div>
          <div className="pg-hero-meta" aria-label="Programme format">
            <span>{readyCount} authored programmes</span>
            <span>Self-paced</span>
            <span>Project-led</span>
          </div>
        </div>

        <figure className="pg-hero-photo">
          <img src={HERO_IMAGE} alt="Students working together on laptops in a classroom" />
          <figcaption>
            <span>01</span>
            <strong>Study → practise → build</strong>
            <em>Real learning, composed as a single path.</em>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
