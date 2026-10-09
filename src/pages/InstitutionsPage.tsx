/**
 * /institutions (repolish). The B2B entry point, now linked from the main navigation and the
 * homepage. It describes what Skylent provides to learners today (programmes, labs, LMS progress,
 * Career OS, lesson help) and how a partnership is set up. No partner names, logos, results or
 * dashboards are shown; institution reporting is described as something planned with the partner.
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
  { title: "Programmes", text: "Certification and professional programmes your learners can take alongside their studies." },
  { title: "Labs and capstones", text: "Hands-on practice on realistic data and cases, finished with a project." },
  { title: "Learning platform", text: "Lessons, checks, assignments and progress for every enrolled learner." },
  { title: "Career OS", text: "Each learner keeps a profile of skills, projects and certificates." },
  { title: "Skylent AI", text: "Lesson help that explains ideas without giving away assessment answers." },
]

const PARTNERS = [
  { title: "Colleges and universities", text: "Add practical programmes and a career profile beside the degree you award." },
  { title: "Skill and training institutions", text: "Run Skylent programmes with your cohorts and trainers." },
  { title: "Academic and industry partners", text: "Shape programmes, cases and projects with us." },
]

const STEPS = [
  { title: "Understand", text: "We map your learners, curriculum and goals together." },
  { title: "Configure", text: "Choose the programmes and set up an organisation account." },
  { title: "Launch", text: "Learners enrol, learn and build projects on Skylent." },
  { title: "Improve", text: "Review progress with us and plan reporting that fits your institution." },
]

export default function InstitutionsPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page abx inx">
        <section className="hx-hero" aria-labelledby="inx-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-hero__inner inx-hero">
            <div>
              <p className="hx-eyebrow">For institutions</p>
              <h1 id="inx-title" className="hx-hero__title">
                Practical learning and <em>career readiness</em> for your learners.
              </h1>
              <p className="hx-hero__lead">
                Skylent works with colleges, universities and training partners to add programmes, labs and Career OS alongside their own
                teaching.
              </p>
              <div className="hx-hero__actions">
                <Link className="sk-btn sk-btn-primary hx-btn" to="/contact">
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
                  Everything your learners use, <em>in one platform.</em>
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
            <h2 id="inx-steps" className="hx-h2 hx-h2--sm">Understand, configure, launch, improve.</h2>
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
              Bring Skylent to <em>your institution.</em>
            </h2>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/contact">
                Partner with Skylent
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/career-os">
                See Career OS
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
