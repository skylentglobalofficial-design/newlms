/**
 * Programme detail page for multi-track & specialist programmes (`data-science-ai`, `full-stack`, `generative-ai-program`, `sql-certificate`).
 *
 * Unified with the 2-Column Royal Midnight Navy + Gold architecture of `ProfessionalProgrammeTemplate.tsx`:
 * 1. 2-Column Hero with 4-Card Key Metrics Grid, Tools & Skills Stack Bar, and Elevated Royal Midnight Navy Enrolment Card (`.pp-enrol-card`)
 * 2. Sticky Sub-Navigation Bar (`.pp-subnav-bar`)
 * 3. Full-bleed Royal Workbench Stage (`.sky-stage.sky-band-navy.pp-stage`) with interactive code/SQL sandbox
 * 4. Included Self-Paced Coursework & Complete 5-Module / 15-Lesson Curriculum
 */
import { Link } from "react-router-dom"
import type { CatalogProgramDetail } from "../../lib/catalog-api"
import { courseBySlug } from "../../lib/catalog-maturity"
import { ArrowRight, SectionIndex, SpecSheet, TruthChip } from "../skylent/primitives"
import { SyllabusDownloadButton } from "../skylent/EdTechVisuals"
import { Reveal } from "../skylent/Reveal"
import { NorthwindLabPlate, ProgrammeThumb, programmeThumbInfo } from "./ProgrammeArtefacts"
import TrackInteractiveSandbox from "../labs/TrackInteractiveSandbox"
import { plural, type ProgrammeTruth } from "./programme-truth"
import { effectiveProgrammePublicFacts } from "../../lib/public-catalogue-copy"
import { practiceNoteForProgramme } from "../../lib/practice-environments"
import "./ProfessionalProgrammeTemplate.css"
import "../../pages/cine.css"
import { STATUS_NOT_CONFIRMED } from "./CatalogueNotice"
import ProgrammePricingAndDock from "./ProgrammePricingAndDock"

type Props = {
  program: CatalogProgramDetail
  truth: ProgrammeTruth
  cta: string
  honesty: string
  afterEnrol: string
  onEnrol: () => void
  confirmed?: boolean
}

const PATHWAY_CAPSTONES: Record<
  string,
  {
    headlinePrefix: string
    headlineSignal: string
    sandboxType: string
    figureCaption: string
    studio: string
    capstoneTitle: string
    summary: string
    roles: string[]
    tools: string[]
    steps: Array<{ num: string; title: string; detail: string }>
  }
