/**
 * Listing state for a programme with no authored material of its own.
 *
 * It prints what the catalogue API returned, says plainly what is and is not
 * taught, and offers the enrol action only when the backend can honour it (the
 * same decision ProgramPage has always made). It never shows another
 * programme's artefact: the figure, when there is one, is marked ILLUSTRATIVE.
 *
 * Layout: display title with the catalogue record as a ruled sheet beside it,
 * linked course module breakdown, then one navy stage that holds the figure and the next step.
 */
import { Link } from "react-router-dom"
import type { CatalogProgramDetail } from "../../lib/catalog-api"
import { courseBySlug } from "../../lib/catalog-maturity"
import { ArrowRight, SectionIndex, SpecSheet, TruthChip } from "../skylent/primitives"
import { Reveal } from "../skylent/Reveal"
import { ProgrammeThumb, programmeThumbInfo } from "./ProgrammeArtefacts"
import { plural, type ProgrammeTruth } from "./programme-truth"
import { effectiveProgrammePublicFacts } from "../../lib/public-catalogue-copy"
import { practiceNoteForProgramme } from "../../lib/practice-environments"
import "./ProfessionalProgrammeTemplate.css"
import { STATUS_NOT_CONFIRMED } from "./CatalogueNotice"

type Props = {
  program: CatalogProgramDetail
  truth: ProgrammeTruth
  cta: string
  honesty: string
  afterEnrol: string
  onEnrol: () => void
  confirmed?: boolean
}

function listingDescription(program: CatalogProgramDetail, truth: ProgrammeTruth): string | null {
  if (program.slug === "data-science-ai" && !truth.authored) {
    return "Listed as a data science direction. Machine learning teaching is not in the pathway yet."
  }
  return program.desc || null
}

