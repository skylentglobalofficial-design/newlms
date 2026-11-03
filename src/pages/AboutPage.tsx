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
  { title: "Education", text: "Planned undergraduate and postgraduate university degree pathways, online and on campus.", to: "/education" },
  { title: "Programmes", text: "Practical skill tracks with browser SQL labs, product case studios, and graded capstones.", to: "/programmes" },
  { title: "Career OS", text: "Bring your professional profile, verified project reports, and interview preparation into one workspace.", to: "/career-os" },
  { title: "Skylent AI", text: "24/7 AI lesson mentor with 1-click Hinglish explanations and 20-minute human Faculty TA support.", to: "/#skylent-ai" },
]

const FLOW = ["Learn", "Practise", "Build work", "Show your skills", "Take the next step"]

const AUDIENCES = [
  { title: "Students", text: "Build verifiable SQL, Product, and engineering project portfolios alongside your college studies.", to: "/programmes" },
  { title: "Working learners", text: "Develop practical capability through self-paced modules and weekend ₹99 live bootcamps.", to: "/events" },
  { title: "Career changers", text: "Graduate with publicly verifiable project certificates (/verify) that recruiters can inspect in one click.", to: "/career-os" },
  { title: "Institutions & Deans", text: "Deploy Skylent's browser labs and live cohort progress dashboards across your college departments.", to: "/institutions" },
]

const PRINCIPLES = [
  { title: "Execution over passive video", text: "Every flagship track centres on a live workspace—such as the 166-row Northwind SQL database or the Harbor Desk PRD studio." },
  { title: "Verifiable proof, not resume claims", text: "Every completed course issues a publicly verifiable SKL certificate paired with the exact SQL queries and written briefs you built." },
  { title: "Complete transparency & zero debt traps", text: "No predatory loan contracts, no inflated placement claims, and a ₹0 pilot track with ₹99 coin-back weekend workshops." },
]

const CREDIBILITY_PILLARS = [
  {
    kicker: "Registered Entity & India HQ",
    title: "Skylent Global Pvt. Ltd. · Bhubaneswar, Odisha",
    body: "Headquartered in Bhubaneswar, Odisha, India, building execution-first learning infrastructure for learners and higher-education institutions across India.",
  },
  {
    kicker: "Practitioner Curriculum Architecture",
    title: "Built by Data, Product & AI Practitioners",
    body: "Every module, SQL dataset, and practical case study is authored around real business problems and graded on a transparent 25% · 35% · 40% rubric.",
  },
  {
    kicker: "24/7 AI Mentor + 20-Min Human TA Help",
    title: "Hinglish + English AI Coach & 20-Min Faculty TA SLA",
    body: "Stuck on a SQL join or PRD constraint? Use 1-click Hinglish explanations inside any lesson or get help from a human Teaching Assistant within 20 minutes.",
  },
]

export default function AboutPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page abx">
        <section className="hx-hero" aria-labelledby="abx-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-hero__inner">
            <p className="hx-eyebrow">About Skylent Global Pvt. Ltd. · Bhubaneswar, India</p>
            <h1 id="abx-title" className="hx-hero__title">
              Education should lead somewhere. <em>We’re building the path.</em>
            </h1>
            <p className="hx-hero__lead">
              Skylent brings practical skill programmes, in-browser execution labs, and verifiable project portfolios into one connected platform—headquartered in Bhubaneswar, Odisha and built for learners and colleges across India.
            </p>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/verify">
                Verify a certificate
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/contact">
                Talk to Skylent
              </Link>
            </div>
          </div>
        </section>

        <section className="abx-section abx-section--tint" aria-labelledby="abx-founder">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">Why We Built Skylent in Bhubaneswar</p>
            <h2 id="abx-founder" className="hx-h2 hx-h2--sm">
              Tired of passive video courses and ₹2,00,000 bootcamp debt traps.
            </h2>
            <p style={{ maxWidth: "68ch", fontSize: 16.5, lineHeight: 1.65, color: "#334155", marginTop: 12 }}>
              Across colleges in Odisha and India, we saw bright students graduate with stacks of attendance certificates that recruiters ignored—or get pushed into ₹2 Lakh loans for generic Zoom lectures. We started Skylent Global Pvt. Ltd. in Bhubaneswar with one rule: <strong>you learn by executing real work in the browser</strong> (querying 166-row retail databases, scoping engineering PRDs, and building RAG pipelines), and you graduate with a <strong>publicly verifiable project report (/verify)</strong> that proves what you built.
            </p>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="abx-trust">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">Company &amp; Academic Standards</p>
            <h2 id="abx-trust" className="hx-h2 hx-h2--sm">Who builds Skylent, and how we operate.</h2>
            <ul className="abx-principles">
              {CREDIBILITY_PILLARS.map((item) => (
                <li key={item.title}>
                  <span className="hx-eyebrow hx-eyebrow--dark" style={{ marginBottom: 4 }}>{item.kicker}</span>
                  <b>{item.title}</b>
                  <span>{item.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="abx-products" style={{ paddingTop: 0 }}>
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">What we’re building</p>
                <h2 id="abx-products" className="hx-h2">
                  Education, skills and careers. <em>Connected.</em>
                </h2>
              </div>
              <p className="hx-head__aside">Skylent is built as a connected execution platform—not a passive video library. Explore the parts that are live today.</p>
            </div>
            <ul className="abx-products">
              {PRODUCTS.map((item) => (
                <li key={item.title}>
                  <Link to={item.to}>
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                    <em>
                      Explore <ArrowRight />
                    </em>
                  </Link>
                </li>
              ))}
            </ul>
            <ol className="abx-flow" aria-label="How learning connects to career readiness">
              {FLOW.map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  <b>{step}</b>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="abx-section abx-section--tint" aria-labelledby="abx-who">
          <div className="sky-container">
            <div className="abx-split">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">Who it’s for</p>
                <h2 id="abx-who" className="hx-h2 hx-h2--sm">
                  Built for learners and institutions across India.
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
                <img src={teamPhoto} alt="Product working session around a table." loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="abx-section" aria-labelledby="abx-principles">
          <div className="sky-container">
            <p className="hx-eyebrow hx-eyebrow--dark">Our principles</p>
            <h2 id="abx-principles" className="hx-h2 hx-h2--sm">What guides every course and lab we ship.</h2>
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
              Ready to see <em>how Skylent works?</em>
            </h2>
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
      </div>
    </PageShell>
  )
}
