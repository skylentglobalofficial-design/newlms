import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import AnchorNav, { scrollToSection, useActiveSection } from '../design/AnchorNav'
import { ButtonLink, EmptyState, Note, Rail, StatusPill } from '../design/primitives'
import { PROGRAM_TYPE_LABEL, formatInr } from '../design/CatalogueCard'
import { getProgrammeAvailability, liveCourseSlugsForProgram } from '../lib/catalogue-status'
import { labsForProgram } from '../lib/virtual-labs'
import { useCatalogEnrollment } from '../hooks/useCatalogEnrollment'
import { courses, programs } from '../data'
import type { Program } from '../data'
import '../design/detail.css'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'projects', label: 'Projects' },
  { id: 'platform', label: 'In the platform' },
  { id: 'delivery', label: 'How it runs' },
  { id: 'fees', label: 'Fees' },
  { id: 'faq', label: 'FAQ' },
]

function lowestFee(program: Program) {
  return program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null
}

function EnrolButton({
  program,
  className,
  enrolling,
  onEnrol,
}: {
  program: Program
  className?: string
  enrolling: boolean
  onEnrol: () => void
}) {
  const availability = getProgrammeAvailability(program)

  if (!availability.canStartLearning) {
    return (
      <Link to="/contact" className={className}>
        {availability.ctaLabel}
      </Link>
    )
  }

  return (
    <button type="button" className={className} disabled={enrolling} onClick={onEnrol}>
      {enrolling ? 'Enrolling…' : availability.ctaLabel}
    </button>
  )
}

function BuyCard({
  program,
  enrolling,
  enrollError,
  onEnrol,
}: {
  program: Program
  enrolling: boolean
  enrollError: string | null
  onEnrol: () => void
}) {
  const availability = getProgrammeAvailability(program)
  const price = lowestFee(program)

  return (
    <aside className="sk-pdp-buy">
      <StatusPill availability={availability} />

      <div className="sk-pdp-buy-price">
        <span>From</span>
        <strong>{price === null ? 'On request' : formatInr(price)}</strong>
        {program.pricing.length > 1 && (
          <button type="button" className="sk-inline-link" onClick={() => scrollToSection('fees')}>
            Compare {program.pricing.length} tiers
          </button>
        )}
      </div>

      <div className="sk-rail-cta">
        <EnrolButton program={program} className="sk-pdp-cta" enrolling={enrolling} onEnrol={onEnrol} />
      </div>

      <p className="sk-pdp-buy-explain">{availability.explanation}</p>

      <dl className="sk-pdp-buy-facts">
        <div><dt>Duration</dt><dd>{program.duration}</dd></div>
        <div><dt>Level</dt><dd>{program.level}</dd></div>
        <div><dt>Mode</dt><dd>{program.format}</dd></div>
        <div><dt>Open now</dt><dd>{availability.canStartLearning ? 'Lessons in the platform' : 'Nothing yet'}</dd></div>
        <div><dt>Starts</dt><dd>{program.upcomingBatch}</dd></div>
      </dl>

      {enrollError && <Note tone="caution">{enrollError}</Note>}

      {!availability.canStartLearning && (
        <p className="sk-pdp-buy-note">Fees shown are planned. Nothing is for sale and no place is reserved.</p>
      )}

      <p className="sk-pdp-buy-note">
        {availability.canStartLearning
          ? 'Enrolling opens the linked courses in the learning platform straight away.'
          : 'Registering interest starts a conversation. It does not reserve a place or take payment.'}
      </p>
      <p className="sk-pdp-buy-note">
        Credential: {program.cert}. It is not an accredited or university qualification.
      </p>
    </aside>
  )
}

