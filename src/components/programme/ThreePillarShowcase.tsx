import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { readCatalogLocks, type CatalogLockItem } from "../../lib/catalog-locks";

export function ThreePillarShowcase() {
  const [items, setItems] = useState<CatalogLockItem[]>(() => readCatalogLocks());
  const [selectedTier, setSelectedTier] = useState<"all" | "skill-certificate" | "professional-career" | "degree-sem">("all");

  useEffect(() => {
    const sync = () => setItems(readCatalogLocks());
    window.addEventListener("skylent:catalog-locks-updated", sync);
    return () => window.removeEventListener("skylent:catalog-locks-updated", sync);
  }, []);

  const skillItems = items.filter((i) => i.category === "skill-certificate");
  const proItems = items.filter((i) => i.category === "professional-career");
  const degreeItems = items.filter((i) => i.category === "degree-sem");

  return (
    <section style={{ maxWidth: 1240, margin: "36px auto", padding: "0 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 18px", marginBottom: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          Clear Visual Guide — How Skylent Programs Are Structured:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, fontWeight: 600, color: "#334155" }}>
          <span><strong style={{ color: "#16a34a" }}>● Open</strong> = Admissions Active Now</span>
          <span><strong style={{ color: "#d97706" }}>🔒 Locked</strong> = Controlled by Academic Cell / Upcoming Cohort</span>
          <span><strong style={{ color: "#0f172a" }}>White Card</strong> = Skill Certificate (₹1,499)</span>
          <span><strong style={{ color: "#1d4ed8" }}>Purple-Blue Card</strong> = Professional Career Program (₹11,999 / 9–12M)</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {[
          { id: "all", label: "All Categories (Complete View)" },
          { id: "skill-certificate", label: "1. Skill Certificate Courses (₹1,499 · Only Skill Development)" },
          { id: "professional-career", label: "2. Professional Programs (₹11,999 Job Assistance & 9–12M Experts)" },
          { id: "degree-sem", label: "3. Online Degree Pathways (Sem 1–8)" }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTier(t.id as any)}
            style={{
              background: selectedTier === t.id ? "linear-gradient(135deg, #3b2d96 0%, #1d4ed8 100%)" : "#ffffff",
              color: selectedTier === t.id ? "#ffffff" : "#1e293b",
              border: selectedTier === t.id ? "none" : "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(selectedTier === "all" || selectedTier === "skill-certificate") && (
        <div style={{ marginBottom: 44 }}>
          <div style={{ borderLeft: "4px solid #0f172a", paddingLeft: 14, marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#475569", textTransform: "uppercase" }}>
              CATEGORY 01 · SELF-PACED SKILL DEVELOPMENT
            </span>
            <h2 style={{ margin: "4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              Skill Certificate Courses — ₹1,499 <span style={{ fontSize: 14, fontWeight: 600, color: "#16a34a" }}>(50% OFF from ₹2,999)</span>
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              Designed strictly for focused skill building through practical case studies and workspace exercises. (Does not include job placement or live mentor classes.)
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {skillItems.map((item) => (
              <div key={item.id} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, background: "#f1f5f9", color: "#334155", padding: "4px 9px", borderRadius: 6 }}>
                      SKILL CERTIFICATE
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.locked ? "#d97706" : "#16a34a" }}>
                      {item.locked ? "🔒 Locked" : "● Open"}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{item.title}</h3>
                  <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{item.subtitle}</p>

                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, fontSize: 12, display: "grid", gap: 5, marginBottom: 16, border: "1px solid #e2e8f0" }}>
                    <div style={{ color: "#15803d", fontWeight: 700 }}>✓ {item.caseStudiesCount} Practical Case Studies & Workspace</div>
                    <div style={{ color: "#15803d", fontWeight: 700 }}>✓ Self-Paced Modules & Verified Skill Certificate</div>
                    <div style={{ color: "#94a3b8", fontWeight: 600 }}>✕ No Dedicated Job Assistance / Referrals</div>
                    <div style={{ color: "#94a3b8", fontWeight: 600 }}>✕ No Live Industry Expert Classes or Mock Interviews</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>₹{item.priceInr.toLocaleString("en-IN")}</span>{" "}
                    <span style={{ fontSize: 12, textDecoration: "line-through", color: "#94a3b8" }}>₹{item.originalPriceInr.toLocaleString("en-IN")}</span>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{item.duration}</div>
                  </div>
                  <Link
                    to={item.locked ? "#" : "/programmes/data-analytics-pro"}
                    style={{
                      background: item.locked ? "#e2e8f0" : "#0f172a",
                      color: item.locked ? "#64748b" : "#ffffff",
                      textDecoration: "none",
                      padding: "9px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    {item.locked ? "Cohort Locked" : "Enrol in Skill Course →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedTier === "all" || selectedTier === "professional-career") && (
        <div style={{ marginBottom: 44 }}>
          <div style={{ borderLeft: "4px solid #1d4ed8", paddingLeft: 14, marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#1d4ed8", textTransform: "uppercase" }}>
              CATEGORY 02 · CAREER TRANSFORMATION & PLACEMENT SUPPORT
            </span>
            <h2 style={{ margin: "4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              Professional Job Assistance Programs (₹11,999) & 9–12 Month Industry Expert Tracks
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              Built for learners seeking complete career readiness: live mentor guidance, 1-on-1 case study review, mock interviews, and dedicated job assistance.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
            {proItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "linear-gradient(145deg, #1e1b4b 0%, #3b2d96 50%, #1d4ed8 100%)",
                  color: "#ffffff",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 14px 32px rgba(29, 78, 216, 0.22)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(255,255,255,0.16)", color: "#ffffff", padding: "4px 10px", borderRadius: 999 }}>
                      {item.tierLabel}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.locked ? "#fde047" : "#4ade80" }}>
                      {item.locked ? "🔒 Locked" : "● Open"}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#ffffff" }}>{item.title}</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.86)", lineHeight: 1.55 }}>{item.subtitle}</p>

                  <div style={{ background: "rgba(15, 23, 42, 0.38)", borderRadius: 12, padding: 14, fontSize: 12, display: "grid", gap: 6, marginBottom: 18, border: "1px solid rgba(255,255,255,0.14)" }}>
                    <div style={{ color: "#86efac", fontWeight: 700 }}>✓ {item.caseStudiesCount} Enterprise Case Studies + Capstone Defense</div>
                    <div style={{ color: "#86efac", fontWeight: 700 }}>✓ Dedicated Job Assistance, Referrals & Placement Desk</div>
                    <div style={{ color: "#86efac", fontWeight: 700 }}>✓ 1-on-1 Human Mentor Review & 3 Live Mock Interviews</div>
                    <div style={{ color: "#86efac", fontWeight: 700 }}>✓ Live Sessions with Top Industry Experts</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>₹{item.priceInr.toLocaleString("en-IN")}</span>{" "}
                    <span style={{ fontSize: 12, textDecoration: "line-through", color: "rgba(255,255,255,0.6)" }}>₹{item.originalPriceInr.toLocaleString("en-IN")}</span>
                    <div style={{ fontSize: 11, color: "#93c5fd", fontWeight: 700 }}>{item.duration}</div>
                  </div>
                  <Link
                    to={item.locked ? "#" : "/programmes/data-analytics-pro"}
                    style={{
                      background: item.locked ? "rgba(255,255,255,0.2)" : "#ffffff",
                      color: item.locked ? "#cbd5e1" : "#1e3a8a",
                      textDecoration: "none",
                      padding: "10px 16px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800
                    }}
                  >
                    {item.locked ? "🔒 Cohort Locked" : "Explore Professional Program →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedTier === "all" || selectedTier === "degree-sem") && (
        <div>
          <div style={{ borderLeft: "4px solid #3b2d96", paddingLeft: 14, marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#3b2d96", textTransform: "uppercase" }}>
              CATEGORY 03 · UNIVERSITY DEGREE SKELETON (SEMESTER LOCK CONTROLLED)
            </span>
            <h2 style={{ margin: "4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              Online & Institutional Degree Pathways (Semesters 1–8)
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              Each semester is unlocked progressively by the Academic Cell as cohorts advance.
            </p>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {degreeItems.map((deg) => {
              const total = deg.semestersTotal ?? 6;
              const unlocked = deg.unlockedSemesters ?? [1, 2];
              return (
                <div key={deg.id} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#3b2d96", background: "#ede9fe", padding: "3px 9px", borderRadius: 6 }}>
                        {deg.tierLabel}
                      </span>
                      <h3 style={{ margin: "6px 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{deg.title}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>{deg.subtitle}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: deg.locked ? "#d97706" : "#16a34a" }}>
                      {deg.locked ? "🔒 Admissions Locked by Admin" : "● Admissions Open"}
                    </span>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed #e2e8f0", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Semester Status:</span>
                    {Array.from({ length: total }, (_, i) => i + 1).map((sem) => {
                      const open = unlocked.includes(sem) && !deg.locked;
                      return (
                        <span
                          key={sem}
                          style={{
                            background: open ? "#eff6ff" : "#f1f5f9",
                            color: open ? "#1d4ed8" : "#64748b",
                            border: `1px solid ${open ? "#bfdbfe" : "#cbd5e1"}`,
                            padding: "5px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700
                          }}
                        >
                          {open ? `● Sem ${sem} Open` : `🔒 Sem ${sem} Locked`}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
