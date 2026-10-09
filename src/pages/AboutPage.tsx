/**
 * /about (repolish). What Skylent is, now that the homepage no longer carries a "What Skylent is"
 * block: the products, how they connect, who they are for and how we work. No partner names,
 * learner counts or outcomes are stated.
 */
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import teamPhoto from "@/assets/site/program-product.jpg"
import "./HomePage.v2.css"
import "./HomeRepolish.css"
import "./AboutRepolish.css"

const PRODUCTS = [
  { title: "Degrees", text: "Undergraduate and postgraduate degrees, online or on campus, awarded by partner institutions.", to: "/education" },
  { title: "Programmes", text: "Certification and professional programmes with lessons, labs and a capstone project.", to: "/programmes" },
  { title: "Career OS", text: "One workspace for your profile, projects, evidence and applications.", to: "/career-os" },
  { title: "Skylent AI", text: "A helper that suggests where to start and explains lessons as you learn.", to: "/#skylent-ai" },
]

const FLOW = ["Learn", "Practise", "Build proof", "Show what you can do", "Get career support"]

const AUDIENCES = [
  { title: "Students", text: "Choose a UG or PG degree and add practical skills alongside it.", to: "/education" },
  { title: "Working learners", text: "Pick up a job skill with a programme you can take at your own pace.", to: "/programmes" },
  { title: "Career changers", text: "Build projects and a profile that show what you can do now.", to: "/career-os" },
  { title: "Institutions", text: "Bring programmes, labs and Career OS to your own learners.", to: "/institutions" },
]

const PRINCIPLES = [
  { title: "Practice over slides", text: "Every programme asks you to do the work: queries, cases, projects." },
  { title: "Your work stays yours", text: "What you build is kept in your profile, ready to show." },
  { title: "Claims we can back", text: "We do not publish learner counts, placement rates or partner logos we cannot verify." },
]

export default function AboutPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page abx">
        <section className="hx-hero" aria-labelledby="abx-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-hero__inner">
            <p className="hx-eyebrow">About Skylent</p>
            <h1 id="abx-title" className="hx-hero__title">
              Education, practice and careers, <em>built as one system.</em>
            </h1>
            <p className="hx-hero__lead">
              Most learning stops at the lesson. Skylent carries it on: what you study becomes practice, practice becomes a finished piece
              of work, and that work stays in a profile you can show.
            </p>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/contact">
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="abx-products">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">What we do</p>
                <h2 id="abx-products" className="hx-h2">
                  Four parts, <em>one platform.</em>
                </h2>
              </div>
              <p className="hx-head__aside">Each part works on its own. Together they take a learner from a first lesson to a profile they can show.</p>
            </div>
            <ul className="abx-products">
              {PRODUCTS.map((product) => (
                <li key={product.title}>
                  <Link to={product.to} className="abx-product">
                    <b>{product.title}</b>
                    <span>{product.text}</span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
            <ol className="abx-flow" aria-label="How the parts connect">
              {FLOW.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="abx-section abx-section--tint" aria-labelledby="abx-who">
          <div className="sky-container abx-who">
            <div className="abx-who__media">
              <img src={teamPhoto} alt="A team around a table with laptops and notebooks, working through a review together." loading="lazy" decoding="async" />
            </div>
            <div>
              <p className="hx-eyebrow hx-eyebrow--dark">Who it is for</p>
              <h2 id="abx-who" className="hx-h2 hx-h2--sm">
                Built for learners and the institutions that teach them.
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
          </div>
        </section>

        <section className="abx-section" aria-labelledby="abx-how">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">How we work</p>
            <h2 id="abx-how" className="hx-h2 hx-h2--sm">Three things we hold to.</h2>
            <ul className="abx-principles">
              {PRINCIPLES.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hx-close" aria-labelledby="abx-close">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-close__inner">
            <h2 id="abx-close" className="hx-close__title">
              Learn with Skylent, <em>or partner with us.</em>
            </h2>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/institutions">
                For institutions
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
