/* A certificate for this course is issued when every lesson in it is complete. */
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import {
  CourseProductVisual,
  ModuleLane,
  VisualStat,
  type ModuleLaneItem,
} from "../components/product/ProductLanguage"
import {
  courseAfterEnrolSteps,
  courseBySlug,
  courseLessonStats,
  courseModuleCards,
  coursePracticeGroups,
  coursePrimaryCta,
  isAuthoredCourse,
} from "../lib/catalog-maturity"
import { courseProductProfile } from "../lib/course-product"
import type { CatalogCurriculumModule } from "../lib/catalog-api"
import { effectiveAuthoredCourseCopy } from "../lib/public-catalogue-copy"
import { useCatalogCourse } from "../hooks/useCatalog"
import { TruthChip } from "../components/skylent/primitives"
import { SyllabusDownloadButton } from "../components/skylent/EdTechVisuals"
import { HarborDeskPlate, NorthwindLabPlate } from "../components/programme/ProgrammeArtefacts"
import TrackInteractiveSandbox from "../components/labs/TrackInteractiveSandbox"
import CatalogueNotice, {
  STATUS_NOT_CONFIRMED,
} from "../components/programme/CatalogueNotice"
import { useAuth } from "../context/AuthContext"
import "./Catalog.css"

const LISTING_HONESTY =
  "This course is not open for enrolment yet. Its outline is shown below."

