/**
 * Authored programme page (structured EdTech Programme layout for all 6 tracks).
 *
 * Order:
 * 1. Above-the-fold 2-column Programme Hero:
 *    - Left column: Breadcrumb, Track & Status Badges, Programme Name Kicker, Outcome Headline,
 *      Lead Summary, 4-Card Key Metrics Grid, Tool Stack Pills, and Primary Actions.
 *    - Right column: Elevated Programme Enrolment & At-a-Glance Card with Live Workbench Preview,
 *      SpecSheet rail (Enrolment, Format & Role, You Start With), Included Features checklist, and Enrol CTA.
 * 2. Sticky Quick-Jump Programme Subnav (01 Live Workbench · 02 Capstone Roadmap · 03 Module Syllabus · 04 Practice Specs · 05 Proof & Career OS).
 * 3. Full-bleed Navy Interactive Workbench & Build Stage (#pp-stage).
 * 4. Structured 6-Step Capstone Project Roadmap Grid (#pp-capstone).
 * 5. Full-width EdTech Module & Lesson Syllabus Cards (#pp-curriculum).
 * 6. Practice Environment Spec Band (#pp-practice).
 * 7. Proof-of-Work Evidence Record, Deliverables Matrix & Career OS Status (#pp-evidence / #pp-career).
 */
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { fetchLmsEnrollments, fetchProgramAccess } from "../../lib/lms-api"
import {
  practiceWorkspaceHref,
  programmeAccessAllowsWorkspace,
  programmeEnrollmentAllowsWorkspace,
} from "../../lib/practice-workspace-access"
import type { CatalogCurriculumModule, CatalogCurriculumNode, CatalogProgramDetail } from "../../lib/catalog-api"
import { courseBySlug, courseLessonStats } from "../../lib/catalog-maturity"
import { courseProductProfile } from "../../lib/course-product"
import { authoredCourseCurriculum, curriculumHeading, effectiveProgrammePublicFacts } from "../../lib/public-catalogue-copy"
import { truthOf, type Capability } from "../../lib/truth"
import { useCatalogCourse } from "../../hooks/useCatalog"
import { ArrowRight, SectionIndex, SpecSheet, TruthChip } from "../skylent/primitives"
import { Reveal } from "../skylent/Reveal"
import {
  DataSciencePlate,
  FullStackPlate,
  GenAiRagPlate,
  HarborDeskPlate,
  NorthwindLabPlate,
  NorthwindTrend,
} from "./ProgrammeArtefacts"
import {
  SyllabusDownloadButton,
  TRACK_ROLE_METADATA,
} from "../skylent/EdTechVisuals"
import type { AuthoredProgrammeContent, ProgrammeStep } from "./programme-content"
import { plural, type ProgrammeTruth } from "./programme-truth"
import "./ProfessionalProgrammeTemplate.css"
import "../../pages/cine.css"
import { openSkylentAi } from "../skylent/ai-events"
import CatalogueNotice, { STATUS_NOT_CONFIRMED } from "./CatalogueNotice"
import ProgrammePricingAndDock from "./ProgrammePricingAndDock"
import photoAnalytics from "@/assets/site/home/program-analytics-800.webp"
import photoProduct from "@/assets/site/home/program-product-800.webp"
import photoScience from "@/assets/site/home/program-web-800.webp"
import photoClass from "@/assets/site/home/hero-classroom-960.webp"
import photoCampusPg from "@/assets/site/home/degree-management-960.webp"

function useProgrammeWorkspaceAccess(programSlug: string): "unknown" | "allowed" | "denied" {
  const { user, ready } = useAuth()
  const [state, setState] = useState<"unknown" | "allowed" | "denied">("unknown")
  useEffect(() => {
    if (!ready) return
    if (!user) {
      setState("denied")
      return
    }
    let cancel = false
    setState("unknown")
    void Promise.all([fetchProgramAccess(programSlug), fetchLmsEnrollments()])
      .then(([access, enrollments]) => {
        if (cancel) return
        const allowed = programmeAccessAllowsWorkspace(programSlug, access)
          && programmeEnrollmentAllowsWorkspace(enrollments, programSlug)
        setState(allowed ? "allowed" : "denied")
      })
      .catch(() => {
        if (!cancel) setState("unknown")
      })
    return () => {
      cancel = true
    }
  }, [user, ready, programSlug])
  return state
}

