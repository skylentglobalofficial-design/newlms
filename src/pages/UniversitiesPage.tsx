import { Link } from "react-router-dom"
import { CertificateOsPreview } from "../components/product/ProductLanguage"
import { PROGRAMS_STUDY_LIBRARY, PROGRAMS_STUDY_UNIVERSITY } from "../media"
import { PublicEditorialShell } from "./public-editorial"

const CHAPTERS = [
  {
    n: "01",
    title: "Academic structure",
    desc: "Faculty and programme leads define outcomes, credit alignment, and assessment structure with Skylent. Curriculum mapping sits across schools and departments — not as a student course catalogue.",
  },
  {
    n: "02",
    title: "Programme delivery",
    desc: "LMS workflows, faculty tools, learner progress, and skills tracks on shared institutional rails. Delivery uses what already ships for learners: written programmes, quizzes, and assignments inside enrolled courses.",
  },
  {
    n: "03",
    title: "Learner experience",
    desc: "Formative and summative assessment data tied to learner records — not stranded in spreadsheets. Progress is visible to the learner in the LMS. Parent and admin audit tools, and faculty assignment, are not built yet.",
  },
  {
    n: "04",
    title: "Career and skills connection",
    desc: "Where programmes qualify, learners move into Career OS for portfolios, applications, and interview prep. Opportunities stay empty until a partner publishes a role.",
  },
] as const

const IMPLEMENTATION = [
  "Curriculum mapping across schools and departments",
  "Faculty dashboards and assessment workflows",
  "Learner progress parents and admins can audit",
  "Career OS for qualifying professional pathways",
] as const

const EXAMPLE_PROGRAMS = [
  { n: "01", name: "B.Sc. Data Science", dur: "3 years", focus: "Analytics pathway with project portfolio" },
  { n: "02", name: "PG Diploma in AI", dur: "1 year", focus: "Applied ML with faculty-reviewed projects" },
  { n: "03", name: "MBA Tech", dur: "2 years", focus: "Product and technology management cases" },
] as const

export default function UniversitiesPage() {
  return (
    <PublicEditorialShell>
      <section className="pe-hero" aria-labelledby="uni-hero-title">
        <div className="cat-rail pe-hero-stage">
          <div className="pe-hero-copy">
            <p className="pe-eyebrow">
              <i aria-hidden="true" />
              Universities
            </p>
            <h1 id="uni-hero-title">
              <span>Degree pathways</span>
              <span>with institutional depth.</span>
            </h1>
            <p className="pe-lead">
              Curriculum design, delivery infrastructure, assessment, and career readiness — structured for
              multi-department universities. This is a partnership and product page, not a student course catalogue.
            </p>
            <p className="pe-note">
              Illustrative programme examples below. No partner university names or placement statistics are published
              here.
            </p>
            <p className="pe-actions">
              <Link className="pe-cta" to="/contact">
                Talk to partnerships
                <span className="pe-cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link className="pe-cta-ghost" to="/institutions">
                All institution types
              </Link>
            </p>
          </div>
          <figure className="pe-figure">
            <div className="pe-photo is-university">
              <img
                src={PROGRAMS_STUDY_UNIVERSITY}
                alt="Adult learners working together in a university library"
                width={1800}
                height={1200}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>University study — not a marketing campus shot</figcaption>
          </figure>
        </div>
      </section>

      <nav className="pe-inkbar" aria-label="University model">
        <div className="cat-rail pe-inkbar-inner">
          <a href="#structure">01 Structure</a>
          <a href="#delivery">02 Delivery</a>
          <a href="#experience">03 Experience</a>
          <a href="#career">04 Career</a>
        </div>
      </nav>

      <section className="pe-ink" id="work" aria-labelledby="uni-work-title">
        <div className="cat-rail pe-ink-stage">
          <div>
            <p className="pe-kicker">Programme workspace</p>
            <h2 id="uni-work-title">Build the degree around the work.</h2>
            <p className="pe-lead">
              Academic lines remain in design. Learners can already enrol on live professional programmes. The
              specimen is the learner product that already exists — not a faculty dashboard.
            </p>
            <p className="pe-note">
              Batches, faculty assignment, and institutional reporting are not shipping.
            </p>
          </div>
          <div className="pe-product">
            <CertificateOsPreview />
          </div>
        </div>
      </section>

      <section className="pe-section" id="collaboration" aria-labelledby="uni-model-title">
        <div className="cat-rail">
          <p className="pe-kicker">Collaboration model</p>
          <h2 id="uni-model-title">From academic design to career handoff.</h2>
          <p className="pe-lead">A delivery model for universities — not a student course catalogue.</p>
          {CHAPTERS.map((chapter, index) => (
            <article
              className={index % 2 === 1 ? "pe-folio is-flip" : "pe-folio"}
              key={chapter.n}
              id={["structure", "delivery", "experience", "career"][index]}
            >
              <p className="pe-folio-n" aria-hidden="true">
                {chapter.n}
              </p>
              <div className="pe-folio-copy">
                <p className="pe-kicker">{chapter.n}</p>
                <h3>{chapter.title}</h3>
                <p>{chapter.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pe-section is-warm" id="implementation" aria-labelledby="uni-impl-title">
        <div className="cat-rail pe-split is-photo">
          <figure className="pe-figure">
            <div className="pe-photo is-library">
              <img
                src={PROGRAMS_STUDY_LIBRARY}
                alt="College students studying at a library table"
                width={1800}
                height={1200}
                decoding="async"
              />
            </div>
            <figcaption>Shared study space across a campus</figcaption>
          </figure>
          <div>
            <p className="pe-kicker">Implementation</p>
            <h2 id="uni-impl-title">Shared infrastructure across departments.</h2>
            <p className="pe-lead">
              Universities would use Skylent for multi-program curriculum, faculty workflows, learner lifecycle
              visibility, and outcomes reporting — with skills and career products where programmes require them.
            </p>
            <ol className="pe-list">
              {IMPLEMENTATION.map((line, index) => (
                <li key={line}>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  {line}
                </li>
              ))}
            </ol>
            <p className="pe-note">Faculty dashboards listed here are intended, not live.</p>
          </div>
        </div>
      </section>

      <section className="pe-section is-paper" id="examples" aria-labelledby="uni-examples-title">
        <div className="cat-rail">
          <p className="pe-kicker">Illustrative programmes</p>
          <h2 id="uni-examples-title">Example university pathways.</h2>
          <p className="pe-lead">
            Sample listings for product exploration — not verified partnerships or live enrolments.
          </p>
          <div className="pe-examples is-anatomy">
            {EXAMPLE_PROGRAMS.map((program) => (
              <article className="pe-example" key={program.name}>
                <p className="pe-kicker">{program.n}</p>
                <div>
                  <h3>{program.name}</h3>
                  <p>{program.focus}</p>
                </div>
                <p className="pe-kicker">{program.dur} · example</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pe-close" aria-labelledby="uni-close-title">
        <div className="cat-rail">
          <p className="pe-kicker">Institutional partnerships</p>
          <h2 id="uni-close-title">Discuss a university deployment with Skylent.</h2>
          <p className="pe-lead">
            We map academic structure, delivery workflows, and career handoff before any programme goes live.
          </p>
          <p className="pe-actions">
            <Link className="pe-cta" to="/contact">
              Contact partnerships
              <span className="pe-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="pe-cta-ghost" to="/institutions">
              View all institutions
            </Link>
          </p>
        </div>
      </section>
    </PublicEditorialShell>
  )
}
