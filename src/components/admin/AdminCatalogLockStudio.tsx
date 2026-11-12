import React, { useState, useEffect } from "react";
import {
  readCatalogLocks,
  toggleCatalogItemLock,
  toggleDegreeSemesterLock,
  type CatalogLockItem,
  type CatalogCategory
} from "../../lib/catalog-locks";

export function AdminCatalogLockStudio() {
  const [items, setItems] = useState<CatalogLockItem[]>(() => readCatalogLocks());
  const [tab, setTab] = useState<CatalogCategory>("self-paced");

  useEffect(() => {
    const sync = () => setItems(readCatalogLocks());
    window.addEventListener("skylent:catalog-locks-updated", sync);
    return () => window.removeEventListener("skylent:catalog-locks-updated", sync);
  }, []);

  const openCount = items.filter((i) => !i.locked).length;
  const lockedCount = items.filter((i) => i.locked).length;

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 22, marginBottom: 24, boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div>
          <span style={{ background: "linear-gradient(135deg, #3b2d96, #1d4ed8)", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
            SKYLENT CATALOGUE & DEGREE LOCK CONTROLLER
          </span>
          <h3 style={{ margin: "6px 0 2px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Manage ₹1,499 Case Study Tracks, 9–12M Expert Programs & Degree Semester Locks
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            {openCount} Tracks Open · {lockedCount} Tracks Locked — Changes reflect immediately on /programmes and /education.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "self-paced", label: "₹1,499 Practical Tracks" },
            { id: "expert-9-12m", label: "9–12M Industry Expert Programs" },
            { id: "degree-sem", label: "Online Degrees (Sem 1–8 Locks)" }
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTab(c.id as CatalogCategory)}
              style={{
                background: tab === c.id ? "linear-gradient(135deg, #3b2d96, #1d4ed8)" : "#f1f5f9",
                color: tab === c.id ? "#ffffff" : "#334155",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {items
          .filter((i) => i.category === tab)
          .map((item) => (
            <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: item.locked ? "#f8fafc" : "#ffffff" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", background: "#eff6ff", padding: "2px 8px", borderRadius: 6 }}>{item.code}</span>
                    <strong style={{ fontSize: 15, color: "#0f172a" }}>{item.title}</strong>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>₹{item.priceInr.toLocaleString("en-IN")}</span>
                    <span style={{ fontSize: 11, textDecoration: "line-through", color: "#94a3b8" }}>₹{item.originalPriceInr.toLocaleString("en-IN")}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>({item.discountLabel})</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    {item.subtitle} · <strong>{item.caseStudiesCount} Case Studies · {item.labsCount} Browser Labs</strong> · {item.duration}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setItems(toggleCatalogItemLock(item.id))}
                  style={{
                    background: item.locked ? "#fef2f2" : "#dcfce7",
                    color: item.locked ? "#dc2626" : "#15803d",
                    border: `1px solid ${item.locked ? "#fecaca" : "#86efac"}`,
                    borderRadius: 999,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {item.locked ? "🔒 LOCKED (Click to Unlock)" : "✓ LIVE & OPEN (Click to Lock)"}
                </button>
              </div>

              {item.category === "degree-sem" && item.semestersTotal && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #e2e8f0", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginRight: 4 }}>Semester Lock Control:</span>
                  {Array.from({ length: item.semestersTotal }, (_, idx) => idx + 1).map((sem) => {
                    const isOpen = (item.unlockedSemesters ?? [1, 2]).includes(sem);
                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setItems(toggleDegreeSemesterLock(item.id, sem))}
                        style={{
                          background: isOpen ? "linear-gradient(135deg, #3b2d96, #1d4ed8)" : "#f1f5f9",
                          color: isOpen ? "#ffffff" : "#64748b",
                          border: isOpen ? "none" : "1px solid #cbd5e1",
                          borderRadius: 6,
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Sem {sem} {isOpen ? "✓ Open" : "🔒 Locked"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
