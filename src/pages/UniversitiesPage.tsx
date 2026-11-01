import { Link } from "react-router-dom"
import { CertificateOsPreview } from "../components/product/ProductLanguage"
import { PROGRAMS_STUDY_LIBRARY, PROGRAMS_STUDY_UNIVERSITY } from "../media"
import { PublicEditorialShell } from "./public-editorial"

const CHAPTERS = [
  {
    n: "01",
    title: "Academic structure",
    desc: "Faculty and programme leads define outcomes, credit alignment, and assessment structure with Skylent. Curriculum mapping sits across schools and departments.",
  },
  {
    n: "02",
    title: "Programme delivery",
    desc: "LMS workflows, cohort tools, learner progress, and applied skills tracks on shared institutional rails: written lessons, quizzes, and studio assignments inside enrolled courses.",
  },
  {
    n: "03",
    title: "Learner experience",
    desc: "Formative and summative assessment data tied to learner records—not stranded in spreadsheets. Progress is visible to both the learner and institutional coordinators inside Skylent OS.",
  },
  {
    n: "04",
    title: "Career and skills connection",
    desc: "Where programmes qualify, learners build verified capstone portfolios, ATS profiles, and interview readiness inside Career OS alongside their university degree.",
  },
] as const

const IMPLEMENTATION = [
  "Curriculum mapping across schools and departments",
  "Cohort progress tracking and assessment workflows",
  "Verifiable capstone dossiers (/verify) for graduating students",
  "Career OS portfolio readiness for qualifying pathways",
] as const

const EXAMPLE_REFERENCES = [
  {
    n: "01",
    name: "Undergraduate Technology Pathway (B.Sc. / B.Tech Supplement)",
    focus: "Partner university awards the degree · Skylent OS provides the applied SQL, Python, and AI studio modules.",
  },
  {
    n: "02",
    name: "Postgraduate Computing & Analytics Pathway",
    focus: "Partner university awards the degree · Skylent OS provides graded capstone datasets and Career OS portfolio integration.",
  },
  {
    n: "03",
    name: "Postgraduate Management & Product Strategy Pathway",
    focus: "Partner university awards the degree · Skylent OS provides Harbor Desk case simulations and structured PRD evaluations.",
  },
] as const

export default function UniversitiesPage() {
  return (
    <PublicEditorialShell>
      <section className="pe-hero" aria-labelledby="uni-hero-title">
        <div className="cat-rail pe-hero-stage">
          <div className="pe-hero-copy">
            <p className="pe-eyebrow">
              <i aria-hidden="true" />
              Universities &amp; Higher Education
            </p>
            <h1 id="uni-hero-title">
              <span>Degree pathways</span>
              <span>with institutional depth.</span>
            </h1>
            <p className="pe-lead">
              Curriculum design, applied studio labs, structured assessment, and a Career OS portfolio—built to run alongside multi-department university degrees.
            </p>
            <p className="pe-note">
              Partner universities award all academic degrees and credits. Skylent provides the digital learning workspace, browser labs, and verifiable capstone dossiers.
            </p>
            <p className="pe-actions">
              <Link className="pe-cta" to="/contact?for=institution">
                Talk to university partnerships
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
            <figcaption>University study combined with practical browser studios</figcaption>
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

      <section className="pe-section is-warm" id="work" aria-labelledby="uni-work-title">
        <div className="cat-rail pe-ink-stage">
          <div>
            <p className="pe-kicker">Programme workspace</p>
            <h2 id="uni-work-title">Build the degree around real student work.</h2>
            <p className="pe-lead">
              Students complete applied SQL, analytics, and product casework inside Skylent OS alongside their university lectures—graduating with both an academic degree and a verifiable project dossier.
            </p>
            <p className="pe-note">
              Institutional cohorts include dedicated College &amp; Organisation dashboards for tracking student progress.
            </p>
          </div>
          <div className="pe-product">
            <CertificateOsPreview />
            <p className="pe-caption">
              Learner programme workspace inside Skylent OS with integrated module checks and capstone verification.
            </p>
          </div>
        </div>
      </section>

      <section className="pe-section is-paper" id="collaboration" aria-labelledby="uni-model-title">
        <div className="cat-rail">
          <p className="pe-kicker">Collaboration model</p>
          <h2 id="uni-model-title" className="is-quiet">From academic design to career handoff.</h2>
          <p className="pe-lead">A structured delivery model for partner universities and autonomous colleges.</p>
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
            <figcaption>Shared study space across a partner campus</figcaption>
          </figure>
          <div>
            <p className="pe-kicker">Implementation</p>
            <h2 id="uni-impl-title">Shared infrastructure across departments.</h2>
            <p className="pe-lead">
              Universities partner with Skylent to embed industry-aligned labs, case studios, and verifiable career portfolios across undergraduate and postgraduate departments.
            </p>
            <ol className="pe-plain">
              {IMPLEMENTATION.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="pe-section is-paper" id="examples" aria-labelledby="uni-examples-title">
        <div className="cat-rail">
          <p className="pe-kicker">Academic Partner Models</p>
          <h2 id="uni-examples-title">Shapes a university pathway can take.</h2>
          <p className="pe-lead">
            Illustrative co-delivered degree architectures. Partner universities govern admissions, academic credits, and degree conferral.
          </p>
          <div className="pe-examples is-anatomy">
            {EXAMPLE_REFERENCES.map((program) => (
              <article className="pe-example" key={program.name}>
                <p className="pe-kicker">{program.n}</p>
                <div>
                  <h3>{program.name}</h3>
                  <p>{program.focus}</p>
                </div>
                <p className="pe-kicker">Academic Partner Track</p>
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
            We map academic structure, semester studio workflows, and Career OS handoff with your academic leadership team.
          </p>
          <p className="pe-actions">
            <Link className="pe-cta" to="/contact?for=institution">
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
