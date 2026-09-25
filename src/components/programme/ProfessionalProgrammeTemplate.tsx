import { Link } from "react-router-dom"
import type { CatalogProgramDetail } from "../../lib/catalog-api"
import type { ProgrammeDiscoveryCard } from "../../lib/programme-discovery"
import type { Program } from "../../data"
import { HarborDeskWorkspace } from "../product/ProductLanguage"
import { ProductVisual } from "../product/ProductVisuals"
import "./ProfessionalProgrammeTemplate.css"

type Props = {
  program: CatalogProgramDetail
  authoredRecord: Program
  authoredCourse: import("../../data").Course | null
  discovery: ProgrammeDiscoveryCard
  taughtOutcomes: string[]
  afterEnrol: string
  cta: string
  comingLater: boolean
  enrollable: boolean
  narrow: boolean
  onEnrol: () => void
}

type CurriculumSource = {
  title: string
  lessons: Array<{ title: string; type: string; duration?: string }>
}

function curriculumFor(course: import("../../data").Course | null, program: Program): CurriculumSource[] {
  if (course?.modules?.length) {
    return course.modules.map((module) => ({
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
      })),
    }))
  }

  return (program.curriculumDetail ?? []).map((module) => ({
    title: module.title,
    lessons: (module.topics ?? []).map((topic) => ({ title: topic, type: "topic" })),
  }))
}

function typeLabel(type: string) {
  return type === "quiz" ? "Check" : type === "assignment" ? "Assignment" : "Lesson"
}

