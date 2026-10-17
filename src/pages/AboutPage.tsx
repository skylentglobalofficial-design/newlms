/**
 * /about — company profile for the public Skylent site.
 * Keep product descriptions accurate; do not invent partners, learner counts or outcomes.
 */
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import teamPhoto from "@/assets/site/program-product.jpg"
import "./HomePage.v2.css"
import "./HomeRepolish.css"
import "./AboutRepolish.css"

const PRODUCTS = [
  { title: "Education", text: "Explore degree pathways and structured learning options. Degree availability depends on confirmed institutional arrangements.", to: "/education" },
  { title: "Programmes", text: "Build practical skills through structured programmes, lessons and project-based work.", to: "/programmes" },
  { title: "Career OS", text: "Bring your professional profile, projects, evidence and career activity into one workspace.", to: "/career-os" },
  { title: "Skylent AI", text: "Get help navigating learning and understanding lessons through the tools available on the platform.", to: "/#skylent-ai" },
]

const FLOW = ["Learn", "Practise", "Build work", "Show your skills", "Take the next step"]

const AUDIENCES = [
  { title: "Students", text: "Explore education options and build practical skills alongside your studies.", to: "/education" },
  { title: "Working learners", text: "Develop skills through structured programmes built around practical work.", to: "/programmes" },
  { title: "Career changers", text: "Organise projects and professional evidence in one place.", to: "/career-os" },
  { title: "Institutions", text: "Discuss learning programmes and digital learning support for your learners.", to: "/institutions" },
]

const PRINCIPLES = [
  { title: "Learning should lead to doing", text: "Lessons matter more when learners can apply ideas through exercises, cases and projects." },
  { title: "Show the work, not just the claim", text: "We want learners to build a clearer record of what they have learned and made." },
  { title: "Be clear about what is ready", text: "We avoid publishing learner counts, placement rates or partner logos that we cannot verify." },
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
              Education should lead somewhere. <em>We’re building the path.</em>
            </h1>
            <p className="hx-hero__lead">
              Skylent brings education, practical learning and career tools into one connected experience. The idea is simple: learn something, put it to work, and keep a clearer record of what you can do.
            </p>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/contact">
                Talk to Skylent
              </Link>
            </div>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="abx-products">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">What we’re building</p>
                <h2 id="abx-products" className="hx-h2">
                  Education, skills and careers. <em>Connected.</em>
                </h2>
              </div>
              <p className="hx-head__aside">Skylent is being built as a connected learning platform—not just a place to browse courses. Explore the parts that are available today.</p>
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
              <img src={teamPhoto} alt="People working together around a table with laptops and notebooks." loading="lazy" decoding="async" />
            </div>
            <div>
              <p className="hx-eyebrow hx-eyebrow--dark">Who it is for</p>
              <h2 id="abx-who" className="hx-h2 hx-h2--sm">
                For people learning, and the institutions that support them.
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
            <p className="hx-eyebrow hx-eyebrow--dark">What guides us</p>
            <h2 id="abx-how" className="hx-h2 hx-h2--sm">Build with purpose. Be honest about progress.</h2>
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
              See what’s taking shape. <em>Let’s talk.</em>
            </h2>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/contact?for=institution">
                Partner with us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
