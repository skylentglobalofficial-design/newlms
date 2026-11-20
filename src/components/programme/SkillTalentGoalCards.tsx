import React from "react";
import { Link } from "react-router-dom";

export function SkillTalentGoalCards() {
  return (
    <section className="skylent-goal-split-section" style={{ maxWidth: 1220, margin: "28px auto 40px", padding: "0 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Choose your learning goal
        </h2>
        <p style={{ margin: 0, fontSize: 14.5, color: "#475569" }}>
          Build practical skills inside <strong>SkyLab</strong> or prepare for placements through <strong>Skylent Career Support</strong>.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 22, marginBottom: 36 }}>
        {/* CARD 1: GET CERTIFIED (SKYLAB) */}
        <div
          className="skylent-smooth-card"
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
            border: "1px solid #bfdbfe",
            borderRadius: 18,
            padding: "26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", background: "#dbeafe", padding: "4px 10px", borderRadius: 999 }}>
                POWERED BY SKYLAB · 6–8 WEEKS
              </span>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                ₹1,499 <span style={{ fontSize: 12, textDecoration: "line-through", color: "#64748b", fontWeight: 500 }}>₹2,999</span>
              </span>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 800, color: "#0f172a" }}>
              Get certified
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#334155", lineHeight: 1.5 }}>
              Learn in-demand skills with <strong>Recorded Lessons + Live Practice & Real Case Studies in SkyLab</strong>.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Data Analytics", to: "/programmes/data-analytics-pro?tier=skill" },
                { label: "Product Management", to: "/programmes?type=certification" },
                { label: "Python & Automation", to: "/programmes?type=certification" },
                { label: "SQL & BI Reporting", to: "/programmes?type=certification" }
              ].map((p) => (
                <Link
                  key={p.label}
                  to={p.to}
                  style={{
                    background: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none"
                  }}
                >
                  {p.label} →
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #dbeafe", paddingTop: 14 }}>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
              ✓ SkyLab Case Studies · ✓ Verified Certificate
            </span>
            <Link
              to="/programmes"
              style={{
                background: "#1d4ed8",
                color: "#ffffff",
                textDecoration: "none",
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 800
              }}
            >
              Choose a course →
            </Link>
          </div>
        </div>

        {/* CARD 2: GET HIRED (TALENTBRIDGE) */}
        <div
          className="skylent-smooth-card"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #3b2d96 52%, #1d4ed8 100%)",
            color: "#ffffff",
            borderRadius: 18,
            padding: "26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 14px 32px rgba(29, 78, 216, 0.2)"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#ffffff", background: "rgba(255,255,255,0.18)", padding: "4px 10px", borderRadius: 999 }}>
                POWERED BY TALENTBRIDGE · 4–6 MONTHS
              </span>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#ffffff" }}>
                ₹11,999 <span style={{ fontSize: 12, textDecoration: "line-through", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>₹19,999</span>
              </span>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 800, color: "#ffffff" }}>
              Get hired
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>
              Land your job offer with <strong>Placement Assistance Courses, 2-Month Internship Letter & 1-on-1 Mock Interviews</strong>.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Data Science & AI", to: "/programmes/data-analytics-pro?tier=professional" },
                { label: "Full-Stack Developer", to: "/programmes?type=professional" },
                { label: "Product Management", to: "/programmes?type=professional" },
                { label: "Applied AI Systems", to: "/programmes?type=professional" }
              ].map((p) => (
                <Link
                  key={p.label}
                  to={p.to}
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.28)",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none"
                  }}
                >
                  {p.label} →
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 14 }}>
            <span style={{ fontSize: 12, color: "#bfdbfe", fontWeight: 600 }}>
              ✓ 2-Month Internship Letter · ✓ Placement Support
            </span>
            <Link
              to="/programmes/data-analytics-pro?tier=professional"
              style={{
                background: "#ffffff",
                color: "#1e3a8a",
                textDecoration: "none",
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 800
              }}
            >
              Choose a track →
            </Link>
          </div>
        </div>
      </div>

      {/* STATIC MEANINGFUL COMPARISON TABLE (LIKE SCREENSHOT 6) */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 18px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.2fr", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
          <div style={{ padding: "14px 20px" }}>How You Learn & Grow</div>
          <div style={{ padding: "14px 16px", textAlign: "center", color: "#64748b" }}>Ordinary Video Courses</div>
          <div style={{ padding: "14px 16px", textAlign: "center", background: "linear-gradient(135deg, #3b2d96, #1d4ed8)", color: "#ffffff" }}>Skylent (SkyLab + Skylent Career Support)</div>
        </div>
        {[
          "Recorded Lessons + Live In-Browser Practice (SkyLab)",
          "Real Business Case Studies Instead of Toy Examples",
          "QR-Verified Certificate & Public Portfolio (/verify)",
          "1-on-1 Mentor Project Feedback & 20-Min Doubt Support",
          "Placement Assistance, Mock Interviews & Referrals (Skylent Career Support)"
        ].map((benefit, idx) => (
          <div key={benefit} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.2fr", borderBottom: idx === 4 ? "none" : "1px solid #f1f5f9", fontSize: 13, alignItems: "center" }}>
            <div style={{ padding: "13px 20px", fontWeight: 600, color: "#334155" }}>{benefit}</div>
            <div style={{ padding: "13px 16px", textAlign: "center", color: "#94a3b8", fontSize: 15, fontWeight: 700 }}>✕</div>
            <div style={{ padding: "13px 16px", textAlign: "center", background: "#eff6ff", color: "#1d4ed8", fontSize: 16, fontWeight: 800 }}>✓</div>
          </div>
        ))}
      </div>
    </section>
  );
}
