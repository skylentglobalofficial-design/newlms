/**
 * Authored programme page (approved design: the Data Analytics programme).
 *
 * Order: hero with the discipline plate, spec strip, capstone as a step rail,
 * curriculum, practice, evidence on the warm proof band with the Career OS
 * status row, and the navy next-step band.
 *
 * Data: the programme row comes from GET /catalog/programs/:slug (passed in).
 * That response carries no lesson outline, so the curriculum and the lesson
 * counts are read from the linked course, GET /catalog/courses/:slug. Artefacts
 * and capstone steps are the programme's own authored material.
 */
import { Link } from "react-router-dom"
import type { CatalogCurriculumModule, CatalogCurriculumNode, CatalogProgramDetail } from "../../lib/catalog-api"
import { courseBySlug } from "../../lib/catalog-maturity"
import { courseProductProfile } from "../../lib/course-product"
import { truthOf, type Capability } from "../../lib/truth"
import { useCatalogCourse } from "../../hooks/useCatalog"
import { ArrowRight, Plate, SectionIndex, SpecSheet, TruthChip } from "../skylent/primitives"
import { HarborDeskPlate, NorthwindLabPlate, NorthwindTrend } from "./ProgrammeArtefacts"
import type { AuthoredProgrammeContent, ProgrammeStep } from "./programme-content"
import { numberWord, plural, type ProgrammeTruth } from "./programme-truth"
import "./ProfessionalProgrammeTemplate.css"

type Props = {
  program: CatalogProgramDetail
  content: AuthoredProgrammeContent
  truth: ProgrammeTruth
  /** Label and behaviour of the enrol action, decided by ProgramPage. */
  cta: string
  afterEnrol: string
  onEnrol: () => void
}

const CAREER_STATUS: Array<{ label: string; capability: Capability }> = [
  { label: "Career profile", capability: "careerProfile" },
  { label: "Projects and evidence", capability: "projectsAndEvidence" },
  { label: "Certificates", capability: "certificates" },
  { label: "Openings", capability: "openings" },
]

/** Titles are stored as "Kind — subject". The page prints them with a comma. */
function displayTitle(title: string): string {
  return title.replace(/\s+[—–]\s+/g, ", ")
}

function shortTitle(title: string): string {
  return title.split(/\s+[—–]\s+/)[0]
}

function nodeKind(nodeType: string): string {
  switch (nodeType.toUpperCase()) {
    case "QUIZ":
      return "Check"
    case "ASSIGNMENT":
      return "Assignment"
    case "VIDEO":
      return "Video"
    case "NOTES":
      return "Notes"
    default:
      return "Topic"
  }
}

function isLesson(node: CatalogCurriculumNode): boolean {
  const type = node.nodeType.toUpperCase()
  return type === "NOTES" || type === "VIDEO"
}

function countType(modules: CatalogCurriculumModule[], nodeType: string): number {
  return modules.reduce(
    (sum, module) => sum + module.nodes.filter((node) => node.nodeType.toUpperCase() === nodeType).length,
    0,
  )
}

function moduleCounts(module: CatalogCurriculumModule): string {
  const lessons = module.nodes.filter(isLesson).length
  const assignments = module.nodes.filter((node) => node.nodeType.toUpperCase() === "ASSIGNMENT").length
  const checks = module.nodes.filter((node) => node.nodeType.toUpperCase() === "QUIZ").length
  return [
    lessons ? plural(lessons, "lesson") : "",
    assignments ? plural(assignments, "assignment") : "",
    checks ? plural(checks, "check") : "",
  ]
    .filter(Boolean)
    .join(" · ")
}

function StepNote({ step, artefact }: { step: ProgrammeStep; artefact: AuthoredProgrammeContent["artefact"] }) {
  if (!step.note) return null
  if (step.note.kind === "trend") return artefact === "northwind" ? <NorthwindTrend /> : null
  if (step.note.kind === "own") return <span className="pp-step__note is-own">In your words</span>
  return <span className="pp-step__note">{step.note.text}</span>
}

