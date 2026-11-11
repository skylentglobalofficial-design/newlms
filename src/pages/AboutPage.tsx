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
    code: "01 · Career Tracks",
    title: "Applied Programmes & Browser Labs",
    text: "5-module, 15-lesson career tracks in Data Analytics, Product Management, Python, Data Science, GenAI, and Full-Stack Web with zero-setup browser sandboxes.",
    badge: "✓ Guest Lab Free · From ₹1,499",
    to: "/programmes",
  },
  {
    code: "02 · University Pathways",
    title: "Undergraduate (UG) & Postgraduate (PG)",
    text: "Structured academic degree pathways (B.Sc., BCA, BBA, M.Sc., MCA, MBA) pairing partner university credentials with Skylent OS execution labs.",
    badge: "✓ UG & PG Tracks",
    to: "/education",
  },
  {
    code: "03 · Verified Portfolio",
    title: "Career OS & Flight Recorder",
    text: "Unlocks automatically at 60% course progress — bringing your verified project reports, 5-dimension rubric scores, and role skill-gap matching into one dossier.",
    badge: "✓ Unlocks at 60%",
    to: "/career-os",
  },
  {
    code: "04 · Learner Support",
    title: "Hinglish Study Support + 20-Min TA SLA",
    text: "24/7 first-principles intuition in simple Hinglish or English inside every lesson, backed by human Teaching Assistants on a 20-minute SLA.",
    badge: "✓ 20-Min Human SLA",
    to: "/programmes/data-analytics-pro",
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
                Practical technical education built on <em>hands-on browser labs and real projects.</em>
              </h1>
              <p className="abx-lead">
                Headquartered in Bhubaneswar, Odisha, Skylent bridges the gap between education and employment — combining practical browser labs, a 2-month complimentary internship for every learner, and dedicated job assistance for students and colleges across India.
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
                <span className="abx-charter-card__code">How Skylent Works</span>
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
                  Building practical, project-first technical education from Bhubaneswar, India.
                </h2>
                <p className="abx-founder-copy">
                  We founded <strong>Skylent Global Pvt. Ltd.</strong> in Bhubaneswar, Odisha so students and working professionals can learn SQL, Python, Product Management, Full-Stack Web, and Generative AI by practising in live browser labs and graduating with verified project portfolios.
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
                  <strong>Course + 2-Month Internship</strong>
                  <p>Every track includes hands-on projects, mentor feedback, and a 2-month complimentary internship.</p>
                </div>
              </div>
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
