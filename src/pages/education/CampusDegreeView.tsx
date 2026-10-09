/**
 * Campus degree detail: /education/campus/:slug  (approved design: CampusDegree)
 * It looks physical on purpose: photographs lead and there are no product plates.
 * Photographs are generic until an institution supplies its own (they are never captioned as a
 * particular campus), and every fact the record does not carry reads "Shared when admissions open".
 */
import { Link } from "react-router-dom"
import { ArrowRight, SectionIndex } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { degreeLevelName, deliveryModeLabel, type Degree } from "../../lib/degrees"
import { DegreeEnquiry } from "./DegreeEnquiry"
import { ClosingBand, DegreeCrumb, DegreeShell, ListingChips, Photo, QuietLink, Unpublished, orUnpublished } from "./DegreeParts"
import { campusGalleryFor, campusHeroFor } from "./degreeStandIns"

/** Layout sample used only while a record has no curriculum. It names no subject and no number of years. */
const EMPTY_YEARS: { label: string; study: string; taught: string }[] = [
  { label: "First year", study: "Foundation subjects", taught: "Weekly lectures, labs and tutorials" },
  { label: "Later years", study: "Core and elective subjects", taught: "Lectures, labs, tutorials and group work" },
  { label: "Final year", study: "Specialisation", taught: "A final project, or a placement where offered" },
]

export default function CampusDegreeView({ degree }: { degree: Degree }) {
  const level = degreeLevelName(degree.level)
  const hero = campusHeroFor(degree)
  const [leadPhoto, ...sidePhotos] = campusGalleryFor(degree, hero)

  return (
    <DegreeShell>
      {/* Title block: the listing, stated plainly */}
      <section className="sky-container dg-title">
        <div className="dg-title__row">
          <div className="dg-title__main">
            <div className="cine-in cine-in--fade">
              <DegreeCrumb mode={degree.deliveryMode} />
            </div>
            <div className="dg-chips cine-in cine-in--fade cine-d1">
              <ListingChips degree={degree} />
            </div>
            <h1 className="dg-h1 dg-h1--campus cine-in cine-d1">{degree.title}</h1>
            <p className="dg-lead cine-in cine-d2">
              A degree you attend in person, taught on campus by the institution that awards it.
              {degree.institution ? null : " Campus, dates and fees are shared when admissions open."}
            </p>
            <div className="dg-actions cine-in cine-d3">
              <Link to="#taught" className="sk-btn sk-btn-primary">
                View pathway
                <ArrowRight />
              </Link>
              <QuietLink to="#ask">Ask about this degree</QuietLink>
            </div>
          </div>

          <dl className="dg-title__facts sky-spec cine-in cine-d4" aria-label="About this listing">
            <div className="sky-label dg-title__factshead">At a glance</div>
            <div className="sky-spec__row">
              <dt className="sky-spec__label">Admissions</dt>
              <dd className="sky-spec__value">Opening soon</dd>
            </div>
            <div className="sky-spec__row">
              <dt className="sky-spec__label">Discipline</dt>
              <dd className="sky-spec__value">{degree.discipline}</dd>
            </div>
            <div className="sky-spec__row">
              <dt className="sky-spec__label">Awarded by</dt>
              <dd className="sky-spec__value">{orUnpublished(degree.institution?.awardingBody ?? degree.institution?.name)}</dd>
            </div>

          </dl>
        </div>
      </section>

      {/* Lead photograph: the campus leads */}
      <div className="sky-container dg-lead-photo cine-in cine-in--plate cine-d5">
        <Photo asset={hero} eager />
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

          </div>

          <aside className="dg-panel sky-panel-proof" aria-label="Location">
            <div className="sky-label">Location</div>
            {degree.location?.city ? (
              <div className="dg-panel__place">
                {[degree.location.city, degree.location.country].filter(Boolean).join(", ")}
              </div>
            ) : (
              <div className="dg-panel__place dg-unpub">City shared when admissions open</div>
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
            <Photo asset={leadPhoto} className="dg-gallery__lead" />
            {sidePhotos.length > 0 ? (
              <div className="dg-gallery__side">
                {sidePhotos.map((asset, i) => (
                  <Photo key={asset.src} asset={asset} />
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
                    <Unpublished>Term or semester dates, shared when admissions open</Unpublished>
                  </dd>
                </div>
                <div>
                  <dt>Assessment</dt>
                  <dd>
                    {degree.assessments?.length ? (
                      degree.assessments.join(", ")
                    ) : (
                      <Unpublished>Examinations, coursework and project work</Unpublished>
                    )}
                  </dd>
                </div>
              </dl>

              {degree.curriculum?.length ? null : (
                <p className="dg-monoline">The full curriculum is shared when admissions open.</p>
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
          <p className="dg-head-row__side">The institution teaches and awards the degree. Skylent adds practical learning and a career profile beside it.</p>
        </div>

        <div className="dg-adds__grid">
          <div className="dg-add">
            <h3 className="dg-h3">Skill programmes alongside</h3>
            <p>Take a Skylent programme such as Data Analytics or Product Management while you study.</p>
            <QuietLink to="/programmes">Explore programmes</QuietLink>
          </div>
          <div className="dg-add">
            <h3 className="dg-h3">Labs and projects</h3>
            <p>Practise on realistic data and cases, and finish a capstone project you can show.</p>
            <QuietLink to="/programmes#professional">See professional programmes</QuietLink>
          </div>
          <div className="dg-add">
            <h3 className="dg-h3">A Career OS profile</h3>
            <p>Keep your education, projects and certificates together in one career profile.</p>
            <QuietLink to="/career-os">How Career OS works</QuietLink>
          </div>
        </div>
      </Reveal>

      <DegreeEnquiry degree={degree} index="05" ruled />

      <ClosingBand
        label="Next step"
        title="Not sure this degree fits? Ask Skylent AI."
        secondary={{ to: "/education", label: "Explore degrees" }}
      />
    </DegreeShell>
  )
}
