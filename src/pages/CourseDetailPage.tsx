import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import {
  CourseProductVisual,
  CourseWorkspacePreview,
  ModuleLane,
  ProductFrame,
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
import { useCatalogCourse } from "../hooks/useCatalog"
import "./Catalog.css"

const LISTING_HONESTY =
  "Catalogue listing — thinner than Data Analytics. You can open the workspace; full teaching content is being built."

export default function CourseDetailPage() {
  const { slug } = useParams()
  const catalog = useCatalogCourse(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (catalog.loading) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <Link className="cat-back" to="/courses">← Courses</Link>
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
              <Link className="cat-back" to="/courses">← Courses</Link>
              <h1>This course could not be loaded</h1>
              <p className="cat-lead">
                The catalogue request failed. This is not a missing course.
              </p>
              <div className="cat-actions">
                <button type="button" className="cat-btn cat-btn-primary" onClick={() => { void catalog.reload() }}>
                  Try again
                </button>
                <Link className="cat-btn cat-btn-ghost" to="/courses">Back to courses</Link>
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
              <Link className="cat-btn cat-btn-ghost" to="/courses">Back to courses</Link>
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
  const enrollable = authored
  const authoredStats = authoredRecord ? courseLessonStats(authoredRecord) : null
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
  const summary = authored
    ? course.desc || authoredRecord?.desc || course.longDesc
    : `${course.title} is a catalogue listing. The LMS has an outline, not a finished course like Data Analytics or Product Management.`
  const outcomes = course.outcomes.length > 0 ? course.outcomes : authoredRecord?.outcomes ?? []
  const forWhom = course.forWhom.length > 0 ? course.forWhom : authored ? authoredRecord?.forWhom ?? [] : []
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
        <div className="cat-enrol-bar">
          <div className="cat-rail cat-enrol-bar-inner">
            <div className="cat-enrol-bar-copy">
              <strong>{course.title}</strong>
              <span>{authored ? "Ready to start" : "Catalogue listing"}</span>
            </div>
            {listingClosed ? (
              <div className="cat-enrol-actions">
                <a className="cat-btn cat-btn-ghost" href="#course-outline">View outline</a>
                <Link className="cat-btn cat-btn-primary" to="/courses/data-analytics">Start Data Analytics</Link>
              </div>
            ) : (
              <button
                type="button"
                className="cat-btn cat-btn-primary"
                disabled={!enrollable}
                onClick={openEnrol}
              >
                {cta}
              </button>
            )}
          </div>
        </div>

        <section className="cat-hero">
          <div className="cat-rail">
            <Link className="cat-back" to="/courses">← Courses</Link>
            <h1>{course.title}</h1>
            <p className="cat-lead">{summary}</p>
            <div className="cat-metrics">
              <VisualStat label="Status" value={authored ? "Ready" : "Catalogue listing"} />
              <VisualStat label="Level" value={course.level} />
              <VisualStat
                label={showLiveCurriculum ? "Lessons" : "Outline"}
                value={String(lessonCount)}
              />
              <VisualStat
                label="Practice"
                value={showLiveCurriculum && authoredStats ? `${authoredStats.quizCount} quizzes` : "Outline only"}
              />
            </div>
            <p className="cat-statline">
              <span>{authored ? "Written lessons + practice" : "LMS outline"}</span>
              <span>{course.mode}</span>
              <span>{showLiveCurriculum ? duration : duration || "Duration not finished"}</span>
              <span>{course.category}</span>
              <span>{moduleCount} modules</span>
              {showLiveCurriculum && authoredStats ? <span>{authoredStats.assignmentCount} assignments</span> : null}
            </p>
            <div className="cat-actions">
              {listingClosed ? (
                <>
                  <a className="cat-btn cat-btn-ghost cat-btn-lg" href="#course-outline">View outline</a>
                  <Link className="cat-btn cat-btn-primary cat-btn-lg" to="/courses/data-analytics">Start Data Analytics</Link>
                  <Link className="cat-btn cat-btn-ghost" to="/courses/product-management">Start Product Management</Link>
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
                  <Link className="cat-btn cat-btn-ghost" to="/courses">Browse courses</Link>
                </>
              )}
            </div>
            <p className="cat-honesty">
              Payment is not collected in this pilot. A certificate is not issued yet.
            </p>
          </div>
        </section>

        <section className="cat-section" id="course-outline">
          <div className="cat-rail">
            <h2>
              {showLiveCurriculum
                ? `${moduleCount} modules · ${lessonCount} lessons`
                : "What exists in the LMS today"}
            </h2>
            <p className="cat-fine">
              {showLiveCurriculum
                ? "Each module is a block of written work and practice. Lesson bodies stay in Skylent OS."
                : "Titles below are an outline, not a finished teaching path."}
            </p>
            <ModuleLane modules={modules} />
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail">
            <p className="cat-preview-caption">What you open after enrol</p>
            {showLiveCurriculum && authoredRecord ? (
              <CourseWorkspacePreview
                courseTitle={course.title}
                lessonTitle={authoredRecord.modules[0]?.lessons[0]?.title ?? "Open the first lesson"}
                practiceTitle={authoredRecord.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")?.title ?? "A short check"}
                workTitle={authoredRecord.modules.flatMap((module) => module.lessons).find((lesson) => /capstone|product case/i.test(lesson.title))?.title ?? "Capstone"}
                modules={authoredRecord.modules.map((module) => module.title)}
                lessonCount={lessonCount}
                visual={profile?.visual === "harbor-desk" ? "harbor-desk" : "northwind"}
                marketing
              />
            ) : (
              <ProductFrame title={course.title} meta="Outline">
                <ol className="pl-ws-rail pl-outline">
                  {modules.map((module) => (
                    <li key={module.id}>
                      <span>{String(module.index).padStart(2, "0")}</span>
                      {module.title}
                    </li>
                  ))}
                </ol>
                <p className="pl-fine">Outline titles only — not a finished teaching path.</p>
              </ProductFrame>
            )}
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
              <h2>{showLiveCurriculum ? "What you will be able to do" : "Listed capabilities"}</h2>
              {!showLiveCurriculum ? (
                <p className="cat-fine">These statements come from the catalogue listing, not a full authored course.</p>
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
                {profile?.practiceIntro ?? "Practice is written work in Skylent OS. There is no live classroom and no video stream."}
              </p>
              <div className="cat-practice">
                <article>
                  <h3>Learning</h3>
                  <p>{practice.learning.length} written lessons in Skylent OS.</p>
                </article>
                <article>
                  <h3>Practice</h3>
                  <p>{practice.practice.length} short checks.</p>
                  <ul>
                    {practice.practice.map((item) => <li key={item.id}>{item.title}</li>)}
                  </ul>
                </article>
                <article>
                  <h3>Assignment</h3>
                  <p>{practice.assignments.length} applied briefs.</p>
                  <ul>
                    {practice.assignments.map((item) => <li key={item.id}>{item.title}</li>)}
                  </ul>
                </article>
                <article>
                  <h3>Capstone</h3>
                  <p>A work sample you keep.</p>
                  <ul>
                    {practice.capstone.map((item) => <li key={item.id}>{item.title}</li>)}
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
                  <p className="cat-label" style={{ marginTop: 18 }}>Source material</p>
                  <div className="cat-datasets">
                    {profile?.datasets.map((item) => (
                      <article key={item.filename}>
                        <strong>{item.filename}</strong>
                        <p>{item.detail}</p>
                      </article>
                    ))}
                  </div>
                  {profile?.labOmission ? <p className="cat-fine">{profile.labOmission}</p> : null}
                </div>
                <div className="cat-stage-visual">
                  {profile ? <CourseProductVisual visual={profile.visual} /> : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="cat-section">
          <div className="cat-rail">
            <h2>What happens when you enrol</h2>
            <ol className="cat-numbered">
              {afterEnrol.map((item) => <li key={item}>{item}</li>)}
            </ol>
            <p className="cat-fine">
              Progress and submitted work stay on your enrolment. You can carry learning evidence into Career OS. Career OS is a workspace — not a job guarantee.
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
                <h2>{showLiveCurriculum ? profile?.ctaTitle ?? `Start ${course.title}` : `Open ${course.title}`}</h2>
                <p>
                  {showLiveCurriculum
                    ? "Enrolment does not collect payment. It opens the written course in Skylent OS."
                    : "This listing is thinner than Data Analytics. Start a ready course, or read the outline below."}
                </p>
              </div>
              {listingClosed ? (
                <div className="cat-enrol-actions">
                  <Link className="cat-btn cat-btn-primary" to="/courses/data-analytics">Start Data Analytics</Link>
                  <Link className="cat-btn cat-btn-ghost" to="/courses/product-management">Start Product Management</Link>
                </div>
              ) : (
                <button type="button" className="cat-btn cat-btn-primary" disabled={!enrollable} onClick={openEnrol}>
                  {cta}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {enrollOpen ? (
        <EnrollmentModal
          item={{ kind: "course", slug: course.slug, title: course.title, price: course.price, enrollable }}
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

function catalogOutlineCards(curriculum: CatalogCurriculumModule[]): ModuleLaneItem[] {
  return curriculum.map((module, index) => {
    const nodeCount = module.nodes.length
    const nodeLine = module.nodes
      .map((node) => (node.duration ? `${node.title} (${node.duration})` : node.title))
      .filter(Boolean)
      .join(" · ")
    return {
      id: module.sourceId ?? `module-${module.order}-${index}`,
      index: index + 1,
      title: module.title,
      workLine: nodeLine || "Outline titles only — not a finished teaching path.",
      countsLabel: nodeCount === 1 ? "1 outline item" : `${nodeCount} outline items`,
    }
  })
}
