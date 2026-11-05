import { Link } from "react-router-dom"
import { courses, programs } from "../../data"

type Props = {
  programSlug?: string
  courseSlug?: string
  programName: string
  studioName: string
  capstoneTitle: string
  canEnrol: boolean
  onEnrol: () => void
}

const DEFAULT_FAQS = [
  {
    q: "How does enrolment work during the Open Pilot?",
    a: "All 6 flagship self-paced courses are open with ₹0 pilot access (no payment is collected at checkout). Clicking Enroll Now opens the course directly inside Skylent OS so you can start Module 1 and the browser lab immediately.",
  },
  {
    q: "Do I need to install any software on my laptop?",
    a: "No. Every SQL database, Python environment, product case workspace, and AI evaluation lab runs directly in your browser or mobile app with zero local setup.",
  },
  {
    q: "How do I get help if I am stuck on a lesson or lab?",
    a: "Every lesson includes an integrated AI Mentor (with English and simple Hinglish explanations) plus 1-click escalation to human Faculty TAs.",
  },
  {
    q: "How does the certificate and verification work?",
    a: "When you complete all modules and pass the graded capstone project, Skylent issues a verifiable certificate with a unique public ID that anyone can check at skylent.live/verify.",
  },
]

export default function ProgrammePricingAndDock({
  programSlug,
  courseSlug,
  programName,
  studioName,
  capstoneTitle,
  canEnrol,
  onEnrol,
}: Props) {
  const sourceProgram = programs.find((p) => p.slug === programSlug)
  const sourceCourse = courses.find((c) => c.slug === courseSlug)
  const listedCoursePrice = sourceCourse?.price ?? 4999
  const faqs = sourceProgram?.faqs?.length ? sourceProgram.faqs : DEFAULT_FAQS
  const tiers = sourceProgram?.pricing ?? []

  return (
    <>
      <section className="pp-plans-band" id="pp-plans" aria-labelledby="pp-plans-title">
        <div className="sky-container">
          <div className="pp-plans-head">
            <span className="pp-plans-eyebrow">ORIGINAL SKYLENT PROGRAMME &amp; COURSE ACCESS</span>
            <h2 id="pp-plans-title" className="pp-plans-h2">
              Enrol in <em>{programName}</em>
            </h2>
            <p className="pp-plans-sub">
              Payment is not collected during the current pilot. Enrolling opens the linked self-paced course, browser lab ({studioName}), and capstone workspace ({capstoneTitle}) directly inside Skylent OS.
            </p>
          </div>

          <div className="pp-plans-grid">
            {/* Card 1: Direct Self-Paced Course Pilot Access (Original Course Fee from src/data.ts) */}
            <article className="pp-plan-card pp-plan-card--pro" aria-label="Open Pilot Course Access">
              <div className="pp-plan-card__top">
                <div className="pp-plan-card__title-row">
                  <h3 className="pp-plan-card__name">Open Pilot Access</h3>
                  <span className="pp-plan-card__rec">Open Now</span>
                </div>
                <div className="pp-plan-card__price-row">
                  <span className="pp-plan-card__price">₹0</span>
                  <span className="pp-plan-card__pilot">
                    Listed course fee ₹{listedCoursePrice.toLocaleString("en-IN")} · Free during pilot
                  </span>
                </div>
                {canEnrol ? (
                  <button
                    type="button"
                    onClick={onEnrol}
                    className="pp-plan-card__btn pp-plan-card__btn--primary"
                  >
                    Enroll Now
                  </button>
                ) : courseSlug ? (
                  <Link
                    to={`/courses/${courseSlug}`}
                    className="pp-plan-card__btn pp-plan-card__btn--primary"
                    style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", textDecoration: "none" }}
                  >
                    Enroll Now in Course
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onEnrol}
                    className="pp-plan-card__btn pp-plan-card__btn--primary"
                  >
                    Enroll Now
                  </button>
                )}
              </div>

              <div className="pp-plan-card__features">
                <div className="pp-plan-feat">
                  <strong>Full Authored Curriculum</strong>
                  <p>All 5 structured modules, 15 lessons, and concept checks inside Skylent OS</p>
                </div>
                <div className="pp-plan-feat">
                  <strong>In-Browser Lab Workspace</strong>
                  <p>Hands-on practice inside {studioName} with zero local setup</p>
                </div>
                <div className="pp-plan-feat">
                  <strong>Graded Capstone Project</strong>
                  <p>Build and submit {capstoneTitle} for rubric evaluation</p>
                </div>
                <div className="pp-plan-feat">
                  <strong>Verifiable Certificate (/verify)</strong>
                  <p>Issued automatically when every lesson and capstone task is complete</p>
                </div>
              </div>
            </article>

            {/* Original Skylent Programme Tiers from src/data.ts (Zero fake learner counts) */}
            {tiers.slice(0, 2).map((tier) => (
              <article
                key={tier.name}
                className="pp-plan-card"
                aria-label={`${tier.name} programme tier`}
              >
                <div className="pp-plan-card__top">
                  <div className="pp-plan-card__title-row">
                    <h3 className="pp-plan-card__name">{tier.name} Track</h3>
                    {tier.highlight ? <span className="pp-plan-card__rec">Full Pathway</span> : null}
                  </div>
                  <div className="pp-plan-card__price-row">
                    <span className="pp-plan-card__price">₹{tier.price.toLocaleString("en-IN")}</span>
                    <span className="pp-plan-card__pilot">
                      Listed programme fee · Start free in pilot
                    </span>
                  </div>
                  {canEnrol ? (
                    <button
                      type="button"
                      onClick={onEnrol}
                      className="pp-plan-card__btn pp-plan-card__btn--soft"
                    >
                      Enroll Now (₹0 Pilot)
                    </button>
                  ) : courseSlug ? (
                    <Link
                      to={`/courses/${courseSlug}`}
                      className="pp-plan-card__btn pp-plan-card__btn--soft"
                      style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", textDecoration: "none" }}
                    >
                      Enroll Now
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={onEnrol}
                      className="pp-plan-card__btn pp-plan-card__btn--soft"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>

                <div className="pp-plan-card__features">
                  {tier.features.map((feat) => (
                    <div key={feat} className="pp-plan-feat">
                      <strong>{feat}</strong>
                      <p>Included in {programName} ({tier.name})</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Programme FAQs Section (#pp-faq) */}
      <section className="pp-faq-band" id="pp-faq" aria-labelledby="pp-faq-title">
        <div className="sky-container">
          <div className="pp-faq-head">
            <span className="pp-plans-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2 id="pp-faq-title" className="pp-plans-h2">
              Common questions about {programName}
            </h2>
          </div>
          <div className="pp-faq-grid">
            {faqs.map((item) => (
              <details key={item.q} className="pp-faq-item" open>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Floating Quick-Jump Bar */}
      <div className="pp-floating-dock-wrap" aria-label="Quick programme section navigation">
        <nav className="pp-floating-dock">
          <button
            type="button"
            className="pp-floating-dock__up"
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑
          </button>
          <a href="#pp-title">Overview</a>
          <a href="#pp-curriculum">Curriculum</a>
          <a href="#pp-stage">Workspace</a>
          <a href="#pp-career">Career OS</a>
          <a href="#pp-plans" className="is-highlight">Pricing</a>
          <a href="#pp-faq">FAQs</a>
          {canEnrol ? (
            <button
              type="button"
              className="pp-floating-dock__cta"
              onClick={onEnrol}
            >
              Enroll Now
            </button>
          ) : courseSlug ? (
            <Link
              to={`/courses/${courseSlug}`}
              className="pp-floating-dock__cta"
              style={{ textDecoration: "none" }}
            >
              Enroll Now
            </Link>
          ) : (
            <a href="#pp-plans" className="pp-floating-dock__cta" style={{ textDecoration: "none" }}>
              Enroll Now
            </a>
          )}
        </nav>
      </div>
    </>
  )
}
