import { useState } from "react"
import { Link } from "react-router-dom"
import { MaturityMark } from "../components/product/Architecture"
import { SkylentOsPreview } from "../components/product/ProductLanguage"
import { INSTITUTION_OS_LAYERS } from "../lib/product-architecture"
import { PROGRAMS_STUDY_CAMPUS } from "../media"
import { PublicEditorialShell } from "./public-editorial"

type InstitutionType = {
  id: string
  label: string
  rail: string
  sub: string
  problem: string
  value: string
  workflow: readonly string[]
  description: string
  offers: readonly string[]
  href?: string
  hrefLabel?: string
}

const INSTITUTION_TYPES: InstitutionType[] = [
  {
    id: "schools",
    label: "Schools",
    rail: "Schools",
    sub: "K–12 · Secondary · Senior Secondary",
    problem: "Academic progress is hard for parents and teachers to see in one place.",
    value: "Students, teachers, classes, assessments, parent visibility, and progress in a schooling workflow.",
    workflow: ["Students", "Teachers", "Classes", "Assessments", "Parent view", "Progress"],
    description:
      "Introduce structured learning, activities, and career awareness before higher education — without turning school into a corporate LMS.",
    offers: [
      "Grade → subject → chapter → lesson delivery",
      "Activities and assessments teachers can run",
      "Parent-visible progress",
      "Faculty development resources",
    ],
  },
  {
    id: "colleges",
    label: "Colleges",
    rail: "Colleges",
    sub: "Degree Colleges · Autonomous Institutions",
    problem: "Degrees finish. Employability does not arrive automatically.",
    value: "Programs, departments, LMS, skills, projects, and career readiness alongside the academic calendar.",
    workflow: ["Programs", "Departments", "Students", "LMS", "Projects", "Career OS"],
    description:
      "Pair undergraduate study with professional programs, projects, and a path into Career OS for qualifying students.",
    offers: [
      "Professional Programs beside the degree",
      "Skills tracks and project portfolios",
      "Career OS for qualifying students",
      "Interview and application workflow",
    ],
  },
  {
    id: "universities",
    label: "Universities",
    rail: "Universities",
    sub: "Multi-program · Research Institutions",
    problem: "Scale across departments without fragmenting student lifecycle and outcomes.",
    value: "Multi-program curriculum, assessments, student lifecycle, and outcomes as shared infrastructure.",
    workflow: ["Multi-program", "Departments", "Curriculum", "Assessments", "Lifecycle", "Outcomes"],
    description:
      "Run Skylent OS as institutional infrastructure — curriculum enrichment, LMS, career readiness, postgraduate tracks.",
    offers: [
      "Curriculum co-design across departments",
      "LMS and assessment infrastructure",
      "Career readiness at graduate scale",
      "Postgraduate specialisation tracks",
    ],
    href: "/universities",
    hrefLabel: "University partnership page",
  },
  {
    id: "skill-institutions",
    label: "Skill & Training Institutions",
    rail: "Training",
    sub: "Training Centers · Vocational · EdTech",
    problem: "Batches, trainers, and certificates live in spreadsheets, not a career path.",
    value: "Programs, batches, trainers, learners, certification, and career support as one delivery system.",
    workflow: ["Programs", "Batches", "Trainers", "Learners", "Certification", "Career support"],
    description: "Power delivery with Skylent infrastructure — credentials and Career OS for qualifying graduates.",
    offers: [
      "Batch and trainer operations",
      "Certification framework",
      "Career OS for qualifying learners",
      "Job board connection — when roles are published",
    ],
  },
  {
    id: "assessment",
    label: "Assessment & Exam Partners",
    rail: "Assessment",
    sub: "Boards · Assessment Bodies · Coaching",
    problem: "Tests end at a score. Learners need a path after the result.",
    value: "Question banks, tests, attempts, scoring, and analytics — linked to learning, not stranded.",
    workflow: ["Question banks", "Tests", "Attempts", "Scoring", "Analytics"],
    description:
      "Connect examination infrastructure to continuous learning and, where relevant, exam-prep products (JEE, NEET, CAT).",
    offers: [
      "Assessment technology integration",
      "Analytics on attempts and scoring",
      "Link scores to learning pathways",
      "Exam-prep product collaboration",
    ],
  },
  {
    id: "industry",
    label: "Academic & Industry Partners",
    rail: "Industry",
    sub: "Employers · Industry Bodies · Curriculum partners",
    problem: "Hiring and curriculum rarely share the same pipeline.",
    value: "Projects, experts, curriculum collaboration, and employability — co-designed, not bolted on.",
    workflow: ["Projects", "Experts", "Curriculum", "Employability"],
    description: "Co-design programs that create a talent pipeline from education into your industry.",
    offers: [
      "Custom program co-design",
      "Expert and project collaboration",
      "Employability-aligned curriculum",
      "Hiring pathway into Career OS when roles exist",
    ],
  },
]

