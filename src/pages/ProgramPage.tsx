import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import { CourseThumb, HarborDeskWorkspace, NorthwindWorkspace } from "../components/product/ProductLanguage"
import { programs } from "../data"
import { isProgramEnrollable } from "../lib/catalog-api"
import { courseProductProfile } from "../lib/course-product"
import { programmeAfterEnrolCopy, programmePublicView } from "../lib/catalog-maturity"
import {
  PROGRAMME_ENROLMENT_FACTS,
  PROGRAMME_WORK_SURFACES,
  programmeDiscoveryFor,
  type ProgrammeDiscoveryCard,
} from "../lib/programme-discovery"
import { useCatalogProgram } from "../hooks/useCatalog"
import "./Catalog.css"

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
  const program = programs.find((item) => item.slug === slug)
  const catalog = useCatalogProgram(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const narrow = useDetailNarrow()
  const discovery = programmeDiscoveryFor(slug)

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

  const view = programmePublicView(program)
  const linkedFromApi = catalog.data?.linkedCourseSlugs ?? view.linked.map((item) => item.slug)
  const enrollable = catalog.data ? isProgramEnrollable(catalog.data) : view.enrollOpen
  const comingLater = view.maturity === "coming_later"
  const afterEnrol = programmeAfterEnrolCopy(view)
  const cta = comingLater
    ? "Coming later"
    : enrollable
      ? view.ctaLabel
      : catalog.loading
        ? "Checking availability…"
        : "Enrolment unavailable"

  function openEnrol() {
    if (comingLater || !enrollable) return
    setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        {discovery ? (
          <AuthoredProgramme
            discovery={discovery}
            view={view}
            afterEnrol={afterEnrol}
            cta={cta}
            comingLater={comingLater}
            enrollable={enrollable}
            narrow={narrow}
            onEnrol={openEnrol}
          />
        ) : (
          <ListingProgramme
            view={view}
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
            price: view.listedPrice,
            enrollmentStatus: program.enrollmentStatus ?? "open",
            enrollable,
            linkedCourseSlugs: linkedFromApi,
          }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}

function AuthoredProgramme({
  discovery,
  view,
  afterEnrol,
  cta,
  comingLater,
  enrollable,
  narrow,
  onEnrol,
}: {
  discovery: ProgrammeDiscoveryCard
  view: ReturnType<typeof programmePublicView>
  afterEnrol: string
  cta: string
  comingLater: boolean
  enrollable: boolean
  narrow: boolean
  onEnrol: () => void
}) {
  const surfaces = PROGRAMME_WORK_SURFACES.filter(
    (surface) => discovery.visual === "northwind" || surface.id !== "lab",
  )

  return (
    <>
      <section className="cat-hero pd-hero" aria-labelledby="pd-title">
        <div className="cat-rail pd-hero-grid">
          <div className="pd-hero-copy">
            <Link className="cat-back" to="/programs">
              ← Programmes
            </Link>
            <p className="cat-label">Professional Certificate</p>
            <h1 id="pd-title">{discovery.title}</h1>
            <p className="cat-lead">{discovery.decisionLine}</p>

            <dl className="pd-facts">
              <div>
                <dt>Taught now</dt>
                <dd>
                  {discovery.taughtModules} modules · {discovery.taughtLessons} lessons
                </dd>
              </div>
              <div>
                <dt>Practice</dt>
                <dd>
                  {discovery.taughtQuizzes} checks · {discovery.taughtAssignments} assignments
                </dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd>{discovery.level}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{discovery.format}</dd>
              </div>
            </dl>

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
              <Link className="cat-btn cat-btn-ghost" to={discovery.courseHref}>
                View {discovery.courseTitle} course
              </Link>
            </div>

            {view.listedPrice > 0 ? (
              <p className="cat-honesty">
                Listed price ₹{view.listedPrice.toLocaleString("en-IN")}. Payment is not collected in this
                pilot. A certificate is not issued yet.
              </p>
            ) : (
              <p className="cat-honesty">Payment is not collected. A certificate is not issued in this pilot.</p>
            )}
            <p className="cat-fine">{discovery.honesty}</p>
          </div>

          <div className="pd-hero-specimen">
            <p className="pd-specimen-caption">The work this programme produces</p>
            {discovery.visual === "harbor-desk" ? (
              <HarborDeskWorkspace compact={narrow} meta="harbor-desk-case.md · 4 interviews" />
            ) : (
              <NorthwindWorkspace compact />
            )}
            {discovery.capstone ? (
              <p className="pd-specimen-attr">
                <span>You produce</span>
                <strong>{discovery.capstone}</strong>
                <em>
                  against <code>{discovery.material}</code>
                </em>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="cat-band" aria-labelledby="pd-path-title">
        <div className="cat-rail pd-path">
          <div>
            <p className="cat-label">How the work develops</p>
            <h2 id="pd-path-title">The taught path, in order.</h2>
            <p className="cat-fine">
              These are the modules that exist in the linked course today. Brochure length is longer; the extra
              modules are not taught here yet.
            </p>
          </div>
          <div className="pd-path-col">
            <ol className="pg-programme-modules pd-modules">
              {discovery.modules.map((module) => (
                <li key={module.id}>
                  <span className="pg-programme-modules-num">{String(module.index).padStart(2, "0")}</span>
                  <span className="pg-programme-modules-body">
                    <strong>{module.title}</strong>
                    <em>{module.countsLabel}</em>
                  </span>
                </li>
              ))}
            </ol>
            {discovery.capstone ? (
              <p className="pg-programme-path-end pd-path-end">
                <span>Ends in</span>
                {discovery.capstone}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {view.taughtOutcomes.length > 0 ? (
        <section className="cat-section" aria-labelledby="pd-learn-title">
          <div className="cat-rail">
            <p className="cat-label">What you will learn now</p>
            <h2 id="pd-learn-title">Capabilities from the live linked course.</h2>
            <p className="cat-fine">
              Taken from the {discovery.courseTitle} outcomes. Not from brochure modules that are not taught yet.
            </p>
            <ul className="pd-outcomes">
              {view.taughtOutcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="cat-band" aria-labelledby="pd-os-title">
        <div className="cat-rail">
          <p className="cat-label">Inside Skylent OS</p>
          <h2 id="pd-os-title">Where the work happens.</h2>
          <p className="cat-fine">
            Enrolment opens {discovery.courseTitle} in the same workspace as the student dashboard. There is no
            separate taught programme, cohort, or live classroom.
          </p>
          <div className="pd-surfaces">
            {surfaces.map((surface) => (
              <article key={surface.id}>
                <strong>{surface.label}</strong>
                <p>{surface.detail}</p>
                {surface.learnerOnly ? <span>Opens after you enrol</span> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cat-section" aria-labelledby="pd-evidence-title">
        <div className="cat-rail pd-evidence">
          <div>
            <p className="cat-label">Your evidence</p>
            <h2 id="pd-evidence-title">Keep the work. Carry it into Career OS.</h2>
            <p className="cat-lead">
              The finished {discovery.capstone ?? "capstone"} lives in your workspace. You can add it to Career OS
              as a work sample attached to your profile. Career OS is a workspace for that evidence — not a
              placement service.
            </p>
            <Link className="cat-text-link" to="/career-os">
              How Career OS holds evidence →
            </Link>
          </div>
        </div>
      </section>

      <section className="cat-band" aria-labelledby="pd-enrol-title">
        <div className="cat-rail">
          <p className="cat-label">Before you enrol</p>
          <h2 id="pd-enrol-title">What enrolment actually does.</h2>
          <ul className="pd-enrol-list">
            {PROGRAMME_ENROLMENT_FACTS.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <p className="cat-fine">{afterEnrol}</p>
        </div>
      </section>

      <section className="cat-final">
        <div className="cat-rail">
          <div className="cat-final-card">
            <div>
              <h2>{comingLater ? "This programme is not open yet" : "Start this programme"}</h2>
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

function ListingProgramme({
  view,
  afterEnrol,
  cta,
  comingLater,
  enrollable,
  onEnrol,
}: {
  view: ReturnType<typeof programmePublicView>
  afterEnrol: string
  cta: string
  comingLater: boolean
  enrollable: boolean
  onEnrol: () => void
}) {
  return (
    <>
      <section className="cat-hero pd-listing" aria-labelledby="pd-title">
        <div className="cat-rail">
          <Link className="cat-back" to="/programs">
            ← Programmes
          </Link>
          <p className="cat-label">Programme listing</p>
          <h1 id="pd-title">{view.title}</h1>
          <p className="cat-lead">{view.summary}</p>
          <p className="cat-statline">
            <span className="cat-mark">{view.maturityLabel}</span>
            {view.linked[0] ? (
              <span>Linked course: {view.linked[0].title}</span>
            ) : (
              <span>No linked LMS course yet</span>
            )}
          </p>
          <p className="cat-note">{view.honesty}</p>
          {view.linked[0] ? (
            <Link className="cat-link" to={view.linked[0].to}>
              <CourseThumb
                authored={view.linked[0].authored}
                visual={courseProductProfile(view.linked[0].slug)?.visual ?? "northwind"}
              />
              <div>
                <span className={view.linked[0].authored ? "cat-mark cat-mark-ready" : "cat-mark"}>
                  {view.linked[0].maturityLabel}
                </span>
                <p className="cat-link-title">{view.linked[0].title}</p>
                <p>
                  {view.linked[0].authored
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
            {view.linked[0] ? (
              <Link className="cat-btn cat-btn-ghost" to={view.linked[0].to}>
                View {view.linked[0].title}
              </Link>
            ) : (
              <Link className="cat-btn cat-btn-ghost" to="/courses">
                Explore courses
              </Link>
            )}
          </div>
          {view.listedPrice > 0 && !comingLater ? (
            <p className="cat-honesty">
              Listed price ₹{view.listedPrice.toLocaleString("en-IN")}. Payment is not collected in this
              pilot. A certificate is not issued yet.
            </p>
          ) : (
            <p className="cat-honesty">Payment is not collected. A certificate is not issued in this pilot.</p>
          )}
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
