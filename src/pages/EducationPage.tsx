/**
 * Education landing: the degree listing, split by delivery mode.
 *
 *   /education                → both groups, each under its own heading
 *   /education?mode=online    → online degrees only
 *   /education?mode=campus    → on-campus degrees only
 *
 * Cards come only from listDegrees() (src/lib/degrees.ts). Degrees are not in the backend, so
 * every card is a sample listing and says so. Nothing here names a university, a fee or a date.
 *
 * The two modes are kept visibly apart: online degrees sit on the navy stage beside the
 * learning-environment plate, on-campus degrees sit on white behind a photograph.
 */
import { useEffect } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { SectionIndex, SpecSheet, TruthChip, type TruthState } from "../components/skylent/primitives"
import { Reveal } from "../components/skylent/Reveal"
import { AUTHORED_COURSE_SLUGS } from "../lib/authored-courses"
import {
  degreeLevelName,
  degreeListingPath,
  degreePath,
  deliveryModeFromParam,
  deliveryModeLabel,
  listDegrees,
  type Degree,
  type DeliveryMode,
} from "../lib/degrees"
import { ACADEMIC_LINES, EDUCATION_HASH_REDIRECTS } from "../lib/product-architecture"
import { truthOf } from "../lib/truth"
import { ClosingBand, DegreeCrumb, DegreeShell, LearningWeek, ListingChips, Photo, QuietLink, Unpublished } from "./education/DegreeParts"
import { campusCardPhotoFor } from "./education/degreeStandIns"

const MODES: DeliveryMode[] = ["ONLINE", "CAMPUS"]

const GROUP_COPY: Record<DeliveryMode, { heading: string; side: string; empty: string }> = {
  ONLINE: {
    heading: "Online degrees",
    side: "Studied on screen. Live sessions, recordings, reading and assessed work sit in one online learning environment.",
    empty: "No online degrees are listed yet.",
  },
  CAMPUS: {
    heading: "On-campus degrees",
    side: "Attended in person. Lectures, labs and tutorials happen at the institution that awards the degree.",
    empty: "No on-campus degrees are listed yet.",
  },
}

/** The degree listing above replaces the old undergraduate line; the other lines keep their own pages. */
const OTHER_LINES = ACADEMIC_LINES.filter((line) => line.id !== "undergraduate")

function degreeFacts(degree: Degree) {
  return [
    { label: "Level", value: degreeLevelName(degree.level) },
    { label: "Area", value: degree.discipline },
    { label: "Awarded by", value: degree.institution?.name ?? <Unpublished /> },
  ]
}

/** One online listing as a ruled row. The interface plate is shown once for the whole group, not once per degree. */
function OnlineRow({ degree }: { degree: Degree }) {
  return (
    <article className="dg-online__row">
      <div className="dg-listing">
        <ListingChips degree={degree} showStatus />
      </div>
      <h3 className="dg-card__title">
        <Link to={degreePath(degree)}>{degree.title}</Link>
      </h3>
      <SpecSheet className="dg-card__facts" rows={degreeFacts(degree)} />
      <div className="dg-card__foot">
        <QuietLink to={degreePath(degree)}>
          View pathway<span className="sr-only">: {degree.title}</span>
        </QuietLink>
      </div>
    </article>
  )
}

function CampusCard({ degree }: { degree: Degree }) {
  return (
    <article className="dg-campus-card">
      <Photo asset={campusCardPhotoFor(degree)} className="dg-campus-card__photo" plain />
      <div className="dg-campus-card__body">
        <div className="dg-listing">
          <ListingChips degree={degree} showStatus />
        </div>
        <h3 className="dg-card__title">
          <Link to={degreePath(degree)}>{degree.title}</Link>
        </h3>
        <SpecSheet
          className="dg-card__facts"
          rows={[...degreeFacts(degree), { label: "Location", value: degree.location?.city ?? <Unpublished /> }]}
        />
        <div className="dg-card__foot">
          <QuietLink to={degreePath(degree)}>
            View pathway<span className="sr-only">: {degree.title}</span>
          </QuietLink>
        </div>
      </div>
    </article>
  )
}