const CONNECT = [
  {
    name: "Education",
    note: "Coming soon",
    items: ["Schooling pathway", "Undergraduate tracks", "Postgraduate specialisation"],
  },
  {
    name: "Skills",
    note: "Live core",
    items: ["Courses", "Certificate programmes", "Professional programmes"],
  },
  {
    name: "Career OS",
    note: "Live workspace",
    items: ["Profile and evidence", "Opportunities when published", "Applications and interviews"],
  },
] as const

const COLLABORATION = [
  {
    n: "01",
    label: "Understand",
    desc: "We map your institution's needs, learner profile, and current gaps.",
  },
  {
    n: "02",
    label: "Configure",
    desc: "Faculty, curriculum leads, and Skylent design the programme together. Then we configure what already ships: organisation accounts, live programmes, and LMS progress.",
  },
  {
    n: "03",
    label: "Launch",
    desc: "Learners enrol on open programmes. Batches and faculty assignment are not built yet.",
  },
  {
    n: "04",
    label: "Improve",
    desc: "Partnership review against real enrolment and LMS progress — not a reporting suite.",
  },
] as const

const SCOPE = [
  { k: "Live for learners", v: "Programmes, LMS, Career OS" },
  { k: "Organisation account", v: "Sign-in shell exists" },
  { k: "Not built", v: "Batches, faculty assignment, reporting" },
  { k: "Next conversation", v: "Co-design around what already ships" },
] as const

