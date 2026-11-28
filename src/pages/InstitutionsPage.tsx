import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import campusPhoto from "@/assets/site/degree-management.jpg"
import "./HomePage.v2.css"
import "./HomeRepolish.css"
import "./AboutRepolish.css"
import "./InstitutionsRepolish.css"
import CampusLabPreview from "./CampusLabPreview"

const TRACKS = [
  { title: "Data Analytics & SQL", text: "Use sales and returns data to answer a business question and explain the calculation." },
  { title: "Python Fundamentals", text: "Clean a CSV and document how the script handles invalid and missing values." },
  { title: "Product Management", text: "Turn customer feedback into a prioritised change and define how to measure it." },
]

const STEPS = [
  { title: "Understand", text: "We map your departments, academic calendar, and cohort skill goals together." },
  { title: "Configure", text: "Agree on the cohort, practical tasks and who will review each submission." },
  { title: "Launch", text: "Students practise, submit an individual project and receive rubric-based feedback." },
  { title: "Track & Export", text: "Review submissions, passes and outstanding feedback with the placement cell." },
]

export default function InstitutionsPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page abx inx">
        <section className="hx-hero" aria-labelledby="inx-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-hero__inner inx-hero">
            <div>
              <p className="hx-eyebrow">For colleges and placement cells</p>
              <h1 id="inx-title" className="hx-hero__title">
                Skylent <em>Campus Lab Pack</em>
              </h1>
              <p className="hx-hero__lead">
                Start with a four-week SQL pilot for one department. Students complete practical work, faculty assess it with a shared rubric, and placement teams see who passed and who needs another attempt.
              </p>
              <div className="hx-hero__actions">
                <Link className="sk-btn sk-btn-primary hx-btn" to="/contact?for=institution">
                  Discuss a campus pilot
                  <ArrowRight />
                </Link>
                <a className="sk-btn hx-btn hx-btn--ghost" href="#campus-preview">Try the sample cohort</a>
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
                <p className="hx-eyebrow hx-eyebrow--dark">Campus Lab Pack tracks</p>
                <h2 id="inx-provides" className="hx-h2">
                  What students will work on.
                </h2>
              </div>
            </div>
            <ul className="inx-provides">
              {TRACKS.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CampusLabPreview />

        <section className="abx-section" aria-labelledby="inx-steps">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">How it works</p>
            <h2 id="inx-steps" className="hx-h2 hx-h2--sm">How the pilot runs.</h2>
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
                Discuss a campus pilot
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/login">
                Organisation sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
