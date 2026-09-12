import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import AnchorNav, { useActiveSection } from '../design/AnchorNav'
import {
  Rail,
  SectionHeading,
  StatusPill,
  Tag,
  Card,
  Button,
  ButtonLink,
  DefinitionList,
  EmptyState,
  Note,
  MetaRow,
  getSurfaceAccent,
} from '../design/primitives'
import { PROGRAM_TYPE_LABEL, formatInr } from '../design/CatalogueCard'
import { R, S, TY } from '../design/tokens'
import { getCourseAvailability, liveProgramSlugsForCourse, publishedLessonCount } from '../lib/catalogue-status'
import { useCatalogEnrollment } from '../hooks/useCatalogEnrollment'
import { resolveAuroraTheme } from '../aurora-themes'
import { courses, programs } from '../data'
import type { Course } from '../data'
import '../design/detail.css'

const THEME = resolveAuroraTheme('/courses')
const accent = getSurfaceAccent(THEME)

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'audience', label: 'Who it is for' },
]

function EnrolRail({ course }: { course: Course }) {
  const availability = getCourseAvailability(course.slug)
  const lessons = publishedLessonCount(course.slug)
  const { startCourseEnrollment, enrolling, enrollError, clearEnrollError } = useCatalogEnrollment()

  return (
    <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <StatusPill availability={availability} />
        <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '10px 0 0' }}>{availability.explanation}</p>
      </div>

      <div style={{ paddingTop: 14, borderTop: `1px solid ${S.line}` }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {formatInr(course.price)}
        </div>
        <div style={{ ...TY.meta, color: S.inkMuted, marginTop: 4 }}>One-time fee, including GST.</div>
      </div>

      <DefinitionList
        items={[
          { term: 'Published lessons', value: lessons > 0 ? lessons : 'None yet' },
          { term: 'Modules', value: course.modules.length },
          { term: 'Duration', value: course.duration },
          { term: 'Level', value: course.level },
          { term: 'Mode', value: course.mode },
          { term: 'Credential', value: 'Skylent completion certificate' },
        ]}
      />

      <div className="sk-rail-cta">
        {availability.canStartLearning ? (
          <>
            <Button
              full
              size="lg"
              themeId={THEME}
              disabled={enrolling}
              onClick={() => {
                if (enrolling) return
                clearEnrollError()
                startCourseEnrollment(course.slug)
              }}
            >
              {enrolling ? 'Enrolling…' : 'Enrol and start learning'}
            </Button>
            <p style={{ ...TY.meta, color: S.inkMuted, margin: 0, textAlign: 'center' }}>
              Lessons open straight after enrolment.
            </p>
          </>
        ) : (
          <ButtonLink to="/contact" full size="lg" variant="secondary" themeId={THEME}>
            Register interest
          </ButtonLink>
        )}
      </div>

      {enrollError && (
        <p role="alert" style={{ ...TY.bodySm, color: S.caution, margin: 0 }}>{enrollError} Please try again.</p>
      )}
    </Card>
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
    <div className="sk-accordion">
      {course.modules.map((mod, index) => {
        const isOpen = openId === mod.id
        return (
          <div key={mod.id} className="sk-accordion-item">
            <button
              type="button"
              className="sk-accordion-trigger"
              onClick={() => setOpenId(isOpen ? null : mod.id)}
              aria-expanded={isOpen}
            >
              <span className="sk-accordion-index" style={{ background: accent.soft, color: accent.text }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span style={{ ...TY.body, color: S.ink, fontWeight: 600, flex: 1, minWidth: 0 }}>{mod.title}</span>
              <span style={{ ...TY.bodySm, color: S.inkMuted, flexShrink: 0 }}>
                {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
              </span>
              <span className="sk-accordion-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="sk-accordion-panel">
                {mod.lessons.length === 0 ? (
                  <p style={{ ...TY.bodySm, color: S.inkMuted, margin: 0 }}>No lessons published in this module yet.</p>
                ) : (
                  <ul className="sk-plain-list">
                    {mod.lessons.map(lesson => (
                      <li key={lesson.id}>
                        {lesson.title}
                        <span style={{ ...TY.meta, color: S.inkMuted }}>
                          {' · '}
                          {lesson.type}
                          {lesson.duration ? ` · ${lesson.duration}` : ''}
                        </span>
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

  if (!course) {
    return (
      <ProductShell>
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

  return (
    <ProductShell className="sk-has-sticky-bar">
      <Rail>
        <div className="sk-detail-head">
          <Link to="/courses" className="sk-backlink">
            <span aria-hidden>←</span> All courses
          </Link>
          <div className="sk-detail-head-row">
            <div style={{ minWidth: 0 }}>
              <div style={{ ...TY.meta, color: accent.text, fontWeight: 600, marginBottom: 8 }}>Course</div>
              <h1 style={{ ...TY.display, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{course.title}</h1>
              <p style={{ ...TY.bodyLg, color: S.inkSecondary, margin: '14px 0 0', maxWidth: '62ch' }}>{course.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
                <StatusPill availability={availability} />
                <Tag>{course.category}</Tag>
                <Tag>{course.level}</Tag>
                <Tag>{course.mode}</Tag>
              </div>
            </div>
          </div>
        </div>
      </Rail>

      <AnchorNav sections={SECTIONS} active={activeSection} themeId={THEME} />

      <Rail>
        <div className="sk-detail">
          <div className="sk-detail-main sk-stack">
            <section id="overview">
              <SectionHeading title="What this course covers" />
              <p style={{ ...TY.body, color: S.inkSecondary, margin: '0 0 18px' }}>{course.longDesc}</p>
              <MetaRow
                items={[
                  `${course.modules.length} ${course.modules.length === 1 ? 'module' : 'modules'}`,
                  lessons > 0 ? `${lessons} published ${lessons === 1 ? 'lesson' : 'lessons'}` : 'No lessons published',
                  course.duration,
                ]}
              />

              {course.outcomes.length > 0 && (
                <div style={{ marginTop: 26 }}>
                  <SectionHeading size="sm" title="What you will learn" />
                  <ul className="sk-check-list">
                    {course.outcomes.map(outcome => (
                      <li key={outcome}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent.solid} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
                          <path d="m20 6-11 11-5-5" />
                        </svg>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section id="curriculum">
              <SectionHeading
                title="Curriculum"
                lead={
                  lessons > 0
                    ? 'Lessons unlock in order. Your progress is saved as you go.'
                    : 'This syllabus is published, but no lessons have been added to the platform yet.'
                }
              />
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

            <section id="audience">
              <SectionHeading title="Who this is for" />
              <ul className="sk-plain-list">
                {course.forWhom.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {parentPrograms.length > 0 && (
              <section>
                <SectionHeading
                  title="Part of these programmes"
                  lead="Longer programmes that deliver this course as part of a wider track."
                />
                <div className="sk-grid sk-grid-2">
                  {parentPrograms.map(program => (
                    <Link key={program.slug} to={`/programs/${program.slug}`} className="sk-linked-course">
                      <div style={{ ...TY.meta, color: accent.text, fontWeight: 600 }}>
                        {PROGRAM_TYPE_LABEL[program.programType]}
                      </div>
                      <div style={{ ...TY.body, color: S.ink, fontWeight: 600 }}>{program.name}</div>
                      <div style={{ ...TY.bodySm, color: S.inkMuted }}>
                        {program.duration} · {program.level}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="sk-detail-rail">
            <EnrolRail course={course} />
          </aside>
        </div>
      </Rail>

      <div className="sk-sticky-bar">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...TY.meta, color: S.inkMuted }}>{availability.label}</div>
          <div style={{ ...TY.bodySm, color: S.ink, fontWeight: 600 }}>{formatInr(course.price)}</div>
        </div>
        <StickyEnrol course={course} />
      </div>
    </ProductShell>
  )
}

function StickyEnrol({ course }: { course: Course }) {
  const availability = getCourseAvailability(course.slug)
  const { startCourseEnrollment, enrolling, clearEnrollError } = useCatalogEnrollment()

  if (!availability.canStartLearning) {
    return <ButtonLink to="/contact" variant="secondary" themeId={THEME} style={{ borderRadius: R.control }}>Register interest</ButtonLink>
  }

  return (
    <Button
      themeId={THEME}
      disabled={enrolling}
      onClick={() => {
        if (enrolling) return
        clearEnrollError()
        startCourseEnrollment(course.slug)
      }}
    >
      {enrolling ? 'Enrolling…' : 'Enrol'}
    </Button>
  )
}
