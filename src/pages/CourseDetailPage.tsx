import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import { CourseProductVisual, CourseWorkspacePreview, ModuleLane, ProductFrame } from "../components/product/ProductLanguage"
import {
  courseAfterEnrolSteps,
  courseModuleCards,
  coursePracticeGroups,
  coursePublicView,
} from "../lib/catalog-maturity"
import { courseProductProfile } from "../lib/course-product"
import { courses } from "../data"
import { useCatalogCourse } from "../hooks/useCatalog"
import "./Catalog.css"

export default function CourseDetailPage() {
  const { slug } = useParams()
  const course = courses.find((item) => item.slug === slug)
  const catalog = useCatalogCourse(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)

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

  const view = coursePublicView(course)
  const profile = courseProductProfile(course.slug)
  const enrollable = Boolean(catalog.data)
  const modules = courseModuleCards(course, view.showLiveCurriculum)
  const practice = coursePracticeGroups(course)
  const afterEnrol = courseAfterEnrolSteps(view.showLiveCurriculum, view.title)
  const cta = enrollCta(enrollable, catalog.loading, view.primaryCta)

  function openEnrol() {
    if (enrollable || !catalog.loading) setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail cat-hero-split">
            <div>
              <Link className="cat-back" to="/courses">← Courses</Link>
              <h1>{view.title}</h1>
              <p className="cat-lead">{view.summary}</p>
              <p className="cat-statline">
                <span className={view.maturity === "ready" ? "cat-mark cat-mark-ready" : "cat-mark"}>
                  {view.maturityLabel}
                </span>
                <span>{view.course.level}</span>
                <span>{view.delivery}</span>
                <span>{view.showLiveCurriculum ? view.duration : "Duration not finished"}</span>
                <span>
                  {view.showLiveCurriculum
                    ? `${view.stats.lessonCount} lessons · ${view.stats.moduleCount} modules`
                    : `${view.stats.lessonCount} outline items · ${view.stats.moduleCount} modules`}
                </span>
                <span>
                  {view.showLiveCurriculum
                    ? `${view.stats.quizCount} quizzes · ${view.stats.assignmentCount} assignments`
                    : "Practice outline only"}
                </span>
              </p>
              {view.honesty ? <p className="cat-note">{view.honesty}</p> : null}
              <div className="cat-actions">
                <button type="button" className="cat-btn cat-btn-primary cat-btn-lg" disabled={catalog.loading && !enrollable} onClick={openEnrol}>
                  {cta}
                </button>
                <Link className="cat-btn cat-btn-ghost" to="/skills">Back to Skills</Link>
              </div>
              <p className="cat-price-line">
                ₹{view.listedPrice.toLocaleString("en-IN")}
                <span> listed · Payment is not collected · Certificate not issued in this pilot</span>
              </p>
              <p className="cat-fine">
                {view.showLiveCurriculum
                  ? "Enrol opens Skylent OS at the first lesson. If you are not signed in, you will be asked to sign in first."
                  : "Enrol opens the LMS outline. If you are not signed in, you will be asked to sign in first."}
              </p>
            </div>
            {view.showLiveCurriculum ? (
              <div className="cat-hero-visual">
                <CourseWorkspacePreview
                  courseTitle={view.title}
                  lessonTitle={course.modules[0]?.lessons[0]?.title ?? "Open the first lesson"}
                  practiceTitle={course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")?.title ?? "A short check"}
                  workTitle={course.modules.flatMap((module) => module.lessons).find((lesson) => /capstone|product case/i.test(lesson.title))?.title ?? "Capstone"}
                  modules={course.modules.map((module) => module.title)}
                  lessonCount={view.stats.lessonCount}
                  visual={profile?.visual === "harbor-desk" ? "harbor-desk" : "northwind"}
                />
              </div>
            ) : (
              <div className="cat-hero-visual">
                <ProductFrame title={view.title} meta="Outline">
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
              </div>
            )}
          </div>
        </section>

        {view.forWhom.length > 0 ? (
          <section className="cat-section">
            <div className="cat-rail">
              <h2>Who it is for</h2>
              <ul className="cat-who">
                {view.forWhom.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="cat-band">
          <div className="cat-rail">
            <h2>{view.showLiveCurriculum ? "Capabilities in this course" : "Listed capabilities"}</h2>
            {!view.showLiveCurriculum ? (
              <p className="cat-fine">These statements come from the catalogue listing, not a full authored course.</p>
            ) : null}
            <div className="cat-caps">
              {view.outcomes.map((item) => (
                <article className="cat-cap" key={item}>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail">
            <h2>
              {view.showLiveCurriculum
                ? `${view.stats.moduleCount} modules · ${view.stats.lessonCount} lessons`
                : "What exists in the LMS today"}
            </h2>
            <p className="cat-fine">
              {view.showLiveCurriculum
                ? "Each module is a block of written work and practice. Lesson bodies stay in Skylent OS."
                : "Titles below are an outline, not a finished teaching path."}
            </p>
            <ModuleLane modules={modules} />
          </div>
        </section>

        {view.showLiveCurriculum ? (
          <section className="cat-section">
            <div className="cat-rail">
              <h2>What you will practise and build</h2>
              <p className="cat-fine">
                {view.showLiveCurriculum
                  ? profile?.practiceIntro ?? "Practice is written work in Skylent OS. There is no live classroom and no video stream."
                  : "Titles below are an outline, not a finished teaching path."}
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

        {view.showLiveCurriculum ? (
          <section className="cat-section">
            <div className="cat-rail">
              <h2>What you work on</h2>
              <p className="cat-fine">Prerequisite: {profile?.prerequisite}</p>
              <ul className="cat-tools">
                {profile?.tools.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <ul className="cat-tools">
                {profile?.datasets.map((item) => (
                  <li key={item.filename}>{item.filename}</li>
                ))}
              </ul>
              {profile?.datasets.map((item) => (
                <p className="cat-fine" key={item.detail}>{item.detail}</p>
              ))}
              {profile?.labOmission ? <p className="cat-fine">{profile.labOmission}</p> : null}
              <div className="cat-stage-visual">
                {profile ? <CourseProductVisual visual={profile.visual} /> : null}
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
            {view.showLiveCurriculum ? (
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
          </div>
        </section>

        <section className="cat-final">
          <div className="cat-rail">
            <div className="cat-final-card">
              <div>
                <h2>{view.showLiveCurriculum ? profile?.ctaTitle ?? `Start ${view.title}` : `Open ${view.title}`}</h2>
                <p>
                  {view.showLiveCurriculum
                    ? "Enrolment does not collect payment. It opens the written course in Skylent OS."
                    : "This listing is thinner than Data Analytics. Enrolment opens the outline only."}
                </p>
              </div>
              <button type="button" className="cat-btn cat-btn-primary" disabled={catalog.loading && !enrollable} onClick={openEnrol}>
                {cta}
              </button>
            </div>
          </div>
        </section>
      </div>

      {enrollOpen ? (
        <EnrollmentModal
          item={{ kind: "course", slug: course.slug, title: course.title, price: view.listedPrice, enrollable }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}

function enrollCta(enrollable: boolean, loading: boolean, primaryCta: string): string {
  if (enrollable) return primaryCta
  if (loading) return "Checking availability…"
  return "Enrolment unavailable"
}
