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
  const [tab, setTab] = useState<CatalogCategory>("skill-certificate");

  useEffect(() => {
    const sync = () => setItems(readCatalogLocks());
    window.addEventListener("skylent:catalog-locks-updated", sync);
    return () => window.removeEventListener("skylent:catalog-locks-updated", sync);
  }, []);

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Program & Degree Semester Lock Controller
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            ● Open = Students can enrol | 🔒 Locked = Controlled by Admin (reflected across /programmes & /education)
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "skill-certificate", label: "1. Skill Certificates (₹1,499)" },
            { id: "professional-career", label: "2. Professional Programs (₹11,999 & 9–12M)" },
            { id: "degree-sem", label: "3. Degree Semesters (Sem 1–8)" }
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
                padding: "8px 13px",
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

      <div style={{ display: "grid", gap: 10 }}>
        {items.filter((i) => i.category === tab).map((item) => (
          <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: item.locked ? "#f8fafc" : "#ffffff" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", marginRight: 8 }}>{item.code}</span>
                <strong style={{ fontSize: 14, color: "#0f172a" }}>{item.title}</strong>
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 800 }}>₹{item.priceInr.toLocaleString("en-IN")}</span>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => setItems(toggleCatalogItemLock(item.id))}
                style={{
                  background: item.locked ? "#fef2f2" : "#dcfce7",
                  color: item.locked ? "#dc2626" : "#15803d",
                  border: `1px solid ${item.locked ? "#fecaca" : "#86efac"}`,
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {item.locked ? "🔒 Locked (Click to Open)" : "● Open (Click to Lock)"}
              </button>
            </div>

            {item.category === "degree-sem" && item.semestersTotal && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #e2e8f0", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Semesters:</span>
                {Array.from({ length: item.semestersTotal }, (_, idx) => idx + 1).map((sem) => {
                  const open = (item.unlockedSemesters ?? [1, 2]).includes(sem);
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setItems(toggleDegreeSemesterLock(item.id, sem))}
                      style={{
                        background: open ? "linear-gradient(135deg, #3b2d96, #1d4ed8)" : "#f1f5f9",
                        color: open ? "#fff" : "#64748b",
                        border: open ? "none" : "1px solid #cbd5e1",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {open ? `● Sem ${sem} Open` : `🔒 Sem ${sem} Locked`}
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
