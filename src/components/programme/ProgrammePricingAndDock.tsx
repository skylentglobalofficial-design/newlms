import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { courses, programs } from "../../data"
import { buildSkylentTiersForPrice, saveAdminPriceOverridesLocal, saveStoredCourseTier, type SkylentTierId } from "../../lib/enrolment-tiers"

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
    q: "How do the 2 Skylent plans work?",
    a: "Choose the Certification + Internship Plan (₹1,499) for part-time self-paced learning, hands-on projects, and a 2-month complimentary internship, or the Job Assistance Program (₹11,999) for full placement support, 1-on-1 mock interviews, and recruiter referrals.",
  },
  {
    q: "Do I need to install any software on my laptop?",
    a: "No. Every SQL database, Python environment, product case workspace, and AI evaluation lab runs directly in your browser or mobile app with zero local setup.",
  },
  {
    q: "How do I get help if I am stuck on a lesson or lab?",
    a: "Every lesson includes integrated English and simple Hinglish study explanations plus direct escalation to human Faculty TAs.",
  },
  {
    q: "How does the certificate and 2-month internship work?",
    a: "When you complete the 5 modules and guided project work, Skylent issues both your verifiable Course Certificate (skylent.live/verify) and your 2-Month Internship Certificate. Top performers are also eligible for direct intern hiring.",
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
  const navigate = useNavigate()
  const sourceProgram = programs.find((p) => p.slug === programSlug)
  const sourceCourse = courses.find((c) => c.slug === courseSlug)
  const listedCoursePrice = sourceCourse?.price ?? 4999
  const faqs = sourceProgram?.faqs?.length ? sourceProgram.faqs : DEFAULT_FAQS
  const [, setPriceTick] = useState(0)
  useEffect(() => {
    fetch("/api/v1/payments/catalog-config", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p?.data?.priceOverrides) {
          saveAdminPriceOverridesLocal(p.data.priceOverrides)
          setPriceTick((t) => t + 1)
        }
      })
      .catch(() => {})
  }, [])
  const tiers = buildSkylentTiersForPrice(listedCoursePrice, courseSlug || programSlug)

  function handleBuyTier(tierId: SkylentTierId) {
    const targetSlug = programSlug || courseSlug || "data-analytics"
    const targetKind = programSlug ? "program" : "course"
    saveStoredCourseTier(targetSlug, tierId)
    if (courseSlug) {
      saveStoredCourseTier(courseSlug, tierId)
    }
    const params = new URLSearchParams({
      kind: targetKind,
      slug: targetSlug,
      tier: tierId,
      price: String(listedCoursePrice),
    })
    navigate(`/checkout?${params.toString()}`)
  }

  return (
    <>
      <section className="pp-plans-band" id="pp-pricing" aria-labelledby="pp-plans-title">
        <div className="sky-container">
          <div className="pp-plans-head">
            <span className="pp-plans-eyebrow">SIMPLE 2-PLAN ENROLMENT</span>
            <h2 id="pp-plans-title" className="pp-plans-h2">
              Choose Your Plan for <em>{programName}</em>
            </h2>
            <p className="pp-plans-sub">
              Every plan includes your 5 interactive modules, browser lab ({studioName}), capstone project ({capstoneTitle}), and 2-month complimentary internship.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
              gap: 20,
              marginTop: 24,
              alignItems: "stretch",
            }}
          >
            {tiers.map((tier) => {
              const isProCard = tier.id === "flagship"
              const displayTitle =
                tier.id === "certificate"
                  ? "Certification + Internship Plan"
                  : "Job Assistance Program"
              return (
                <article
                  key={tier.id}
                  aria-label={`${displayTitle} programme tier`}
                  style={{
                    borderRadius: 16,
                    padding: "26px 24px",
                    background: isProCard
                      ? "linear-gradient(160deg, #2e1065 0%, #4c1d95 55%, #5142b5 100%)"
                      : "#ffffff",
                    color: isProCard ? "#ffffff" : "#0f172a",
                    border: isProCard ? "2px solid #6d28d9" : "1px solid #e2e8f0",
                    borderTop: isProCard ? "2px solid #6d28d9" : "4px solid #5142b5",
                    boxShadow: isProCard
                      ? "0 20px 44px -14px rgba(76, 29, 149, 0.42)"
                      : "0 10px 28px -14px rgba(15, 23, 42, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 20,
                          fontWeight: 600,
                          color: isProCard ? "#ffffff" : "#0f172a",
                        }}
                      >
                        {displayTitle}
                      </h3>
                      {isProCard ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.22)",
                            color: "#ffffff",
                          }}
                        >
                          Full Job Assistance
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "#f5f3ff",
                            color: "#5142b5",
                          }}
                        >
                          {tier.shortBadge || "2-Month Free Internship"}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 30,
                          fontWeight: 600,
                          color: isProCard ? "#ffffff" : "#0f172a",
                        }}
                      >
                        ₹{tier.price.toLocaleString("en-IN")}
                      </strong>
                      <span
                        style={{
                          fontSize: 14,
                          color: isProCard ? "rgba(255,255,255,0.65)" : "#94a3b8",
                          textDecoration: "line-through",
                          fontWeight: 600,
                        }}
                      >
                        ₹{tier.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuyTier(tier.id)}
                      style={{
                        width: "100%",
                        padding: "13px 18px",
                        borderRadius: 10,
                        border: "none",
                        background: isProCard ? "#ffffff" : "#5142b5",
                        color: isProCard ? "#3b0764" : "#ffffff",
                        boxShadow: isProCard ? "0 6px 16px rgba(0,0,0,0.12)" : "0 8px 20px -6px rgba(81, 66, 181, 0.45)",
                        fontSize: 14.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        marginBottom: 18,
                      }}
                    >
                      Buy Now
                    </button>

                    <div
                      style={{
                        borderTop: isProCard
                          ? "1px solid rgba(255,255,255,0.18)"
                          : "1px solid #f1f5f9",
                        paddingTop: 14,
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      {tier.features.map((feat) => (
                        <div
                          key={feat}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 9,
                            fontSize: 13,
                            lineHeight: 1.45,
                            color: isProCard ? "#f8fafc" : "#334155",
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: isProCard ? "rgba(255,255,255,0.22)" : "#dcfce7",
                              color: isProCard ? "#ffffff" : "#15803d",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 600,
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            ✓
                          </span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
            <div
              style={{
                padding: "18px 20px",
                borderRadius: 14,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderTop: "3px solid #5142b5",
              }}
            >
              <strong style={{ display: "block", fontSize: 15, color: "#0f172a", marginBottom: 10 }}>
                How Your 2-Month Complimentary Internship Works
              </strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                <div>
                  <strong style={{ color: "#5142b5" }}>Step 1 · 5 Guided Modules:</strong> Learn concepts and practise in live browser labs at your own pace.
                </div>
                <div>
                  <strong style={{ color: "#5142b5" }}>Step 2 · 2-Month Guided Internship:</strong> Build practical industry projects with mentor feedback.
                </div>
                <div>
                  <strong style={{ color: "#5142b5" }}>Step 3 · Dual Certificates &amp; Hiring:</strong> Earn your Course Certificate + 2-Month Internship Certificate (top performers eligible for direct hiring).
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#334155",
              }}
            >
              <span><strong>✓ 7-Day Refund Policy</strong> · Transparent cancellation within 7 days</span>
              <span><strong>✓ Secure Checkout</strong> · PayU Verified Gateway (UPI / Cards / NetBanking)</span>
              <span><strong>✓ Helpline:</strong> +91 6370044001 · support@skylent.live</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pp-faq-band" id="pp-faq" aria-labelledby="pp-faq-title">
        <div className="sky-container">
          <div className="pp-faq-head">
            <span className="pp-plans-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2 id="pp-faq-title" className="pp-plans-h2">
              Common questions about {programName}
            </h2>
          </div>
          <div className="pp-faq-grid">
            {faqs.map((item, idx) => (
              <details key={item.q} className="pp-faq-item" open={idx === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="pp-floating-dock-wrap" style={{ display: "none" }} aria-label="Quick programme section navigation">
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
          <a href="#pp-pricing" className="is-highlight">Pricing</a>
          <a href="#pp-stage">Workspace</a>
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
            <a href="#pp-pricing" className="pp-floating-dock__cta" style={{ textDecoration: "none" }}>
              Enroll Now
            </a>
          )}
        </nav>
      </div>
    </>
  )
}