export default function ProgrammeListing({ program, truth, cta, honesty, afterEnrol, onEnrol, confirmed = true }: Props) {
  const thumb = programmeThumbInfo(program.slug)
  const canEnrol = confirmed && truth.enrollable && truth.authored && !truth.comingLater
  const firstLinked = truth.linked[0]
  const facts = effectiveProgrammePublicFacts(program)
  const description = listingDescription({ ...program, desc: facts.desc }, truth)
  const primaryCourse = firstLinked ? courseBySlug(firstLinked.slug) : null

  return (
    <div className="pp-page pp-page--listing">
      <section className="sky-container pp-hero" aria-labelledby="pp-title">
        <nav className="sky-label pp-crumb" aria-label="Breadcrumb">
          <Link to="/programmes">Programmes</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{program.name}</span>
        </nav>
        <div className="pp-hero__grid pp-hero__grid--listing">
          <div className="pp-hero__main">
            <p className="pp-chips">
              {confirmed ? (
                <TruthChip
                  state={truth.state}
                  label={truth.state === "live" ? "Open" : truth.state === "soon" ? "Coming soon" : "In development"}
                />
              ) : (
                <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
              )}
            </p>
            <h1 id="pp-title" className="sky-display sky-display--lg pp-h1">
              {program.name}
            </h1>
            {description ? <p className="pp-lede">{description}</p> : null}
            <p className="pp-note pp-note--rule">{honesty}</p>
            <div className="pp-actions">
              {canEnrol ? (
                <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
                  {cta}
                  <ArrowRight />
                </button>
              ) : null}
              {firstLinked ? (
                <Link className="sk-btn sk-btn-secondary" to={firstLinked.to}>
                  View {firstLinked.title === program.name ? `${firstLinked.title} course` : firstLinked.title}
                </Link>
              ) : (
                <Link className="sk-btn sk-btn-secondary" to="/programmes">
                  All programmes
                </Link>
              )}
            </div>
            {canEnrol ? <p className="pp-note">{afterEnrol}</p> : null}
          </div>
          <div className="pp-hero__record">
            <p className="sky-label">At a glance</p>
            <SpecSheet
              className="pp-hero__spec"
              rows={[
                {
                  label: "Enrolment",
                  value: !confirmed
                    ? STATUS_NOT_CONFIRMED
                    : canEnrol
                      ? "Open"
                      : truth.comingLater
                        ? "Coming soon"
                        : truth.state === "development"
                          ? "In development"
                          : "Not open yet",
                },
                { label: "Format", value: facts.format },
                { label: "Access & fee", value: "Pilot access · Payment is not collected (No card required)" },
                { label: "Practice", value: practiceNoteForProgramme(program.slug) },
                { label: "Level", value: program.level },
                { label: "Length", value: program.duration },
                {
                  label: "Modules",
                  value:
                    facts.taughtModuleCount > 0
                      ? truth.linked.length > 0
                        ? `${plural(facts.taughtModuleCount, "module")} in the linked course ${truth.linked.length === 1 ? "outline" : "outlines"}`
                        : plural(facts.taughtModuleCount, "module")
                      : null,
                },
                {
                  label: truth.linked.length === 1 ? "Linked course" : "Linked courses",
                  value:
                    truth.linked.length > 0 ? (
                      <span className="pp-linked">
                        {truth.linked.map((item) => (
                          <span key={item.slug}>
                            <Link to={item.to}>{item.title}</Link>
                            {confirmed ? (
                              <TruthChip state={item.authored ? "live" : "development"} label={item.authored ? "Ready to start" : "In development"} />
                            ) : (
                              <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
                            )}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "Being prepared"
                    ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {primaryCourse && primaryCourse.modules.length > 0 ? (
        <Reveal as="section" className="sky-container pp-section" aria-labelledby="pp-linked-outline-title">
          <div className="pp-split">
            <div className="pp-split__intro">
              <SectionIndex n="01" label="Linked Course Outline" />
              <h2 id="pp-linked-outline-title" className="sky-display sky-display--md pp-h2">
                Modules in {primaryCourse.title}
              </h2>
              <p className="pp-body">
                Inspect the module structure for the linked course ({primaryCourse.modules.length} modules).{" "}
                {firstLinked?.authored
                  ? "This course is authored and ready to study on its own."
                  : "This course outline is in development."}
              </p>
              {firstLinked ? (
                <p style={{ marginTop: 14 }}>
                  <Link className="sk-btn sk-btn-secondary" to={firstLinked.to}>
                    Open {firstLinked.title} course page →
                  </Link>
                </p>
              ) : null}
            </div>
            <div className="pp-split__main">
              <ol className="pp-curriculum">
                {primaryCourse.modules.map((mod, idx) => (
                  <li key={mod.id} className="pp-mod">
                    <details open={idx === 0}>
                      <summary className="pp-mod__head">
                        <span className="pp-mod__n">Module {String(idx + 1).padStart(2, "0")}</span>
                        <span className="pp-mod__main">
                          <span className="pp-mod__title">{mod.title}</span>
                          <span className="pp-mod__meta">{mod.lessons.length} lessons &amp; checks</span>
                        </span>
                      </summary>
                      <ol className="pp-lessons">
                        {mod.lessons.map((lesson, lIdx) => (
                          <li key={lesson.id} className="pp-lesson">
                            <span className="pp-lesson__n">{idx + 1}.{lIdx + 1}</span>
                            <span className="pp-lesson__title">{lesson.title}</span>
                            <span className="pp-lesson__kind">{lesson.type}</span>
                            {lesson.duration ? <span className="pp-lesson__time">{lesson.duration}</span> : null}
                          </li>
                        ))}
                      </ol>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      ) : null}

      <section className="sky-stage sky-band-navy pp-next pp-next--listing" aria-labelledby="pp-next-title">
        <div className={`sky-container pp-listing-stage${thumb.hasArtefact ? "" : " pp-listing-stage--plain"}`}>
          {thumb.hasArtefact ? (
            <Reveal as="figure" variant="plate" className="pp-listing-stage__figure">
              <div className="sky-stage__plate pp-listing-stage__plate">
                <ProgrammeThumb program={program} />
              </div>
              <figcaption className="sky-stage__caption">
                <span>{thumb.caption}</span>
              </figcaption>
            </Reveal>
          ) : null}
          <Reveal className="pp-listing-stage__copy">
            <p className="sky-label">Next step</p>
            <h2 id="pp-next-title" className="sky-display sky-display--md pp-next__title">
              {!confirmed
                ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked.`
                : truth.comingLater
                ? "Enrolment is not open on this programme yet."
                : canEnrol
                  ? "Start with the course that is ready now."
                  : "This programme is being prepared."}
            </h2>
            <div className="pp-actions">
              {canEnrol ? (
                <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
                  {cta}
                  <ArrowRight />
                </button>
              ) : (
                <>
                  <Link className="sk-btn sk-btn-primary" to={`/contact?program=${encodeURIComponent(program.slug)}`}>
                    Register interest
                    <ArrowRight />
                  </Link>
                  <Link className="sk-btn sk-btn-secondary" to="/programmes">
                    See all programmes
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
