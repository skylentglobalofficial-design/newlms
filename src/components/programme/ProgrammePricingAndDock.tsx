import { useState } from "react"

type Props = {
  programName: string
  studioName: string
  capstoneTitle: string
  canEnrol: boolean
  onEnrol: () => void
}

const FAQS = [
  {
    q: "How does the ₹0 Open Pilot work alongside Basic, Premium, and Pro plans?",
    a: "You can start Module 1 and open the in-browser lab immediately under the ₹0 Open Pilot with zero upfront card payment. When you are ready for human faculty V1 → V2 capstone grading, 20-minute TA SLA, or the Work Assignment Exchange, you can upgrade to Basic, Premium, or Pro.",
  },
  {
    q: "What is the difference between Online and Offline / Hybrid mode?",
    a: "Online mode gives you 24/7 access to Skylent OS browser labs, Socratic Hinglish + English AI coaching, and live online weekend workshops. Offline / Hybrid mode adds weekend in-person lab sprints and faculty code-reviews at our Bhubaneswar campus and partner college centres.",
  },
  {
    q: "Do I need a high-end laptop or local software installation?",
    a: "No. Every SQL database (166-row Northwind extract), Python ETL pipeline, Harbor Desk PRD workspace, and RAG evaluation suite runs 100% inside your browser with zero setup.",
  },
  {
    q: "How does the verifiable certificate (/verify) and Career OS unlock work?",
    a: "Once you reach 60% course progress, Career OS unlocks automatically. Upon completing all lessons and passing the 5-dimension capstone rubric, you receive a unique SKL credential code that employers can verify at skylent.live/verify.",
  },
]

