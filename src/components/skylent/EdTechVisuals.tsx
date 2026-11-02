/**
 * Unified Skylent Brand & Visual Showmanship System (EdTechVisuals.tsx)
 *
 * Includes:
 * - TechStackIcon: Real multi-color inline SVG icons for SQL/Postgres, Python, React, TypeScript, Node, RAG/AI, and Product
 * - TrackWorkbenchStrip / TrackWorkbenchOverlay: Non-overlapping dark terminal strip + SVG tool badges below card photos
 * - HeroProofStrip: Non-overlapping dark-gold proof bar below hero photography
 * - BrandTrustRibbon / EdTechTrustBar: Production stack with colored SVG logos & SLA guarantee
 * - CertificateTrophyShowcase: Visual framed dark-gold/violet Certificate & Graded Dossier Trophy preview card
 * - FacultyTaShowcaseStrip: Human Faculty TA & Reviewer avatar cards with live 11-min avg response SLA
 * - SyllabusDownloadButton: 1-click printable curriculum & rubric specification download
 * - RoleOutcomeStrip: Target career roles pill bar
 */
import type { MouseEvent } from "react"
import { Link } from "react-router-dom"
import { courses } from "../../data"

export function TechStackIcon({ kind }: { kind: "sql" | "python" | "react" | "node" | "ai" | "product" }) {
  switch (kind) {
    case "sql":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="5" rx="8" ry="3" fill="#38bdf8" fillOpacity="0.25" stroke="#0284c7" strokeWidth="2" />
          <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" stroke="#0284c7" strokeWidth="2" />
          <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke="#0284c7" strokeWidth="2" />
        </svg>
      )
    case "python":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2c-4 0-4 2-4 2v3h5v1H6S2 8 2 12s3 4 3 4h2v-2.5S7 11 9.5 11h5s2.5 0 2.5-2.5V4s0-2-5-2z" fill="#3b82f6" />
          <path d="M12 22c4 0 4-2 4-2v-3h-5v-1h7s4 0 4-4-3-4-3-4h-2v2.5S17 13 14.5 13h-5S7 13 7 15.5V20s0 2 5 2z" fill="#eab308" />
        </svg>
      )
    case "react":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="2.2" fill="#06b6d4" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#06b6d4" strokeWidth="1.8" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" stroke="#06b6d4" strokeWidth="1.8" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" stroke="#06b6d4" strokeWidth="1.8" />
        </svg>
      )
    case "node":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 20 6.5v11L12 22 4 17.5v-11L12 2z" fill="#10b981" fillOpacity="0.2" stroke="#059669" strokeWidth="2" />
          <path d="M9 9h6v6H9z" fill="#059669" />
        </svg>
      )
    case "ai":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="#8b5cf6" fillOpacity="0.25" stroke="#7c3aed" strokeWidth="2" />
        </svg>
      )
    case "product":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" fill="#f59e0b" fillOpacity="0.2" stroke="#d97706" strokeWidth="2" />
          <path d="M8 10h8M8 14h5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
  }
}

export type WorkbenchSnippet = {
  env: string
  cmd: string
  metric: string
  icon: "sql" | "python" | "react" | "node" | "ai" | "product"
  tools: string[]
}

