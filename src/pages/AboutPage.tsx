import { Link } from "react-router-dom"
import { PROGRAMS_STUDY_LIBRARY } from "../media"
import { PublicEditorialShell } from "./public-editorial"

const GAP_STAGES = [
  { label: "Learning", sub: "Academic programmes and structured coursework" },
  { label: "Practice", sub: "Activities, assessments, and applied work" },
  { label: "Proof", sub: "Projects, credentials, and portfolio artefacts" },
  { label: "Career", sub: "Profile, interview prep, jobs, applications" },
  { label: "Institutions", sub: "Infrastructure to deliver and measure outcomes" },
] as const

const SYSTEM = [
  {
    label: "Education",
    body: "Schooling, undergraduate, postgraduate, and competitive exams as distinct products — not one generic academic page.",
    to: "/education",
  },
  {
    label: "Skills",
    body: "Certificate programmes and professional programmes are the live skills products. Workshop registration is not live.",
    to: "/skills",
  },
  {
    label: "Career OS",
    body: "The workspace where learning evidence lives, alongside your profile, applications, and interview preparation. Not a job board.",
    to: "/career-os",
  },
  {
    label: "Institutions",
    body: "Infrastructure for schools, colleges, universities, training institutes, assessment partners, and industry.",
    to: "/institutions",
  },
] as const

const LEARNER_STEPS = [
  { label: "Learn", sub: "Programmes and coursework" },
  { label: "Practice", sub: "Activities and assessments" },
  { label: "Build", sub: "Projects and applied work" },
  { label: "Prove", sub: "Portfolio and credentials" },
  { label: "Prepare", sub: "Interview preparation" },
  { label: "Apply", sub: "When a role is published" },
  { label: "Track", sub: "Application status" },
] as const

const PRODUCT_MAP = [
  { label: "Programmes", sub: "Education and skills catalogue" },
  { label: "Learning", sub: "Curriculum, lessons, cohort" },
  { label: "Projects / Assessments", sub: "Work that becomes proof" },
  { label: "Career proof", sub: "Profile, resume, portfolio" },
  { label: "Career OS", sub: "Evidence, profile, applications" },
  { label: "Opportunities", sub: "Roles to discover and apply — if published" },
] as const

const AUDIENCES = [
  { label: "School learners & parents", desc: "Schooling workflows with parent-visible progress.", to: "/education#schooling" },
  { label: "Undergraduate learners", desc: "Degree-aligned programmes, projects, and career direction.", to: "/education#undergraduate" },
  { label: "Postgraduate learners", desc: "Specialisation tracks with professional outcomes.", to: "/education#postgraduate" },
  { label: "Exam aspirants", desc: "JEE, NEET, CAT — practice, mocks, and analytics.", to: "/education#competitive-exams" },
  { label: "Skill learners", desc: "Certificates and professional programmes. Workshop listings are coming soon.", to: "/skills" },
  { label: "Career seekers", desc: "Career OS — the workspace where your learning evidence becomes something you can present.", to: "/career-os" },
  { label: "Institutions", desc: "Schools, colleges, universities, and training partners.", to: "/institutions" },
] as const

const INSTITUTION_ITEMS = [
  "Programs",
  "Offerings",
  "Batches",
  "Learners",
  "Faculty",
  "Curriculum",
  "Assessments",
  "Progress",
] as const

const CAREER_ITEMS = [
  "Career Profile",
  "Resume readiness",
  "Interview Preparation",
  "Job Board",
  "Applications",
  "Career Support",
] as const

const SURFACES = [
  { label: "Education", desc: "Schooling, undergraduate, postgraduate, and exam preparation products.", to: "/education" },
  { label: "Skills", desc: "Certificates, professional programmes, and Career OS. Workshops are listings only.", to: "/skills" },
  { label: "Career", desc: "Career OS workspace for profile, prep, jobs, and applications.", to: "/career-os" },
  { label: "Institutions", desc: "Partnership workflows for schools, colleges, and training institutes.", to: "/institutions" },
  { label: "Programmes", desc: "The catalogue connecting learners to every product surface.", to: "/programs" },
] as const

