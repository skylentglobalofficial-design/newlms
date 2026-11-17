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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readCatalogLocks());
    window.addEventListener("skylent:catalog-locks-updated", sync);
    return () => window.removeEventListener("skylent:catalog-locks-updated", sync);
  }, []);

  return (
    <div className="skylent-admin-lock-bar" style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", background: "#eff6ff", padding: "3px 9px", borderRadius: 999 }}>
              CATALOGUE & SEMESTER ACCESS CONTROL
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              (● Open = Active | 🔒 Locked = Hidden/Upcoming)
            </span>
          </div>
          <h3 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Manage Certification Courses (₹1,499), Placement Courses (₹11,999) & Degree Semesters (1–8)
          </h3>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {!collapsed && [
            { id: "skill-certificate", label: "Certification (₹1,499)" },
            { id: "professional-career", label: "Placement Assistance (₹11,999)" },
            { id: "degree-sem", label: "Degrees (Sem 1–8)" }
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
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            {collapsed ? "Expand Lock Controls +" : "Minimize –"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {items.filter((i) => i.category === tab).map((item) => (
            <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", background: item.locked ? "#f8fafc" : "#ffffff" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", marginRight: 8 }}>{item.code}</span>
                  <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{item.title}</strong>
                  <span style={{ marginLeft: 10, fontSize: 12.5, fontWeight: 800, color: "#334155" }}>₹{item.priceInr.toLocaleString("en-IN")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setItems(toggleCatalogItemLock(item.id))}
                  style={{
                    background: item.locked ? "#fef2f2" : "#dcfce7",
                    color: item.locked ? "#dc2626" : "#15803d",
                    border: `1px solid ${item.locked ? "#fecaca" : "#86efac"}`,
                    borderRadius: 999,
                    padding: "5px 12px",
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {item.locked ? "🔒 Locked (Click to Open)" : "● Open (Click to Lock)"}
                </button>
              </div>

              {item.category === "degree-sem" && item.semestersTotal && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #e2e8f0", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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
                          padding: "4px 9px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {open ? `● Sem ${sem}` : `🔒 Sem ${sem}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