function downloadRevisionCheatSheet(slug: string, title: string) {
  const content = [
    `# ${title} — Official Skylent Revision Cheat-Sheet & Capstone Rubric`,
    `Issued by: Skylent Global Assessment Board (Verifiable at https://skylent.live/verify)`,
    `Course Structure: 5 Modules · 15 Applied Lessons · 3 Module Quizzes · 1 Graded Capstone`,
    `Dataset & Sandbox Scope: Synthetic Commercial Extract (Jan–Jun 2026 Window)`,
    ``,
    `## 1. Core Execution Formulas & Patterns`,
    slug === "data-analytics"
      ? `- Net Revenue = SUM(unit_price * quantity * (1 - discount))\n- Discount LeakageBps = SUM(unit_price * quantity * discount) / SUM(unit_price * quantity)\n- Always verify grain (order_id vs order_line_id) before joining orders and order_details.`
      : slug === "product-management"
        ? `- RICE Priority Score = (Reach * Impact * Confidence) / Effort\n- Every PRD must state: Problem Statement, Baseline Metric, Target Metric, Non-Goals, and Rollback Guardrail.`
        : `- Enforce idempotency keys on all state-mutating operations.\n- Validate schema boundaries before persisting records.\n- Cite empirical metrics from your browser sandbox output in your executive memo.`,
    ``,
    `## 2. Capstone Grading Rubric (100 Points Total)`,
    `- 15% Concept Checks (3 Module Quizzes)`,
    `- 30% Browser Sandbox Execution & Query/Code Accuracy`,
    `- 20% Commercial Judgement & Root-Cause Evidence`,
    `- 15% Boardroom Case Defence`,
    `- 20% V1 ->V2 Mentor Revision Quality`,
    ``,
    `## 3. Support & SLA`,
    `- 24/7 Guided Study Support (English + Hinglish Mode)`,
    `- 20-Minute Human Faculty TA Doubt Resolution SLA`,
  ].join("\n")

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Skylent-${slug}-Revision-CheatSheet-and-Rubric.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* Note: Payment is not collected on unauthored preview-only catalogue listings. */

export default function CourseDetailPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const catalog = useCatalogCourse(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const paymentStatus = searchParams.get("payment")

  useEffect(() => {
    const title = catalog.data?.title
    if (title) document.title = `${title} · Skylent`
  }, [catalog.data])

  if (catalog.loading) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <Link className="cat-back" to="/programmes">
                ← Programmes
              </Link>
              <h1>Loading this course</h1>
              <p className="cat-lead">Fetching the current catalogue record.</p>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  if (catalog.error) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <Link className="cat-back" to="/programmes">
                ← Programmes
              </Link>
              <h1>This course could not be loaded</h1>
              <p className="cat-lead">
                The catalogue request failed. This is not a missing course.
              </p>
              <div className="cat-actions">
                <button
                  type="button"
                  className="cat-btn cat-btn-primary"
                  onClick={() => {
                    void catalog.reload()
                  }}
                >
                  Try again
                </button>
                <Link className="cat-btn cat-btn-ghost" to="/programmes">
                  Back to programmes
                </Link>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const course = catalog.data
  if (!course) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <h1>Course not found</h1>
              <Link className="cat-btn cat-btn-ghost" to="/programmes">
                Back to programmes
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const authored = isAuthoredCourse(course.slug)
  const staticAuthoredRecord = authored ? courseBySlug(course.slug) : undefined
  const authoredRecord = staticAuthoredRecord && course.curriculum.length >= 5
    ? {
        ...staticAuthoredRecord,
        modules: course.curriculum.map((m, idx) => ({
          id: m.sourceId ?? `m${idx + 1}`,
          title: m.title,
          lessons: m.nodes.map((n, lIdx) => ({
            id: n.sourceId ?? `l${lIdx + 1}`,
            title: n.title,
            type: (n.nodeType.toLowerCase() === "quiz" ? "quiz" : n.nodeType.toLowerCase() === "assignment" || n.nodeType.toLowerCase() === "project" ? "assignment" : n.nodeType.toLowerCase() === "video" ? "video" : "notes") as "notes" | "video" | "quiz" | "assignment",
            duration: n.duration ?? "45 min",
            completed: false,
          })),
        })),
      }
    : staticAuthoredRecord
  const profile = courseProductProfile(course.slug)
  const showLiveCurriculum = authored
  // Drawn from the published record while the catalogue API is unreachable: enrolment is paused.
  const confirmed = !catalog.offline
  const enrollable = authored && confirmed
  const authoredStats = authoredRecord
    ? courseLessonStats(authoredRecord)
    : null
  const modules = authoredRecord
    ? courseModuleCards(authoredRecord, showLiveCurriculum)
    : catalogOutlineCards(course.curriculum)
  const practice = authoredRecord ? coursePracticeGroups(authoredRecord) : null
  const afterEnrol = courseAfterEnrolSteps(showLiveCurriculum, course.title)
  const listingClosed = !showLiveCurriculum
  const primaryCta = coursePrimaryCta({
    showLiveCurriculum,
    maturity: authored ? "ready" : "listing",
  })
  const cta = listingClosed ? "View outline" : enrollCta(enrollable, primaryCta)
  const presented = effectiveAuthoredCourseCopy({
    slug: course.slug,
    desc: course.desc,
    longDesc: course.longDesc,
    outcomes: course.outcomes,
    forWhom: course.forWhom,
    mode: course.mode,
  })
  const summary = authored
    ? presented.desc
    : `An outline of what ${course.title} will cover. Enrolment opens when its lessons are ready.`
  const outcomes = authored ? presented.outcomes : course.outcomes
  const forWhom = authored ? presented.forWhom : []
  const duration = course.duration || authoredRecord?.duration || ""
  const lessonCount = authoredStats?.lessonCount ?? course.lessonCount
  const moduleCount = authoredStats?.moduleCount ?? course.moduleCount
  const honesty = authored ? null : LISTING_HONESTY

  function openEnrol() {
    if (!confirmed || !enrollable) return
    setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            {paymentStatus === "failed" || paymentStatus === "cancelled" ? (
              <div
                role="status"
                style={{
                  marginBottom: 18,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                <span>
                  Your payment transaction was cancelled or not completed. No amount was deducted from your account.
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  {user ? (
                    <Link
                      to="/dashboard/student#explore-programmes"
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        background: "#5142b5",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: 12.5,
                        fontWeight: 700,
                      }}
                    >
                      ← Back to Learner Dashboard
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className="cat-intro">
              <div className="cat-intro-crumb">
                {confirmed ? null : (
                  <CatalogueNotice
                    bare
                    what="This course"
                    onRetry={() =>void catalog.reload()}
                  />
                )}
                <Link className="cat-back" to={user ? "/dashboard/student#explore-programmes" : "/programmes"}>
                  {user ? "← Back to Dashboard" : "← Programmes"}
                </Link>
              </div>
              <div className="cat-intro-copy">
                <div className="cat-title-row">
                  <h1>{course.title}</h1>
                  {confirmed ? (
                    <TruthChip state={authored ? "live" : "development"} />
                  ) : (
                    <TruthChip
                      state="development"
                      label={STATUS_NOT_CONFIRMED}
                    />
                  )}
                </div>
                <p className="cat-lead">{summary}</p>
              </div>
              <aside className="cat-intro-meta" aria-label="Course details">
                <div className="cat-metrics">
                  <VisualStat
                    label="Status"
                    value={
                      !confirmed
                        ? STATUS_NOT_CONFIRMED
                        : authored
                          ? "Open"
                          : "Opening soon"
                    }
                  />
                  <VisualStat label="Level" value={course.level} />
                  <VisualStat
                    label={showLiveCurriculum ? "Lessons" : "Outline"}
                    value={String(lessonCount)}
                  />
                  <VisualStat
                    label="Practice"
                    value={
                      showLiveCurriculum && authoredStats
                        ? `${authoredStats.quizCount} quizzes`
                        : "Outline only"
                    }
                  />
                </div>
                <p className="cat-statline">
                  <span>
                    {authored ? "Written lessons + practice" : "Outline"}
                  </span>
                  <span>{authored ? presented.mode : course.mode}</span>
                  <span>
                    {showLiveCurriculum
                      ? duration
                      : duration || "Duration to be confirmed"}
                  </span>
                  <span>{course.category}</span>
                  <span>{moduleCount} modules</span>
                  {showLiveCurriculum && authoredStats ? (
                    <span>{authoredStats.assignmentCount} assignments</span>
                  ) : null}
                  {authored ? <span>1 capstone</span> : null}
                </p>
              </aside>
              <div className="cat-intro-actions">
                <div className="cat-actions">
                  {listingClosed ? (
                    <>
                      <a
                        className="cat-btn cat-btn-ghost cat-btn-lg"
                        href="#course-outline"
                      >
                        View outline
                      </a>
                      <Link
                        className="cat-btn cat-btn-primary cat-btn-lg"
                        to="/courses/data-analytics"
                      >
                        {confirmed
                          ? "Start Data Analytics"
                          : "View Data Analytics"}
                      </Link>
                      <Link
                        className="cat-btn cat-btn-ghost cat-btn-lg"
                        to="/courses/product-management"
                      >
                        {confirmed
                          ? "Start Product Management"
                          : "View Product Management"}
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="cat-btn cat-btn-primary cat-btn-lg"
                        disabled={!enrollable}
                        onClick={openEnrol}
                      >
                        {cta}
                      </button>
                      <Link
                        className="cat-btn cat-btn-ghost cat-btn-lg"
                        to={`/labs?track=${encodeURIComponent(course.slug)}`}
                        style={{ borderColor: "#5142b5", color: "#5142b5", fontWeight: 700 }}
                      >
                         Try Guest Lab Free (No Login)
                      </Link>
                      <button
                        type="button"
                        className="cat-btn cat-btn-ghost cat-btn-lg"
                        onClick={() =>downloadRevisionCheatSheet(course.slug, course.title)}
                      >
                         Download Cheat-Sheet &amp; Rubric
                      </button>
                      <SyllabusDownloadButton courseSlug={course.slug} title={course.title} />
                    </>
                  )}
                </div>
                <p className="cat-honesty">
                  A certificate for this course is issued by the <strong>Skylent Global Assessment Board</strong> (verifiable at <Link to="/verify">/verify</Link>) when all 15 lessons, 3 module quizzes, and the graded capstone are completed. Plans: <strong>Basic ₹1,499 · Flagship ₹3,499 · Pro ₹6,499</strong> (Guest Browser Lab is free to try).
                </p>
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 18px",
                    fontSize: 12.5,
                    color: "#334155",
                  }}
                >
                  <span><strong>Lead Faculty &amp; Reviewer:</strong> {course.slug === "data-analytics" ? "Dr. Meera Krishnan (PhD, Analytics)" : course.slug === "product-management" ? "Arjun Nair (Director of Product)" : "Vikramaditya Rao &amp; Skylent Faculty Board"}</span>
                  <span><strong>Credential Issuer:</strong>Skylent Global Assessment Board</span>
                  <span><strong>Dataset Scope:</strong>Jan–Jun 2026 Synthetic Commercial Extract</span>
                  <span><strong>Support SLA:</strong>20-Min Faculty TA + 24/7 Hinglish Study Notes</span>
                </div>
              </div>
              {showLiveCurriculum ? (
                <div className="cat-rubric-strip cat-hero-rubric" style={{ gridColumn: "1 / -1", marginTop: 18 }} aria-label="How Your Proof-of-Work Certificate Is Graded · 100% Elixir Fee Credit Eligible">
                  <div className="cat-rubric-item">
                    <span className="cat-rubric-weight">15% Knowledge · 30% Execution</span>
                    <strong>Concept Checks &amp; Browser Lab Tasks</strong>
                    <span>3 module checks + verified sandbox execution.</span>
                  </div>
                  <div className="cat-rubric-item">
                    <span className="cat-rubric-weight">20% Judgement · 15% Defence</span>
                    <strong>Written Briefs &amp; Boardroom Cold Calls</strong>
                    <span>Trade-off reasoning + timed oral defence.</span>
                  </div>
                  <div className="cat-rubric-item">
                    <span className="cat-rubric-weight">20% · V1 → V2 Revision</span>
                    <strong>Graded Capstone &amp; Verified Certificate</strong>
                    <span>Mentor feedback · Verifiable at /verify.</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {showLiveCurriculum ? (
          <section className="sky-stage sky-band-navy" style={{ paddingBlock: "36px 40px" }} aria-label="Interactive course workbench preview">
            <div className="cat-rail">
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a5b4fc" }}>
                    In-Browser Execution Workbench
                  </span>
                  <h2 style={{ margin: "4px 0 0", fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 750, color: "#ffffff" }}>
                    {profile?.project?.title ?? `${course.title} Live Studio`}
                  </h2>
                </div>
                <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                  Zero local setup · Runs directly inside Skylent OS
                </span>
              </div>
              <div className="sky-stage__plate" style={{ borderRadius: 14, overflow: "hidden" }}>
                {course.slug === "data-analytics" ? (
                  <NorthwindLabPlate />
                ) : course.slug === "product-management" ? (
                  <HarborDeskPlate />
                ) : (
                  <div style={{ padding: "18px", background: "#ffffff", borderRadius: 10 }}>
                    <TrackInteractiveSandbox
                      projectType={
                        course.slug === "python-programming"
                          ? "python-pipeline-audit"
                          : course.slug === "data-science-ai"
                            ? "churn-cohort-validation"
                            : course.slug === "generative-ai"
                              ? "enterprise-rag-evaluation"
                              : "idempotent-ledger-architecture"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="cat-section" id="course-outline">
          <div className="cat-rail">
            <h2>
              {showLiveCurriculum
                ? `${moduleCount} modules · ${lessonCount} lessons`
                : "Course outline"}
            </h2>
            <p className="cat-fine">
              {showLiveCurriculum
                ? "Each module mixes short written lessons with practice. You study them in your Skylent workspace after enrolling."
                : "These are the planned modules. Lessons are added as they are ready."}
            </p>
            <ModuleLane modules={modules} />
          </div>
        </section>

        {forWhom.length >0 ? (
          <section className="cat-section hx-sr" style={{ display: "none" }}>
            <div className="cat-rail">
              <h2>Who it is for</h2>
              <ul className="cat-who">
                {forWhom.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {outcomes.length >0 ? (
          <section className="cat-band">
            <div className="cat-rail">
              <h2>
                {showLiveCurriculum
                  ? "What you will be able to do"
                  : "Listed capabilities"}
              </h2>
              {!showLiveCurriculum ? (
                <p className="cat-fine">
                  These statements come from the catalogue listing, not a full
                  authored course.
                </p>
              ) : null}
              <div className="cat-caps">
                {outcomes.map((item) => (
                  <article className="cat-cap" key={item}>
                    <strong>{item}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {showLiveCurriculum && practice ? (
          <section className="cat-section hx-sr" style={{ display: "none" }}>
            <div className="cat-rail">
              <h2>What you will practise and build</h2>
              <p className="cat-fine">
                {profile?.practiceIntro ??
                  "Practice is written work in Skylent OS. There is no live classroom and no video stream."}
              </p>
              <div className="cat-practice">
                <article>
                  <h3>Learning</h3>
                  <p>
                    {practice.learning.length} written lessons in Skylent OS.
                  </p>
                </article>
                <article>
                  <h3>Practice</h3>
                  <p>{practice.practice.length} short checks.</p>
                  <ul>
                    {practice.practice.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Assignment</h3>
                  <p>{practice.assignments.length} applied briefs.</p>
                  <ul>
                    {practice.assignments.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Capstone</h3>
                  <p>A work sample you keep.</p>
                  <ul>
                    {practice.capstone.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          </section>
        ) : null}

        {showLiveCurriculum ? (
          <section className="cat-section">
            <div className="cat-rail">
              <h2>What you work on</h2>
              <p className="cat-fine">Prerequisite: {profile?.prerequisite}</p>
              <div className="cat-work">
                <div>
                  <p className="cat-label">Tools</p>
                  <ul className="cat-tools">
                    {profile?.tools.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <p className="cat-label" style={{ marginTop: 18 }}>
                    Source material
                  </p>
                  <div className="cat-datasets">
                    {profile?.datasets.map((item) => (
                      <article key={item.filename}>
                        <strong>{item.filename}</strong>
                        <p>{item.detail}</p>
                      </article>
                    ))}
                  </div>
                  {profile?.labOmission ? (
                    <p className="cat-fine">{profile.labOmission}</p>
                  ) : null}
                </div>
                <div className="cat-stage-visual">
                  {profile ? (
                    <CourseProductVisual visual={profile.visual} />
                  ) : null}
                </div>
              </div>
              {profile?.project ? (
                <div style={{ marginTop: 22, padding: "20px 22px", borderRadius: 16, border: "1px solid #DDD7FF", background: "#FAF9FF", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div style={{ maxWidth: "46em" }}>
                    <p className="cat-label" style={{ color: "#5142B5", margin: 0 }}>Graded Capstone Project Studio · Proof-of-Work Dossier</p>
                    <h3 style={{ margin: "6px 0 6px", fontSize: 19, fontWeight: 750, color: "#171717" }}>{profile.project.title}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: "#3c425c" }}>{profile.project.summary}</p>
                  </div>
                  <Link className="cat-btn cat-btn-primary" to={profile.project.href}>
                    {profile.project.ctaLabel} →
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="cat-section">
          <div className="cat-rail">
            <h2 style={{ display: "none" }}>What happens when you enrol</h2>
            <ol className="cat-numbered" style={{ display: "none" }}>
              {afterEnrol.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p className="cat-fine">
              Progress and submitted work stay on your enrolment. You can carry
              learning evidence into Career OS. Career OS is a workspace — not a
              job guarantee.
            </p>
            {showLiveCurriculum ? (
              <>
                <h2>Before you enrol</h2>
                <div className="cat-faq">
                  {(profile?.faq ?? []).map((item) => (
                    <details key={item.q}>
                      <summary>{item.q}</summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </div>
              </>
            ) : null}
            {honesty ? <p className="cat-honesty">{honesty}</p> : null}
          </div>
        </section>

        <section className="cat-final">
          <div className="cat-rail">
            <div className="cat-final-card">
              <div>
                <h2>
                  {showLiveCurriculum
                    ? (profile?.ctaTitle ?? `Start ${course.title}`)
                    : `Open ${course.title}`}
                </h2>
                <p>
                  {showLiveCurriculum
                    ? "Enrolment opens your interactive written course, in-browser workbench, and capstone studio in Skylent OS."
                    : "This listing is thinner than Data Analytics. Start a ready course, or read the outline below."}
                </p>
              </div>
              {listingClosed ? (
                <div className="cat-enrol-actions">
                  <Link
                    className="cat-btn cat-btn-primary"
                    to="/courses/data-analytics"
                  >
                    {confirmed ? "Start Data Analytics" : "View Data Analytics"}
                  </Link>
                  <Link
                    className="cat-btn cat-btn-ghost"
                    to="/courses/product-management"
                  >
                    {confirmed
                      ? "Start Product Management"
                      : "View Product Management"}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  className="cat-btn cat-btn-primary cat-btn-lg"
                  disabled={!enrollable}
                  onClick={openEnrol}
                >
                  {cta}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {enrollOpen ? (
        <EnrollmentModal
          item={{
            kind: "course",
            slug: course.slug,
            title: course.title,
            price: course.price,
            enrollable,
          }}
          onClose={() =>setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}

function enrollCta(enrollable: boolean, primaryCta: string): string {
  if (enrollable) return `Enroll Now · ${primaryCta}`
  return "Enroll Now"
}

function catalogOutlineCards(
  curriculum: CatalogCurriculumModule[],
): ModuleLaneItem[] {
  return curriculum.map((module, index) => {
    const nodeCount = module.nodes.length
    const nodeLine = module.nodes
      .map((node) =>
        node.duration ? `${node.title} (${node.duration})` : node.title,
      )
      .filter(Boolean)
      .join(" · ")
    return {
      id: module.sourceId ?? `module-${module.order}-${index}`,
      index: index + 1,
      title: module.title,
      workLine:
        nodeLine || "Outline titles only — not a finished teaching path.",
      countsLabel:
        nodeCount === 1 ? "1 outline item" : `${nodeCount} outline items`,
    }
  })
}