> = {
  "data-science-ai": {
    headlinePrefix: "Combine commercial SQL analytics with ",
    headlineSignal: "production Python & cohort validation.",
    sandboxType: "churn-cohort-validation",
    figureCaption: "Skylent OS · Out-of-time Churn Cohort & SQL Validation Workbench",
    studio: "Northwind SQL Lab + Python ETL & Churn Cohort Sandbox",
    capstoneTitle: "Dual Capstone: Commercial Margin Audit & Out-of-Time Churn Pipeline",
    summary: "Complete both the 15-lesson Data Analytics course and the 15-lesson Python Programming & Automation course, plus the Churn Cohort Leakage validator.",
    roles: ["Data Analyst", "Data Science Associate", "Analytics Engineer", "BI & Python Developer"],
    tools: ["PostgreSQL & CTEs", "Python 3 & Pandas", "Pytest Validators", "Cohort Retention", "Executive Memo"],
    steps: [
      { num: "01", title: "Audit Commercial SQL Grain", detail: "Validate 166 Northwind order rows, remove returned/invalid units, and compute category net revenue." },
      { num: "02", title: "Build Python ETL & Pytest Validators", detail: "Quarantine malformed settlement records, enforce unique transaction keys, and pass automated pytest suites." },
      { num: "03", title: "Verify Cohort Split & Leakage Guards", detail: "Enforce chronological train/test splits and audit precision-recall lift without future data leakage." },
      { num: "04", title: "Publish Verified Project & Certificate", detail: "Submit both capstones to unlock your verified project report (/verify) and Career OS profile." },
    ],
  },
  "full-stack": {
    headlinePrefix: "Ship end-to-end TypeScript applications with ",
    headlineSignal: "safe PostgreSQL payment ledgers.",
    sandboxType: "idempotent-ledger-architecture",
    figureCaption: "Skylent OS · Full-Stack Transactional Outbox & Ledger Sandbox",
    studio: "Full-Stack TypeScript, Express & PostgreSQL Ledger Sandbox",
    capstoneTitle: "Capstone: Safe Financial Settlement & Transactional Ledger API",
    summary: "Master end-to-end web engineering across 5 modules and 15 lessons: React 18 state architecture, Node/Express REST APIs, PostgreSQL indexing, and safe transaction handling.",
    roles: ["Full-Stack Developer", "Backend Node.js Engineer", "Frontend React Engineer", "Software Development Engineer (SDE-1)"],
    tools: ["React 18 & TypeScript", "Node.js & Express", "PostgreSQL & Prisma", "REST API Security", "Automated Testing"],
    steps: [
      { num: "01", title: "Design Relational Schema & Constraints", detail: "Model normalized PostgreSQL tables with foreign keys, composite unique indexes, and migration safety." },
      { num: "02", title: "Build Safe REST API Endpoints", detail: "Enforce request validation, row-level locking, and duplicate-payment protection under webhook retries." },
      { num: "03", title: "Wire React 18 State & Error Boundaries", detail: "Build resilient client views that handle loading, optimistic updates, and 503 fallback states cleanly." },
      { num: "04", title: "Pass Security Audit & Capstone Review", detail: "Defend your architecture decisions and publish your verified project portfolio (/verify)." },
    ],
  },
  "generative-ai-program": {
    headlinePrefix: "Architect citation-grounded RAG pipelines and ",
    headlineSignal: "reliable LLM evaluation suites.",
    sandboxType: "enterprise-rag-evaluation",
    figureCaption: "Skylent OS · Citation-Grounded Enterprise RAG & Guardrail Evaluator",
    studio: "Grounded RAG, Vector Retrieval & LLM Evaluation Sandbox",
    capstoneTitle: "Capstone: Citation-Grounded Enterprise RAG & Accuracy Eval Suite",
    summary: "Build production LLM systems across 5 modules and 15 lessons: structured JSON prompting, chunking & embeddings, hybrid RAG retrieval, tool-calling agents, and hallucination guardrails.",
    roles: ["Applied AI Engineer", "LLM Systems Developer", "RAG & Knowledge Engineer", "AI Product Engineer"],
    tools: ["Grounded RAG", "Vector Embeddings", "JSON Prompt Contracts", "Tool-Calling Agents", "LLM Accuracy Evals"],
    steps: [
      { num: "01", title: "Engineer Structured Prompt Contracts", detail: "Enforce strict JSON schemas, system boundaries, and prompt-injection refusal guardrails." },
      { num: "02", title: "Build Hybrid Chunking & Vector Retrieval", detail: "Index enterprise documents with semantic + keyword retrieval and strict citation grounding." },
      { num: "03", title: "Orchestrate Safe Tool-Calling Agents", detail: "Bind read-only tools with loop caps, latency budgets, and deterministic fallback handlers." },
      { num: "04", title: "Run Golden-Dataset LLM Evals", detail: "Benchmark faithfulness, answer relevance, and p95 latency to earn your verified AI certificate." },
    ],
  },
  "sql-certificate": {
    headlinePrefix: "Turn raw relational tables into ",
    headlineSignal: "defensible commercial decisions.",
    sandboxType: "northwind-sql",
    figureCaption: "Northwind Lab, revenue by category (180 order lines, Q3 window)",
    studio: "Northwind Retail SQL Lab (166 Validated Order Rows)",
    capstoneTitle: "Capstone: Multi-Table Revenue & Discount Leakage Audit",
    summary: "Master practical business SQL from foundational filtering to multi-table joins, CTEs, window functions, and executive margin reporting via our live Data Analytics track.",
    roles: ["Business Analyst", "SQL Data Analyst", "Operations Analyst", "Reporting Specialist"],
    tools: ["SQL SELECT & WHERE", "Multi-Table JOINs", "CTEs & Window Functions", "Data Cleaning", "Revenue Reporting"],
    steps: [
      { num: "01", title: "Inspect Schema & Row Hygiene", detail: "Audit raw order lines for negative quantities, zero prices, and returned shipments before aggregating." },
      { num: "02", title: "Write Multi-Table Joins & CTEs", detail: "Combine orders, line items, and category mappings without grain-mismatch fanout." },
      { num: "03", title: "Compute Cohort & Monthly Trends", detail: "Use window functions and grouped aggregations to isolate Q2 revenue dips." },
      { num: "04", title: "Publish Verified SQL Evidence", detail: "Complete the SQL modules inside Data Analytics to earn your verifiable certificate code." },
    ],
  },
}

