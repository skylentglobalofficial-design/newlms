/**
 * /about — Skylent Global Pvt. Ltd. (Bhubaneswar, Odisha) Institutional & Founder Dossier.
 */
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import teamPhoto from "@/assets/site/program-product.jpg"
import "./HomePage.v2.css"
import "./HomeRepolish.css"
import "./AboutRepolish.css"

const PRODUCTS = [
  {
    code: "PILLAR 01 · 6 CAREER TRACKS",
    title: "Applied Programmes & Browser Labs",
    text: "5-module, 15-lesson career tracks in Data Analytics, Product Management, Python, Data Science, GenAI, and Full-Stack Web with zero-setup browser sandboxes.",
    badge: "✓ Guest Lab Free · From ₹1,499",
    to: "/programmes",
  },
  {
    code: "PILLAR 02 · UNIVERSITY ARTICULATION",
    title: "Undergraduate (UG) & Postgraduate (PG)",
    text: "Structured academic degree pathways (B.Sc., BCA, BBA, M.Sc., MCA, MBA) pairing partner university credentials with Skylent OS execution labs.",
    badge: "✓ UG & PG Tracks",
    to: "/education",
  },
  {
    code: "PILLAR 03 · MERIT-GATED PORTFOLIO",
    title: "Career OS & Flight Recorder",
    text: "Unlocks automatically at 60% course progress — bringing your verified project reports, 5-dimension rubric scores, and role skill-gap matching into one dossier.",
    badge: "✓ Unlocks at 60%",
    to: "/career-os",
  },
  {
    code: "PILLAR 04 · HYBRID PEDAGOGY",
    title: "Hinglish Study Support + 20-Min TA SLA",
    text: "24/7 first-principles intuition in simple Hinglish or English inside every lesson, backed by human Teaching Assistants on a 20-minute SLA.",
    badge: "✓ 20-Min Human SLA",
    to: "/programmes/data-analytics-pro",
  },
]

const ENVIRONMENTS = [
  {
    code: "ENV A · SIMULATED ENTERPRISE UNITS",
    badge: "Zero Local Setup",
    title: "Northwind Retail SQL & Harbor Desk PRD Studios",
    body: "Instead of watching someone code on YouTube, you execute real SQL queries against our 166-row Northwind retail database, audit Python settlement pipelines, and write 6-week engineering PRDs inside your browser.",
  },
  {
    code: "ENV B · WORK ASSIGNMENT EXCHANGE",
    badge: "V1 → V2 Faculty Critique",
    title: "Human Red-Line Review & Partner Fieldwork",
    body: "Every capstone goes through a structured V1 → V2 faculty red-line critique across our 5-dimension rubric (Knowledge, Execution, Judgement, Oral Defence, and Revision) and qualifies learners for supervised partner briefs.",
  },
  {
    code: "ENV C · EXECUTION FLIGHT RECORDER",
    badge: "Public /verify Ledger",
    title: "Cryptographically Verifiable Proof-of-Work",
    body: "Every graduate receives a permanent, publicly verifiable SKL credential (/verify) that displays the exact SQL queries, data-cleaning logs, and executive memos they produced — not just an attendance PDF.",
  },
]

const COMPARISON_ROWS = [
  {
    dimension: "How You Learn",
    legacy: "Passive pre-recorded videos & generic Zoom lectures where you watch someone else type.",
    skylent: "First-principles written notes + immediate execution inside live browser SQL, Python, PRD & RAG sandboxes.",
  },
  {
    dimension: "Doubt Resolution",
    legacy: " slow forum threads or generic chatbot answers that leak code without building intuition.",
    skylent: "1-click Hinglish + English guided study notes + live human Faculty TA escalation within 20 minutes.",
  },
  {
    dimension: "How You Are Assessed",
    legacy: "Multiple-choice trivia quizzes and auto-generated completion certificates.",
    skylent: "5-Dimension Competency Rubric (15% Knowledge · 30% Execution · 20% Judgement · 15% Oral Defence · 20% V1→V2 Revision).",
  },
  {
    dimension: "Financial Transparency",
    legacy: "High-pressure ₹1.5L–₹2.5L NBFC loan contracts and inflated placement claims.",
    skylent: "Try our interactive Guest Browser Labs free, attend ₹99 weekend sprints with 100% Elixir Coin cashback, and enrol in full tracks from ₹1,499.",
  },
  {
    dimension: "What Employers See",
    legacy: "A static PDF certificate that looks identical for every student.",
    skylent: "A live Proof-of-Work Dossier on skylent.live/verify showing your saved SQL queries, rubric breakdown, and capstone defense.",
  },
]

