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
  { title: "Career OS", text: "Bring your professional profile, verified capstone dossiers, and role preparation into one workspace.", to: "/career-os" },
  { title: "Skylent AI", text: "Socratic lesson coach with 1-click Hinglish intuition and 20-minute Faculty TA support.", to: "/#skylent-ai" },
]

const FLOW = ["Learn", "Practise", "Build work", "Show your skills", "Take the next step"]

const AUDIENCES = [
  { title: "Students", text: "Build verifiable SQL, Product, and engineering proof-of-work alongside your college studies.", to: "/programmes" },
  { title: "Working learners", text: "Develop practical capability through self-paced modules and weekend ₹99 live bootcamps.", to: "/events" },
  { title: "Career changers", text: "Assemble cryptographic capstone dossiers (/verify) that recruiters can inspect directly.", to: "/career-os" },
  { title: "Institutions & Deans", text: "Deploy Skylent's browser labs and CCRO cohort analytics across your college departments.", to: "/institutions" },
]

const PRINCIPLES = [
  { title: "Execution over passive video", text: "Every flagship track centres on a live workspace—such as the 166-row Northwind SQL database or the Harbor Desk PRD studio." },
  { title: "Verifiable proof, not resume claims", text: "Every completed course issues a cryptographic SKL credential paired with the exact query outputs and written briefs you defended." },
  { title: "Radical transparency & zero debt traps", text: "No predatory ISA contracts, no fake placement percentages, and a ₹0 pilot foundation track with ₹99 coin-back weekend workshops." },
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
    body: "Every module, SQL dataset, and 60-second case cold call is authored around real commercial trade-offs and graded on a transparent 25% · 35% · 40% rubric.",
  },
  {
    kicker: "Human + Socratic AI Support",
    title: "Socratic AI Coach + 20-Min Faculty TA SLA",
    body: "Stuck on a SQL join or PRD constraint? Use 1-click Hinglish intuition inside any lesson or escalate to a human Teaching Assistant.",
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
              Skylent brings practical skill programmes, in-browser execution labs, and verifiable career dossiers into one connected platform—headquartered in Bhubaneswar, Odisha and built for learners and colleges across India.
            </p>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/verify">
                Inspect verified dossiers
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/contact">
                Talk to Skylent
              </Link>
            </div>
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
