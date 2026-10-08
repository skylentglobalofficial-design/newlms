/**
 * Campus degree detail: /education/campus/:slug  (approved design: CampusDegree)
 * It looks physical on purpose: photographs lead and there are no product plates.
 * Every photograph is a stand-in until an institution supplies its own, and every fact the
 * record does not carry reads "Published by the institution".
 */
import { Link } from "react-router-dom"
import { ArrowRight, SectionIndex, TruthChip, type TruthState } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { AUTHORED_COURSE_SLUGS } from "../../lib/authored-courses"
import { degreeLevelName, deliveryModeLabel, type Degree } from "../../lib/degrees"
import { truthOf } from "../../lib/truth"
import { DegreeEnquiry } from "./DegreeEnquiry"
import { ClosingBand, DegreeCrumb, DegreeShell, ListingChips, Photo, QuietLink, Unpublished, orUnpublished } from "./DegreeParts"
import { campusGalleryFor, campusHeroFor } from "./degreeStandIns"

/** Layout sample used only while a record has no curriculum. It names no subject and no number of years. */
const EMPTY_YEARS: { label: string; study: string; taught: string }[] = [
  { label: "First year", study: "Subjects published by the institution", taught: "Weekly lectures, labs and tutorials published by the institution" },
  { label: "Later years", study: "Subjects published by the institution", taught: "Weekly lectures, labs and tutorials published by the institution" },
  { label: "Final year", study: "Subjects published by the institution", taught: "Project or placement, if the institution includes one" },
]

