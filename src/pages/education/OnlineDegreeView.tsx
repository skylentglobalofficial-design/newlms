/**
 * Online degree detail: /education/online/:slug  (approved design: OnlineDegree)
 * It looks digital on purpose: the learning environment is drawn as product plates, the first
 * of them large on the navy stage, and the one photograph is a learner at a screen. No campus imagery.
 * Every plate is ILLUSTRATIVE: Skylent has no degree learning environment in production.
 */
import { Link } from "react-router-dom"
import { ArrowRight, Plate, SectionIndex, SpecSheet, TruthChip } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { degreeLevelName, deliveryModeLabel, type Degree } from "../../lib/degrees"
import { DegreeEnquiry } from "./DegreeEnquiry"
import {
  ClosingBand,
  DegreeCrumb,
  DegreeShell,
  ILLUSTRATIVE_WEEK,
  LearningWeek,
  ListingChips,
  Photo,
  QuietLink,
  Tick,
  Unpublished,
  orUnpublished,
} from "./DegreeParts"
import { ONLINE_STAND_IN } from "./degreeStandIns"

const FORMATS: { name: string; means: string }[] = [
  { name: "Live", means: "Everyone online at a set time." },
  { name: "Recorded", means: "Watched in your own time." },
  { name: "Self-study", means: "Reading and resources, unscheduled." },
  { name: "Assessed", means: "Submitted online by a deadline." },
]

const ASKS: { title: string; body: string }[] = [
  { title: "A regular weekly slot", body: "Live sessions and tutorials have set times. You keep them free." },
  { title: "A laptop and a stable connection", body: "Sessions, recordings and assessments are all on screen." },
  { title: "Time you plan yourself", body: "Recorded lectures and reading are not timetabled. Nobody schedules them for you." },
  { title: "Assessed work submitted online", body: "Deadlines are fixed and the work is handed in through the learning environment." },
]

const RESOURCES: { kind: string; name: string; note: string; state: "opened" | "today" | "unopened" }[] = [
  { kind: "Slides", name: "Monday session", note: "From the live session", state: "opened" },
  { kind: "Recording", name: "Tuesday lecture", note: "From the recorded lecture", state: "opened" },
  { kind: "Reading", name: "Core reading", note: "Set by the institution", state: "today" },
  { kind: "Reading", name: "Further reading", note: "Set by the institution", state: "unopened" },
  { kind: "Dataset", name: "Tutorial practice file", note: "For Thursday's tutorial", state: "unopened" },
]