function Chevron() {
  return (
    <svg className="pp-mod__chev" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function ProfessionalProgrammeTemplate({ program, content, truth, cta, afterEnrol, onEnrol }: Props) {
  const course = useCatalogCourse(content.courseSlug)
  const curriculum = course.data?.curriculum ?? []
  const courseReady = !course.loading && !course.error && course.data != null
  const authoredCourse = courseBySlug(content.courseSlug)
  const courseTitle = course.data?.title || authoredCourse?.title || program.name
  const profile = courseProductProfile(content.courseSlug)

  const firstNode = curriculum[0]?.nodes[0] ?? null
  const moduleCount = program.moduleCount || course.data?.moduleCount || 0
  const lessonCount = course.data?.lessonCount ?? 0
  const assignmentCount = countType(curriculum, "ASSIGNMENT")
  const checkCount = countType(curriculum, "QUIZ")
  const canEnrol = truth.enrollable && !truth.comingLater

  const enrolChip = truth.comingLater ? (
    <TruthChip state="soon" label={truth.enrolment || "Coming soon"} />
  ) : truth.enrollable ? (
    <TruthChip state="live" label="Open" />
  ) : (
    <TruthChip state="development" />
  )

  const startsWith = course.loading ? (
    <span className="sky-skeleton pp-skel-line" aria-label="Loading the first lesson" />
  ) : firstNode ? (
    `Lesson 1, ${displayTitle(firstNode.title)}`
  ) : null

  const lessonTitle = (lessonId: string): string => {
    for (const module of curriculum) {
      const node = module.nodes.find((row) => row.sourceId === lessonId)
      if (node) return node.title
    }
    const fallback = authoredCourse?.modules.flatMap((module) => module.lessons).find((row) => row.id === lessonId)
    return fallback?.title ?? lessonId
  }

  const primaryAction = canEnrol ? (
    <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
      {cta}
      <ArrowRight />
    </button>
  ) : null

  const nextStepLabel = ["Next step", firstNode ? "Lesson 1" : "", firstNode ? nodeKind(firstNode.nodeType) : "", firstNode?.duration ?? ""]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="pp-page">
      {/* Hero */}
      <section className="sky-container pp-hero" aria-labelledby="pp-title">
        <div className="pp-hero__copy">
          <nav className="sky-label pp-crumb" aria-label="Breadcrumb">
            <Link to="/programmes">Programmes</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{courseTitle}</span>
          </nav>
          <h1 id="pp-title" className="pp-h1">
            {content.hero.headline}
          </h1>
          <p className="pp-lede">{content.hero.summary(numberWord(moduleCount, true))}</p>
          <div className="pp-actions">
            {primaryAction}
            <a className="sk-btn sk-btn-secondary" href="#pp-curriculum">
              View curriculum
            </a>
          </div>
          <p className="pp-note">
            {program.name && program.name !== courseTitle ? `Listed in the catalogue as ${program.name}. ` : ""}
            {afterEnrol}
          </p>
          <SpecSheet
            className="pp-hero__spec"
            rows={[
              { label: "Enrolment", value: enrolChip },
              { label: "Format", value: program.format },
              { label: "You start with", value: startsWith },
            ]}
          />
        </div>

        <Plate className="pp-hero__plate" fig="FIG. 01" caption={content.hero.figure} note={content.hero.figureNote}>
          {content.artefact === "northwind" ? <NorthwindLabPlate /> : <HarborDeskPlate />}
        </Plate>
      </section>

      {/* What you will build: spec strip */}
      <section className="sky-container pp-strip" aria-label="What you will build">
        <SectionIndex n="01" label="What you will build" />
        <dl className="pp-strip__grid">
          {moduleCount > 0 ? (
            <div>
              <dt className="sky-label">Modules</dt>
              <dd className="pp-strip__num">{moduleCount}</dd>
            </div>
          ) : null}
          {course.loading ? (
            <div aria-hidden="true">
              <dt className="sky-label">Lessons</dt>
              <dd className="pp-strip__num">
                <span className="sky-skeleton pp-skel-num" />
              </dd>
            </div>
          ) : null}
          {courseReady && lessonCount > 0 ? (
            <div>
              <dt className="sky-label">Lessons</dt>
              <dd className="pp-strip__num">{lessonCount}</dd>
            </div>
          ) : null}
          {courseReady && assignmentCount > 0 ? (
            <div>
              <dt className="sky-label">Assignments</dt>
              <dd className="pp-strip__num">{assignmentCount}</dd>
            </div>
          ) : null}
          {courseReady && checkCount > 0 ? (
            <div>
              <dt className="sky-label">Checks</dt>
              <dd className="pp-strip__num">{checkCount}</dd>
            </div>
          ) : null}
          <div>
            <dt className="sky-label">{content.specSheet.material.label}</dt>
            <dd className="pp-strip__text">
              {content.specSheet.material.value}
              <span>{content.specSheet.material.note}</span>
            </dd>
          </div>
          {profile && profile.tools.length > 0 ? (
            <div>
              <dt className="sky-label">{content.specSheet.tools.label}</dt>
              <dd className="pp-strip__text">
                {profile.tools[0]}
                {profile.tools.slice(1).map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {/* Learning journey and project */}
      <section className="sky-container pp-section" id="pp-capstone" aria-labelledby="pp-capstone-title">
        <div className="pp-split">
          <div className="pp-split__intro">
            <SectionIndex n="02" label={content.project.label} />
            <h2 id="pp-capstone-title" className="pp-h2">
              {content.project.heading}
            </h2>
            <p className="pp-body">{content.project.intro}</p>
            <p className="pp-disclaimer">{content.project.disclaimer}</p>
          </div>
          <ol className="sky-steps pp-split__main">
            {content.project.steps.map((step, index) => {
              const next = content.project.steps[index + 1]
              return (
                <li className="sky-step" key={step.number}>
                  <div className="sky-step__rail">
                    <span className={step.worked ? "sky-step__node sky-step__node--on" : "sky-step__node"}>{step.number}</span>
                    {next ? <span className={step.worked && next.worked ? "sky-step__line sky-step__line--on" : "sky-step__line"} /> : null}
                  </div>
                  <div className="sky-step__body pp-step">
                    <div className="pp-step__copy">
                      <h3 className="pp-h3">{step.title}</h3>
                      <p>{step.summary}</p>
                    </div>
                    <StepNote step={step} artefact={content.artefact} />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Curriculum */}
      <section className="sky-container pp-section" id="pp-curriculum" aria-labelledby="pp-curriculum-title">
        <div className="pp-split">
          <div className="pp-split__intro">
            <SectionIndex n="03" label="Curriculum" />
            <h2 id="pp-curriculum-title" className="pp-h2">
              {courseReady && curriculum.length > 0
                ? `${numberWord(curriculum.length, true)} modules, ${numberWord(lessonCount)} lessons.`
                : "The module and lesson outline."}
            </h2>
            {courseReady && curriculum.length > 0 ? <p className="pp-body">{content.curriculum.note}</p> : null}
          </div>

          <div className="pp-split__main">
            {course.loading ? (
              <div className="pp-curriculum" aria-busy="true" aria-label="Loading the curriculum">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div className="pp-mod pp-mod--skeleton" key={row}>
                    <span className="sky-skeleton" style={{ width: 24 }} />
                    <span className="sky-skeleton" style={{ width: `${46 - row * 4}%` }} />
                  </div>
                ))}
              </div>
            ) : course.error ? (
              <div className="pp-state" role="alert">
                <p className="sky-error">The curriculum could not be loaded.</p>
                <button type="button" className="sk-btn sk-btn-secondary" onClick={() => void course.reload()}>
                  Try again
                </button>
              </div>
            ) : curriculum.length === 0 ? (
              <p className="sky-empty">
                <strong>No outline is published for this course yet.</strong>
                The catalogue returned the course without modules.
              </p>
            ) : (
              <div className="pp-curriculum">
                {curriculum.map((module, index) => (
                  <details
                    className="pp-mod"
                    key={module.sourceId ?? `${module.order}-${module.title}`}
                    open={module.sourceId ? module.sourceId === content.curriculum.openModuleId : index === 0}
                  >
                    <summary>
                      <span className="pp-mod__n">M{index + 1}</span>
                      <span className="pp-mod__title">{module.title}</span>
                      <span className="pp-mod__meta">{moduleCounts(module)}</span>
                      <Chevron />
                    </summary>
                    <ul className="pp-mod__list">
                      {module.nodes.map((node) => (
                        <li key={node.sourceId ?? `${node.order}-${node.title}`}>
                          <span>{displayTitle(node.title)}</span>
                          <span className="pp-mod__kind">
                            {nodeKind(node.nodeType)}
                            {node.duration ? ` · ${node.duration}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Practice */}
      <section className="sky-container pp-section" id="pp-practice" aria-labelledby="pp-practice-title">
        <div className="pp-split">
          <div className="pp-split__intro">
            <SectionIndex n="04" label="Practice" />
            <h2 id="pp-practice-title" className="pp-h2">
              {content.practice.heading}
            </h2>
            <p className="pp-body">{content.practice.intro}</p>
            {content.practice.link ? (
              <Link className="sk-link pp-practice__link" to={content.practice.link.to}>
                {content.practice.link.label}
                <ArrowRight />
              </Link>
            ) : null}
          </div>
          <div className="pp-split__main">
            <SpecSheet
              rows={content.practice.rows.map((row) => ({
                label: row.label,
                value: row.mono ? <span className="sky-mono pp-mono">{row.value}</span> : row.value,
              }))}
            />
            <p className="pp-disclaimer pp-disclaimer--plain">{content.practice.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* Evidence and career connection: warm proof band */}
      <section className="sky-band-proof pp-proof" id="pp-evidence" aria-labelledby="pp-evidence-title">
        <div className="sky-container">
          <div className="pp-split">
            <div className="pp-split__intro">
              <SectionIndex n="05" label="What you can prove" />
              <h2 id="pp-evidence-title" className="pp-h2">
                {content.evidence.heading}
              </h2>
              <p className="pp-body">{content.evidence.lede}</p>
            </div>

            <article className="pp-record pp-split__main" aria-labelledby="pp-record-title">
              <header className="pp-record__head">
                <span className="sky-label">Evidence record · Career OS</span>
                <TruthChip state={truthOf("projectsAndEvidence")} />
              </header>
              <div className="pp-record__body">
                <h3 id="pp-record-title" className="pp-record__title">
                  {content.evidence.record.title}
                </h3>
                <p className="pp-record__context">{content.evidence.record.context}</p>
                <dl className="pp-record__rows">
                  <div>
                    <dt className="sky-label">Work shown</dt>
                    <dd>{content.evidence.record.workShown}</dd>
                  </div>
                  <div>
                    <dt className="sky-label">Skills</dt>
                    <dd className="pp-record__skills">
                      {content.evidence.record.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="sky-label">Reflection</dt>
                    <dd className="is-muted">{content.evidence.record.reflection}</dd>
                  </div>
                </dl>
              </div>
              <p className="pp-record__foot">{content.evidence.record.footnote}</p>
            </article>
          </div>

          <div className="pp-evtable" tabIndex={0} role="group" aria-label="Assignments and the evidence each one leaves">
            <table>
              <thead>
                <tr>
                  <th scope="col">Assignment</th>
                  <th scope="col">What you produce</th>
                  <th scope="col">What a reviewer can see</th>
                </tr>
              </thead>
              <tbody>
                {content.evidence.rows.map((row) => (
                  <tr key={row.lessonId}>
                    <th scope="row">
                      {row.capstone ? (
                        <span className="pp-evtable__cap">
                          <span aria-hidden="true" />
                          {shortTitle(lessonTitle(row.lessonId))}
                        </span>
                      ) : (
                        shortTitle(lessonTitle(row.lessonId))
                      )}
                    </th>
                    <td>{row.produce}</td>
                    <td>{row.reviewer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pp-career" aria-labelledby="pp-career-title">
            <h3 id="pp-career-title" className="sky-label pp-career__label">
              In Career OS today
            </h3>
            <ul className="pp-career__list">
              {CAREER_STATUS.map((item) => (
                <li key={item.capability}>
                  {item.label} <TruthChip state={truthOf(item.capability)} />
                </li>
              ))}
            </ul>
            <Link className="sk-link pp-career__link" to="/career-os">
              Open Career OS
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Next action: navy anchor */}
      <section className="sky-band-navy pp-next" aria-labelledby="pp-next-title">
        <div className="sky-container pp-next__inner">
          <div className="pp-next__copy">
            <p className="sky-label">{canEnrol ? nextStepLabel : "Next step"}</p>
            <h2 id="pp-next-title" className="pp-h2">
              {canEnrol ? content.closing.line : "Enrolment is not open on this programme yet."}
            </h2>
          </div>
          <div className="pp-actions">
            {primaryAction}
            <Link className="sk-btn sk-btn-secondary" to="/path">
              {canEnrol ? "Not sure yet? Find my path" : "Find my path"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
