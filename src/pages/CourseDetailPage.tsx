import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import AnchorNav, { useActiveSection } from '../design/AnchorNav'
import { ButtonLink, EmptyState, Note, Rail, StatusPill } from '../design/primitives'
import { PROGRAM_TYPE_LABEL, formatInr } from '../design/CatalogueCard'
import { getCourseAvailability, liveProgramSlugsForCourse, publishedLessonCount } from '../lib/catalogue-status'
import { useCatalogEnrollment } from '../hooks/useCatalogEnrollment'
import { emptySubjectLabCopy, labsForCourse } from '../lib/virtual-labs'
import { labRunPath } from '../lib/safe-return'
import { courses, programs } from '../data'
import type { Course } from '../data'
import '../design/detail.css'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'labs', label: 'Labs' },
  { id: 'audience', label: 'Who it is for' },
]

function EnrolButton({
  course,
  className,
  enrolling,
  onEnrol,
}: {
  course: Course
  className?: string
  enrolling: boolean
  onEnrol: () => void
}) {
  const availability = getCourseAvailability(course.slug)
  if (!availability.canStartLearning) {
    return (
      <Link to="/contact" className={className}>
        Register interest
      </Link>
    )
  }
  return (
    <button type="button" className={className} disabled={enrolling} onClick={onEnrol}>
      {enrolling ? 'Enrolling…' : className?.includes('compact') ? 'Enrol' : 'Enrol and start learning'}
    </button>
  )
}