function listingDescription(program: CatalogProgramDetail, truth: ProgrammeTruth): string | null {
  if (program.slug === "data-science-ai" && !truth.authored) {
    return "Listed as a data science direction. Machine learning teaching is not in the pathway yet."
  }
  return program.desc || null
}

export default function ProgrammeListing({ program, truth, cta, honesty, afterEnrol, onEnrol, confirmed = true }: Props) {
  const thumb = programmeThumbInfo(program.slug)
  const canEnrol = confirmed && truth.enrollable && !truth.comingLater
  const firstLinked = truth.linked[0]
  const facts = effectiveProgrammePublicFacts(program)
  const description = listingDescription({ ...program, desc: facts.desc }, truth)

  const pathwaySpec = PATHWAY_CAPSTONES[program.slug] ?? PATHWAY_CAPSTONES["data-science-ai"]
  const linkedCoursesData = (
    truth.linked.length > 0
      ? truth.linked.map((item) => courseBySlug(item.slug)).filter((c): c is NonNullable<typeof c> => Boolean(c))
      : [courseBySlug("data-analytics")].filter((c): c is NonNullable<typeof c> => Boolean(c))
  )
  const firstLessonTitle = linkedCoursesData[0]?.modules[0]?.lessons[0]?.title ?? "Foundations & Workspace Setup"
  const moduleCount = facts.taughtModuleCount > 0 ? facts.taughtModuleCount : 5
  const lessonCount = moduleCount * 3
  const moduleSummaryText =
    facts.taughtModuleCount > 0
      ? `${plural(facts.taughtModuleCount, "module")} (${facts.taughtModuleCount * 3} lessons)`
      : "5 modules (15 lessons)"

  const enrolChip = !confirmed ? (
    <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
  ) : (
    <TruthChip state="live" label="Open" />
  )

  const primaryActionBtn = canEnrol ? (
    <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
      Enroll Now
      <ArrowRight />
    </button>
  ) : firstLinked ? (
    <Link className="sk-btn sk-btn-primary" to={firstLinked.to}>
      Enroll Now — {firstLinked.title}
      <ArrowRight />
    </Link>
  ) : (
    <Link className="sk-btn sk-btn-primary" to="/courses/data-analytics">
      Enroll Now — Data Analytics
      <ArrowRight />
    </Link>
  )

  return (
    <div className="pp-page">
      {/* Unified 2-Column EdTech Hero with Royal Midnight Navy Enrolment Card */}
      <section className="pp-hero" aria-labelledby="pp-title">
        <div className="sky-container">
          <nav className="sky-label pp-crumb cine-in cine-in--fade" aria-label="Breadcrumb">
            <Link to="/programmes">Programmes</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{program.name}</span>
          </nav>

          <div className="pp-hero__split">
            <div className="pp-hero__main">
              <div className="pp-hero__badges cine-in cine-in--fade">
                <span className="pp-badge pp-badge--track">
                  {program.category || "Professional Programme"}
                </span>
                {enrolChip}
                <span className="pp-badge pp-badge--pilot">
                  Guest Lab Free · From ₹1,499
                </span>
              </div>

              <p className="pp-hero__kicker cine-in cine-d1">
                {program.name} · Target Roles: <strong>{pathwaySpec.roles.slice(0, 3).join(" · ")}</strong>
              </p>

              <h1 id="pp-title" className="sky-display sky-display--lg pp-h1 cine-in cine-d1">
                {pathwaySpec.headlinePrefix}
                <span className="sky-signal">{pathwaySpec.headlineSignal}</span>
              </h1>

              {description ? <p className="pp-lede">{description}</p> : null}
              <p className="pp-note" style={{ marginTop: 8 }}>
                {pathwaySpec.summary}
              </p>

              {/* 4-Card Key Programme Stats Grid Above the Fold */}
              <div className="pp-metrics-grid cine-in cine-d2" aria-label="Programme structure at a glance">
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Curriculum</span>
                  <strong className="pp-metric-card__val">
                    {moduleCount} Modules · {lessonCount} Lessons
                  </strong>
                  <span className="pp-metric-card__sub">Self-paced in Skylent OS</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Applied Proof</span>
                  <strong className="pp-metric-card__val">
                    3 Briefs + Graded Capstone
                  </strong>
                  <span className="pp-metric-card__sub">Rubric-graded portfolio</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Browser Sandbox</span>
                  <strong className="pp-metric-card__val">{pathwaySpec.studio.split(" (")[0]}</strong>
                  <span className="pp-metric-card__sub">Zero local setup required</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Credential</span>
                  <strong className="pp-metric-card__val">Verifiable SKL ID</strong>
                  <span className="pp-metric-card__sub">Unlocks Career OS at 60%</span>
                </div>
              </div>

              {/* Tools & Skills Stack Bar */}
              <div className="pp-tools-bar cine-in cine-d3" aria-label="Tools and skills covered">
                <span className="pp-tools-bar__label">Skills &amp; Stack:</span>
                <div className="pp-tools-bar__list">
                  {pathwaySpec.tools.map((tool) => (
                    <span key={tool} className="pp-tool-pill">{tool}</span>
                  ))}
                </div>
              </div>

              <div className="pp-hero__actions-wrap cine-in cine-d3">
                <div className="pp-actions">
                  {primaryActionBtn}
                  <a className="sk-btn sk-btn-secondary" href="#pp-curriculum">
                    View curriculum ({moduleCount} modules)
                  </a>
                  <SyllabusDownloadButton courseSlug={program.slug} title={program.name} />
                </div>
                <p className="pp-note">{honesty}</p>
                <p className="pp-note">{afterEnrol}</p>
              </div>
            </div>

            {/* Right Column: Royal Midnight Navy Enrolment & Workbench Card Above the Fold */}
            <aside className="pp-hero__card cine-in cine-d3" aria-label="Programme enrolment and workbench summary">
              <div className="pp-enrol-card">
                <div className="pp-enrol-card__top">
                  <div className="pp-enrol-card__eyebrow">
                    <span className="pp-live-dot" aria-hidden="true" />
                    <span>LIVE IN-BROWSER LAB · ZERO SETUP</span>
                  </div>
                  <h2 className="pp-enrol-card__title">{pathwaySpec.capstoneTitle}</h2>
                  <p className="pp-enrol-card__sub">{pathwaySpec.figureCaption}</p>
                  <div className="pp-enrol-card__preview">
                    <div className="pp-enrol-card__terminal">
                      <div className="pp-enrol-card__dots" aria-hidden="true">
                        <span /><span /><span />
                        <code>{pathwaySpec.studio}</code>
                      </div>
                      <p className="pp-enrol-card__desc">{pathwaySpec.summary}</p>
                      <a href="#pp-stage" className="pp-enrol-card__jump">
                        Inspect live workbench below ↓
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pp-enrol-card__body">
                  <SpecSheet
                    className="pp-rail"
                    rows={[
                      { label: "Enrolment", value: enrolChip },
                      { label: "Format", value: `${facts.format} · ${moduleSummaryText}` },
                      { label: "You start with", value: `Lesson 1, ${firstLessonTitle.replace(/\s+[—–]\s+/g, ", ")}` },
                    ]}
                  />

                  <ul className="pp-enrol-card__checks">
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>{moduleCount} modules &amp; {lessonCount} lessons</strong> written in clear, plain language</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>In-browser practice lab</strong> ({pathwaySpec.studio})</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>24/7 Hinglish + English Study Support</strong> &amp; 20-Min Human TA Help</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>Verifiable SKL Certificate</strong> &amp; Career OS unlock at 60% completion</span>
                    </li>
                  </ul>

                  <div className="pp-enrol-card__cta">
                    {primaryActionBtn}
                    <a className="sk-btn sk-btn-secondary" href="#pp-curriculum">
                      Open syllabus
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Sticky Sub-Navigation Bar */}
      <div className="pp-subnav-bar">
        <div className="sky-container">
          <nav className="pp-jump" aria-label="On this page">
            <ol>
              <li>
                <a href="#pp-stage">
                  <span className="pp-jump__n">01</span>
                  <span className="pp-jump__verb">Workbench</span>
                  <span className="pp-jump__what">Live browser lab</span>
                </a>
              </li>
              <li>
                <a href="#pp-courses">
                  <span className="pp-jump__n">02</span>
                  <span className="pp-jump__verb">Courses</span>
                  <span className="pp-jump__what">Included self-paced tracks</span>
                </a>
              </li>
              <li>
                <a href="#pp-curriculum">
                  <span className="pp-jump__n">03</span>
                  <span className="pp-jump__verb">Syllabus</span>
                  <span className="pp-jump__what">{moduleCount} modules · {lessonCount} lessons</span>
                </a>
              </li>
              <li>
                <a href="#pp-next-title">
                  <span className="pp-jump__n">04</span>
                  <span className="pp-jump__verb">Start</span>
                  <span className="pp-jump__what">Begin Lesson 1 free</span>
                </a>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Full-Bleed Dark-Violet Workbench Stage */}
      <section id="pp-stage" className="sky-stage sky-band-navy pp-stage" aria-labelledby="pp-build-title">
        <div className="sky-container pp-stage__inner">
          <Reveal as="figure" variant="plate" className="pp-stage__figure">
            <div className="sky-stage__plate pp-stage__plate cine-plate cine-in cine-in--plate cine-d5">
              {pathwaySpec.sandboxType === "northwind-sql" ? (
                <NorthwindLabPlate />
              ) : (
                <div style={{ padding: "18px", background: "#ffffff", borderRadius: 10 }}>
                  <TrackInteractiveSandbox projectType={pathwaySpec.sandboxType} />
                </div>
              )}
            </div>
            <figcaption className="sky-stage__caption cine-in cine-in--fade cine-d6">
              <span>{pathwaySpec.figureCaption}</span>
            </figcaption>
          </Reveal>

          <Reveal className="pp-build">
            <div className="pp-build__lead">
              <SectionIndex n="01" label="What you will build" />
              <h2 id="pp-build-title" className="pp-build__title">
                {pathwaySpec.capstoneTitle}
              </h2>
              <p className="pp-practice">
                Practice Environment: <strong>{pathwaySpec.studio || practiceNoteForProgramme(program.slug)}</strong>
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginTop: 20 }}>
              {pathwaySpec.steps.map((step) => (
                <div key={step.num} style={{ padding: "18px", borderRadius: 14, background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "4px solid #5142B5", boxShadow: "0 10px 24px -14px rgba(81, 66, 181, 0.25)" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#5142B5", fontFamily: "var(--font-mono)" }}>
                    STEP {step.num}
                  </span>
                  <strong style={{ display: "block", margin: "6px 0", fontSize: 15.5, fontWeight: 800, color: "#0F172A" }}>
                    {step.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.5 }}>{step.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 02: Included Self-Paced Coursework Cards */}
      <section id="pp-courses" className="sky-container" style={{ paddingBlock: "36px 24px" }} aria-label="Included self-paced courses">
        <div style={{ padding: "24px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <SectionIndex n="02" label="Included Flagship Coursework" />
          <h2 style={{ margin: "8px 0 6px", fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 750, color: "#0f172a" }}>
            Start the linked self-paced course immediately
          </h2>
          <p style={{ margin: "0 0 18px", fontSize: 15, color: "#475569", maxWidth: "54em" }}>
            {pathwaySpec.summary}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {(truth.linked.length > 0
              ? truth.linked.filter((item) => item.authored)
              : [{ slug: "data-analytics", title: "Data Analytics (SQL & Commercial Review)", to: "/courses/data-analytics", authored: true, maturityLabel: "Ready to start" }]
            ).map((item) => (
              <Link
                key={item.slug}
                to={item.to}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "20px 22px",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: "1.5px solid #DDD7FF",
                  borderTop: "4px solid #5142B5",
                  color: "#0F172A",
                  textDecoration: "none",
                  boxShadow: "0 10px 26px -14px rgba(81, 66, 181, 0.14)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#15803D", background: "#DCFCE7", border: "1px solid #86EFAC", padding: "3px 10px", borderRadius: 999 }}>
                    ✓ Open now · 5 Modules · 15 Lessons
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#5142B5", fontFamily: "var(--font-mono)" }}>From ₹1,499</span>
                </div>
                <strong style={{ fontSize: 19, fontWeight: 800, color: "#0F172A" }}>{item.title}</strong>
                <span style={{ fontSize: 13.5, color: "#475569" }}>
                  3 module quizzes · 3 applied briefs · 1 graded capstone · Verifiable Certificate
                </span>
                <span style={{ marginTop: "auto", paddingTop: 8, fontSize: 14, fontWeight: 800, color: "#5142B5", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Start {item.title} <ArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 03: Full Module-by-Module Curriculum Breakdown */}
      <section id="pp-curriculum" className="sky-container" style={{ paddingBlock: "16px 44px" }} aria-label="Full curriculum breakdown">
        <SectionIndex n="03" label="Curriculum Architecture" />
        <h2 style={{ margin: "8px 0 6px", fontSize: "clamp(22px, 2.6vw, 30px)", fontWeight: 750, color: "#0f172a" }}>
          Complete module &amp; lesson breakdown
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 15, color: "#475569" }}>
          Every module pairs concise first-principles readings with concept checks, applied briefs, and in-browser lab execution.
        </p>
        <div style={{ display: "grid", gap: 24 }}>
          {linkedCoursesData.map((course) => (
            <div key={course.slug} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: "22px 24px", background: "#ffffff" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5142b5" }}>
                    {course.category} · {course.duration}
                  </span>
                  <h3 style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{course.title}</h3>
                </div>
                <Link to={`/courses/${course.slug}`} className="sk-btn sk-btn-secondary" style={{ fontSize: 13 }}>
                  Open full course workspace <ArrowRight />
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {course.modules.map((mod, idx) => (
                  <div key={mod.id} style={{ padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Module 0{idx + 1} · {mod.lessons.length} Lessons
                    </span>
                    <strong style={{ display: "block", margin: "4px 0 8px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                      {mod.title}
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "#475569", lineHeight: 1.55 }}>
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} style={{ marginBottom: 4 }}>
                          {lesson.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div id="pp-review-standard" />
      <div id="pp-evidence" />
      <div id="pp-career" />
      <ProgrammePricingAndDock
        programSlug={program.slug}
        courseSlug={firstLinked?.slug ?? "data-analytics"}
        programName={program.name}
        studioName={pathwaySpec.studio}
        capstoneTitle={pathwaySpec.capstoneTitle}
        canEnrol={canEnrol}
        onEnrol={onEnrol}
      />

      <section className="sky-stage sky-band-navy pp-next pp-next--listing" aria-labelledby="pp-next-title">
        <div className={`sky-container pp-listing-stage${thumb.hasArtefact ? "" : " pp-listing-stage--plain"}`}>
          {thumb.hasArtefact ? (
            <Reveal as="figure" variant="plate" className="pp-listing-stage__figure">
              <div className="sky-stage__plate pp-listing-stage__plate">
                <ProgrammeThumb program={program} />
              </div>
              <figcaption className="sky-stage__caption">
                <span>{thumb.caption}</span>
              </figcaption>
            </Reveal>
          ) : null}
          <Reveal className="pp-listing-stage__copy">
            <p className="sky-label">Next step</p>
            <h2 id="pp-next-title" className="sky-display sky-display--md pp-next__title">
              {!confirmed
                ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked.`
                : truth.linked.some((l) => l.authored)
                  ? "Start with the linked self-paced course today."
                  : "Start SQL practice inside Data Analytics today."}
            </h2>
            <div className="pp-actions">
              {canEnrol ? (
                <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
                  {cta}
                  <ArrowRight />
                </button>
              ) : firstLinked ? (
                <Link className="sk-btn sk-btn-primary" to={firstLinked.to}>
                  Start {firstLinked.title}
                  <ArrowRight />
                </Link>
              ) : (
                <Link className="sk-btn sk-btn-primary" to="/courses/data-analytics">
                  Start Data Analytics
                  <ArrowRight />
                </Link>
              )}
              <Link className="sk-btn sk-btn-secondary" to="/programmes">
                See all programmes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