const WORKBENCH_BY_SLUG: Record<string, WorkbenchSnippet> = {
  "data-analytics": {
    env: "NORTHWIND SQL LAB",
    cmd: "SELECT category, ROUND(SUM(net_revenue)) FROM northwind_sales WHERE returned = 'no'",
    metric: "166 rows · 14ms",
    icon: "sql",
    tools: ["PostgreSQL", "DuckDB", "Spreadsheets"],
  },
  "data-analytics-pro": {
    env: "NORTHWIND SQL LAB",
    cmd: "SELECT category, ROUND(SUM(net_revenue)) FROM northwind_sales WHERE returned = 'no'",
    metric: "166 rows · 14ms",
    icon: "sql",
    tools: ["PostgreSQL", "DuckDB", "Spreadsheets"],
  },
  "product-management": {
    env: "HARBOR DESK STUDIO",
    cmd: "prd-scope --engineers=2 --weeks=6 --triage=weekend_delivery_exceptions",
    metric: "18 interviews · 6w PRD",
    icon: "product",
    tools: ["Harbor Desk", "PRD Studio", "Cohort Funnel"],
  },
  "python-programming": {
    env: "PYTHON 3 · PYTEST",
    cmd: "pytest tests/test_settlement_pipeline.py --maxfail=1 -q",
    metric: "18 passed · 0.08s",
    icon: "python",
    tools: ["Python 3.12", "Pytest", "ETL CLI"],
  },
  "data-science-ai": {
    env: "SQL + PYTHON COHORT LAB",
    cmd: "audit_temporal_split(cohort_df, cutoff='2026-04-01', leakage_guard=True)",
    metric: "30 lessons · 0 leakage",
    icon: "python",
    tools: ["Python 3", "PostgreSQL", "Cohort Eval"],
  },
  "generative-ai": {
    env: "GROUNDED RAG EVAL",
    cmd: "evaluate_rag(chunks=12, citation_strict=True, hallucination_guard='on')",
    metric: "98.4% grounded",
    icon: "ai",
    tools: ["Grounded RAG", "Vector Search", "ReAct Agents"],
  },
  "generative-ai-program": {
    env: "GROUNDED RAG EVAL",
    cmd: "evaluate_rag(chunks=12, citation_strict=True, hallucination_guard='on')",
    metric: "98.4% grounded",
    icon: "ai",
    tools: ["Grounded RAG", "Vector Search", "ReAct Agents"],
  },
  "full-stack-web": {
    env: "TS · EXPRESS · POSTGRES",
    cmd: "POST /api/v1/ledger/transfer [Idempotency-Key: tx_904a] -> 200 OK",
    metric: "ACID · Outbox verified",
    icon: "react",
    tools: ["React 18", "TypeScript", "PostgreSQL"],
  },
  "full-stack": {
    env: "TS · EXPRESS · POSTGRES",
    cmd: "POST /api/v1/ledger/transfer [Idempotency-Key: tx_904a] -> 200 OK",
    metric: "ACID · Outbox verified",
    icon: "react",
    tools: ["React 18", "TypeScript", "PostgreSQL"],
  },
  "sql-certificate": {
    env: "SQL QUERY WORKBENCH",
    cmd: "SELECT store, RANK() OVER (ORDER BY net_margin DESC) FROM retail_orders",
    metric: "5 SQL modules · Live",
    icon: "sql",
    tools: ["SQL Joins", "CTEs", "Window Functions"],
  },
}

/**
 * Non-overlapping dark-mode terminal strip rendered directly below card images.
 */
export function TrackWorkbenchStrip({ slug }: { slug: string }) {
  const item = WORKBENCH_BY_SLUG[slug] ?? WORKBENCH_BY_SLUG["data-analytics"]
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "10px 14px",
        background: "#0f172a",
        color: "#e2e8f0",
        borderBottom: "1px solid #1e293b",
        fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
        fontSize: 11,
        lineHeight: 1.4,
      }}
      aria-label={`${item.env} preview`}
    >
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#a5b4fc", textTransform: "uppercase" }}>
          <TechStackIcon kind={item.icon} />
          {item.env}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6ee7b7", background: "rgba(16, 185, 129, 0.16)", padding: "1px 7px", borderRadius: 999 }}>
          {item.metric}
        </span>
      </span>
      <span
        style={{
          display: "block",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#cbd5e1",
          fontSize: 11,
        }}
      >
        $ {item.cmd}
      </span>
    </span>
  )
}

export const TrackWorkbenchOverlay = TrackWorkbenchStrip

/**
 * Non-overlapping dark-gold proof bar placed cleanly below hero photography.
 */
export function HeroProofStrip() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 12,
        background: "#0f172a",
        color: "#f8fafc",
        border: "1px solid #1e293b",
        marginTop: 10,
        fontSize: 12,
      }}
      aria-label="Proof-of-Work verification standard"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#10b981",
          }}
          aria-hidden="true"
        />
        <strong style={{ color: "#ffffff", fontWeight: 700 }}>Cryptographic Proof-of-Work Standard</strong>
      </div>
      <span style={{ color: "#cbd5e1", fontSize: 11.5 }}>
        25% Checks · 35% Briefs · 40% Capstone ·{" "}
        <Link to="/verify?code=SKL-2026-DA-EXEMPLAR" style={{ color: "#a5b4fc", fontWeight: 700, textDecoration: "none" }}>
          Inspect Exemplar Dossier →
        </Link>
      </span>
    </div>
  )
}