const AUDIENCES = [
  {
    title: "College Students (UG & PG)",
    text: "Build verifiable SQL, Product, Python, and AI project portfolios alongside your semester coursework so you graduate with real work samples.",
    to: "/programmes",
  },
  {
    title: "Working Professionals & Career Switchers",
    text: "Master applied data, product, or engineering workflows through self-paced modules and weekend ₹99 live execution sprints.",
    to: "/events",
  },
  {
    title: "Universities, Autonomous Colleges & Deans",
    text: "Deploy Skylent's Isolated College Tenant OS, browser labs, and NAAC/NIRF-ready cohort telemetry across your academic departments.",
    to: "/institutions",
  },
  {
    title: "Hiring Managers & Technical Recruiters",
    text: "Verify any candidate's SKL credential code in one click and inspect their actual SQL queries, PRD specs, and faculty rubric scores.",
    to: "/verify/SKL-2026-DA-EXEMPLAR",
  },
]

export default function AboutPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page abx">
        {/* 2-Column Institutional Hero */}
        <section className="abx-hero" aria-labelledby="abx-title">
          <div className="sky-container abx-hero__split">
            <div className="abx-hero__main">
              <span className="abx-eyebrow-pill">
                SKYLENT GLOBAL PVT. LTD. · BHUBANESWAR, ODISHA · INDIA
              </span>
              <h1 id="abx-title" className="abx-h1">
                An Institute of Applied Learning built on <em>verifiable execution, not passive video.</em>
              </h1>
              <p className="abx-lead">
                Headquartered in Bhubaneswar, Odisha, Skylent combines structured self-paced coursework, zero-setup browser labs, 20-minute human Faculty TA support, and cryptographically verifiable Proof-of-Work dossiers into one unified operating system for learners and universities across India.
              </p>
              <div className="hx-hero__actions" style={{ marginTop: 22 }}>
                <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                  Explore all 6 programmes
                  <ArrowRight />
                </Link>
                <Link className="sk-btn sk-btn-secondary hx-btn" to="/verify/SKL-2026-DA-EXEMPLAR">
                  Inspect live exemplar dossier
                </Link>
                <Link className="sk-btn sk-btn-secondary hx-btn" to="/contact">
                  Talk to our team
                </Link>
              </div>
            </div>

            {/* Right-Hand Institutional Charter & Architecture Card */}
            <aside className="abx-charter-card" aria-label="Skylent Institutional Architecture">
              <div className="abx-charter-card__top">
                <span className="abx-charter-card__code">INSTITUTIONAL CHARTER · SKYLENT OS</span>
                <span className="abx-charter-card__badge">✓ Live in Production</span>
              </div>
              <h2 className="abx-charter-card__title">
                The 5-Stage Applied Learning Loop
              </h2>
              <p className="abx-charter-card__sub">
                Every course, workshop, and university pathway inside Skylent runs on the same verifiable five-stage cycle:
              </p>
              <ol className="abx-charter-card__steps">
                {[
                  ["01 · LEARN", "First-principles written notes + Hinglish/English study hints"],
                  ["02 · PRACTISE", "In-browser SQL, Python, PRD & RAG sandboxes with zero setup"],
                  ["03 · WORK", "Graded module briefs & supervised partner fieldwork"],
                  ["04 · REFLECT", "Boardroom Cold Call oral defense & V1 → V2 faculty revision"],
                  ["05 · PROVE", "Publicly verifiable SKL Dossier on skylent.live/verify"],
                ].map(([step, desc]) => (
                  <li key={step}>
                    <strong>{step}</strong>
                    <span>{desc}</span>
                  </li>
                ))}
              </ol>
              <div className="abx-charter-card__foot">
                <div>
                  <span>INDIA HQ</span>
                  <strong>Bhubaneswar, Odisha</strong>
                </div>
                <div>
                  <span>DOUBT SLA</span>
                  <strong>20-Min Human TA</strong>
                </div>
                <div>
                  <span>ENTRY MODEL</span>
                  <strong>Guest Lab Free · From ₹1,499</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Founder & Mission Section + 3-Environment Architecture */}
        <section className="abx-section" aria-labelledby="abx-founder">
          <div className="sky-container">
            <div className="abx-founder-box">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">Why We Built Skylent in Bhubaneswar</p>
                <h2 id="abx-founder" className="hx-h2 hx-h2--sm">
                  Replacing passive attendance certificates and ₹2,00,000 bootcamp debt traps with real proof of work.
                </h2>
                <p className="abx-founder-copy">
                  Across engineering and degree colleges in Odisha and India, we saw bright, capable students graduate with stacks of video-completion certificates that hiring managers ignored — or get pushed into high-interest ₹2 Lakh loans for generic online lectures. We founded <strong>Skylent Global Pvt. Ltd.</strong> in Bhubaneswar with a single engineering rule: <strong>if you cannot execute the work in a live lab and defend your trade-offs, we have not taught it yet.</strong>
                </p>
              </div>
              <div className="abx-founder-stats">
                <div>
                  <span>6 Flagship Tracks</span>
                  <strong>90 Authored Lessons</strong>
                  <p>Complete 5-module, 15-lesson curricula across Data, Product, Python, AI &amp; Full-Stack.</p>
                </div>
                <div>
                  <span>5 Competency Levels</span>
                  <strong>L1 Foundation → L5 Mastery</strong>
                  <p>Weighted 5-dimension rubric grading Knowledge, Execution, Judgement, Defence &amp; Revision.</p>
                </div>
              </div>
            </div>

            <div className="abx-env-grid" aria-label="Three operating environments">
              {ENVIRONMENTS.map((env) => (
                <article key={env.code} className="abx-env-card">
                  <div className="abx-env-card__top">
                    <span className="abx-env-card__code">{env.code}</span>
                    <span className="abx-env-card__badge">{env.badge}</span>
                  </div>
                  <h3>{env.title}</h3>
                  <p>{env.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Old EdTech vs. Skylent Execution Standard Comparison Table */}
        <section className="abx-section abx-section--tint" aria-labelledby="abx-compare-title">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">The Skylent Difference</p>
                <h2 id="abx-compare-title" className="hx-h2 hx-h2--sm">
                  How Skylent compares to traditional video courses &amp; bootcamps.
                </h2>
              </div>
              <p className="hx-head__aside">
                Every architectural decision in Skylent OS is designed to maximize learner execution and employer trust.
              </p>
            </div>

            <div className="abx-compare-wrap" role="region" aria-labelledby="abx-compare-title" tabIndex={0}>
              <table className="abx-compare-table">
                <thead>
                  <tr>
                    <th scope="col">Dimension</th>
                    <th scope="col">Traditional Video EdTech &amp; Bootcamps</th>
                    <th scope="col" className="is-skylent">Skylent Institute of Applied Learning</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.dimension}>
                      <th scope="row">{row.dimension}</th>
                      <td className="is-legacy">{row.legacy}</td>
                      <td className="is-skylent">
                        <span className="abx-check" aria-hidden="true">✓</span>
                        <span>{row.skylent}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 Connected Product Pillars */}
        <section className="abx-section" aria-labelledby="abx-products">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">Connected Platform Architecture</p>
                <h2 id="abx-products" className="hx-h2">
                  Education, skills, labs and careers. <em>Connected.</em>
                </h2>
              </div>
              <p className="hx-head__aside">
                Explore each live pillar of the Skylent platform below.
              </p>
            </div>
            <ul className="abx-products">
              {PRODUCTS.map((item) => (
                <li key={item.title} className="abx-product-card">
                  <Link to={item.to}>
                    <div className="abx-product-card__top">
                      <span className="abx-product-card__code">{item.code}</span>
                      <span className="abx-product-card__badge">{item.badge}</span>
                    </div>
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                    <em>
                      Explore pillar <ArrowRight />
                    </em>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Who We Serve + Campus / Partner Photo */}
        <section className="abx-section abx-section--tint" aria-labelledby="abx-who">
          <div className="sky-container">
            <div className="abx-split">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">Who We Serve</p>
                <h2 id="abx-who" className="hx-h2 hx-h2--sm">
                  Built for students, professionals, universities, and hiring teams across India.
                </h2>
                <ul className="abx-audiences">
                  {AUDIENCES.map((item) => (
                    <li key={item.title}>
                      <Link to={item.to}>
                        <b>{item.title}</b>
                        <span>{item.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="abx-split__media">
                <img src={teamPhoto} alt="Skylent product and curriculum working session." loading="lazy" />
                <div className="abx-hq-card">
                  <span>REGISTERED HEADQUARTERS &amp; ACADEMIC LAB</span>
                  <strong>Skylent Global Pvt. Ltd. · Bhubaneswar, Odisha</strong>
                  <p>Building sovereign applied-learning and credential-verification infrastructure for India’s next generation of analysts, product builders, and engineers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hx-close" aria-labelledby="abx-close">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-close__inner">
            <h2 id="abx-close" className="hx-close__title">
              Ready to experience <em>Skylent OS firsthand?</em>
            </h2>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/institutions">
                University partnerships
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/contact">
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