export default function ProfessionalProgrammeTemplate({
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
}: Props) {
  const curriculum = curriculumFor(authoredCourse, authoredRecord)
  const projects = authoredRecord.projectsDetail ?? []
  const outcomes = taughtOutcomes.length > 0 ? taughtOutcomes : authoredRecord.whatYouWillLearn ?? []
  const facts = [
    { label: "Duration", value: program.duration || authoredRecord.duration },
    { label: "Level", value: program.level || authoredRecord.level },
    { label: "Format", value: program.format || authoredRecord.format },
    { label: "Projects", value: String(program.projectCount || authoredRecord.projects) },
  ].filter((item) => item.value)

  return (
    <div className="pp-page">
      <section className="pp-hero" id="pd-overview" aria-labelledby="pp-title">
        <div className="pp-rail pp-hero-grid">
          <div className="pp-hero-copy">
            <Link className="pp-back" to="/programs">← Programmes</Link>
            <p className="pp-eyebrow">Professional Programme</p>
            <h1 id="pp-title">{authoredRecord.name}</h1>
            <p className="pp-hero-lead">{discovery.decisionLine}</p>
            <p className="pp-hero-description">
              {authoredRecord.desc}
            </p>
            <div className="pp-actions">
              <button
                type="button"
                className="pp-button pp-button-primary"
                disabled={comingLater || !enrollable}
                onClick={onEnrol}
              >
                {cta}
              </button>
              <a className="pp-button pp-button-secondary" href="#pp-curriculum">View curriculum</a>
            </div>
            <div className="pp-facts" aria-label="Programme facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="pp-hero-visual">
            <div className="pp-visual-label">A real learning artefact</div>
            <HarborDeskWorkspace compact={narrow} meta="Product case workspace" />
            <div className="pp-visual-caption">
              <span>Case</span>
              <strong>Harbor Desk</strong>
              <em>Evidence → problem → bet → specification</em>
            </div>
          </div>
        </div>
      </section>

      <nav className="pp-sticky" aria-label="Programme sections">
        <div className="pp-rail pp-sticky-inner">
          <div className="pp-sticky-links">
            {[
              ["pp-learn", "Learn"],
              ["pp-journey", "Journey"],
              ["pp-build", "Build"],
              ["pp-curriculum", "Curriculum"],
              ["pp-career", "Career OS"],
              ["pp-plans", "Plans"],
              ["pp-faq", "FAQ"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`}>{label}</a>
            ))}
          </div>
          <button type="button" className="pp-sticky-cta" disabled={comingLater || !enrollable} onClick={onEnrol}>
            {cta}
          </button>
        </div>
      </nav>

      <section className="pp-section pp-section-paper" id="pp-learn" aria-labelledby="pp-learn-title">
        <div className="pp-rail">
          <div className="pp-section-intro">
            <p className="pp-kicker">What you'll learn</p>
            <h2 id="pp-learn-title">Learn the decisions behind the work.</h2>
            <p>
              The programme is organised around practical product decisions. Skills sit inside the work rather than
              appearing as a disconnected list.
            </p>
          </div>
          <div className="pp-outcome-grid">
            {outcomes.map((item, index) => (
              <article key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pp-section pp-journey-section" id="pp-journey" aria-labelledby="pp-journey-title">
        <div className="pp-rail">
          <div className="pp-section-intro">
            <p className="pp-kicker">Learning journey</p>
            <h2 id="pp-journey-title">From evidence to a product decision.</h2>
          </div>
          <div className="pp-journey">
            {[
              ["01", "Learn", "Understand the product concept."],
              ["02", "Practice", "Work through a bounded case."],
              ["03", "Build", "Create the artefact a PM would actually use."],
              ["04", "Prove", "Keep the finished work as evidence."],
            ].map(([number, title, detail]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pp-section pp-build-section" id="pp-build" aria-labelledby="pp-build-title">
        <div className="pp-rail">
          <div className="pp-section-intro pp-build-intro">
            <p className="pp-kicker">What you'll build</p>
            <h2 id="pp-build-title">Leave with work, not just notes.</h2>
            <p>
              Each project is an artefact with a clear purpose. The final work can become part of your professional
              evidence when the product is ready.
            </p>
          </div>
          <div className="pp-project-grid">
            {projects.map((project, index) => (
              <article className="pp-project-card" key={project.title}>
                <div className="pp-project-number">0{index + 1}</div>
                <h3>{project.title}</h3>
                <p>{project.what}</p>
                <ul>
                  {project.skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
                <span>{project.difficulty}</span>
              </article>
            ))}
          </div>
          {discovery.capstone ? (
            <div className="pp-capstone">
              <div>
                <p className="pp-kicker">Final case</p>
                <h3>{discovery.capstone}</h3>
              </div>
              <p>Produced against <strong>{discovery.material}</strong> inside the taught course.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pp-section pp-section-paper" id="pp-curriculum" aria-labelledby="pp-curriculum-title">
        <div className="pp-rail">
          <div className="pp-section-intro pp-curriculum-intro">
            <div>
              <p className="pp-kicker">Inside the curriculum</p>
              <h2 id="pp-curriculum-title">See exactly what you'll study.</h2>
            </div>
            <p>{curriculum.length} modules · {curriculum.reduce((sum, module) => sum + module.lessons.length, 0)} learning items</p>
          </div>

          <div className="pp-curriculum">
            {curriculum.map((module, moduleIndex) => (
              <details key={module.title} open={moduleIndex === 0}>
                <summary>
                  <span className="pp-module-number">{String(moduleIndex + 1).padStart(2, "0")}</span>
                  <span className="pp-module-title">
                    <strong>{module.title}</strong>
                    <em>{module.lessons.length} items</em>
                  </span>
                  <span className="pp-module-toggle">+</span>
                </summary>
                <div className="pp-lessons">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div className="pp-lesson" key={lesson.title}>
                      <span>{String(lessonIndex + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{lesson.title}</strong>
                        <small>{typeLabel(lesson.type)}</small>
                      </div>
                      {lesson.duration ? <time>{lesson.duration}</time> : null}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pp-section pp-work-section" aria-labelledby="pp-work-title">
        <div className="pp-rail pp-work-grid">
          <div>
            <p className="pp-kicker">Work inside Skylent</p>
            <h2 id="pp-work-title">The programme lives in the same learning system.</h2>
            <p>
              Lessons, checks, assignments and the finished project stay connected. Enrolment opens the linked course
              in Skylent OS rather than creating a separate programme classroom.
            </p>
            <ul className="pp-work-list">
              <li><strong>Learn</strong><span>Written teaching and structured lessons.</span></li>
              <li><strong>Practice</strong><span>Checks and applied assignments.</span></li>
              <li><strong>Build</strong><span>Project work that becomes evidence.</span></li>
            </ul>
          </div>
          <ProductVisual id="career-workspace" className="pp-product-visual" label="Skylent workspace" />
        </div>
      </section>

      <section className="pp-section pp-career-section" id="pp-career" aria-labelledby="pp-career-title">
        <div className="pp-rail pp-career-grid">
          <div>
            <p className="pp-kicker">Career OS</p>
            <h2 id="pp-career-title">Your learning can become professional evidence.</h2>
            <p>
              Career OS is the career layer for Professional Programmes: profile, projects, evidence, opportunities,
              applications and preparation. It is a workspace, not a placement guarantee.
            </p>
            <Link to="/career-os">Explore Career OS →</Link>
          </div>
          <div className="pp-career-flow">
            {["Programme", "Projects", "Evidence", "Profile", "Opportunities"].map((item, index) => (
              <div key={item}>
                <span>0{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pp-section pp-section-paper" id="pp-plans" aria-labelledby="pp-plans-title">
        <div className="pp-rail">
          <div className="pp-section-intro">
            <p className="pp-kicker">Plans</p>
            <h2 id="pp-plans-title">Choose how you want to learn.</h2>
            <p>Pricing is rendered from the programme record, so future programmes can define their own plans.</p>
          </div>
          <div className="pp-plan-grid">
            {authoredRecord.pricing.map((plan) => (
              <article className={`pp-plan ${plan.highlight ? "is-highlighted" : ""}`} key={plan.name}>
                {plan.highlight ? <span className="pp-plan-mark">Recommended path</span> : null}
                <h3>{plan.name}</h3>
                <div className="pp-price">₹{plan.price.toLocaleString("en-IN")}</div>
                <p className="pp-original">₹{plan.originalPrice.toLocaleString("en-IN")}</p>
                <ul>
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <button type="button" className="pp-button pp-button-secondary" disabled={comingLater || !enrollable} onClick={onEnrol}>
                  {cta}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pp-section pp-faq-section" id="pp-faq" aria-labelledby="pp-faq-title">
        <div className="pp-rail pp-faq-grid">
          <div>
            <p className="pp-kicker">Questions</p>
            <h2 id="pp-faq-title">Before you enrol.</h2>
          </div>
          <div className="pp-faq">
            {(authoredRecord.faqs ?? []).map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}<span>+</span></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pp-final">
        <div className="pp-rail pp-final-card">
          <div>
            <p className="pp-kicker">Start here</p>
            <h2>{comingLater ? "This programme is coming later." : "Ready to work through the programme?"}</h2>
            <p>{afterEnrol}</p>
          </div>
          <button type="button" className="pp-button pp-button-primary" disabled={comingLater || !enrollable} onClick={onEnrol}>
            {cta}
          </button>
        </div>
      </section>
    </div>
  )
}
