import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
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
import CatalogueNotice, {
  STATUS_NOT_CONFIRMED,
} from "../components/programme/CatalogueNotice"
import "./Catalog.css"

const LISTING_HONESTY =
  "This course is not open for enrolment yet. Its outline is shown below."

export default function CourseDetailPage() {
  const { slug } = useParams()
  const catalog = useCatalogCourse(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)
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
  const authoredRecord = authored ? courseBySlug(course.slug) : undefined
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
    if (!enrollable) return
    setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <div className="cat-intro">
              <div className="cat-intro-crumb">
                {confirmed ? null : (
                  <CatalogueNotice
                    bare
                    what="This course"
                    onRetry={() => void catalog.reload()}
                  />
                )}
                <Link className="cat-back" to="/programmes">
                  ← Programmes
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
                        to="/programmes"
                      >
                        Browse programmes
                      </Link>
                    </>
                  )}
                </div>
                <p className="cat-honesty">
                  Payment is not collected in this pilot. A certificate for this course is issued when every lesson in it is complete.
                </p>
              </div>
            </div>
          </div>
        </section>

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

        {forWhom.length > 0 ? (
          <section className="cat-section">
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

        {outcomes.length > 0 ? (
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
          <section className="cat-section">
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
              <div className="cat-rubric-strip" aria-label="Assessment and credential weightage">
                <div className="cat-rubric-item">
                  <span className="cat-rubric-weight">25% · Concept Checks</span>
                  <strong>3 Module Quizzes (15 Questions)</strong>
                  <span>Earn +10 Elixir bonus when scoring 80%+ on module checks.</span>
                </div>
                <div className="cat-rubric-item">
                  <span className="cat-rubric-weight">35% · Applied Practice</span>
                  <strong>Applied Briefs &amp; Lab Execution</strong>
                  <span>Earn +15 Elixir per submitted brief with Socratic AI &amp; 20-Min TA SLA.</span>
                </div>
                <div className="cat-rubric-item">
                  <span className="cat-rubric-weight">40% · Executive Proof</span>
                  <strong>Capstone &amp; Cold Call Defense</strong>
                  <span>Unlocks Career Rise at 60% progress &amp; Cryptographic Certificate at 100%.</span>
                </div>
              </div>
              <div className="cat-caps" style={{ marginTop: 20 }}>
                <article className="cat-cap">
                  <strong>💎 +50 Elixir Enrolment &amp; Milestone Credits</strong>
                  <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#555B7D" }}>
                    Receive +50 Elixir on enrolment, +5 per lesson, +10 on 80%+ quizzes, +15 per brief, and +100 on full course completion.
                  </p>
                </article>
                <article className="cat-cap">
                  <strong>⚡ 60-Sec Boardroom Cold Calls &amp; Cohort Split</strong>
                  <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#555B7D" }}>
                    Practise timed executive trade-off decisions inside every lesson and compare your decision against the peer cohort % split.
                  </p>
                </article>
                <article className="cat-cap">
                  <strong>🤖 Socratic AI Tutor + 20-Min Faculty TA SLA</strong>
                  <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#555B7D" }}>
                    Ask Socratic AI for conceptual hints or escalate complex blockers to a live Faculty TA with a 20-minute SLA tracker.
                  </p>
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
            <h2>What happens when you enrol</h2>
            <ol className="cat-numbered">
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
                    ? "Enrolment does not collect payment. It opens the written course in Skylent OS."
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
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}

function enrollCta(enrollable: boolean, primaryCta: string): string {
  if (enrollable) return primaryCta
  return "View outline"
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