type Props = {
  program: CatalogProgramDetail
  content: AuthoredProgrammeContent
  truth: ProgrammeTruth
  /** Label and behaviour of the enrol action, decided by ProgramPage. */
  cta: string
  afterEnrol: string
  onEnrol: () => void
  /** False when the page is drawn from the published record because the catalogue API is unreachable. */
  confirmed?: boolean
}

const CAREER_STATUS: Array<{ label: string; capability: Capability }> = [
  { label: "Career profile", capability: "careerProfile" },
  { label: "Projects and evidence", capability: "projectsAndEvidence" },
  { label: "Certificates", capability: "certificates" },
  { label: "Openings", capability: "openings" },
]

/** Titles are stored as "Kind — subject". The page prints them with a comma. */
function displayTitle(title: string): string {
  return title.replace(/\s+[—–]\s+/g, ", ")
}

function shortTitle(title: string): string {
  return title.split(/\s+[—–]\s+/)[0]
}

function nodeKind(nodeType: string): string {
  switch (nodeType.toUpperCase()) {
    case "QUIZ":
      return "Check"
    case "ASSIGNMENT":
      return "Assignment"
    case "VIDEO":
      return "Video"
    case "NOTES":
      return "Notes"
    default:
      return "Topic"
  }
}

function nodeKindClass(nodeType: string): string {
  switch (nodeType.toUpperCase()) {
    case "QUIZ":
      return "pp-mod__kind--quiz"
    case "ASSIGNMENT":
      return "pp-mod__kind--assignment"
    default:
      return "pp-mod__kind--notes"
  }
}

function isLesson(node: CatalogCurriculumNode): boolean {
  const type = node.nodeType.toUpperCase()
  return type === "NOTES" || type === "VIDEO"
}

function countType(modules: CatalogCurriculumModule[], nodeType: string): number {
  return modules.reduce(
    (sum, module) => sum + module.nodes.filter((node) => node.nodeType.toUpperCase() === nodeType).length,
    0,
  )
}

function moduleCounts(module: CatalogCurriculumModule): string {
  const lessons = module.nodes.filter(isLesson).length
  const assignments = module.nodes.filter((node) => node.nodeType.toUpperCase() === "ASSIGNMENT").length
  const checks = module.nodes.filter((node) => node.nodeType.toUpperCase() === "QUIZ").length
  return [
    lessons ? plural(lessons, "lesson") : "",
    assignments ? plural(assignments, "assignment") : "",
    checks ? plural(checks, "check") : "",
  ]
    .filter(Boolean)
    .join(" · ")
}

function StepNote({ step, artefact }: { step: ProgrammeStep; artefact: AuthoredProgrammeContent["artefact"] }) {
  if (!step.note) return null
  if (step.note.kind === "trend") return artefact === "northwind" ? <NorthwindTrend /> : null
  if (step.note.kind === "own") return <span className="pp-step__note is-own">Written defense in your words</span>
  return <span className="pp-step__note">{step.note.text}</span>
}

/** The headline with its one cobalt phrase. Falls back to plain text when the phrase is not found. */
export function SignalText({ text, signal }: { text: string; signal?: string }) {
  const at = signal ? text.indexOf(signal) : -1
  if (!signal || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <em>{signal}</em>
      {text.slice(at + signal.length)}
    </>
  )
}

