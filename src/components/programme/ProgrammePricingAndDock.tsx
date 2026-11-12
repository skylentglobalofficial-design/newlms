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
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 22,
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
                    borderRadius: 18,
                    padding: "28px 26px",
                    background: isProCard
                      ? "linear-gradient(160deg, #2e1065 0%, #4c1d95 55%, #5142b5 100%)"
                      : "#ffffff",
                    color: isProCard ? "#ffffff" : "#0f172a",
                    border: isProCard ? "2px solid #6d28d9" : "1px solid #e2e8f0",
                    borderTop: isProCard ? "2px solid #6d28d9" : "4px solid #5142b5",
                    boxShadow: isProCard
                      ? "0 20px 44px -14px rgba(76, 29, 149, 0.42)"
                      : "0 12px 30px -14px rgba(15, 23, 42, 0.08)",
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
                          fontWeight: 700,
                          color: isProCard ? "#ffffff" : "#0f172a",
                        }}
                      >
                        {displayTitle}
                      </h3>
                      {isProCard ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
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
                          fontSize: 32,
                          fontWeight: 800,
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
                        fontWeight: 700,
                        cursor: "pointer",
                        marginBottom: isProCard ? 10 : 18,
                      }}
                    >
                      Enroll Now — ₹{tier.price.toLocaleString("en-IN")}
                    </button>

                    {isProCard ? (
                      <div style={{ textAlign: "center", marginBottom: 14 }}>
                        <Link
                          to={`/contact?plan=job-assistance&track=${encodeURIComponent(programSlug || courseSlug || "data-analytics")}`}
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#e9d5ff",
                            textDecoration: "underline",
                            textUnderlineOffset: 3,
                          }}
                        >
                          Have questions? Request a 1-on-1 Career Advisor Call →
                        </Link>
                      </div>
                    ) : null}

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
                            fontSize: 13.5,
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

          {/* Skylent Signature Dual Credential & 2-Month Internship Visual Showcase */}
          <div style={{ marginTop: 26, display: "grid", gap: 18 }}>
            <div
              style={{
                padding: "22px 24px",
                borderRadius: 18,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 12px 32px -18px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#5142b5", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    DUAL CREDENTIALS INCLUDED IN EVERY PLAN
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 700, color: "#0f172a" }}>
                    How Your 2-Month Complimentary Internship &amp; Dual Certificates Work
                  </h3>
                </div>
                <Link
                  to="/verify"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#5142b5",
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                  }}
                >
                  ✓ Publicly Verifiable at skylent.live/verify →
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, fontSize: 13, color: "#334155", lineHeight: 1.5, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <strong style={{ color: "#5142b5" }}>Step 1 · 5 Interactive Modules:</strong> Master concepts and practise in live browser labs ({studioName}) at your own pace.
                </div>
                <div>
                  <strong style={{ color: "#5142b5" }}>Step 2 · 2-Month Guided Internship:</strong> Build and submit practical industry deliverables ({capstoneTitle}) with mentor review.
                </div>
                <div>
                  <strong style={{ color: "#5142b5" }}>Step 3 · Dual Certificates &amp; Hiring:</strong> Graduate with both certificates below — top performers are eligible for direct intern hiring.
                </div>
              </div>

              {/* Side-by-Side Visual Preview of Both Certificates */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {/* Certificate 1: Course Completion Certificate */}
                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "linear-gradient(180deg, #faf9ff 0%, #ffffff 100%)",
                    border: "1.5px solid #ddd6fe",
                    borderTop: "4px solid #5142b5",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5142b5", letterSpacing: "0.08em" }}>
                      CREDENTIAL 01 · COURSE CERTIFICATE
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#ede9fe", color: "#5142b5" }}>
                      ✓ QR &amp; ID Verified
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 2 }}>Skylent Global Pvt. Ltd. certifies completion of</div>
                    <strong style={{ display: "block", fontSize: 17, color: "#0f172a", fontFamily: "var(--font-display)" }}>
                      {programName}
                    </strong>
                    <span style={{ display: "block", fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                      5 Modules · 15 Interactive Lessons · {studioName}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px dashed #cbd5e1", fontSize: 11.5, color: "#475569" }}>
                    <span>ID: <code>SKL-2026-VERIFIED</code></span>
                    <strong style={{ color: "#0f172a" }}>LinkedIn &amp; Resume Ready</strong>
                  </div>
                </div>

                {/* Certificate 2: 2-Month Internship Experience Certificate */}
                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
                    border: "1.5px solid #a7f3d0",
                    borderTop: "4px solid #059669",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#047857", letterSpacing: "0.08em" }}>
                      CREDENTIAL 02 · INTERNSHIP LETTER
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#dcfce7", color: "#047857" }}>
                      ✓ 2-Month Experience
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 2 }}>2-Month Guided Project Internship in</div>
                    <strong style={{ display: "block", fontSize: 17, color: "#0f172a", fontFamily: "var(--font-display)" }}>
                      {capstoneTitle}
                    </strong>
                    <span style={{ display: "block", fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                      Practical Project Execution · Mentor Reviewed · Performance Graded
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px dashed #a7f3d0", fontSize: 11.5, color: "#047857" }}>
                    <span>Issued by Skylent Global</span>
                    <strong>Top Performers Eligible for Hiring</strong>
                  </div>
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
    </>
  )
}