function Curriculum({ program }: { program: Program }) {
  const [open, setOpen] = useState<string | null>(program.curriculumDetail?.[0]?.number ?? null)
  const modules = program.curriculumDetail ?? []

  if (!modules.length) {
    return (
      <EmptyState
        title="No curriculum published"
        body="The syllabus for this programme has not been written up yet. We would rather show nothing than a placeholder outline."
      />
    )
  }

  return (
    <div className="sk-pdp-curriculum">
      {modules.map(module => {
        const isOpen = open === module.number
        return (
          <div key={module.number} className={`sk-pdp-module${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="sk-pdp-module-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : module.number)}
            >
              <span className="sk-pdp-module-num">{module.number}</span>
              <span className="sk-pdp-module-copy">
                <span className="sk-pdp-module-title">{module.title}</span>
                <span className="sk-pdp-module-duration">{module.duration}</span>
              </span>
              <span className="sk-pdp-module-chevron" aria-hidden>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="sk-pdp-module-panel">
                <p>{module.description}</p>
                {module.topics && module.topics.length > 0 && (
                  <ul className="sk-pdp-topics">
                    {module.topics.map(topic => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>()
  const program = useMemo(() => programs.find(item => item.slug === slug), [slug])
  const activeSection = useActiveSection(SECTIONS.map(section => section.id))
  const { startProgramEnrollment, enrolling, enrollError } = useCatalogEnrollment()

  if (!program) {
    return (
      <ProductShell className="sk-pdp">
        <Rail>
          <div style={{ padding: '80px 0' }}>
            <EmptyState
              title="Programme not found"
              body="This programme is not in the catalogue."
              action={<ButtonLink to="/programs" variant="secondary">Browse programmes</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const availability = getProgrammeAvailability(program)
  const liveCourses = liveCourseSlugsForProgram(program.slug)
    .map(courseSlug => courses.find(course => course.slug === courseSlug))
    .filter((course): course is NonNullable<typeof course> => !!course)
  const realFaculty = (program.faculty ?? []).filter(member => !member.placeholder)
  const modules = program.curriculumDetail ?? []
  const liveModuleCount = liveCourses.reduce((total, course) => total + course.modules.length, 0)
  const liveLessonCount = liveCourses.reduce(
    (total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    0,
  )
  const relatedLabs = labsForProgram(program.slug)
  const price = lowestFee(program)

  return (
    <ProductShell className="sk-pdp sk-has-sticky-bar">
      <Rail>
        <Link to="/programs" className="sk-pdp-back"><span aria-hidden>←</span> All programmes</Link>

        <header className="sk-pdp-hero">
          <div className="sk-pdp-cover" aria-hidden>
            <span>{PROGRAM_TYPE_LABEL[program.programType]}</span>
            <strong>{program.name}</strong>
          </div>
          <div className="sk-pdp-hero-copy">
            <div className="sk-pdp-hero-tags">
              <StatusPill availability={availability} />
              <span>{program.level}</span>
              <span>{program.format}</span>
            </div>
            <h1>{program.name}</h1>
            <p>{program.desc}</p>
            <ul className="sk-pdp-hero-facts">
              <li><em>{program.duration}</em> duration</li>
              <li><em>{liveLessonCount || '—'}</em> lessons open now</li>
              <li><em>{liveCourses.length}</em> {liveCourses.length === 1 ? 'course' : 'courses'} in the platform</li>
              <li><em>{price === null ? 'On request' : formatInr(price)}</em> from</li>
            </ul>
          </div>
        </header>
      </Rail>

      <AnchorNav sections={SECTIONS} active={activeSection} label="Programme sections" />

      <Rail>
        <div className="sk-detail">
          <div className="sk-detail-main">
            <section id="overview" className="sk-pdp-section">
              <h2>What you will work through</h2>
              {program.whatYouWillLearn?.length ? (
                <ul className="sk-pdp-learn">
                  {program.whatYouWillLearn.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="Not published yet" body="Learning outcomes for this programme have not been written up." />
              )}

              {program.whoIsItFor?.length ? (
                <div className="sk-pdp-audience">
                  <h3>Who it is for</h3>
                  <ul>
                    {program.whoIsItFor.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <section id="curriculum" className="sk-pdp-section">
              <h2>Curriculum</h2>
              <p className="sk-pdp-lead">
                {modules.length
                  ? `${modules.length} planned module${modules.length === 1 ? '' : 's'} in the syllabus. What is actually open is listed further down.`
                  : 'No modules have been published.'}
              </p>
              <Curriculum program={program} />
            </section>

            <section id="projects" className="sk-pdp-section">
              <h2>Projects</h2>
              {program.projectsDetail?.length ? (
                <div className="sk-pdp-projects">
                  {program.projectsDetail.map(project => (
                    <article key={project.title}>
                      <header>
                        <h3>{project.title}</h3>
                        <span>{project.difficulty}</span>
                      </header>
                      <p>{project.what}</p>
                      <ul>
                        {project.skills.map(skill => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No project briefs published" body="This programme does not have published project work." />
              )}
            </section>

            <section id="platform" className="sk-pdp-section">
              <h2>What is open in the learning platform</h2>
              <p className="sk-pdp-lead">Only material that actually exists in the platform is listed here.</p>
              {liveCourses.length ? (
                <>
                  <div className="sk-pdp-live">
                    {liveCourses.map(course => {
                      const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
                      return (
                        <Link key={course.slug} to={`/courses/${course.slug}`}>
                          <strong>{course.title}</strong>
                          <span>
                            {lessons} lessons · {course.modules.length} modules · {course.level}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  {modules.length > liveModuleCount && liveModuleCount > 0 && (
                    <Note>
                      The syllabus describes {modules.length} modules. {liveModuleCount} module
                      {liveModuleCount === 1 ? '' : 's'} {liveModuleCount === 1 ? 'is' : 'are'} currently in the linked
                      courses; the rest is still being produced.
                    </Note>
                  )}
                </>
              ) : (
                <EmptyState
                  title="Nothing to open yet"
                  body="No lessons for this programme have been published. The curriculum above describes what is planned."
                />
              )}
              {relatedLabs.length > 0 && (
                <div className="sk-pdp-live" style={{ marginTop: 16 }}>
                  {relatedLabs.map(lab => (
                    <Link key={lab.id} to={`/labs/${lab.id}/run`}>
                      <strong>{lab.title}</strong>
                      <span>Virtual lab · {lab.duration} · runs in your browser</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section id="delivery" className="sk-pdp-section">
              <h2>How it runs</h2>
              {program.learningExperience?.length ? (
                <ul className="sk-pdp-plain">
                  {program.learningExperience.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              <div className="sk-pdp-callout">
                <h3>Assessment and credential</h3>
                <p>
                  Quizzes and assignments are marked inside the platform and count towards completion. On finishing
                  the required lessons and assessments you receive a <strong>{program.cert}</strong> from Skylent. It
                  records what you completed here — it is not an accredited or university-recognised qualification,
                  and it is not a guarantee of employment.
                </p>
              </div>

              <h3 className="sk-pdp-sub">Who teaches it</h3>
              {realFaculty.length ? (
                <ul className="sk-pdp-faculty">
                  {realFaculty.map(member => (
                    <li key={member.name}>
                      <strong>{member.name}</strong>
                      <span>{member.role} · {member.expertise}</span>
                      {member.affiliation && <span>{member.affiliation}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  compact
                  title="Faculty not announced"
                  body="We have not confirmed named faculty for this programme, so we are not listing any."
                />
              )}
            </section>

            <section id="fees" className="sk-pdp-section">
              <h2>Fees</h2>
              <p className="sk-pdp-lead">One-time fees in Indian rupees. No hidden charges are added later.</p>
              <div className="sk-pdp-prices">
                {program.pricing.map(tier => (
                  <article key={tier.name} className={tier.highlight ? 'is-featured' : undefined}>
                    <header>
                      <h3>{tier.name}</h3>
                      {tier.highlight && <span>Most complete</span>}
                    </header>
                    <p className="sk-pdp-prices-amount">{formatInr(tier.price)}</p>
                    <ul>
                      {tier.features.map(feature => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section id="faq" className="sk-pdp-section">
              <h2>Questions</h2>
              {program.faqs?.length ? (
                <div className="sk-pdp-faq">
                  {program.faqs.map(faq => (
                    <details key={faq.q}>
                      <summary>{faq.q}</summary>
                      <p>{faq.a}</p>
                    </details>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No questions published" body="Nothing has been written up for this programme yet." />
              )}
            </section>
          </div>

          <BuyCard
            program={program}
            enrolling={enrolling}
            enrollError={enrollError}
            onEnrol={() => startProgramEnrollment(program.slug)}
          />
        </div>
      </Rail>

      <div className="sk-sticky-bar">
        <div className="sk-sticky-bar-copy">
          <div>{availability.label}</div>
          <strong>{price === null ? 'Fee on request' : `From ${formatInr(price)}`}</strong>
        </div>
        <EnrolButton
          program={program}
          className="sk-pdp-cta sk-pdp-cta-compact"
          enrolling={enrolling}
          onEnrol={() => startProgramEnrollment(program.slug)}
        />
      </div>
    </ProductShell>
  )
}