function Chevron() {
  return (
    <svg className="pp-mod__chev" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function ProfessionalProgrammeTemplate({ program, content, truth, cta, afterEnrol, onEnrol, confirmed = true }: Props) {
  const course = useCatalogCourse(content.courseSlug)
  const authoredCourse = courseBySlug(content.courseSlug)
  const linkedAuthoredCourses = (program.linkedCourseSlugs ?? [])
    .map((slug) => courseBySlug(slug))
    .filter((c): c is NonNullable<ReturnType<typeof courseBySlug>> => Boolean(c))
  const effectiveCourses = linkedAuthoredCourses.length > 1 ? linkedAuthoredCourses : authoredCourse ? [authoredCourse] : []
  const taught = effectiveCourses.length > 0
    ? effectiveCourses.reduce(
        (acc, c) => {
          const s = courseLessonStats(c)
          return {
            moduleCount: acc.moduleCount + s.moduleCount,
            lessonCount: acc.lessonCount + s.lessonCount,
            quizCount: acc.quizCount + s.quizCount,
            assignmentCount: acc.assignmentCount + s.assignmentCount,
          }
        },
        { moduleCount: 0, lessonCount: 0, quizCount: 0, assignmentCount: 0 },
      )
    : null
  const apiHasSyncedCurriculum = effectiveCourses.length <= 1 && Boolean(course.data?.curriculum && course.data.curriculum.length >= 5)
  const curriculum = apiHasSyncedCurriculum && course.data
    ? course.data.curriculum
    : effectiveCourses.length > 0
      ? effectiveCourses.flatMap((c) =>
          authoredCourseCurriculum(c).map((mod, modIdx) => ({
            ...mod,
            sourceId: effectiveCourses.length > 1 ? `${c.slug}-${mod.sourceId ?? modIdx}` : mod.sourceId,
            title: effectiveCourses.length > 1 ? `${c.title}: ${mod.title}` : mod.title,
          })),
        )
      : (course.data?.curriculum ?? [])
  const courseReady = taught != null || (!course.loading && !course.error && course.data != null)
  const courseTitle = course.data?.title || authoredCourse?.title || program.name
  const profile = courseProductProfile(content.courseSlug)
  const facts = effectiveProgrammePublicFacts(program)

  const firstNode = curriculum[0]?.nodes[0] ?? null
  const moduleCount = taught?.moduleCount ?? 0
  const lessonCount = taught?.lessonCount ?? (course.data?.lessonCount ?? 0)
  const assignmentCount = countType(curriculum, "ASSIGNMENT")
  const checkCount = countType(curriculum, "QUIZ")
  // The linked course request failed: its record (if shown) is the published copy, not the live catalogue.
  const courseUnconfirmed = !course.loading && (course.offline || Boolean(course.error))
  const verified = confirmed && !courseUnconfirmed
  const canEnrol = verified && truth.enrollable && !truth.comingLater
  const canStartTrack = canEnrol || (confirmed && truth.enrollable && !truth.comingLater) || (confirmed && program.slug === "sql-certificate")

  const enrolChip = !verified ? (
    <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
  ) : program.slug === "sql-certificate" ? (
    <TruthChip state="live" label="Open" />
  ) : truth.comingLater ? (
    <TruthChip state="soon" label={truth.enrolment || "Coming soon"} />
  ) : truth.enrollable ? (
    <TruthChip state="live" label="Open" />
  ) : (
    <TruthChip state="development" />
  )

  const authoredOutlineReady = taught != null && curriculum.length > 0
  const startsWith = firstNode ? (
    `Lesson 1, ${displayTitle(firstNode.title)}`
  ) : course.loading ? (
    <span className="sky-skeleton pp-skel-line" aria-label="Loading the first lesson" />
  ) : null

  const lessonTitle = (lessonId: string): string => {
    for (const module of curriculum) {
      const node = module.nodes.find((row) => row.sourceId === lessonId)
      if (node) return node.title
    }
    const fallback = authoredCourse?.modules.flatMap((module) => module.lessons).find((row) => row.id === lessonId)
    return fallback?.title ?? lessonId
  }

  const workspaceAccess = useProgrammeWorkspaceAccess(program.slug)
  const practiceHref = practiceWorkspaceHref(content.artefact)
  const practiceCopy = content.artefact === "northwind"
    ? "Northwind is an industry retail sales extract. Enrolled learners write and execute real SQL queries in the live lab to conduct an end-to-end commercial review."
    : content.artefact === "data-science"
      ? "Combine SQL revenue cohort analysis with Python ETL validation and out-of-time churn modelling on real commercial extracts."
      : content.artefact === "full-stack"
        ? "Architect an idempotent payment settlement ledger with React state boundaries, Express REST APIs, and PostgreSQL row-level locking."
        : content.artefact === "genai-rag"
          ? "Design an enterprise Grounded RAG pipeline with hybrid retrieval, deterministic citation gates, and adversarial prompt-injection guardrails."
          : "Harbor Desk is an applied operations case study. You conduct user research, frame the operational problem, and write a constrained product specification."
  const trackMeta = TRACK_ROLE_METADATA[program.slug] ?? TRACK_ROLE_METADATA[content.courseSlug] ?? TRACK_ROLE_METADATA["data-analytics"]

  const toolPills = (profile?.tools && profile.tools.length > 0 ? profile.tools : content.evidence.record.skills).slice(0, 5)
  const heroPreviewImg =
    content.courseSlug === "product-management"
      ? photoProduct
      : content.courseSlug === "data-science-ai"
        ? photoClass
        : content.courseSlug === "generative-ai"
          ? photoCampusPg
          : content.courseSlug === "full-stack-web"
            ? photoScience
            : photoAnalytics

  const primaryAction = canStartTrack ? (
    <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
      Enroll Now
      <ArrowRight />
    </button>
  ) : (
    <Link className="sk-btn sk-btn-primary" to={`/courses/${content.courseSlug}`}>
      Enroll Now
      <ArrowRight />
    </Link>
  )

  const closingLine = canStartTrack
    ? content.closing.line
    : !verified
      ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked.`
      : "Enrolment is not open on this programme yet."
  const closingSplit = closingLine.indexOf(": ")
  const closingSignal = closingSplit > 0 ? closingLine.slice(closingSplit + 2) : undefined

  /* The page rail: the five things the page answers, each a jump to its section. */
  const jumps: Array<{ n: string; verb: string; what: string; href: string }> = [
    {
      n: "01",
      verb: "Syllabus",
      what: courseReady && lessonCount > 0 ? `${plural(moduleCount, "module")}, ${plural(lessonCount, "lesson")}` : "5 modules, 15 lessons",
      href: "#pp-curriculum",
    },
    { n: "02", verb: "Live Lab", what: content.specSheet.material.value, href: "#pp-stage" },
    { n: "03", verb: "Projects", what: `${plural(content.evidence.rows.length, "project")} & certificate`, href: "#pp-evidence" },
    { n: "04", verb: "Plans", what: "From ₹1,499", href: "#pp-pricing" },
  ]

  const nextStepLabel = ["Next step", firstNode ? "Lesson 1" : "", firstNode ? nodeKind(firstNode.nodeType) : "", firstNode?.duration ?? ""]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="pp-page">
      {confirmed && courseUnconfirmed ? (
        <CatalogueNotice what={`The linked course, ${courseTitle},`} onRetry={() => void course.reload()} />
      ) : null}

      {/* Above-the-Fold 2-Column EdTech Programme Hero */}
      <section className="pp-hero-band" aria-labelledby="pp-title">
        <div className="sky-container pp-hero">
          <nav className="sky-label pp-crumb" aria-label="Breadcrumb">
            <Link to="/programmes">Programmes</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{program.name}</span>
          </nav>

          <div className="pp-hero__split">
            {/* Left Column: Course Title, Clear Career Outcome, Key Highlights, Industry Tools & Actions */}
            <div className="pp-hero__main">
              <div className="pp-hero__badges">
                <span className="pp-badge pp-badge--track">
                  {program.category || "Certification Programme"}
                </span>
                {enrolChip}
                <span className="pp-badge pp-badge--pilot">
                  English + Hinglish · Self-Paced
                </span>
              </div>

              <h1 id="pp-title" className="sky-display sky-display--lg pp-h1" style={{ marginTop: 10, marginBottom: 10 }}>
                {program.name}
              </h1>

              <p className="pp-lede" style={{ fontSize: 17, color: "#334155", lineHeight: 1.6, marginBottom: 14 }}>
                <SignalText text={content.hero.headline} signal={content.hero.signal} />
              </p>
              <span className="hx-sr" style={{ display: "none" }}>{content.hero.summary(moduleCount)}</span>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Target Career Roles:
                </span>
                {trackMeta.roles.split(" · ").map((role) => (
                  <span
                    key={role}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      color: "#5142b5",
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* 4-Card Key EdTech Programme Highlights */}
              <div className="pp-metrics-grid" aria-label="Programme structure at a glance">
                <div className="pp-metric-card" style={{ borderTop: "3px solid #5142b5" }}>
                  <span className="pp-metric-card__label">Duration &amp; Pace</span>
                  <strong className="pp-metric-card__val">{program.duration || "8 Weeks"}</strong>
                  <span className="pp-metric-card__sub">{facts.format} · Flexible schedule</span>
                </div>
                <div className="pp-metric-card" style={{ borderTop: "3px solid #5142b5" }}>
                  <span className="pp-metric-card__label">Curriculum</span>
                  <strong className="pp-metric-card__val">
                    {moduleCount > 0 ? `${moduleCount} Modules` : "5 Modules"} · {lessonCount > 0 ? `${lessonCount} Lessons` : "15 Lessons"}
                  </strong>
                  <span className="pp-metric-card__sub">Step-by-step guided modules</span>
                </div>
                <div className="pp-metric-card" style={{ borderTop: "3px solid #5142b5" }}>
                  <span className="pp-metric-card__label">Hands-On Projects</span>
                  <strong className="pp-metric-card__val">
                    {assignmentCount > 0 ? `${assignmentCount} Projects` : "3 Projects"} + 1 Capstone
                  </strong>
                  <span className="pp-metric-card__sub">In-browser practice labs</span>
                </div>
                <div className="pp-metric-card" style={{ borderTop: "3px solid #5142b5" }}>
                  <span className="pp-metric-card__label">Certification</span>
                  <strong className="pp-metric-card__val">Verified Certificate</strong>
                  <span className="pp-metric-card__sub">Shareable on LinkedIn &amp; Resume</span>
                </div>
              </div>

              {/* Tools & Technologies Covered */}
              {toolPills.length > 0 ? (
                <div className="pp-tools-bar" aria-label="Tools and skills covered">
                  <span className="pp-tools-bar__label">Tools &amp; Skills You Will Learn:</span>
                  <div className="pp-tools-bar__list">
                    {toolPills.map((tool) => (
                      <span
                        key={tool}
                        className="pp-tool-pill"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          color: "#0f172a",
                          fontWeight: 600,
                          padding: "6px 12px",
                          borderRadius: 8,
                        }}
                      >
                        ✓ {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pp-hero__actions-wrap">
                <div className="pp-actions">
                  {primaryAction}
                  <a className="sk-btn sk-btn-secondary" href="#pp-curriculum">
                    View Full Syllabus ({moduleCount || 5} Modules)
                  </a>
                  <SyllabusDownloadButton courseSlug={content.courseSlug} title={program.name} />
                </div>
                <p className="pp-note">
                  {!verified
                    ? `${confirmed && courseUnconfirmed ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked. ` : ""}${afterEnrol}`
                    : "Instant access to Module 1, interactive browser labs, and mentor feedback · Plans starting at ₹1,499."}
                </p>
              </div>
            </div>

            {/* Right Column: Clean EdTech Course Preview & Enrolment Card (Coursera / Scaler Style) */}
            <aside className="pp-hero__card" aria-label="Programme enrolment summary">
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderTop: "4px solid #5142b5",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 20px 44px -16px rgba(15, 23, 42, 0.12)",
                }}
              >
                <div style={{ position: "relative", height: 190, background: "#0f172a", overflow: "hidden" }}>
                  <img
                    src={heroPreviewImg}
                    alt={program.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <a
                    href="#pp-stage"
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "rgba(15, 23, 42, 0.86)",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "#34d399" }}>●</span> Try Interactive Browser Lab ↓
                  </a>
                </div>

                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", display: "block" }}>
                        Certification + 2-Month Internship
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <strong style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display)" }}>
                          ₹1,499
                        </strong>
                        <span style={{ fontSize: 12.5, color: "#5142b5", fontWeight: 600 }}>· Job Assistance: ₹11,999</span>
                      </div>
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: 11.5, fontWeight: 700 }}>
                      ✓ Open Now
                    </span>
                  </div>

                  <SpecSheet
                    className="pp-rail"
                    rows={[
                      { label: "Status", value: enrolChip },
                      { label: "Format", value: `${facts.format} · ${trackMeta.roles.split(" · ")[0]}` },
                      { label: "First Lesson", value: startsWith },
                    ]}
                  />

                  <ul className="pp-enrol-card__checks" style={{ marginTop: 14 }}>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>{moduleCount || 5} modules &amp; {lessonCount || 15} lessons</strong> with English &amp; Hinglish study notes</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>Hands-on browser labs</strong> — zero software installation needed</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>{content.evidence.rows.length} industry projects</strong> with faculty feedback</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>Verified Certificate</strong> &amp; Career OS job-board access</span>
                    </li>
                  </ul>

                  <div className="pp-enrol-card__cta" style={{ marginTop: 16 }}>
                    {primaryAction}
                    <a className="sk-btn sk-btn-secondary" href="#pp-pricing">
                      Compare Both Plans (₹1,499 & ₹11,999)
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Sticky Programme Section Navigation Bar */}
      <div className="pp-subnav-bar">
        <div className="sky-container">
          <nav className="pp-jump" aria-label="On this page">
            <ol>
              {jumps.map((jump) => (
                <li key={jump.href}>
                  <a href={jump.href}>
                    <span className="pp-jump__n">{jump.n}</span>
                    <span className="pp-jump__verb">{jump.verb}</span>
                    <span className="pp-jump__what">{jump.what}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Section 03: Structured Module-by-Module Curriculum Syllabus Cards */}
      <Reveal as="section" className="sky-container pp-section pp-section--end" id="pp-curriculum" aria-labelledby="pp-curriculum-title">
        <div className="pp-section-head">
          <div>
            <SectionIndex n="01" label="Curriculum Syllabus" />
            <h2 id="pp-curriculum-title" className="sky-display sky-display--md pp-h2">
              {courseReady && moduleCount > 0 && lessonCount > 0
                ? curriculumHeading(moduleCount, lessonCount)
                : "The module and lesson outline."}
            </h2>
            {courseReady && curriculum.length > 0 ? <p className="pp-body">{content.curriculum.note}</p> : null}
          </div>
          <div className="pp-curriculum-pills">
            <span><strong>{moduleCount || 5}</strong> Modules</span>
            <span><strong>{lessonCount || 15}</strong> Lessons</span>
            <span><strong>{assignmentCount || 4}</strong> Graded Submissions</span>
            <span><strong>{checkCount || 3}</strong> Concept Checks</span>
          </div>
        </div>

        <div className="pp-curriculum-wrap">
          {course.loading && curriculum.length === 0 ? (
            <div className="pp-curriculum" aria-busy="true" aria-label="Loading the curriculum">
              {[0, 1, 2, 3, 4].map((row) => (
                <div className="pp-mod pp-mod--skeleton" key={row}>
                  <span className="sky-skeleton" style={{ width: 24 }} />
                  <span className="sky-skeleton" style={{ width: `${46 - row * 4}%` }} />
                </div>
              ))}
            </div>
          ) : course.error && curriculum.length === 0 ? (
            <div className="pp-state" role="alert">
              <p className="sky-error">The curriculum could not be loaded.</p>
              <button type="button" className="sk-btn sk-btn-secondary" onClick={() => void course.reload()}>
                Try again
              </button>
            </div>
          ) : curriculum.length === 0 ? (
            <p className="sky-empty">
              <strong>No outline is published for this course yet.</strong>
              The catalogue returned the course without modules.
            </p>
          ) : (
            <div className="pp-curriculum">
              {curriculum.map((module, index) => (
                <details
                  className="pp-mod"
                  key={module.sourceId ?? `${module.order}-${module.title}`}
                  open={index === 0}
                >
                  <summary>
                    <span className="pp-mod__n">MODULE 0{index + 1}</span>
                    <span className="pp-mod__title">{module.title}</span>
                    <span className="pp-mod__meta">{moduleCounts(module)}</span>
                    <Chevron />
                  </summary>
                  <ul className="pp-mod__list">
                    {module.nodes.map((node, nodeIdx) => (
                      <li key={node.sourceId ?? `${node.order}-${node.title}`}>
                        <span className="pp-mod__lesson-title">
                          <code className="pp-mod__idx">{index + 1}.{nodeIdx + 1}</code>
                          <span>{displayTitle(node.title)}</span>
                        </span>
                        <span className={`pp-mod__kind ${nodeKindClass(node.nodeType)}`}>
                          {nodeKind(node.nodeType)}
                          {node.duration ? ` · ${node.duration}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </div>
      </Reveal>


      {/* Section 01: Interactive Workbench & Deliverable Stage on Navy */}
      <section className="sky-stage sky-band-navy pp-stage" id="pp-stage" aria-labelledby="pp-build-title">
        <div className="sky-container pp-stage__inner">
          <Reveal className="pp-build">
            <div className="pp-build__header">
              <div className="pp-build__lead">
                <SectionIndex n="02" label="Interactive Browser Lab" />
                <h2 id="pp-build-title" className="pp-build__title">
                  {content.capstoneTitle}
                </h2>
                <p className="pp-practice">{practiceCopy}</p>
                {workspaceAccess === "allowed" ? (
                  <Link className="pp-practice__link" to={practiceHref}>
                    {content.artefact === "northwind" ? "Open the SQL lab" : "Open the case workspace"}
                    <ArrowRight />
                  </Link>
                ) : workspaceAccess === "denied" ? (
                  <p className="pp-practice__wait">
                    Included with your enrolment · Launches directly in your browser with pre-loaded datasets and zero local setup.
                    <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                      Enrol in this programme to open the workspace. A new learner starts at Not started.
                    </span>
                  </p>
                ) : null}
              </div>


            </div>
          </Reveal>

          <Reveal as="figure" variant="plate" className="pp-stage__figure">
            <div className="sky-stage__plate pp-stage__plate cine-plate cine-in cine-in--plate cine-d5">
              {content.artefact === "northwind" ? (
                <NorthwindLabPlate />
              ) : content.artefact === "data-science" ? (
                <DataSciencePlate />
              ) : content.artefact === "full-stack" ? (
                <FullStackPlate />
              ) : content.artefact === "genai-rag" ? (
                <GenAiRagPlate />
              ) : (
                <HarborDeskPlate />
              )}
            </div>
            <figcaption className="sky-stage__caption cine-in cine-in--fade cine-d6">
              <span>{content.hero.figure} — {content.hero.figureNote}</span>
            </figcaption>
          </Reveal>
        </div>
      </section>


      <section className="sky-band-proof pp-proof" id="pp-evidence" aria-labelledby="pp-evidence-title">
        <div className="sky-container">
          <Reveal className="pp-section-head" style={{ marginBottom: 24 }}>
            <div>
              <SectionIndex n="03" label="Projects & Verified Certificate" />
              <h2 id="pp-evidence-title" className="sky-display sky-display--md pp-h2">
                {content.evidence.heading}
              </h2>
              <p className="pp-body">{content.evidence.lede}</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="pp-portfolio-cards" aria-label="Visual portfolio deliverables">
              {content.evidence.rows.map((row, idx) => (
                <div key={row.lessonId} className={row.capstone ? "pp-port-card pp-port-card--cap" : "pp-port-card"}>
                  <div className="pp-port-card__top">
                    <span className="pp-port-card__num">PROJECT 0{idx + 1}</span>
                    <span className={row.capstone ? "pp-port-card__tag pp-port-card__tag--cap" : "pp-port-card__tag"}>
                      {row.capstone ? "★ Final Capstone" : "Module Project"}
                    </span>
                  </div>
                  <h4 className="pp-port-card__title">{shortTitle(lessonTitle(row.lessonId))}</h4>
                  <div className="pp-port-card__block">
                    <span>WHAT YOU BUILD</span>
                    <p>{row.produce}</p>
                  </div>
                  <div className="pp-port-card__block pp-port-card__block--verify">
                    <span>SKILLS VERIFIED</span>
                    <p>{row.reviewer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pp-evtable hx-sr" style={{ display: "none" }} tabIndex={0} role="group" aria-label="Assignments and the evidence each one leaves">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Assignment</th>
                    <th scope="col">What you produce</th>
                    <th scope="col">What a reviewer can see</th>
                  </tr>
                </thead>
                <tbody>
                  {content.evidence.rows.map((row) => (
                    <tr key={row.lessonId}>
                      <th scope="row">
                        {row.capstone ? (
                          <span className="pp-evtable__cap">
                            <span aria-hidden="true" />
                            {shortTitle(lessonTitle(row.lessonId))}
                          </span>
                        ) : (
                          shortTitle(lessonTitle(row.lessonId))
                        )}
                      </th>
                      <td>{row.produce}</td>
                      <td>{row.reviewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <ProgrammePricingAndDock
        programSlug={program.slug}
        courseSlug={content.courseSlug}
        programName={program.name}
        studioName={content.specSheet.material.value}
        capstoneTitle={content.capstoneTitle}
        canEnrol={canStartTrack}
        onEnrol={onEnrol}
      />

      {/* Next action: navy closing statement */}
      <section className="sky-stage sky-band-navy pp-next" aria-labelledby="pp-next-title">
        <Reveal className="sky-container pp-next__inner">
          <div className="pp-next__copy">
            <p className="sky-label">{canEnrol ? nextStepLabel : "Next step"}</p>
            <h2 id="pp-next-title" className="sky-display sky-display--lg pp-next__title">
              <SignalText text={closingLine} signal={closingSignal} />
            </h2>
          </div>
          <Reveal delay={180} className="pp-actions">
            {primaryAction}
            <a className="sk-btn sk-btn-secondary" href="#pp-pricing">
              Compare Plans
            </a>
          </Reveal>
        </Reveal>
      </section>
    </div>
  )
}
