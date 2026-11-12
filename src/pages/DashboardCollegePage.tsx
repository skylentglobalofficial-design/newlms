import React, { useState } from "react";
import { Link } from "react-router-dom";
import { readCatalogLocks, toggleDegreeSemesterLock } from "../lib/catalog-locks";

export function DashboardCollegePage() {
  const [degrees, setDegrees] = useState(() => readCatalogLocks().filter((i) => i.category === "degree-sem"));

  const handleSemToggle = (id: string, sem: number) => {
    const next = toggleDegreeSemesterLock(id, sem);
    setDegrees(next.filter((i) => i.category === "degree-sem"));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg, #2e1f84 0%, #1d4ed8 100%)", color: "#fff", padding: "22px 28px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <span style={{ background: "rgba(255,255,255,0.16)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              PARTNER UNIVERSITY & DEAN CONSOLE
            </span>
            <h1 style={{ margin: "6px 0 2px", fontSize: 24, fontWeight: 800 }}>Campus Cohort, Case Study & Semester Lock Tracker</h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              Real-time NAAC/NEP credit readiness, student lab completion & Semester 1–8 curriculum access controls.
            </p>
          </div>
          <Link to="/education" style={{ background: "#fff", color: "#1e3a8a", padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
            View Public Degree Pathways ↗
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: "24px auto", padding: "0 24px 60px", display: "grid", gap: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          {[
            { label: "Active Campus Students", value: "412", sub: "Across B.Tech CSE, BCA & MCA" },
            { label: "Case Studies Submitted", value: "1,284", sub: "86% passing rubric threshold" },
            { label: "Browser Lab Hours", value: "6,490 hrs", sub: "Zero local setup required" },
            { label: "Placement & Internship Ready", value: "194", sub: "Verified Career OS portfolios" }
          ].map((k) => (
            <div key={k.label} style={{ background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #e2e8f0", borderTop: "4px solid #1d4ed8" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 4px" }}>{k.value}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>University Degree Semesters (1-Click Academic Lock / Unlock)</h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Control which semesters are currently unlocked for your campus students:</p>
          <div style={{ display: "grid", gap: 14 }}>
            {degrees.map((deg) => {
              const total = deg.semestersTotal ?? 8;
              const unlocked = deg.unlockedSemesters ?? [1, 2];
              return (
                <div key={deg.id} style={{ padding: 16, borderRadius: 12, border: "1px solid #cbd5e1" }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{deg.title} <span style={{ color: "#1d4ed8", fontSize: 12 }}>({deg.code})</span></div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{deg.subtitle}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {Array.from({ length: total }, (_, idx) => idx + 1).map((sem) => {
                      const open = unlocked.includes(sem);
                      return (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => handleSemToggle(deg.id, sem)}
                          style={{
                            background: open ? "linear-gradient(135deg, #3b2d96, #1d4ed8)" : "#f1f5f9",
                            color: open ? "#fff" : "#64748b",
                            border: open ? "none" : "1px solid #cbd5e1",
                            borderRadius: 8,
                            padding: "6px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Sem {sem} {open ? "✓ Unlocked" : "🔒 Locked"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardCollegePage;