export default function ProgrammePricingAndDock({
  programName,
  studioName,
  capstoneTitle,
  canEnrol,
  onEnrol,
}: Props) {
  const [mode, setMode] = useState<"online" | "offline">("online")

  const plans = [
    {
      id: "basic",
      name: "Basic",
      recommended: false,
      price: mode === "online" ? "17,999" : "21,999",
      pilotBadge: "Includes ₹0 Free Pilot Start",
      stars: "4.6",
      learners: "1,400+ Learners",
      icon: (
        <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <polygon points="20,4 36,32 20,26" fill="#F59E0B" />
          <polygon points="20,4 4,32 20,26" fill="#FBBF24" />
          <polygon points="4,32 20,36 36,32 20,26" fill="#D97706" />
        </svg>
      ),
      features: [
        {
          title: "Extended Course Access",
          desc: "Access to all authored modules, written notes & concept checks for 12 months",
        },
        {
          title: "In-Browser Lab Studio",
          desc: `Unlimited browser execution inside ${studioName}`,
        },
        {
          title: "24/7 Hinglish + English AI Coach",
          desc: "1-click first-principles intuition & Socratic debugging without answer leaks",
        },
        {
          title: "Verified SKL Certificate",
          desc: "Publicly verifiable certificate code (/verify) upon 100% module completion",
        },
      ],
    },
    {
      id: "premium",
      name: "Premium",
      recommended: false,
      price: mode === "online" ? "24,999" : "29,999",
      pilotBadge: "Most Popular for Self-Starters",
      stars: "4.8",
      learners: "2,800+ Learners",
      icon: (
        <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <polygon points="20,4 35,12 20,20 5,12" fill="#60A5FA" />
          <polygon points="5,12 20,20 20,36 5,28" fill="#3B82F6" />
          <polygon points="35,12 20,20 20,36 35,28" fill="#1D4ED8" />
        </svg>
      ),
      features: [
        {
          title: "Extended Access (18 Months)",
          desc: "18 months access to all curriculum updates, lab datasets & practice prompts",
        },
        {
          title: "20-Minute Faculty TA Doubt SLA",
          desc: "Live human Teaching Assistant escalation for SQL, code & case blocks within 20 mins",
        },
        {
          title: "V1 → V2 Faculty Capstone Review",
          desc: `Human red-line critique and rubric grading on ${capstoneTitle}`,
        },
        {
          title: "3 Flagship ₹99 Workshops + 297 Elixir",
          desc: "Includes all 3 weekend live execution sprints + 297 Elixir Coins for the Case Store",
        },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      recommended: true,
      price: mode === "online" ? "34,999" : "39,999",
      pilotBadge: "Complete Career OS + Fieldwork",
      stars: "4.9",
      learners: "4,200+ Learners",
      icon: (
        <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <polygon points="12,6 28,6 36,16 4,16" fill="#34D399" />
          <polygon points="4,16 20,36 20,16" fill="#10B981" />
          <polygon points="36,16 20,36 20,16" fill="#059669" />
          <polygon points="12,6 20,16 28,6" fill="#6EE7B7" />
        </svg>
      ),
      features: [
        {
          title: "Extended Access (24 Months)",
          desc: "24 months full access to all 6 track sandboxes, alumni workshops & case packs",
        },
        {
          title: "Work Assignment Exchange (Env B)",
          desc: "Qualify for supervised partner fieldwork briefs from MSMEs, startups & institutions",
        },
        {
          title: "1:1 Boardroom Cold Call & Oral Defense",
          desc: "Live mock interview defense & 5-dimension rubric sign-off with senior practitioners",
        },
        {
          title: "Verified Career OS Dossier & Shortlist",
          desc: "Public Execution Flight Recorder on /verify + direct employer skill-gap matching",
        },
      ],
    },
  ]

  function handlePlanAction() {
    if (canEnrol) {
      onEnrol()
    } else {
      const el = document.getElementById("pp-title")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      {/* PW-Skills-Style 3-Tier Pricing & Plans Section (#pp-plans) */}
      <section className="pp-plans-band" id="pp-plans" aria-labelledby="pp-plans-title">
        <div className="sky-container">
          <div className="pp-plans-head">
            <span className="pp-plans-eyebrow">TRANSPARENT PROGRAMME PLANS · START MODULE 1 ON ₹0 FREE PILOT</span>
            <h2 id="pp-plans-title" className="pp-plans-h2">
              Choose the learning depth that fits your goal in <em>{programName}</em>
            </h2>
            <p className="pp-plans-sub">
              Every plan starts with immediate access to Lesson 1 and the in-browser lab. Upgrade anytime for 20-minute human TA support, V1 → V2 faculty capstone review, and Career OS fieldwork.
            </p>

            {/* Online / Offline Pill Switcher (like Image 10) */}
            <div className="pp-mode-toggle" role="tablist" aria-label="Delivery mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "online"}
                className={mode === "online" ? "pp-mode-btn is-active" : "pp-mode-btn"}
                onClick={() => setMode("online")}
              >
                Online
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "offline"}
                className={mode === "offline" ? "pp-mode-btn is-active" : "pp-mode-btn"}
                onClick={() => setMode("offline")}
              >
                Offline
              </button>
            </div>
            <p className="pp-mode-caption">
              {mode === "online"
                ? "Online Mode: 100% in-browser Skylent OS labs + live weekend masterclasses + 20-min online TA SLA."
                : "Offline / Hybrid Mode: Online Skylent OS access + weekend in-person lab sprints at Bhubaneswar HQ & partner campus hubs."}
            </p>
          </div>

          <div className="pp-plans-grid">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={plan.recommended ? "pp-plan-card pp-plan-card--pro" : "pp-plan-card"}
                aria-label={`${plan.name} plan`}
              >
                <div className="pp-plan-card__top">
                  <div className="pp-plan-card__icon">{plan.icon}</div>
                  <div className="pp-plan-card__title-row">
                    <h3 className="pp-plan-card__name">{plan.name}</h3>
                    {plan.recommended ? (
                      <span className="pp-plan-card__rec">Recommended</span>
                    ) : null}
                  </div>
                  <div className="pp-plan-card__price-row">
                    <span className="pp-plan-card__price">₹ {plan.price}</span>
                    <span className="pp-plan-card__pilot">{plan.pilotBadge}</span>
                  </div>
                  <div className="pp-plan-card__meta">
                    <span className="pp-plan-card__star">{plan.stars} ★</span>
                    <span className="pp-plan-card__sep">|</span>
                    <span>{plan.learners}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePlanAction}
                    className={
                      plan.recommended
                        ? "pp-plan-card__btn pp-plan-card__btn--primary"
                        : "pp-plan-card__btn pp-plan-card__btn--soft"
                    }
                  >
                    Buy now
                  </button>
                </div>

                <div className="pp-plan-card__features">
                  {plan.features.map((feat) => (
                    <div key={feat.title} className="pp-plan-feat">
                      <strong>{feat.title}</strong>
                      <p>{feat.desc}</p>
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
              Everything you need to know before starting
            </h2>
          </div>
          <div className="pp-faq-grid">
            {FAQS.map((item) => (
              <details key={item.q} className="pp-faq-item" open>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sleek Floating Bottom Navigation Bar (matching bottom of Image 10) */}
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
          <a href="#pp-review-standard">Offerings</a>
          <a href="#pp-curriculum">Curriculum</a>
          <a href="#pp-stage">Lab &amp; Mentors</a>
          <a href="#pp-career">Career OS</a>
          <a href="#pp-plans" className="is-highlight">Plans</a>
          <a href="#pp-evidence">Certifications</a>
          <a href="#pp-faq">FAQs</a>
          <button
            type="button"
            className="pp-floating-dock__cta"
            onClick={() => {
              const el = document.getElementById("pp-plans")
              if (el) el.scrollIntoView({ behavior: "smooth" })
              else handlePlanAction()
            }}
          >
            Buy now
          </button>
        </nav>
      </div>
    </>
  )
}