export default function AboutPage() {
  return (
    <PublicEditorialShell>
      <section className="pe-hero is-essay" id="story" aria-labelledby="about-hero-title">
        <div className="cat-rail pe-hero-stage">
          <div className="pe-hero-copy">
            <p className="pe-eyebrow">
              <i aria-hidden="true" />
              About Skylent
            </p>
            <h1 id="about-hero-title">
              <span>Education → skills</span>
              <span>→ career → institutions.</span>
            </h1>
            <p className="pe-lead">
              We are building the infrastructure where students, parents, institutions, and employers can meet — with
              product depth, not marketing claims.
            </p>
            <p className="pe-actions">
              <Link className="pe-cta" to="/programs">
                Explore programmes
                <span className="pe-cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link className="pe-cta-ghost" to="/contact">
                Contact
              </Link>
            </p>
          </div>
          <figure className="pe-figure">
            <div className="pe-photo is-library">
              <img
                src={PROGRAMS_STUDY_LIBRARY}
                alt="College students studying together at a library table"
                width={1800}
                height={1200}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>Learning as a shared practice</figcaption>
          </figure>
        </div>
      </section>

      <section className="pe-section" id="gap" aria-labelledby="about-gap-title">
        <div className="cat-rail pe-split">
          <div>
            <p className="pe-kicker">01 · The gap</p>
            <h2 id="about-gap-title">Close the distance between what people learn and what they can do next.</h2>
            <p className="pe-lead">
              Students need more than lectures. Parents need visibility. Institutions need infrastructure. Employers
              need people who can contribute. Skylent is built so those needs meet in one system.
            </p>
            <p className="pe-note">
              The gap is not a single missing feature — it is the disconnect between learning, practice, proof, career
              readiness, and the institutions that deliver education at scale.
            </p>
          </div>
          <ol className="pe-chain">
            {GAP_STAGES.map((stage, index) => (
              <li key={stage.label}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <div>
                  <strong>{stage.label}</strong>
                  <span>{stage.sub}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pe-section is-paper" id="idea" aria-labelledby="about-idea-title">
        <div className="cat-rail">
          <p className="pe-kicker">02 · The idea</p>
          <h2 id="about-idea-title">One system for learning, proof, and what comes next.</h2>
          <p className="pe-lead">
            Skylent is not a single app and not a founder anecdote. It is a connected layer: academic lines where they
            belong, skills products you can start, Career OS for the work you keep, and an institution layer for the
            organisations that run education.
          </p>
        </div>
      </section>

      <section className="pe-section" id="ecosystem" aria-labelledby="about-system-title">
        <div className="cat-rail">
          <p className="pe-kicker">03 · The system</p>
          <h2 id="about-system-title">Four products that connect.</h2>
          <p className="pe-lead">
            Education, Skills, Career OS, and Institutions are separate products with separate pages — designed to work
            together when a learner is ready to move on.
          </p>
          <div className="pe-rows">
            {SYSTEM.map((item, index) => (
              <Link className="pe-row" key={item.label} to={item.to}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.body}</span>
                </div>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
          <p className="pe-kicker is-spaced" id="journey">From programmes to opportunities</p>
          <p className="pe-lead">
            Each step maps to product surfaces already in Skylent — not a marketing funnel, but an implemented journey.
          </p>
          <div className="pe-split">
            <div>
              <p className="pe-kicker">Learner journey</p>
              <ol className="pe-list">
                {LEARNER_STEPS.map((step, index) => (
                  <li key={step.label}>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    <span>
                      <strong>{step.label}. </strong>
                      {step.sub}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="pe-kicker">Product surfaces</p>
              <ol className="pe-list">
                {PRODUCT_MAP.map((item, index) => (
                  <li key={item.label}>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    <span>
                      <strong>{item.label}. </strong>
                      {item.sub}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="pe-section is-warm" id="who-we-serve" aria-labelledby="about-serve-title">
        <div className="cat-rail">
          <p className="pe-kicker">04 · Who it serves</p>
          <h2 id="about-serve-title">Built for learners and the institutions that support them.</h2>
          <p className="pe-lead">
            Each audience has a distinct workflow in Skylent — not one generic user type forced into the same product.
          </p>
          <div className="pe-rows">
            {AUDIENCES.map((group, index) => (
              <Link className="pe-row" key={group.label} to={group.to}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <div>
                  <strong>{group.label}</strong>
                  <span>{group.desc}</span>
                </div>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pe-section" id="institutions" aria-labelledby="about-inst-title">
        <div className="cat-rail">
          <p className="pe-kicker">05 · Where institutions fit</p>
          <h2 id="about-inst-title">Infrastructure institutions run on. Career readiness as a product.</h2>
          <div className="pe-split">
            <div>
              <p className="pe-kicker">Institution side</p>
              <p className="pe-lead">
                Long-term, Skylent OS is curriculum, assessment, skills, and career readiness as shared infrastructure
                — for schools through universities, training partners, and industry.
              </p>
              <ol className="pe-list">
                {INSTITUTION_ITEMS.map((item, index) => (
                  <li key={item}>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    {item}
                  </li>
                ))}
              </ol>
              <p className="pe-note">Batches, faculty assignment, and reporting are not built yet.</p>
              <p className="pe-actions">
                <Link className="pe-cta-ghost" to="/institutions">
                  For institutions
                </Link>
              </p>
            </div>
            <div>
              <p className="pe-kicker">Career side</p>
              <p className="pe-lead">
                Career OS is the workspace for the work you produced. Profile, evidence, applications, and interview
                preparation live here. Opportunities stay empty until a partner publishes a role.
              </p>
              <ol className="pe-list">
                {CAREER_ITEMS.map((item, index) => (
                  <li key={item}>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    {item}
                  </li>
                ))}
              </ol>
              <p className="pe-actions">
                <Link className="pe-cta-ghost" to="/career-os">
                  Explore Career OS
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pe-section is-paper" id="platform" aria-labelledby="about-build-title">
        <div className="cat-rail">
          <p className="pe-kicker">06 · What Skylent is building</p>
          <h2 id="about-build-title">Become the education and career platform institutions run on.</h2>
          <p className="pe-lead">
            Skylent OS is not a single app — it is the connected layer where curriculum, skills, career readiness, and
            institutional delivery meet.
          </p>
          <div className="pe-rows">
            {SURFACES.map((surface, index) => (
              <Link className="pe-row" key={surface.label} to={surface.to}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <div>
                  <strong>{surface.label}</strong>
                  <span>{surface.desc}</span>
                </div>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
          <aside className="pe-scope">
            <p className="pe-kicker">Honest company</p>
            <p className="pe-lead">
              We do not publish student counts, placement rates, or partner logos we cannot verify. Credibility is
              product depth, honest enrolment, and institutions that can actually run on this platform.
            </p>
          </aside>
        </div>
      </section>

      <section className="pe-close" aria-labelledby="about-close-title">
        <div className="cat-rail">
          <p className="pe-kicker">Get in touch</p>
          <h2 id="about-close-title">Education, skills, career. Built as connected products.</h2>
          <p className="pe-lead">
            Explore programmes, partner as an institution, or contact us to learn what Skylent can support today.
          </p>
          <p className="pe-actions">
            <Link className="pe-cta" to="/programs">
              Explore programmes
              <span className="pe-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="pe-cta-ghost" to="/institutions">
              For institutions
            </Link>
            <Link className="pe-cta-ghost" to="/education">
              Explore education
            </Link>
          </p>
        </div>
      </section>
    </PublicEditorialShell>
  )
}
