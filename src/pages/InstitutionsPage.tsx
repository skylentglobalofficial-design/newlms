/**
 * /institutions (repolish). The B2B entry point, linked from the main navigation and the
 * homepage. It describes what Skylent provides to learners today (programmes, labs, LMS progress,
 * Career OS, lesson help, and the isolated College Tenant OS with 1-click CSV export) and how a
 * partnership is set up.
 */
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import campusPhoto from "@/assets/site/degree-management.jpg"
import "./HomePage.v2.css"
import "./HomeRepolish.css"
import "./AboutRepolish.css"
import "./InstitutionsRepolish.css"

const PROVIDES = [
  { title: "6 Live 15-Lesson Courses & Programmes", text: "Data Analytics, Product Management, Python, Data Science & AI, Generative AI, and Full Stack Web — ready for immediate campus cohort deployment." },
  { title: "Graded Browser Labs & Capstones", text: "In-browser SQL & Python sandboxes, timed mock interview checks, and 6-task Capstone Project Studios that generate verifiable work samples." },
  { title: "Isolated College Tenant OS (/dashboard/college)", text: "Dedicated institutional portal for Deans, HODs, and Placement Officers with strict campus cohort management." },
  { title: "1-Click NAAC / NIRF / Placement CSV Export", text: "Export audited cohort progress, lesson completion rates, capstone readiness, and verified certificate codes in one click." },
  { title: "24/7 Guided Study Support (Hinglish + English) + 20-Min Faculty TA SLA", text: "In-lesson guided explanations that help students without spoiling answers, backed by live human Faculty TA support within 20 minutes." },
]

const PARTNERS = [
  { title: "Colleges and universities", text: "Add practical 15-lesson courses, graded capstones, and verifiable certificates beside the degree you award." },
  { title: "Placement & Training Cells (TPOs)", text: "Track real-time student readiness across the 60% Career Rise milestone and export verified project portfolios for visiting recruiters." },
  { title: "Campus ₹99 Workshop Chapters", text: "Host live campus workshops where every ₹99 seat grants 99 Elixir Coins (100% coin cashback) for applied case studies." },
]

const STEPS = [
  { title: "Understand", text: "We map your departments, academic calendar, and cohort skill goals together." },
  { title: "Configure", text: "Provision your Isolated College Tenant OS and assign tracks across semesters." },
  { title: "Launch", text: "Students enrol (+50 Elixir bonus), practise in browser labs, and ship graded capstones." },
  { title: "Track & Export", text: "Monitor live cohort completion and export verified CSV reports for accreditation and placement drives." },
]

export default function InstitutionsPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page abx inx">
        <section className="hx-hero" aria-labelledby="inx-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-hero__inner inx-hero">
            <div>
              <p className="hx-eyebrow">For institutions · Multi-Tenant College OS</p>
              <h1 id="inx-title" className="hx-hero__title">
                Practical learning and <em>Career OS</em> for your learners.
              </h1>
              <p className="hx-hero__lead">
                Deploy Skylent’s 6 live 15-lesson courses, interactive SQL &amp; Python sandboxes, verifiable project certificates, and Isolated College Tenant OS alongside your campus curriculum.
              </p>
              <div className="hx-hero__actions">
                <Link className="sk-btn sk-btn-primary hx-btn" to="/contact?for=institution">
                  Talk to partnerships
                  <ArrowRight />
                </Link>
                <Link className="sk-btn hx-btn hx-btn--ghost" to="/login">
                  Organisation sign in
                </Link>
              </div>
            </div>
            <div className="inx-hero__media">
              <img src={campusPhoto} alt="Two students studying together outdoors on a campus lawn." />
            </div>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="inx-provides">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">What Skylent provides</p>
                <h2 id="inx-provides" className="hx-h2">
                  Everything your learners and faculty use, <em>in one platform.</em>
                </h2>
              </div>
            </div>
            <ul className="inx-provides">
              {PROVIDES.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="abx-section abx-section--tint" aria-labelledby="inx-partners">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">Who we work with</p>
            <h2 id="inx-partners" className="hx-h2 hx-h2--sm">Partnerships by type of institution.</h2>
            <ul className="abx-principles">
              {PARTNERS.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="inx-steps">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">How it works</p>
            <h2 id="inx-steps" className="hx-h2 hx-h2--sm">Understand, configure, launch, track.</h2>
            <ol className="inx-steps">
              {STEPS.map((step) => (
                <li key={step.title}>
                  <b>{step.title}</b>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="hx-close" aria-labelledby="inx-close">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-close__inner">
            <h2 id="inx-close" className="hx-close__title">
              Bring Skylent to <em>your campus or organisation.</em>
            </h2>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/contact?for=institution">
                Talk to partnerships
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/programmes">
                Explore programmes
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