export default function CampusDegreeView({ degree }: { degree: Degree }) {
  const level = degreeLevelName(degree.level)
  const hero = campusHeroFor(degree)
  const [leadPhoto, ...sidePhotos] = campusGalleryFor(degree, hero)
  const place = degree.institution
    ? [degree.institution.name, degree.location?.city].filter(Boolean).join(", ")
    : undefined
  /* Enrolment is real only for courses with authored content; that registry decides this chip. */
  const programmes: TruthState = AUTHORED_COURSE_SLUGS.length > 0 ? "live" : "development"
  const evidence = truthOf("projectsAndEvidence")

  return (
    <DegreeShell>
      {/* Title block: the listing, stated plainly */}
      <section className="sky-container dg-title">
        <div className="dg-title__row">
          <div className="dg-title__main">
            <DegreeCrumb mode={degree.deliveryMode} />
            <div className="dg-chips">
              <ListingChips degree={degree} />
            </div>
            <h1 className="dg-h1 dg-h1--campus">{degree.title}</h1>
            <p className="dg-lead">
              A degree you attend in person, taught on campus by the institution that awards it.
              {degree.sample ? ` This is a sample listing for the ${degree.discipline} area.` : null}
              {degree.institution ? null : " The institution's name, place and dates appear here once it is confirmed."}
            </p>
            <div className="dg-actions">
              <Link to="#taught" className="sk-btn sk-btn-primary">
                View pathway
                <ArrowRight />
              </Link>
              <QuietLink to="/path">Find my path</QuietLink>
            </div>
          </div>

          <dl className="dg-title__facts sky-spec" aria-label="About this listing">
            <div className="sky-label dg-title__factshead">This listing</div>
            {degree.status === "coming_soon" ? (
              <div className="sky-spec__row">
                <dt className="sky-spec__label">Listing</dt>
                <dd className="sky-spec__value">
                  <TruthChip state="soon" />
                </dd>
              </div>
            ) : null}
            <div className="sky-spec__row">
              <dt className="sky-spec__label">Discipline</dt>
              <dd className="sky-spec__value">{degree.discipline}</dd>
            </div>
            <div className="sky-spec__row">
              <dt className="sky-spec__label">Awarded by</dt>
              <dd className="sky-spec__value">{orUnpublished(degree.institution?.awardingBody ?? degree.institution?.name)}</dd>
            </div>
            {degree.sample ? (
              <div className="dg-note">Partner confirmation is pending. University names and degree titles are not yet published.</div>
            ) : null}
          </dl>
        </div>
      </section>

      {/* Lead photograph: the campus leads */}
      <div className="sky-container dg-lead-photo">
        <Photo asset={hero} fig="FIG. 01" aside={place} eager />
      </div>

      {/* 01 The degree sheet and the location panel */}
      <Reveal as="section" className="sky-container dg-degree" aria-label="Degree facts and location">
        <div className="dg-degree__row">
          <div className="dg-degree__main">
            <SectionIndex n="01" label="The degree" />
            <dl className="dg-sheet dg-rows">
              <div>
                <dt>Mode</dt>
                <dd>
                  <b>{deliveryModeLabel(degree.deliveryMode)}</b>
                  <span>In person, at the institution's campus</span>
                </dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd>
                  <b>{level}</b>
                  <span>Awarded by the partner institution, not by Skylent</span>
                </dd>
              </div>
              <div>
                <dt>Discipline</dt>
                <dd>
                  <b>{degree.discipline}</b>
                  <span>The degree area of this listing</span>
                </dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>
                  {degree.duration ? <b>{degree.duration}</b> : <Unpublished />}
                  <span>Years of full-time study</span>
                </dd>
              </div>
              <div>
                <dt>Intake</dt>
                <dd>
                  {degree.intake ? <b>{degree.intake}</b> : <Unpublished />}
                  <span>When a new cohort starts on campus</span>
                </dd>
              </div>
              <div>
                <dt>Eligibility</dt>
                <dd>
                  {degree.eligibility ? <b>{degree.eligibility}</b> : <Unpublished />}
                  <span>What you need before you can apply</span>
                </dd>
              </div>
              <div>
                <dt>Residence</dt>
                <dd>
                  {degree.residence ? <b>{degree.residence}</b> : <Unpublished />}
                  <span>Whether rooms are on or near campus</span>
                </dd>
              </div>
            </dl>
            <p className="dg-note">
              Mode, level and discipline come from the {degree.sample ? "sample " : ""}listing. Every other row is published by the
              institution and stays empty until then.
            </p>
          </div>

          <aside className="dg-panel sky-panel-proof" aria-label="Location">
            <div className="sky-label">Location</div>
            {degree.location?.city ? (
              <div className="dg-panel__place">
                {[degree.location.city, degree.location.country].filter(Boolean).join(", ")}
              </div>
            ) : (
              <div className="dg-panel__place dg-unpub">City published by the institution</div>
            )}
            <dl>
              <div>
                <dt>Campus address</dt>
                <dd>{orUnpublished(degree.location?.campusAddress)}</dd>
              </div>
              <div>
                <dt>Getting there</dt>
                <dd>{orUnpublished(degree.location?.gettingThere)}</dd>
              </div>
              <div>
                <dt>Visiting</dt>
                <dd>{orUnpublished(degree.location?.visiting)}</dd>
              </div>
            </dl>
            <p className="dg-note">Location details come from the institution. No map is shown until an address is published.</p>
          </aside>
        </div>
      </Reveal>

      {/* 02 The campus: photographs carry the section */}
      <Reveal as="section" id="campus" className="sky-container dg-section">
        <div className="dg-head-row">
          <div className="dg-head-row__main">
            <SectionIndex n="02" label="The campus" />
            <h2 className="dg-h2">Where the degree happens.</h2>
          </div>
          <p className="dg-head-row__side">
            A campus degree is spent in real rooms. These frames mark what the institution's own photographs will show.
          </p>
        </div>
        {leadPhoto ? (
          <div className="dg-gallery">
            <Photo asset={leadPhoto} fig="FIG. 02" className="dg-gallery__lead" />
            {sidePhotos.length > 0 ? (
              <div className="dg-gallery__side">
                {sidePhotos.map((asset, i) => (
                  <Photo key={asset.src} asset={asset} fig={`FIG. ${String(i + 3).padStart(2, "0")}`} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Reveal>

      {/* 03 How you are taught: warm editorial band */}
      <section id="taught" className="sky-band-proof dg-band">
        <Reveal className="sky-container dg-band__inner">
          <div className="dg-taught">
            <div className="dg-taught__lead">
              <SectionIndex n="03" label="How you are taught" />
              <h2 className="dg-h2">In a room, by a lecturer, on a timetable.</h2>
              <p>
                Lectures, labs and tutorials happen in person. The institution sets the curriculum, the timetable and the assessment,
                and awards the degree.
              </p>
            </div>

            <div className="dg-taught__main">
              <h3 className="dg-h3">The programme by year</h3>
              <div className="dg-table-wrap">
                <table className="dg-table dg-years">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: "21%" }}>Year</th>
                      <th scope="col" style={{ width: "37%" }}>What you study</th>
                      <th scope="col">How it is taught</th>
                    </tr>
                  </thead>
                  <tbody>
                    {degree.curriculum && degree.curriculum.length > 0
                      ? degree.curriculum.map((stage) => (
                          <tr key={stage.label}>
                            <th scope="row">{stage.label}</th>
                            <td>{stage.subjects.join(", ")}</td>
                            <td>{orUnpublished(stage.teaching)}</td>
                          </tr>
                        ))
                      : EMPTY_YEARS.map((row) => (
                          <tr key={row.label}>
                            <th scope="row">{row.label}</th>
                            <td>
                              <Unpublished>{row.study}</Unpublished>
                            </td>
                            <td>
                              <Unpublished>{row.taught}</Unpublished>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              <dl className="dg-taught__facts dg-rows">
                <div>
                  <dt>Calendar</dt>
                  <dd>
                    <Unpublished>Term or semester dates published by the institution</Unpublished>
                  </dd>
                </div>
                <div>
                  <dt>Assessment</dt>
                  <dd>
                    {degree.assessments?.length ? (
                      degree.assessments.join(", ")
                    ) : (
                      <Unpublished>Examinations, coursework and project work published by the institution</Unpublished>
                    )}
                  </dd>
                </div>
              </dl>

              {degree.curriculum?.length ? null : (
                <p className="dg-monoline">
                  The curriculum is published by the institution. The rows above are a layout sample: the number of years follows
                  the institution's duration.
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* 04 What Skylent adds: the only product language on the page */}
      <Reveal as="section" id="adds" className="sky-container dg-adds">
        <div className="dg-head-row">
          <div className="dg-head-row__main">
            <SectionIndex n="04" label="What Skylent adds" />
            <h2 className="dg-h2">Three things beside the degree.</h2>
          </div>
          <p className="dg-head-row__side">
            The institution teaches and awards the degree. Skylent's part is smaller, and only some of it exists today.
          </p>
        </div>

        <div className="dg-adds__grid">
          <div className="dg-add">
            <TruthChip state={truthOf("findMyPath")} />
            <h3 className="dg-h3">Find My Path</h3>
            <p>Use it before you choose a route: a campus degree, an online degree, or a skill programme.</p>
            <QuietLink to="/path">Find my path</QuietLink>
          </div>
          <div className="dg-add">
            <TruthChip state={programmes} />
            <h3 className="dg-h3">Skill programmes alongside a degree</h3>
            <p>Data Analytics and Product Management are open to enrol today. The other programmes are still in development.</p>
            <QuietLink to="/programmes">Explore programmes</QuietLink>
          </div>
          <div className="dg-add">
            <TruthChip state={evidence} />
            <h3 className="dg-h3">Career OS evidence for degree work</h3>
            <p>Career OS records projects from Skylent programmes as evidence. Degree coursework is not connected yet.</p>
            <span className="dg-monoline">No action yet</span>
          </div>
        </div>
      </Reveal>

      <DegreeEnquiry degree={degree} index="05" ruled />

      <ClosingBand
        label={`Next step · Choose${degree.sample ? " · Sample listing" : ""}`}
        title="See where a campus degree sits on your path."
        secondary={{ to: "/education", label: "Explore degrees" }}
      />
    </DegreeShell>
  )
}