function Curriculum({ course }: { course: Course }) {
  const [openId, setOpenId] = useState<string | null>(course.modules[0]?.id ?? null)

  if (course.modules.length === 0) {
    return (
      <EmptyState
        title="No curriculum published"
        body="Modules and lessons for this course have not been added to the platform yet."
        compact
      />
    )
  }

  return (
    <div className="sk-pdp-curriculum">
      {course.modules.map((mod, index) => {
        const isOpen = openId === mod.id
        return (
          <div key={mod.id} className={`sk-pdp-module${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="sk-pdp-module-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : mod.id)}
            >
              <span className="sk-pdp-module-num">{String(index + 1).padStart(2, '0')}</span>
              <span className="sk-pdp-module-copy">
                <span className="sk-pdp-module-title">{mod.title}</span>
                <span className="sk-pdp-module-duration">
                  {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </span>
              <span className="sk-pdp-module-chevron" aria-hidden>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="sk-pdp-module-panel">
                {mod.lessons.length === 0 ? (
                  <p>No lessons published in this module yet.</p>
                ) : (
                  <ul className="sk-pdp-topics">
                    {mod.lessons.map(lesson => (
                      <li key={lesson.id}>
                        {lesson.title}
                        {lesson.duration ? ` · ${lesson.duration}` : ''}
                      </li>
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

export default function CourseDetailPage() {
  const { slug } = useParams()
  const course = courses.find(item => item.slug === slug)
  const activeSection = useActiveSection(SECTIONS.map(section => section.id))
  const { startCourseEnrollment, enrolling, enrollError, clearEnrollError } = useCatalogEnrollment()

  if (!course) {
    return (
      <ProductShell className="sk-pdp">
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Course not found"
              body="That course is not in the catalogue."
              action={<ButtonLink to="/courses">Back to courses</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const availability = getCourseAvailability(course.slug)
  const lessons = publishedLessonCount(course.slug)
  const parentPrograms = liveProgramSlugsForCourse(course.slug)
    .map(programSlug => programs.find(program => program.slug === programSlug))
    .filter((program): program is NonNullable<typeof program> => !!program)
  const relatedLabs = labsForCourse(course.slug)

  function enrol() {
    if (enrolling || !course) return
    clearEnrollError()
    startCourseEnrollment(course.slug)
  }

  return (
    <ProductShell className="sk-pdp sk-has-sticky-bar">
      <Rail>
        <Link to="/courses" className="sk-pdp-back">
          <span aria-hidden>←</span> All courses
        </Link>

        <header className="sk-pdp-hero">
          <div className="sk-pdp-cover" aria-hidden>
            <span>{course.category}</span>
            <strong>{course.title}</strong>
          </div>
          <div className="sk-pdp-hero-copy">
            <div className="sk-pdp-hero-tags">
              <StatusPill availability={availability} />
              <span>{course.level}</span>
              <span>{course.mode}</span>
            </div>
            <h1>{course.title}</h1>
            <p>{course.desc}</p>
            <ul className="sk-pdp-hero-facts">
              <li><em>{lessons || '—'}</em> published lessons</li>
              <li><em>{course.modules.length}</em> modules</li>
              <li><em>{course.duration}</em> duration</li>
              <li><em>{formatInr(course.price)}</em> one-time fee</li>
            </ul>
          </div>
        </header>
      </Rail>

      <AnchorNav sections={SECTIONS} active={activeSection} label="Course sections" />

      <Rail>
        <div className="sk-detail">
          <div className="sk-detail-main">
            <section id="overview" className="sk-pdp-section">
              <h2>What this course covers</h2>
              <p className="sk-pdp-lead">{course.longDesc}</p>
              {course.outcomes.length > 0 && (
                <ul className="sk-pdp-learn">
                  {course.outcomes.map(outcome => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              )}
            </section>

            <section id="curriculum" className="sk-pdp-section">
              <h2>Curriculum</h2>
              <p className="sk-pdp-lead">
                {lessons > 0
                  ? 'Lessons unlock in order. Your progress is saved as you go.'
                  : 'This syllabus is published, but no lessons have been added to the platform yet.'}
              </p>
              <Curriculum course={course} />
              {lessons > 0 && lessons < course.lessons && (
                <div style={{ marginTop: 16 }}>
                  <Note>
                    {lessons} of the {course.lessons} lessons in this syllabus are published so far. The rest are not
                    in the platform yet.
                  </Note>
                </div>
              )}
            </section>

            <section id="labs" className="sk-pdp-section">
              <h2>Virtual labs</h2>
              <p className="sk-pdp-lead">
                Only experiments that match this course are listed. We do not substitute an unrelated subject.
              </p>
              {relatedLabs.length > 0 ? (
                <div className="sk-pdp-live">
                  {relatedLabs.map(lab => (
                    <Link key={lab.id} to={labRunPath(lab.id, `/courses/${course.slug}`)}>
                      <strong>{lab.title}</strong>
                      <span>{lab.subject} · {lab.duration} · runs in your browser</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No lab for this subject" body={emptySubjectLabCopy(course.title)} />
              )}
            </section>

            <section id="audience" className="sk-pdp-section">
              <h2>Who this is for</h2>
              <ul className="sk-pdp-plain">
                {course.forWhom.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {parentPrograms.length > 0 && (
                <div className="sk-pdp-audience">
                  <h3>Part of these programmes</h3>
                  <div className="sk-pdp-live">
                    {parentPrograms.map(program => (
                      <Link key={program.slug} to={`/programs/${program.slug}`}>
                        <strong>{program.name}</strong>
                        <span>
                          {PROGRAM_TYPE_LABEL[program.programType]} · {program.duration} · {program.level}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="sk-pdp-buy">
            <StatusPill availability={availability} />
            <div className="sk-pdp-buy-price">
              <span>One-time fee, including GST</span>
              <strong>{formatInr(course.price)}</strong>
            </div>
            <div className="sk-rail-cta">
              <EnrolButton course={course} className="sk-pdp-cta" enrolling={enrolling} onEnrol={enrol} />
            </div>
            <p className="sk-pdp-buy-explain">{availability.explanation}</p>
            <dl className="sk-pdp-buy-facts">
              <div><dt>Published lessons</dt><dd>{lessons > 0 ? lessons : 'None yet'}</dd></div>
              <div><dt>Modules</dt><dd>{course.modules.length}</dd></div>
              <div><dt>Duration</dt><dd>{course.duration}</dd></div>
              <div><dt>Level</dt><dd>{course.level}</dd></div>
              <div><dt>Mode</dt><dd>{course.mode}</dd></div>
            </dl>
            {enrollError && <p role="alert" className="sk-pdp-buy-note">{enrollError} Please try again.</p>}
            <p className="sk-pdp-buy-note">
              {availability.canStartLearning
                ? 'Lessons open straight after enrolment.'
                : 'Registering interest starts a conversation. It does not reserve a place or take payment.'}
            </p>
            <p className="sk-pdp-buy-note">
              Credential: Skylent completion certificate. It is not an accredited qualification.
            </p>
          </aside>
        </div>
      </Rail>

      <div className="sk-sticky-bar">
        <div className="sk-sticky-bar-copy">
          <div>{availability.label}</div>
          <strong>{formatInr(course.price)}</strong>
        </div>
        <EnrolButton
          course={course}
          className="sk-pdp-cta sk-pdp-cta-compact"
          enrolling={enrolling}
          onEnrol={enrol}
        />
      </div>
    </ProductShell>
  )
}