export default function InstitutionsPage() {
  const [activeId, setActiveId] = useState<string>("colleges")

  return (
    <PublicEditorialShell>
      <section className="pe-hero" aria-labelledby="inst-hero-title">
        <div className="cat-rail pe-hero-stage">
          <div className="pe-hero-copy">
            <p className="pe-eyebrow">
              <i aria-hidden="true" />
              Institutions
            </p>
            <h1 id="inst-hero-title">
              <span>Build the learning</span>
              <span>ecosystem around your institution.</span>
            </h1>
            <p className="pe-lead">
              Skylent works with schools, colleges, universities, training partners, assessment bodies, and industry
              on the learning, skills, and career layer around their existing academic work. Institution OS is product
              direction. The organisation dashboard today is an honest shell.
            </p>
            <p className="pe-note">
              Batches, faculty assignment, and institutional reporting are not built. Partnership starts from what
              already ships: live programmes, LMS progress, and Career OS.
            </p>
            <p className="pe-actions">
              <Link className="pe-cta" to="/contact">
                Talk to partnerships
                <span className="pe-cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link className="pe-cta-ghost" to="/login">
                Organisation sign in
              </Link>
            </p>
          </div>
          <figure className="pe-figure">
            <div className="pe-photo is-campus">
              <img
                src={PROGRAMS_STUDY_CAMPUS}
                alt="A university student working on a laptop on campus"
                width={1800}
                height={1200}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>Study on campus — not a live class</figcaption>
          </figure>
        </div>
      </section>

      <nav className="pe-inkbar" aria-label="Institution types">
        <div className="cat-rail pe-inkbar-inner" role="radiogroup">
          {INSTITUTION_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === activeId}
              className={item.id === activeId ? "is-on" : undefined}
              onClick={() => {
                setActiveId(item.id)
                document.getElementById("institution-types")?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              {item.rail}
            </button>
          ))}
        </div>
      </nav>

      <section className="pe-section is-warm" id="institution-types" aria-labelledby="inst-types-title">
        <div className="cat-rail">
          <p className="pe-kicker">Who Skylent works with</p>
          <h2 id="inst-types-title">Partnership by institution type.</h2>
          <p className="pe-lead">
            An operating map — not a live control panel. Select a type to open the intended spine we would build with
            that partner.
          </p>

          <div className="pe-map">
            {INSTITUTION_TYPES.map((item, index) => {
              const selected = item.id === activeId
              return (
                <div key={item.id} className={selected ? "pe-map-item is-on" : "pe-map-item"}>
                  <button
                    type="button"
                    className="pe-map-row"
                    aria-expanded={selected}
                    onClick={() => setActiveId(item.id)}
                  >
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.sub}</span>
                    </div>
                    <b aria-hidden="true">→</b>
                  </button>
                  {selected ? (
                    <div className="pe-map-detail">
                      <p>
                        <strong>Problem. </strong>
                        {item.problem}
                      </p>
                      <p>{item.value}</p>
                      <p>{item.description}</p>
                      <p className="pe-note">Product direction · not a live control panel</p>
                      <ol className="pe-map-rail" aria-label="Intended workflow">
                        {item.workflow.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                      <p className="pe-actions">
                        <Link className="pe-cta" to="/contact">
                          Enquire now
                          <span className="pe-cta-arrow" aria-hidden="true">
                            →
                          </span>
                        </Link>
                        {item.href ? (
                          <Link className="pe-cta-ghost" to={item.href}>
                            {item.hrefLabel}
                          </Link>
                        ) : null}
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pe-section is-warm" id="ecosystem" aria-labelledby="inst-connect-title">
        <div className="cat-rail">
          <p className="pe-kicker">What institutions can connect</p>
          <h2 id="inst-connect-title">From institutional intent to a working learning system.</h2>
          <p className="pe-lead">
            Live professional programmes, LMS progress, and Career OS are real. Academic lines and institutional
            reporting are not.
          </p>
          <div className="pe-ink-stage">
            <div>
              <div className="pe-connect">
                {CONNECT.map((col) => (
                  <div className="pe-connect-col" key={col.name}>
                    <h3>{col.name}</h3>
                    <p className="pe-kicker">{col.note}</p>
                    <ol className="pe-list">
                      {col.items.map((item, index) => (
                        <li key={item}>
                          <em>{String(index + 1).padStart(2, "0")}</em>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <ol className="pe-caprail" aria-label="Capability versus what ships">
                {INSTITUTION_OS_LAYERS.map((item) => (
                  <li key={item.label} className={item.status === "live" ? "is-live" : undefined}>
                    <strong>{item.label}</strong>
                    <span>
                      <MaturityMark maturity={item.status} compact />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="pe-product">
              <SkylentOsPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="pe-section is-paper" id="partnership" aria-labelledby="inst-collab-title">
        <div className="cat-rail">
          <p className="pe-kicker">How collaboration takes shape</p>
          <h2 id="inst-collab-title" className="is-quiet">Understand, configure, launch, improve.</h2>
          <p className="pe-lead">
            Partnership starts with a conversation. Full Institution OS — batches, faculty, reporting — is the intended
            product, not what an organisation account can run today.
          </p>
          <ol className="pe-track">
            {COLLABORATION.map((step) => (
              <li key={step.n}>
                <p className="pe-kicker">{step.n}</p>
                <h3>{step.label}</h3>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pe-close" id="enquiries" aria-labelledby="inst-close-title">
        <div className="cat-rail">
          <p className="pe-kicker">Institutional partnership</p>
          <h2 id="inst-close-title">Bring Skylent to your institution.</h2>
          <p className="pe-lead">
            Get in touch to discuss your institution's needs. We will map a partnership that fits your learners, your
            curriculum, and what already ships.
          </p>
          <ul className="pe-marks">
            <li>
              <i aria-hidden="true" />
              No long lock-ins
            </li>
            <li>
              <i aria-hidden="true" />
              Co-designed programmes
            </li>
            <li>
              <i aria-hidden="true" />
              Organisation accounts exist
            </li>
            <li>
              <i aria-hidden="true" />
              Honest capability map
            </li>
          </ul>
          <p className="pe-actions">
            <Link className="pe-cta" to="/contact">
              Partner with Skylent
              <span className="pe-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="pe-cta-ghost" to="/career-os">
              View Career OS
            </Link>
          </p>
          <aside className="pe-scope">
            <p className="pe-kicker">What is in scope now</p>
            <dl>
              {SCOPE.map((row) => (
                <div key={row.k}>
                  <dt>{row.k}</dt>
                  <dd>{row.v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </PublicEditorialShell>
  )
}