const STACK_STANDARDS: Array<{ name: string; role: string; icon: "sql" | "python" | "react" | "node" | "ai" | "product" }> = [
  { name: "PostgreSQL 16", role: "Northwind 166-Row Lab", icon: "sql" },
  { name: "Python 3.12 & Pytest", role: "ETL & Pipeline Audits", icon: "python" },
  { name: "React 18 & TypeScript", role: "Full-Stack Systems", icon: "react" },
  { name: "Node.js & Express", role: "Idempotent Ledger APIs", icon: "node" },
  { name: "Grounded RAG & Evals", role: "Citation-Checked LLMs", icon: "ai" },
  { name: "Harbor Desk Studio", role: "6-Week PRD & Cold Calls", icon: "product" },
]

/**
 * Unified Brand & Tech-Stack Trust Ribbon with Colored SVG Tool Icons.
 */
export function BrandTrustRibbon({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        padding: compact ? "14px 18px" : "18px 22px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        marginBlock: compact ? 16 : 24,
      }}
      aria-label="Production stack and evaluation standard"
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142B5" }}>
          Production Stack &amp; Evaluation Standard Across Skylent OS
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "#475569" }}>
          In-Browser Sandboxes · 20-Min Faculty TA Doubt SLA · SHA-256 Verifiable Dossiers
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
        {STACK_STANDARDS.map((item) => (
          <div
            key={item.name}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", flexShrink: 0 }}>
              <TechStackIcon kind={item.icon} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</strong>
              <span style={{ fontSize: 11, color: "#64748b" }}>{item.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const EdTechTrustBar = BrandTrustRibbon

/**
 * Visual Framed Certificate & Proof-of-Work Dossier Trophy Card (Coursera / AlmaBetter / Maven style).
 */
export function CertificateTrophyShowcase() {
  return (
    <div
      style={{
        marginTop: 28,
        padding: "24px",
        borderRadius: 16,
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        color: "#f8fafc",
        border: "1px solid rgba(165, 180, 252, 0.25)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 24,
        alignItems: "center",
      }}
      aria-label="Verifiable Proof-of-Work Certificate and Dossier Preview"
    >
      <div>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", background: "rgba(251, 191, 36, 0.14)", padding: "4px 10px", borderRadius: 999, marginBottom: 10 }}>
          Verifiable Employer Credential · SHA-256 Signed
        </span>
        <h3 style={{ margin: "0 0 8px", fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
          Graduate with a live Proof-of-Work Dossier — not a generic PDF.
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#cbd5e1", lineHeight: 1.55 }}>
          Every Skylent credential links directly to your executed SQL queries, Python test suites, 6-week PRD specs, and graded 25% · 35% · 40% rubric scores so recruiters can verify your work in one click.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/verify?code=SKL-2026-DA-EXEMPLAR" className="sk-btn sk-btn-primary" style={{ fontSize: 13 }}>
            Inspect Live Exemplar Dossier →
          </Link>
          <Link to="/verify?code=SKL-2026-PM-EXEMPLAR" className="sk-btn sk-btn-secondary" style={{ fontSize: 13, background: "rgba(255,255,255,0.08)", color: "#ffffff", borderColor: "rgba(255,255,255,0.2)" }}>
            View PM Exemplar
          </Link>
        </div>
      </div>

      {/* Framed Certificate & Rubric Card Mockup */}
      <div
        style={{
          padding: "18px 20px",
          borderRadius: 12,
          background: "#ffffff",
          color: "#0f172a",
          border: "2px solid #fbbf24",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 10, marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#5142B5", textTransform: "uppercase" }}>
              SKYLENT GLOBAL PVT. LTD. · VERIFIED CREDENTIAL
            </span>
            <strong style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
              Data Analytics &amp; Commercial SQL
            </strong>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#dcfce7", color: "#15803d" }}>
            96 / 100 · Distinction
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b" }}>25% CHECKS</span>
            <strong style={{ fontSize: 13, color: "#0f172a" }}>24 / 25</strong>
          </div>
          <div style={{ padding: "8px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b" }}>35% BRIEFS</span>
            <strong style={{ fontSize: 13, color: "#0f172a" }}>34 / 35</strong>
          </div>
          <div style={{ padding: "8px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b" }}>40% CAPSTONE</span>
            <strong style={{ fontSize: 13, color: "#0f172a" }}>38 / 40</strong>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#475569", fontFamily: "var(--font-mono)" }}>
          <span>ID: SKL-2026-DA-EXEMPLAR</span>
          <span style={{ color: "#5142B5", fontWeight: 700 }}>skylent.live/verify ✓</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Human Faculty TA & Mentor SLA Showcase Cards.
 */
export function FacultyTaShowcaseStrip() {
  const mentors = [
    {
      initials: "AR",
      name: "Ananya R.",
      role: "Principal SQL & Analytics TA",
      sla: "Avg reply: 9 mins",
      specialty: "Northwind SQL Grain, CTEs & Cohort Margin Audits",
      color: "#4338ca",
    },
    {
      initials: "VK",
      name: "Vikram K.",
      role: "Product Strategy & PRD Reviewer",
      sla: "Avg reply: 12 mins",
      specialty: "Harbor Desk Triage, 6-Week Scoping & Cold Calls",
      color: "#0f766e",
    },
    {
      initials: "SD",
      name: "Siddharth D.",
      role: "Python, RAG & Full-Stack TA",
      sla: "Avg reply: 11 mins",
      specialty: "Pytest ETL Suites, Grounded RAG & Idempotent APIs",
      color: "#7c3aed",
    },
  ] as const

  return (
    <div style={{ marginTop: 22 }} aria-label="Human Faculty TA Desk">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142B5" }}>
          Live Human Faculty TA Desk · 20-Minute Response SLA
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: "#15803d" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }} />
          TAs Online Across All 6 Tracks
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {mentors.map((m) => (
          <div
            key={m.name}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: m.color,
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {m.initials}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 13.5, fontWeight: 750, color: "#0f172a" }}>{m.name}</strong>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: "#dcfce7", color: "#15803d" }}>
                  {m.sla}
                </span>
              </div>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#5142B5", margin: "1px 0 3px" }}>
                {m.role}
              </span>
              <span style={{ display: "block", fontSize: 11.5, color: "#64748b", lineHeight: 1.35 }}>
                {m.specialty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 1-Click Printable Syllabus & Rubric Specification Sheet Download Button.
 */
export function SyllabusDownloadButton({
  courseSlug,
  title,
  label = "Download Syllabus",
}: {
  courseSlug: string
  title?: string
  label?: string
}) {
  const handleDownload = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const normalizedSlug =
      courseSlug === "data-analytics-pro" || courseSlug === "sql-certificate"
        ? "data-analytics"
        : courseSlug === "full-stack"
          ? "full-stack-web"
          : courseSlug === "generative-ai-program"
            ? "generative-ai"
            : courseSlug

    const course = courses.find((c) => c.slug === normalizedSlug) ?? courses[0]
    const displayTitle = title || course.title
    const modulesMd = course.modules
      .map(
        (m, i) =>
          `## Module 0${i + 1}: ${m.title}
` +
          m.lessons.map((l, j) => `  ${i + 1}.${j + 1} ${l.title} (${l.type.toUpperCase()} · ${l.duration})`).join("\n")
      )
      .join("\n\n")

    const docText = `# SKYLENT (skylent.live) — OFFICIAL CURRICULUM & CAPSTONE SPECIFICATION
Track: ${displayTitle}
Format: ${course.mode} · ${course.duration} · 5 Modules · 15 Lessons
Grading Standard: 25% Module Concept Checks · 35% Applied Written Briefs · 40% Capstone & Cold Call Defense
Support SLA: Socratic AI Coach + 20-Minute Human Faculty TA Escalation

## Overview
${course.desc}

## Learning Outcomes
${course.outcomes.map((o) => `- ${o}`).join("\n")}

## Complete 5-Module, 15-Lesson Syllabus
${modulesMd}

## Verification & Career OS Standard
Completing 60% of this curriculum unlocks Career Rise (skill-gap role matching & mock defense). Completing 100% issues a cryptographic Proof-of-Work Dossier verifiable at https://skylent.live/verify.
`
    const blob = new Blob([docText], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Skylent-${course.slug}-Syllabus.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="sk-btn sk-btn-secondary"
      style={{ fontSize: 13.5, fontWeight: 600 }}
    >
      {label} ↓
    </button>
  )
}

export function RoleOutcomeStrip({ roles }: { roles: readonly string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 12 }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5142B5" }}>
        Target Roles:
      </span>
      {roles.map((r) => (
        <span
          key={r}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 999,
            background: "#eef2ff",
            color: "#3730a3",
            border: "1px solid #c7d2fe",
          }}
        >
          {r}
        </span>
      ))}
    </div>
  )
}



export type ToolBadgeId =
  | "sql"
  | "python"
  | "react"
  | "node"
  | "postgres"
  | "genai"
  | "prd"
  | "sheets"
  | "cohort"
  | "pytest"
  | "rag"
  | "typescript"

const TOOL_PILL_STYLE: Record<ToolBadgeId, { label: string; bg: string; border: string; text: string; kind: "sql" | "python" | "react" | "node" | "ai" | "product" }> = {
  sql: { label: "SQL & Joins", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", kind: "sql" },
  postgres: { label: "PostgreSQL 16", bg: "#eef2ff", border: "#c7d2fe", text: "#3730a3", kind: "sql" },
  python: { label: "Python 3.12", bg: "#fefce8", border: "#fde047", text: "#854d0e", kind: "python" },
  pytest: { label: "ETL & Pytest", bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", kind: "python" },
  react: { label: "React 18", bg: "#ecfeff", border: "#a5f3fc", text: "#155e75", kind: "react" },
  typescript: { label: "TypeScript", bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", kind: "react" },
  node: { label: "Node & Express", bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", kind: "node" },
  genai: { label: "LLM Systems", bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", kind: "ai" },
  rag: { label: "Grounded RAG", bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8", kind: "ai" },
  prd: { label: "PRD & Roadmaps", bg: "#fffbeb", border: "#fde68a", text: "#92400e", kind: "product" },
  sheets: { label: "Spreadsheets & BI", bg: "#f0fdfa", border: "#99f6e4", text: "#115e59", kind: "sql" },
  cohort: { label: "Cohort & Churn ML", bg: "#fdf2f8", border: "#fbcfe8", text: "#9d174d", kind: "python" },
}

export function ToolStackPills({ tools }: { tools: readonly ToolBadgeId[] }) {
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {tools.map((id) => {
        const meta = TOOL_PILL_STYLE[id]
        if (!meta) return null
        return (
          <span
            key={id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 600,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              color: meta.text,
              lineHeight: 1.3,
            }}
          >
            <TechStackIcon kind={meta.kind} />
            <span>{meta.label}</span>
          </span>
        )
      })}
    </span>
  )
}

export const TRACK_ROLE_METADATA: Record<
  string,
  {
    roles: string
    pace: string
    tools: readonly ToolBadgeId[]
  }
> = {
  "data-analytics": { roles: "Data Analyst · BI Analyst · Commercial Analyst", pace: "4–6 Weeks · Self-Paced", tools: ["sql", "sheets", "postgres"] },
  "data-analytics-pro": { roles: "Data Analyst · BI Analyst · Commercial Analyst", pace: "4–6 Weeks · Self-Paced", tools: ["sql", "sheets", "postgres"] },
  "product-management": { roles: "Product Manager · Associate PM · Growth PM", pace: "4–6 Weeks · Self-Paced", tools: ["prd", "sheets", "cohort"] },
  "python-programming": { roles: "Python Developer · Data Engineer · Automation Engineer", pace: "4–6 Weeks · Self-Paced", tools: ["python", "pytest", "sql"] },
  "data-science-ai": { roles: "Data Scientist · Decision Scientist · ML Analyst", pace: "6–8 Weeks · Dual Track (30 Lessons)", tools: ["python", "sql", "cohort"] },
  "generative-ai": { roles: "AI Engineer · LLM Systems Developer · Applied AI Lead", pace: "4–6 Weeks · Self-Paced", tools: ["genai", "rag", "python"] },
  "generative-ai-program": { roles: "AI Engineer · LLM Systems Developer · Applied AI Lead", pace: "4–6 Weeks · Self-Paced", tools: ["genai", "rag", "python"] },
  "full-stack": { roles: "Full-Stack Developer · Backend Engineer · Product Engineer", pace: "5–7 Weeks · Self-Paced", tools: ["react", "typescript", "node", "postgres"] },
  "full-stack-web": { roles: "Full-Stack Developer · Backend Engineer · Product Engineer", pace: "5–7 Weeks · Self-Paced", tools: ["react", "typescript", "node", "postgres"] },
  "sql-certificate": { roles: "Business Analyst · SQL Reporting Analyst · Operations Analyst", pace: "3–4 Weeks · Self-Paced", tools: ["sql", "postgres", "sheets"] },
}

export function TargetRolesBadge({ slug }: { slug: string }) {
  const meta = TRACK_ROLE_METADATA[slug]
  if (!meta) return null
  return (
    <span
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "#334155",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        padding: "5px 9px",
        marginTop: 4,
      }}
    >
      <strong style={{ color: "#4f46e5" }}>Target Roles:</strong> {meta.roles}
    </span>
  )
}

export function ShareableCredentialPreviewCard({
  courseTitle,
  capstoneTitle,
  skills,
  codeExample = "SKL-2026-PGM-VERIFIED",
}: {
  courseTitle: string
  capstoneTitle: string
  skills: readonly string[]
  codeExample?: string
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <CertificateTrophyShowcase />
      <FacultyTaShowcaseStrip />
    </div>
  )
}