export default function EducationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = deliveryModeFromParam(params.get("mode"))

  useEffect(() => {
    const id = location.hash.replace("#", "")
    const target = EDUCATION_HASH_REDIRECTS[id]
    if (target) navigate(target, { replace: true })
  }, [location.hash, navigate])

  const all = listDegrees()
  const shownModes = mode ? [mode] : MODES
  const index = (n: number) => String(n).padStart(2, "0")
  /* Enrolment is real only for courses with authored content; that registry decides this chip. */
  const courses: TruthState = AUTHORED_COURSE_SLUGS.length > 0 ? "live" : "development"

  return (
    <DegreeShell>
      <section className="sky-container dg-land">
        <div className="dg-land__row">
          <div className="dg-land__main">
            <div className="cine-in cine-in--fade">
              <DegreeCrumb />
            </div>
            <h1 className="dg-h1 cine-in cine-d1">
              Degrees, <em>online or on campus.</em>
            </h1>
            <p className="dg-lead cine-in cine-d2">
              A degree is studied on screen or attended in person, and the two are listed apart. These are sample listings by
              degree area: no institution is confirmed, so none of them can be applied for yet.
            </p>
          </div>
          <nav className="dg-land__switch cine-in cine-d3" aria-label="Show degrees by delivery mode">
            <span className="sky-label">Show</span>
            <div className="dg-switch">
              <Link to={degreeListingPath()} aria-current={mode ? undefined : "true"}>
                All <span>{all.length}</span>
              </Link>
              {MODES.map((m) => (
                <Link key={m} to={degreeListingPath(m)} aria-current={mode === m ? "true" : undefined}>
                  {deliveryModeLabel(m)} <span>{all.filter((d) => d.deliveryMode === m).length}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <div id="degrees">
        {shownModes.map((m, i) => {
          const degrees = all.filter((d) => d.deliveryMode === m)
          const copy = GROUP_COPY[m]
          const headingId = `dg-group-${m.toLowerCase()}`
          if (m === "ONLINE") {
            return (
              <section key={m} className="sky-stage sky-band-navy dg-group dg-group--online" aria-labelledby={headingId}>
                <div className="sky-container">
                  <div className="dg-onstage">
                    <div className="dg-onstage__lead cine-in cine-d4">
                      <SectionIndex n={index(i + 1)} label={deliveryModeLabel(m)} />
                      <h2 className="dg-h2" id={headingId}>
                        {copy.heading}
                      </h2>
                      <p className="dg-onstage__side">{copy.side}</p>
                      <p className="sky-label dg-onstage__count">
                        {degrees.length === 1 ? "1 sample listing" : `${degrees.length} sample listings`} · no institution confirmed
                      </p>
                    </div>
                    <Reveal as="figure" variant="plate" delay={120} className="dg-onstage__figure">
                      <div className="sky-stage__plate dg-stage__plate cine-plate cine-in cine-in--plate cine-d5">
                        <LearningWeek />
                      </div>
                      <figcaption className="sky-stage__caption">
                        <span>FIG. 01 · A study week in the online learning environment</span>
                        <span>Placeholder days and counts</span>
                      </figcaption>
                    </Reveal>
                  </div>

                  {degrees.length === 0 ? (
                    <div className="sky-empty dg-empty">
                      <p>{copy.empty}</p>
                    </div>
                  ) : (
                    <Reveal className="dg-online__list">
                      {degrees.map((degree) => (
                        <OnlineRow key={degree.slug} degree={degree} />
                      ))}
                    </Reveal>
                  )}
                </div>
              </section>
            )
          }
          return (
            <section key={m} className="sky-container dg-group dg-group--campus" aria-labelledby={headingId}>
              <div className="dg-head-row">
                <div className="dg-head-row__main">
                  <SectionIndex n={index(i + 1)} label={deliveryModeLabel(m)} />
                  <h2 className="dg-h2" id={headingId}>
                    {copy.heading}
                  </h2>
                </div>
                <p className="dg-head-row__side">{copy.side}</p>
              </div>

              {degrees.length === 0 ? (
                <div className="sky-empty dg-empty">
                  <p>{copy.empty}</p>
                </div>
              ) : (
                <div className="dg-campus-list">
                  {degrees.map((degree) => (
                    <Reveal key={degree.slug}>
                      <CampusCard degree={degree} />
                    </Reveal>
                  ))}
                </div>
              )}
            </section>
          )
        })}
        <div className="sky-container">
          <p className="dg-note dg-sample-note">
            Sample listings by degree area. Partner confirmation is pending, so university names and degree titles are not
            published. A degree is always awarded by the partner institution, not by Skylent.
          </p>
        </div>
      </div>

      <section className="sky-band-proof dg-band" aria-labelledby="dg-other-lines">
        <Reveal className="sky-container dg-band__inner dg-two">
          <div className="dg-two__lead">
            <SectionIndex n={index(shownModes.length + 1)} label="Other education areas" />
            <h2 className="dg-h2 dg-h2--sm" id="dg-other-lines">
              Schooling, postgraduate study and exams.
            </h2>
            <p>
              Each area has its own academic model and its own page. They are specified, not open: there are no classes, faculty
              or results to show, so none are shown.
            </p>
          </div>
          <div className="dg-two__main">
            <ul className="dg-lines dg-rows">
              {OTHER_LINES.map((line) => (
                <li key={line.id}>
                  <Link to={line.to}>
                    <b>{line.label}</b>
                    <span className="dg-lines__job">{line.job}</span>
                    <span className="dg-lines__who">{line.audience}</span>
                    <TruthChip state="soon" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="sky-container dg-adds" aria-labelledby="dg-start-now">
        <div className="dg-head-row">
          <div className="dg-head-row__main">
            <SectionIndex n={index(shownModes.length + 2)} label="Open today" />
            <h2 className="dg-h2" id="dg-start-now">
              What you can start now.
            </h2>
          </div>
          <p className="dg-head-row__side">
            Degrees are not open yet. Two written courses are, and Find My Path helps you choose between a degree and a skill
            programme.
          </p>
        </div>
        <div className="dg-adds__grid">
          <div className="dg-add">
            <TruthChip state={truthOf("findMyPath")} />
            <h3 className="dg-h3">Find My Path</h3>
            <p>Answer a few questions and see which route fits: a campus degree, an online degree or a skill programme.</p>
            <QuietLink to="/path">Find my path</QuietLink>
          </div>
          <div className="dg-add">
            <TruthChip state={courses} />
            <h3 className="dg-h3">Data Analytics</h3>
            <p>A written Skylent course, open to enrol today.</p>
            <QuietLink to="/courses/data-analytics">Open the course</QuietLink>
          </div>
          <div className="dg-add">
            <TruthChip state={courses} />
            <h3 className="dg-h3">Product Management</h3>
            <p>A written Skylent course, open to enrol today.</p>
            <QuietLink to="/courses/product-management">Open the course</QuietLink>
          </div>
        </div>
      </Reveal>

      <ClosingBand
        label="Next step · Choose"
        title="Not sure which route fits? Start with your path."
        secondary={{ to: "/programmes", label: "Explore programmes" }}
      />
    </DegreeShell>
  )
}
