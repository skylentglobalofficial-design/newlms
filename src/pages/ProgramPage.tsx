import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import ProfessionalProgrammeTemplate from "../components/programme/ProfessionalProgrammeTemplate"
import { programs, type Program } from "../data"
import {
  isProgramEnrollable,
  lowestProgramPrice,
  type CatalogEnrollmentStatus,
  type CatalogProgramDetail,
} from "../lib/catalog-api"
import { courseProductProfile } from "../lib/course-product"
import {
  courseBySlug,
  isAuthoredCourse,
  programmeAfterEnrolCopy,
  programmePublicView,
  type LinkedLearning,
} from "../lib/catalog-maturity"
import {
  hasAuthoredProgrammePath,
  programmeDiscoveryFor,
  type ProgrammeDiscoveryCard,
} from "../lib/programme-discovery"
import { useCatalogProgram } from "../hooks/useCatalog"
import "./Catalog.css"
import "./ProgramPage.css"



function useDetailNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return narrow
}

export default function ProgramPage() {
  const { slug } = useParams()
  const catalog = useCatalogProgram(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const narrow = useDetailNarrow()

  if (catalog.loading) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <Link className="cat-back" to="/programs">
                ← Programmes
              </Link>
              <h1>Loading this programme</h1>
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
              <Link className="cat-back" to="/programs">
                ← Programmes
              </Link>
              <h1>This programme could not be loaded</h1>
              <p className="cat-lead">The catalogue request failed. This is not a missing programme.</p>
              <div className="cat-actions">
                <button type="button" className="cat-btn cat-btn-primary" onClick={() => { void catalog.reload() }}>
                  Try again
                </button>
                <Link className="cat-btn cat-btn-ghost" to="/programs">
                  Back to programmes
                </Link>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const program = catalog.data
  if (!program) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <h1>Programme not found</h1>
              <Link className="cat-btn cat-btn-ghost" to="/programs">
                Back to programmes
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const authoredRecord = programs.find((item) => item.slug === program.slug)
  const discovery = programmeDiscoveryFor(program.slug)
  const overlayView = authoredRecord ? programmePublicView(authoredRecord) : null
  const linked = linkedLearningFromApi(program.linkedCourseSlugs)
  const hasTaughtPath = hasAuthoredProgrammePath(program.slug)
  const enrollable = isProgramEnrollable(program) && hasTaughtPath
  const comingLater = program.enrollmentStatus === "coming_soon" || program.enrollmentStatus === "waitlist"
  const maturity = comingLater ? "coming_later" as const : "listing" as const
  const afterEnrol = programmeAfterEnrolCopy({ maturity, linked })
  const authoredLinked = linked.filter((item) => item.authored)
  const cta = comingLater
    ? "Coming later"
    : enrollable
      ? authoredLinked.length > 0 && authoredLinked.length === linked.length
        ? overlayView?.ctaLabel ?? "Start this programme"
        : overlayView?.ctaLabel ?? "Open linked course"
      : "Enrolment unavailable"

  function openEnrol() {
    if (comingLater || !enrollable) return
    setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        {discovery && authoredRecord ? (
          <AuthoredProgramme
            program={program}
            authoredRecord={authoredRecord}
            authoredCourse={linked.map((item) => courseBySlug(item.slug)).find((item): item is import("../data").Course => Boolean(item)) ?? null}
            discovery={discovery}
            taughtOutcomes={overlayView?.taughtOutcomes ?? []}
            afterEnrol={afterEnrol}
            cta={cta}
            comingLater={comingLater}
            enrollable={enrollable}
            narrow={narrow}
            onEnrol={openEnrol}
          />
        ) : (
          <ListingProgramme
            title={program.name}
            summary={program.desc || overlayView?.summary || ""}
            duration={program.duration}
            format={program.format}
            level={program.level}
            maturityLabel={comingLater ? "Coming later" : "Catalogue listing"}
            honesty={overlayView?.honesty ?? programmeListingHonesty(program.enrollmentStatus, linked)}
            linked={linked}
            afterEnrol={afterEnrol}
            cta={cta}
            comingLater={comingLater}
            enrollable={enrollable}
            onEnrol={openEnrol}
          />
        )}
      </div>

      {enrollOpen ? (
        <EnrollmentModal
          item={{
            kind: "program",
            slug: program.slug,
            title: program.name,
            price: lowestProgramPrice(program) ?? 0,
            enrollmentStatus: program.enrollmentStatus ?? undefined,
            enrollable,
            linkedCourseSlugs: program.linkedCourseSlugs,
          }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}

function AuthoredProgramme({
  program,
  authoredRecord,
  authoredCourse,
  discovery,
  taughtOutcomes,
  afterEnrol,
  cta,
  comingLater,
  enrollable,
  narrow,
  onEnrol,
}: {
  program: CatalogProgramDetail
  authoredRecord: Program
  authoredCourse: import("../data").Course | null
  discovery: ProgrammeDiscoveryCard
  taughtOutcomes: string[]
  afterEnrol: string
  cta: string
  comingLater: boolean
  enrollable: boolean
  narrow: boolean
  onEnrol: () => void
}) {
  return (
    <ProfessionalProgrammeTemplate
      program={program}
      authoredRecord={authoredRecord}
      authoredCourse={authoredCourse}
      discovery={discovery}
      taughtOutcomes={taughtOutcomes}
      afterEnrol={afterEnrol}
      cta={cta}
      comingLater={comingLater}
      enrollable={enrollable}
      narrow={narrow}
      onEnrol={onEnrol}
    />
  )
}

function ListingProgramme({
  title,
  summary,
  duration,
  format,
  level,
  maturityLabel,
  honesty,
  linked,
  afterEnrol,
  cta,
  comingLater,
  enrollable,
  onEnrol,
}: {
  title: string
  summary: string
  duration: string
  format: string
  level: string
  maturityLabel: string
  honesty: string
  linked: LinkedLearning[]
  afterEnrol: string
  cta: string
  comingLater: boolean
  enrollable: boolean
  onEnrol: () => void
}) {
  const linkedCourse = linked[0]
  return (
    <>
      <section className="cat-hero pd-listing" aria-labelledby="pd-title">
        <div className="cat-rail">
          <Link className="cat-back" to="/programs">
            ← Programmes
          </Link>
          <p className="cat-label">Programme listing</p>
          <h1 id="pd-title">{title}</h1>
          <p className="cat-lead">{summary}</p>
          <p className="cat-statline">
            <span className="cat-mark">{maturityLabel}</span>
            {level ? <span>{level}</span> : null}
            {format ? <span>{format}</span> : null}
            {duration ? <span>{duration}</span> : null}
            {linkedCourse ? (
              <span>Linked course: {linkedCourse.title}</span>
            ) : (
              <span>No linked LMS course yet</span>
            )}
          </p>
          <p className="cat-note">{honesty}</p>
          {linkedCourse ? (
            <Link className="cat-link" to={linkedCourse.to}>
              <CourseThumb
                authored={linkedCourse.authored}
                visual={courseProductProfile(linkedCourse.slug)?.visual ?? "northwind"}
              />
              <div>
                <span className={linkedCourse.authored ? "cat-mark cat-mark-ready" : "cat-mark"}>
                  {linkedCourse.maturityLabel}
                </span>
                <p className="cat-link-title">{linkedCourse.title}</p>
                <p>
                  {linkedCourse.authored
                    ? "Authored course in Skylent OS."
                    : "Catalogue listing — thinner than Data Analytics."}
                </p>
              </div>
              <span className="cat-btn cat-btn-ghost">View course</span>
            </Link>
          ) : null}
          <div className="cat-actions">
            {comingLater ? (
              <span className="cat-btn cat-btn-ghost" aria-disabled="true">
                Coming later
              </span>
            ) : (
              <button
                type="button"
                className="cat-btn cat-btn-primary cat-btn-lg"
                disabled={!enrollable}
                onClick={onEnrol}
              >
                {cta}
              </button>
            )}
            {linkedCourse ? (
              <Link className="cat-btn cat-btn-ghost" to={linkedCourse.to}>
                View {linkedCourse.title}
              </Link>
            ) : (
              <Link className="cat-btn cat-btn-ghost" to="/courses">
                Explore courses
              </Link>
            )}
          </div>
          <p className="cat-honesty">Payment is not collected. A certificate is not issued in this pilot.</p>
          <p className="cat-fine">{afterEnrol}</p>
        </div>
      </section>

      <section className="cat-final">
        <div className="cat-rail">
          <div className="cat-final-card">
            <div>
              <h2>{comingLater ? "This programme is not open yet" : "Open the linked learning"}</h2>
              <p>{afterEnrol}</p>
            </div>
            {comingLater ? (
              <Link className="cat-btn cat-btn-ghost" to="/courses">
                Browse courses
              </Link>
            ) : (
              <button type="button" className="cat-btn cat-btn-primary" disabled={!enrollable} onClick={onEnrol}>
                {cta}
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function linkedLearningFromApi(slugs: string[]): LinkedLearning[] {
  return slugs.map((courseSlug) => {
    const course = courseBySlug(courseSlug)
    const authored = isAuthoredCourse(courseSlug)
    return {
      slug: courseSlug,
      title: course?.title ?? courseSlug,
      to: `/courses/${courseSlug}`,
      authored,
      maturityLabel: authored ? "Ready to start" : "Catalogue listing",
    }
  })
}

function programmeListingHonesty(
  status: CatalogEnrollmentStatus | null,
  linked: LinkedLearning[],
): string {
  const authored = linked.filter((item) => item.authored)
  if (status === "coming_soon" || status === "waitlist") {
    return "This programme is not open yet. There is no classroom session or batch behind the listing."
  }
  if (authored.length && linked.length === authored.length) {
    return `Enrolment opens the ${authored[0].title} course — the authored learning path. Brochure modules beyond that course are not teachable here yet.`
  }
  if (authored.length) {
    return `What you can study today is ${authored.map((item) => item.title).join(" and ")}. Other linked listings are thinner than Data Analytics. Brochure topics such as machine learning are not taught yet.`
  }
  if (linked.length) {
    return "This programme enrols you into a thinner catalogue course. It is not as complete as Data Analytics."
  }
  return "There is no linked LMS course for this programme yet."
}