export default function OnlineDegreeView({ degree }: { degree: Degree }) {
  const level = degreeLevelName(degree.level)
  const photo = degree.heroAsset ?? ONLINE_STAND_IN
  const opened = RESOURCES.filter((r) => r.state === "opened").length

  return (
    <DegreeShell>
      {/* Hero: the listing, stated at display scale */}
      <section className="sky-container dg-hero">
        <div className="cine-in cine-in--fade">
          <DegreeCrumb mode={degree.deliveryMode} />
        </div>
        <div className="dg-chips cine-in cine-in--fade cine-d1">
          <ListingChips degree={degree} />
        </div>
        <h1 className="dg-h1 cine-in cine-d1">{degree.title}</h1>
        <div className="dg-hero__row">
          <p className="dg-lead cine-in cine-d2">
            Live sessions, recorded lectures, reading and assessed work all happen in one online learning environment, so the
            week runs on a laptop and not on a campus.
            {degree.institution ? null : " Timetable, fees and entry details are shared once an institution is confirmed."}
          </p>
          <div className="dg-actions cine-in cine-d3">
            <Link to="#week" className="sk-btn sk-btn-primary">
              View pathway
              <ArrowRight />
            </Link>
            <QuietLink to="#ask">Ask about this degree</QuietLink>
          </div>
        </div>
        <div className="dg-hero__facts cine-in cine-in--fade cine-d4">
          <SpecSheet
            className="dg-rail"
            rows={[
              { label: "Mode", value: deliveryModeLabel(degree.deliveryMode) },
              { label: "Level", value: level },
              {
                label: "Listing",
                value: (
                  <span className="dg-listing">
                    <span>Not open yet</span>
                  </span>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* The online learning environment, large, on the navy stage; the degree facts beside it */}
      <section className="sky-stage sky-band-navy dg-stage" aria-label="Degree facts">
        <div className="sky-container dg-stage__inner">
          <Reveal as="figure" variant="plate" className="dg-stage__figure">
            <div className="sky-stage__plate dg-stage__plate cine-plate cine-in cine-in--plate cine-d5">
              <LearningWeek />
            </div>
            <figcaption className="sky-stage__caption">
              <span>A week in the online learning environment</span>
            </figcaption>
          </Reveal>

          <Reveal delay={160} className="dg-stage__facts">
            <SectionIndex n="01" label="The degree" />
            <dl className="dg-stagefacts">
              <div>
                <dt>Mode</dt>
                <dd className="dg-stagefacts__value">{deliveryModeLabel(degree.deliveryMode)}</dd>
                <dd className="dg-stagefacts__sub">Studied on screen</dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd className="dg-stagefacts__value">{level}</dd>
                <dd className="dg-stagefacts__sub">Awarded by the institution</dd>
              </div>
              <div>
                <dt>Discipline</dt>
                <dd className="dg-stagefacts__value">{degree.discipline}</dd>
                <dd className="dg-stagefacts__sub">Degree area</dd>
              </div>
              <div>
                <dt>Pacing</dt>
                <dd className="dg-stagefacts__unpub">{orUnpublished(degree.learningMode?.pacing)}</dd>
              </div>
              <div>
                <dt>Live sessions</dt>
                <dd className="dg-stagefacts__unpub">{orUnpublished(degree.learningMode?.liveSessions)}</dd>
              </div>
              <div>
                <dt>Assessment</dt>
                <dd className="dg-stagefacts__unpub">{orUnpublished(degree.assessments?.join(", "))}</dd>
              </div>
            </dl>
            <p className="dg-note">A degree is awarded by an institution, not by Skylent. No institution is confirmed for this listing yet.</p>
          </Reveal>
        </div>
      </section>

      {/* 02 How a week works */}
      <Reveal as="section" id="week" className="sky-container dg-section">
        <div className="dg-split">
          <div className="dg-split__lead">
            <SectionIndex n="02" label="How a week works" />
            <h2 className="dg-h2">Some of the week has a set time. The rest you schedule.</h2>
            <p>
              Live sessions are attended together. Recorded lectures and reading fit around them, and assessed work is due against a
              deadline.
            </p>
            <dl className="dg-formats dg-rows">
              {FORMATS.map((f) => (
                <div key={f.name}>
                  <dt>{f.name}</dt>
                  <dd>{f.means}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="dg-split__main">
            <div className="dg-table-head">
              <span className="sky-label">Timetable · one study week</span>
              <TruthChip state="illustrative" />
            </div>
            <div className="dg-table-wrap">
              <table className="dg-table dg-tt">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "11%" }}>Day</th>
                    <th scope="col" style={{ width: "22%" }}>Time</th>
                    <th scope="col">Session</th>
                    <th scope="col" style={{ width: "19%" }}>Format</th>
                  </tr>
                </thead>
                <tbody>
                  {ILLUSTRATIVE_WEEK.map((s) => (
                    <tr key={s.day}>
                      <th scope="row">{s.day}</th>
                      <td className={`dg-tt__time${s.timing === "Own time" ? "" : " dg-tt__time--set"}`}>
                        <span>
                          <span className={`dg-key${s.timing === "Own time" ? "" : " dg-key--set"}`} aria-hidden="true" />
                          {s.timing}
                        </span>
                      </td>
                      <td className="dg-tt__session">
                        <b>{s.name}</b>
                        <span>{s.room}</span>
                      </td>
                      <td className="dg-tt__format">{s.format}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="dg-legend">
              <span>
                <span>
                  <span className="dg-key dg-key--set" aria-hidden="true" />
                  Set time or deadline
                </span>
                <span>
                  <span className="dg-key" aria-hidden="true" />
                  Your own time
                </span>
              </span>
              <span>Real days and times come from the institution.</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 03 The environment: warm band, three captioned plates */}
      <section className="sky-band-proof dg-band">
        <div className="sky-container dg-band__inner">
          <div className="dg-head-row">
            <div className="dg-head-row__main">
              <SectionIndex n="03" label="The environment" />
              <h2 className="dg-h2">The classroom, the reading list and the exam, on one screen.</h2>
            </div>
            <p className="dg-head-row__side">
              These are designs for the learning environment an online degree would use. They are not screenshots of a live product.
            </p>
          </div>

          <div className="dg-env">
            {/* (a) Virtual classroom */}
            <Reveal variant="plate" className="dg-env__item">
            <Plate className="dg-mat--tight dg-stretch" caption="Virtual classroom">
              <div className="dg-plate-bar">
                <span className="sky-label">Classroom</span>
                <TruthChip state="illustrative" />
              </div>
              <div className="dg-room sky-on-navy">
                <div className="dg-room__top">
                  <span>Tutorial · Thu</span>
                  <span className="dg-room__live">
                    <i aria-hidden="true" />
                    In session
                  </span>
                </div>
                <div className="dg-slide" role="img" aria-label="Shared slide area with a title placeholder, four lines of text and a figure block">
                  <div className="dg-slide__label">Shared slide</div>
                  <div className="dg-slide__title">Slide shared by the tutor</div>
                  <div className="dg-slide__body">
                    <div className="dg-slide__lines">
                      <i style={{ width: "100%" }} />
                      <i style={{ width: "84%" }} />
                      <i style={{ width: "92%" }} />
                      <i style={{ width: "56%" }} />
                    </div>
                    <div className="dg-slide__block" />
                  </div>
                </div>
                <ul className="dg-people" aria-label="Participants">
                  <li className="is-tutor">
                    <b>T</b>
                    <span>Tutor</span>
                  </li>
                  <li className="is-you">
                    <b>Y</b>
                    <span>You</span>
                  </li>
                  <li>
                    <b>L</b>
                    <span>Learner</span>
                  </li>
                  <li className="is-more">
                    <b>+</b>
                    <span>more</span>
                  </li>
                </ul>
              </div>
              <div className="dg-questions">
                <div className="sky-label">Questions</div>
                <ul>
                  <li>
                    <span>Learner</span>Could you go back one slide?
                  </li>
                  <li>
                    <span>Tutor</span>Back on the previous slide now.
                  </li>
                  <li>
                    <span>You</span>Is this in Friday's assessment?
                  </li>
                </ul>
              </div>
            </Plate>
            </Reveal>

            {/* (b) Resources */}
            <Reveal variant="plate" delay={90} className="dg-env__item">
            <Plate className="dg-mat--tight dg-stretch" caption="Week resources">
              <div className="dg-plate-bar">
                <span className="sky-label">Resources</span>
                <TruthChip state="illustrative" />
              </div>
              <div className="dg-tabs" aria-hidden="true">
                <span className="is-on">All</span>
                <span>Reading</span>
                <span>Recording</span>
                <span>Slides</span>
                <span>Dataset</span>
              </div>
              <ul className="dg-res">
                {RESOURCES.map((r) => (
                  <li key={r.name} className={r.state === "today" ? "is-today" : undefined}>
                    <span className="dg-res__kind">{r.kind}</span>
                    <span className="dg-res__name">
                      <b>{r.name}</b>
                      <span>{r.note}</span>
                    </span>
                    {r.state === "opened" ? (
                      <Tick label="Opened" />
                    ) : r.state === "today" ? (
                      <span className="dg-res__today">
                        <span className="dg-dot" aria-hidden="true" />
                        Today
                      </span>
                    ) : (
                      <span className="dg-ring" role="img" aria-label="Not opened" />
                    )}
                  </li>
                ))}
              </ul>
              <div className="dg-res__foot">
                <span>
                  {opened} of {RESOURCES.length} opened
                </span>
                <div
                  className="dg-progress"
                  role="progressbar"
                  aria-label="Resources opened this week"
                  aria-valuemin={0}
                  aria-valuemax={RESOURCES.length}
                  aria-valuenow={opened}
                >
                  <span style={{ width: `${(opened / RESOURCES.length) * 100}%` }} />
                </div>
              </div>
            </Plate>
            </Reveal>

            {/* (c) Online assessment: neutral placeholder text, never a real-looking question */}
            <Reveal variant="plate" delay={180} className="dg-env__item">
            <Plate className="dg-mat--tight dg-stretch" caption="Online assessment">
              <div className="dg-plate-bar">
                <span className="sky-label">Assessment</span>
                <TruthChip state="illustrative" />
              </div>
              <div className="dg-exam__head sky-on-navy">
                <div className="dg-exam__meta">
                  <b>Attempt 1</b>
                  <span>Timed by the institution</span>
                </div>
                <div className="dg-exam__progress">
                  <div className="dg-progress" role="progressbar" aria-label="Position in the assessment" aria-valuemin={0} aria-valuemax={100} aria-valuenow={25}>
                    <span style={{ width: "25%" }} />
                  </div>
                  <span>Question 2</span>
                </div>
              </div>
              <div className="dg-exam__body">
                <div className="sky-label">Question 2 · Placeholder</div>
                <p className="dg-exam__q">The question set by the institution appears here.</p>
                <ul className="dg-exam__opts" aria-label="Answer options">
                  {["A", "B", "C", "D"].map((letter) => (
                    <li key={letter} className={letter === "B" ? "is-picked" : undefined} aria-current={letter === "B" ? "true" : undefined}>
                      <i aria-hidden="true" />
                      <span>{letter}</span>
                      Answer option {letter}
                    </li>
                  ))}
                </ul>
                <div className="dg-exam__foot" aria-hidden="true">
                  <span className="dg-exam__exit">Save and exit</span>
                  <span className="dg-exam__submit">
                    Submit
                    <ArrowRight />
                  </span>
                </div>
              </div>
            </Plate>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 04 One photograph and what online study asks */}
      <Reveal as="section" className="sky-container dg-section dg-section--end">
        <div className="dg-asks">
          <Photo asset={photo} className="dg-asks__photo" plain />
          <div className="dg-asks__main">
            <SectionIndex n="04" label="Before you choose" />
            <h2 className="dg-h2">What studying online asks of you.</h2>
            <ol className="dg-asks__list dg-rows">
              {ASKS.map((ask, i) => (
                <li key={ask.title}>
                  <span className="dg-asks__n">{String(i + 1).padStart(2, "0")}</span>
                  <div className="dg-asks__pair">
                    <b>{ask.title}</b>
                    <span>{ask.body}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="dg-note">
              Device and software requirements: {degree.tools?.length ? degree.tools.join(", ") : <Unpublished>shared once an institution is confirmed.</Unpublished>}
            </p>
          </div>
        </div>
      </Reveal>

      {/* 05 What you can prove: small warm proof row */}
      <section className="sky-band-proof">
        <div className="sky-container dg-band__inner dg-band__inner--sm">
          <div className="dg-prove">
            <div className="dg-prove__lead">
              <SectionIndex n="05" label="What you can prove" />
              <h2 className="dg-h2 dg-h2--sm">Your Career OS profile, alongside the degree.</h2>
              <p>The degree is awarded by the partner institution. Skylent programmes, labs and projects you take while you study are kept in Career OS.</p>
            </div>
            <dl className="dg-prove__rows dg-rows">
              <div>
                <dt>Education</dt>
                <dd>Add your degree to your career profile yourself, with your other education.</dd>
              </div>
              <div>
                <dt>Projects</dt>
                <dd>Projects from Skylent programmes are kept with their brief, files and reflection.</dd>
              </div>
              <div>
                <dt>Certificates</dt>
                <dd>Skylent course certificates carry a code anyone can check.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <DegreeEnquiry degree={degree} index="06" />

      <ClosingBand
        label="Next step"
        title="Not sure this degree fits? Ask Skylent AI."
        secondary={{ to: "/programmes", label: "Explore programmes" }}
      />
    </DegreeShell>
  )
}
