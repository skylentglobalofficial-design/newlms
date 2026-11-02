/**
 * Unified Skylent Brand & Visual System (EdTechVisuals.tsx)
 *
 * Provides shared visual components across all public and catalogue surfaces:
 * - TrackWorkbenchOverlay / TrackWorkbenchStrip: Non-overlapping dark terminal strip below card photos
 * - HeroProofStrip: Non-overlapping dark-gold proof bar below hero photography
 * - BrandTrustRibbon / EdTechTrustBar: Industry stack & execution SLA strip
 * - SyllabusDownloadButton: 1-click printable HTML/Markdown syllabus brochure download
 * - RoleOutcomeStrip: Target career roles and verifiable portfolio deliverables
 */
import type { MouseEvent } from "react"
import { Link } from "react-router-dom"
import { courses } from "../../data"

export type WorkbenchSnippet = {
  env: string
  cmd: string
  metric: string
}

const WORKBENCH_BY_SLUG: Record<string, WorkbenchSnippet> = {
  "data-analytics": {
    env: "NORTHWIND SQL LAB",
    cmd: "SELECT category, ROUND(SUM(net_revenue)) FROM northwind_sales WHERE returned = 'no'",
    metric: "166 rows · 14ms",
  },
  "data-analytics-pro": {
    env: "NORTHWIND SQL LAB",
    cmd: "SELECT category, ROUND(SUM(net_revenue)) FROM northwind_sales WHERE returned = 'no'",
    metric: "166 rows · 14ms",
  },
  "product-management": {
    env: "HARBOR DESK STUDIO",
    cmd: "prd-scope --engineers=2 --weeks=6 --triage=weekend_delivery_exceptions",
    metric: "18 interviews · 6w PRD",
  },
  "python-programming": {
    env: "PYTHON 3 · PYTEST",
    cmd: "pytest tests/test_settlement_pipeline.py --maxfail=1 -q",
    metric: "18 passed · 0.08s",
  },
  "data-science-ai": {
    env: "SQL + PYTHON COHORT LAB",
    cmd: "audit_temporal_split(cohort_df, cutoff='2026-04-01', leakage_guard=True)",
    metric: "30 lessons · 0 leakage",
  },
  "generative-ai": {
    env: "GROUNDED RAG EVAL",
    cmd: "evaluate_rag(chunks=12, citation_strict=True, hallucination_guard='on')",
    metric: "98.4% grounded",
  },
  "generative-ai-program": {
    env: "GROUNDED RAG EVAL",
    cmd: "evaluate_rag(chunks=12, citation_strict=True, hallucination_guard='on')",
    metric: "98.4% grounded",
  },
  "full-stack-web": {
    env: "TS · EXPRESS · POSTGRES",
    cmd: "POST /api/v1/ledger/transfer [Idempotency-Key: tx_904a] -> 200 OK",
    metric: "ACID · Outbox verified",
  },
  "full-stack": {
    env: "TS · EXPRESS · POSTGRES",
    cmd: "POST /api/v1/ledger/transfer [Idempotency-Key: tx_904a] -> 200 OK",
    metric: "ACID · Outbox verified",
  },
  "sql-certificate": {
    env: "SQL QUERY WORKBENCH",
    cmd: "SELECT store, RANK() OVER (ORDER BY net_margin DESC) FROM retail_orders",
    metric: "5 SQL modules · Live",
  },
}

/**
 * Non-overlapping dark-mode terminal strip rendered directly below card images.
 * Exported as both TrackWorkbenchStrip and TrackWorkbenchOverlay for full compatibility.
 */
export function TrackWorkbenchStrip({ slug }: { slug: string }) {
  const item = WORKBENCH_BY_SLUG[slug] ?? WORKBENCH_BY_SLUG["data-analytics"]
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
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
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#a5b4fc", textTransform: "uppercase" }}>
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

const STACK_STANDARDS = [
  { name: "PostgreSQL 16", role: "Northwind 166-Row Lab" },
  { name: "Python 3.12 & Pytest", role: "ETL & Pipeline Audits" },
  { name: "React 18 & TypeScript", role: "Full-Stack Systems" },
  { name: "Node.js & Express", role: "Idempotent Ledger APIs" },
  { name: "Grounded RAG & Evals", role: "Citation-Checked LLMs" },
  { name: "Harbor Desk Studio", role: "6-Week PRD & Cold Calls" },
] as const

/**
 * Unified Brand & Tech-Stack Trust Ribbon mounted across public surfaces.
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
          Zero passive video bloat · 20-Min Faculty TA Doubt SLA · SHA-256 Verifiable Dossiers
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 10 }}>
        {STACK_STANDARDS.map((item) => (
          <div
            key={item.name}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <strong style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{item.name}</strong>
            <span style={{ fontSize: 11, color: "#64748b" }}>{item.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const EdTechTrustBar = BrandTrustRibbon

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
          m.lessons.map((l, j) => `  ${i + 1}.${j + 1} ${l.title} (${l.type.toUpperCase()} · ${l.duration})`).join("
")
      )
      .join("

")

    const docText = `# SKYLENT (skylent.live) — OFFICIAL CURRICULUM & CAPSTONE SPECIFICATION
Track: ${displayTitle}
Format: ${course.mode} · ${course.duration} · 5 Modules · 15 Lessons
Grading Standard: 25% Module Concept Checks · 35% Applied Written Briefs · 40% Capstone & Cold Call Defense
Support SLA: Socratic AI Coach + 20-Minute Human Faculty TA Escalation

## Overview
${course.desc}

## Learning Outcomes
${course.outcomes.map((o) => `- ${o}`).join("
")}

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
