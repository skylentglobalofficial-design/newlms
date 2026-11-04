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
  const curriculum = effectiveCourses.length > 0
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
  const canStartTrack = canEnrol || (verified && program.slug === "sql-certificate")

  const enrolChip = !verified ? (
    <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
  ) : program.slug === "sql-certificate" ? (
    <TruthChip state="live" label="Open via SQL Lab" />
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

  const toolPills = Array.from(
    new Set([
      ...(profile?.tools ?? []),
      ...content.evidence.record.skills.slice(0, 4),
    ]),
  ).slice(0, 6)

  const primaryAction = canStartTrack ? (
    <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
      {cta}
      <ArrowRight />
    </button>
  ) : null

  const closingLine = canStartTrack
    ? content.closing.line
    : !verified
      ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked.`
      : "Enrolment is not open on this programme yet."
  const closingSplit = closingLine.indexOf(": ")
  const closingSignal = closingSplit > 0 ? closingLine.slice(closingSplit + 2) : undefined

  /* The page rail: the five things the page answers, each a jump to its section. */
  const jumps: Array<{ n: string; verb: string; what: string; href: string }> = [
    { n: "01", verb: "Workbench", what: content.specSheet.material.value, href: "#pp-stage" },
    { n: "02", verb: "Build", what: content.capstoneTitle, href: "#pp-capstone" },
    {
      n: "03",
      verb: "Learn",
      what: courseReady && lessonCount > 0 ? `${plural(moduleCount, "module")}, ${plural(lessonCount, "lesson")}` : "Modules and lessons",
      href: "#pp-curriculum",
    },
    { n: "04", verb: "Practise", what: "In-browser studio", href: "#pp-practice" },
    { n: "05", verb: "Prove", what: `${plural(content.evidence.rows.length, "piece")} of reviewable work`, href: "#pp-evidence" },
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
          <nav className="sky-label pp-crumb cine-in cine-in--fade" aria-label="Breadcrumb">
            <Link to="/programmes">Programmes</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{program.name}</span>
          </nav>

          <div className="pp-hero__split">
            {/* Left Column: Programme Identity, Headline, Metrics Grid, Stack Pills & Primary CTAs */}
            <div className="pp-hero__main">
              <div className="pp-hero__badges cine-in cine-in--fade">
                <span className="pp-badge pp-badge--track">
                  {program.category || "Professional Programme"}
                </span>
                {enrolChip}
                <span className="pp-badge pp-badge--pilot">
                  Pilot Access · ₹0
                </span>
              </div>

              <p className="pp-hero__kicker cine-in cine-d1">
                {program.name} · Target Role: <strong>{trackMeta.roles}</strong>
              </p>

              <h1 id="pp-title" className={`sky-display sky-display--lg pp-h1 cine-in cine-d1${content.hero.headline.length > 72 ? " pp-h1--long" : ""}`}>
                <SignalText text={content.hero.headline} signal={content.hero.signal} />
              </h1>

              <p className="pp-lede cine-in cine-d2">{content.hero.summary(moduleCount)}</p>

              {/* 4-Card Key Programme Stats Grid Above the Fold */}
              <div className="pp-metrics-grid cine-in cine-d2" aria-label="Programme structure at a glance">
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Curriculum</span>
                  <strong className="pp-metric-card__val">
                    {moduleCount > 0 ? `${moduleCount} Modules` : "5 Modules"} · {lessonCount > 0 ? `${lessonCount} Lessons` : "15 Lessons"}
                  </strong>
                  <span className="pp-metric-card__sub">Self-paced in Skylent OS</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Applied Proof</span>
                  <strong className="pp-metric-card__val">
                    {assignmentCount > 0 ? `${assignmentCount} Briefs` : "3 Briefs"} + 1 Capstone
                  </strong>
                  <span className="pp-metric-card__sub">
                    {checkCount > 0 ? `${checkCount} concept checks included` : "Rubric-graded portfolio"}
                  </span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">{content.specSheet.material.label}</span>
                  <strong className="pp-metric-card__val">{content.specSheet.material.value}</strong>
                  <span className="pp-metric-card__sub">{content.specSheet.material.note}</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-card__label">Credential</span>
                  <strong className="pp-metric-card__val">Verifiable SKL ID</strong>
                  <span className="pp-metric-card__sub">Unlocks Career OS at 60%</span>
                </div>
              </div>

              {/* Tools & Skills Taught Strip */}
              {toolPills.length > 0 ? (
                <div className="pp-tools-bar cine-in cine-d3" aria-label="Tools and skills covered">
                  <span className="pp-tools-bar__label">{content.specSheet.tools.label}:</span>
                  <div className="pp-tools-bar__list">
                    {toolPills.map((tool) => (
                      <span key={tool} className="pp-tool-pill">{tool}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pp-hero__actions-wrap cine-in cine-d3">
                <div className="pp-actions">
                  {primaryAction}
                  <a className="sk-btn sk-btn-secondary" href="#pp-curriculum">
                    View curriculum ({moduleCount || 5} modules)
                  </a>
                  <SyllabusDownloadButton courseSlug={content.courseSlug} title={program.name} />
                </div>
                <p className="pp-note">
                  {!verified
                    ? `${confirmed && courseUnconfirmed ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked. ` : ""}${afterEnrol}`
                    : `No payment collected during pilot · Immediate access to Lesson 1, ${content.specSheet.material.value} lab, and graded capstone.`}
                </p>
              </div>
            </div>

            {/* Right Column: Elevated Programme Enrolment & Live Workbench Card Above the Fold */}
            <aside className="pp-hero__card cine-in cine-d3" aria-label="Programme enrolment and workbench summary">
              <div className="pp-enrol-card">
                <div className="pp-enrol-card__top">
                  <div className="pp-enrol-card__eyebrow">
                    <span className="pp-live-dot" aria-hidden="true" />
                    <span>LIVE IN-BROWSER LAB · ZERO SETUP</span>
                  </div>
                  <h2 className="pp-enrol-card__title">{content.capstoneTitle}</h2>
                  <p className="pp-enrol-card__sub">{content.hero.figureNote}</p>
                  <div className="pp-enrol-card__preview">
                    <div className="pp-enrol-card__terminal">
                      <div className="pp-enrol-card__dots" aria-hidden="true">
                        <span /><span /><span />
                        <code>{content.specSheet.material.value} · Skylent OS Studio</code>
                      </div>
                      <p className="pp-enrol-card__desc">{practiceCopy}</p>
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
                      { label: "Format & role", value: `${facts.format} · ${trackMeta.roles.split(" · ")[0]}` },
                      { label: "You start with", value: startsWith },
                    ]}
                  />

                  <ul className="pp-enrol-card__checks">
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>{moduleCount || 5} modules &amp; {lessonCount || 15} lessons</strong> written for step-by-step mastery</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>In-browser practice lab</strong> with pre-loaded {content.specSheet.material.value}</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>{content.evidence.rows.length} portfolio artefacts</strong> graded on our 5-dimension competency rubric (Knowledge, Execution, Judgement, Oral Defence & V1→V2 Revision)</span>
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span>
                      <span><strong>Verifiable SKL Certificate</strong> &amp; Career OS unlock at 60% completion</span>
                    </li>
                  </ul>

                  <div className="pp-enrol-card__cta">
                    {primaryAction}
                    <Link className="sk-btn sk-btn-secondary" to={`/courses/${content.courseSlug}`}>
                      Open course syllabus
                    </Link>
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

      {/* Section 01: Interactive Workbench & Deliverable Stage on Navy */}
      <section className="sky-stage sky-band-navy pp-stage" id="pp-stage" aria-labelledby="pp-build-title">
        <div className="sky-container pp-stage__inner">
          <Reveal className="pp-build">
            <div className="pp-build__header">
              <div className="pp-build__lead">
                <SectionIndex n="01" label="Interactive Workbench & Capstone Deliverable" />
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

              <dl className="pp-build__grid">
                {moduleCount > 0 ? (
                  <div>
                    <dt className="sky-label">Modules</dt>
                    <dd className="pp-build__num">{moduleCount}</dd>
                  </div>
                ) : null}
                {course.loading && !authoredOutlineReady ? (
                  <div aria-hidden="true">
                    <dt className="sky-label">Lessons</dt>
                    <dd className="pp-build__num">
                      <span className="sky-skeleton pp-skel-num" />
                    </dd>
                  </div>
                ) : null}
                {courseReady && lessonCount > 0 ? (
                  <div>
                    <dt className="sky-label">Lessons</dt>
                    <dd className="pp-build__num">{lessonCount}</dd>
                  </div>
                ) : null}
                {courseReady && assignmentCount > 0 ? (
                  <div>
                    <dt className="sky-label">Assignments</dt>
                    <dd className="pp-build__num">{assignmentCount}</dd>
                  </div>
                ) : null}
                {courseReady && checkCount > 0 ? (
                  <div>
                    <dt className="sky-label">Checks</dt>
                    <dd className="pp-build__num">{checkCount}</dd>
                  </div>
                ) : null}
                <div className="pp-build__wide">
                  <dt className="sky-label">{content.specSheet.material.label}</dt>
                  <dd className="pp-build__text">
                    {content.specSheet.material.value}
                    <span>{content.specSheet.material.note}</span>
                  </dd>
                </div>
                {profile && profile.tools.length > 0 ? (
                  <div className="pp-build__wide">
                    <dt className="sky-label">{content.specSheet.tools.label}</dt>
                    <dd className="pp-build__text">
                      {profile.tools[0]}
                      {profile.tools.slice(1).map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
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

      {/* Section 02: Structured 6-Step Capstone Project Roadmap Grid */}
      <Reveal as="section" className="sky-container pp-section" id="pp-capstone" aria-labelledby="pp-capstone-title">
        <div className="pp-section-head">
          <div>
            <SectionIndex n="02" label={content.project.label} />
            <h2 id="pp-capstone-title" className="sky-display sky-display--md pp-h2">
              {content.project.heading}
            </h2>
            <p className="pp-body">{content.project.intro}</p>
          </div>
          <div className="pp-section-head__meta">
            <p className="pp-disclaimer">{content.project.disclaimer}</p>
          </div>
        </div>

        <ol className="pp-steps-grid">
          {content.project.steps.map((step) => (
            <li className={`pp-step-card${step.worked ? " pp-step-card--worked" : ""}`} key={step.number}>
              <div className="pp-step-card__top">
                <span className={step.worked ? "sky-step__node sky-step__node--on" : "sky-step__node"}>
                  STEP {step.number}
                </span>
                <span className="pp-step-card__badge">
                  {step.worked ? "Lab Execution" : "Executive Synthesis"}
                </span>
              </div>
              <h3 className="pp-h3">{step.title}</h3>
              <p className="pp-step-card__summary">{step.summary}</p>
              <div className="pp-step-card__foot">
                <StepNote step={step} artefact={content.artefact} />
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Section 03: Structured Module-by-Module Curriculum Syllabus Cards */}
      <Reveal as="section" className="sky-container pp-section pp-section--end" id="pp-curriculum" aria-labelledby="pp-curriculum-title">
        <div className="pp-section-head">
          <div>
            <SectionIndex n="03" label="Curriculum Syllabus" />
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
                  open={index < 2 || (module.sourceId ? module.sourceId === content.curriculum.openModuleId : index === 0)}
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

      {/* Section 04: Practice Environment Specifications */}
      <section className="sky-band-navy pp-practice" id="pp-practice" aria-labelledby="pp-practice-title">
        <Reveal className="sky-container">
          <div className="pp-split">
            <div className="pp-split__intro">
              <SectionIndex n="04" label="Practice Environment" />
              <h2 id="pp-practice-title" className="sky-display sky-display--md pp-h2">
                {content.practice.heading}
              </h2>
              <p className="pp-body">{content.practice.intro}</p>
              {content.practice.link ? (
                <Link className="sk-link pp-practice__link" to={content.practice.link.to}>
                  {content.practice.link.label}
                  <ArrowRight />
                </Link>
              ) : null}
            </div>
            <div className="pp-split__main">
              <SpecSheet
                rows={content.practice.rows.map((row) => ({
                  label: row.label,
                  value: row.mono ? <span className="sky-mono pp-mono">{row.value}</span> : row.value,
                }))}
              />
              <p className="pp-disclaimer pp-disclaimer--plain">{content.practice.disclaimer}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Section 05 & 06: Evidence Portfolio & Career OS Integration */}
            <section className="sky-container pp-section" id="pp-review-standard" aria-labelledby="pp-review-standard-title">
        <div
          style={{
            background: "linear-gradient(145deg, #11152c 0%, #1d1849 100%)",
            border: "1px solid rgba(251, 191, 36, 0.38)",
            borderRadius: 20,
            padding: "clamp(24px, 4vw, 38px)",
            color: "#ffffff",
            boxShadow: "0 20px 44px rgba(10, 14, 34, 0.22)",
          }}
        >
          <p style={{ margin: "0 0 8px", color: "#fbbf24", font: "700 11px/1.4 var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            SKYLENT INSTITUTE OF APPLIED LEARNING · 5-DIMENSION COMPETENCY &amp; ASSESSMENT STANDARD
          </p>
          <h2 id="pp-review-standard-title" style={{ margin: "0 0 12px", fontSize: "clamp(22px, 2.8vw, 32px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
            Learn · Practise · Work · Reflect · Prove: How Competency Is Assessed
          </h2>
          <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.84)", maxWidth: 800, fontSize: 15, lineHeight: 1.6 }}>
            A Skylent learner does not pass merely by watching lessons. Progression moves across five internal competency levels (<strong>L1 Foundation → L2 Guided Practice → L3 Independent Execution → L4 Professional Practice → L5 Advanced Practice</strong>) and is evaluated across five weighted dimensions:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(15, 23, 42, 0.65)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: 14 }}>
              <strong style={{ color: "#fbbf24", fontSize: 18, display: "block" }}>15% · Knowledge</strong>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Conceptual accuracy &amp; first principles</span>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.65)", border: "1px solid rgba(52,211,153,0.38)", borderRadius: 12, padding: 14 }}>
              <strong style={{ color: "#34d399", fontSize: 18, display: "block" }}>30% · Execution</strong>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Verified lab tasks &amp; edge-case checks</span>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.65)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: 14 }}>
              <strong style={{ color: "#fbbf24", fontSize: 18, display: "block" }}>20% · Judgement</strong>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Trade-offs &amp; decision reasoning</span>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.65)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: 14 }}>
              <strong style={{ color: "#fbbf24", fontSize: 18, display: "block" }}>15% · Oral Defence</strong>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Boardroom Cold Call &amp; stakeholder clarity</span>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.65)", border: "1px solid rgba(52,211,153,0.38)", borderRadius: 12, padding: 14 }}>
              <strong style={{ color: "#34d399", fontSize: 18, display: "block" }}>20% · V1 → V2 Revision</strong>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Capstone improvement after faculty critique</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            <div style={{ background: "rgba(15, 23, 42, 0.62)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, padding: 18 }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(16, 185, 129, 0.16)", border: "1px solid rgba(52, 211, 153, 0.4)", color: "#34d399", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: 8 }}>
                ENV A · SIMULATED ENTERPRISE UNITS
              </span>
              <h3 style={{ margin: "0 0 6px", fontSize: 16.5, color: "#ffffff" }}>Guided Trial → Independent Sprint</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                Start on a ₹0 Free Pilot in Northwind Commerce or Harbor Desk SaaS with immediate automated pre-flight feedback and Socratic Hinglish support.
              </p>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.62)", border: "1px solid rgba(251, 191, 36, 0.42)", borderRadius: 14, padding: 18 }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(251, 191, 36, 0.16)", border: "1px solid rgba(251, 191, 36, 0.45)", color: "#fbbf24", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: 8 }}>
                ENV B · WORK ASSIGNMENT EXCHANGE
              </span>
              <h3 style={{ margin: "0 0 6px", fontSize: 16.5, color: "#ffffff" }}>Supervised Partner Fieldwork &amp; V1 → V2 Review</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                Receive human faculty red-line critique within published review windows and qualify for scoped MSME, startup, and institutional fieldwork projects.
              </p>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.62)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, padding: 18 }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(16, 185, 129, 0.16)", border: "1px solid rgba(52, 211, 153, 0.4)", color: "#34d399", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: 8 }}>
                ENV C · FLIGHT RECORDER &amp; CAREER OS
              </span>
              <h3 style={{ margin: "0 0 6px", fontSize: 16.5, color: "#ffffff" }}>Verifiable Evidence &amp; Employer Evaluation</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                Graduate with an event-based Execution Flight Recorder on `/verify` showing what you built, how you were assessed, and who reviewed your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sky-band-proof pp-proof" id="pp-evidence" aria-labelledby="pp-evidence-title">
        <div className="sky-container">
          <div className="pp-split">
            <Reveal className="pp-split__intro">
              <SectionIndex n="05" label="What you can prove" />
              <h2 id="pp-evidence-title" className="sky-display sky-display--md pp-h2">
                {content.evidence.heading}
              </h2>
              <p className="pp-body">{content.evidence.lede}</p>
            </Reveal>

            <Reveal as="article" variant="plate" className="pp-record pp-split__main" aria-labelledby="pp-record-title">
              <header className="pp-record__head">
                <span className="sky-label">Evidence record · Career OS</span>
                <TruthChip state={truthOf("projectsAndEvidence")} />
              </header>
              <div className="pp-record__body">
                <h3 id="pp-record-title" className="pp-record__title">
                  {content.evidence.record.title}
                </h3>
                <p className="pp-record__context">{content.evidence.record.context}</p>
                <dl className="pp-record__rows">
                  <div>
                    <dt className="sky-label">Work shown</dt>
                    <dd>{content.evidence.record.workShown}</dd>
                  </div>
                  <div>
                    <dt className="sky-label">Skills</dt>
                    <dd className="pp-record__skills">
                      {content.evidence.record.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="sky-label">Reflection</dt>
                    <dd className="is-muted">{content.evidence.record.reflection}</dd>
                  </div>
                </dl>
              </div>
              <p className="pp-record__foot">{content.evidence.record.footnote}</p>
            </Reveal>
          </div>

          <Reveal>
            <div className="pp-evtable" tabIndex={0} role="group" aria-label="Assignments and the evidence each one leaves">
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

          <Reveal>
            <div className="pp-career" id="pp-career" role="group" aria-labelledby="pp-career-title">
              <div className="pp-career__head">
                <SectionIndex n="06" label="Where it leads" />
                <h3 id="pp-career-title" className="pp-career__title">
                  In Career OS today
                </h3>
              </div>
              <ul className="pp-career__list">
                {CAREER_STATUS.map((item) => (
                  <li key={item.capability}>
                    <span>{item.label}</span>
                    <TruthChip state={truthOf(item.capability)} />
                  </li>
                ))}
              </ul>
              <Link className="sk-link pp-career__link" to="/career-os">
                Open Career OS
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

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
            <button type="button" className="sk-btn sk-btn-secondary" onClick={() => openSkylentAi("finder")}>
              {canEnrol ? "Not sure yet? Find your path in 90 seconds" : "Find your path in 90 seconds"}
            </button>
          </Reveal>
        </Reveal>
      </section>
    </div>
  )
}
