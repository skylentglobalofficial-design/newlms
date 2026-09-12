import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, SectionHeading, ButtonLink, StatusPill, Note, Card, MetaRow } from '../design/primitives'
import { ProgrammeCard, CourseCard } from '../design/CatalogueCard'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { resolveAcademicStages, type ResolvedStage, type ResolvedStream } from '../lib/academic-streams'
import { getProgrammeAvailability, publishedLessonCount } from '../lib/catalogue-status'
import { courses, programs } from '../data'
import '../design/education.css'

/** Tracks which stage section is currently in view for the anchor nav. */
function useActiveStage(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 },
    )
    for (const id of idsRef.current) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return active
}

// ── Header ───────────────────────────────────────────────────────────────────
function EducationHeader({ stages }: { stages: ResolvedStage[] }) {
  const stagesOpen = stages.filter(stage => stage.openCount > 0)
  const openProgrammes = programs.filter(program => getProgrammeAvailability(program).canStartLearning).length
  const publishedCourses = courses.filter(course => course.modules.some(module => module.lessons.length > 0)).length

  return (
    <section className="sk-edu-head">
      <Rail>
        <div className="sk-eyebrow">Education</div>
        <h1 className="sk-edu-title">Schooling, degrees and entrance exams.</h1>
        <p className="sk-edu-lead">
          Academic study is organised differently from skills training — by stage, then by degree, then by subject.
          This page shows how Skylent is structured for it, and states plainly what exists today.
        </p>

        <div style={{ marginTop: 22, maxWidth: '72ch' }}>
          <Note tone="caution">
            Skylent is not a university. It does not award degrees and it is not accredited by any university or
            examination board.{' '}
            {stagesOpen.length === 0
              ? `Nothing in the ${stages.length} stages below is open to study yet.`
              : `Only ${stagesOpen.map(stage => stage.label.toLowerCase()).join(' and ')} has anything open to study.`}{' '}
            What is open today is professional and skills material: {openProgrammes}{' '}
            {openProgrammes === 1 ? 'programme' : 'programmes'} and {publishedCourses}{' '}
            {publishedCourses === 1 ? 'course' : 'courses'}.
          </Note>
        </div>

        <div className="sk-edu-head-actions">
          <ButtonLink to="/education#open-today" themeId="schooling">See what is open today</ButtonLink>
          <ButtonLink to="/contact" variant="secondary" themeId="schooling">Register interest</ButtonLink>
        </div>
      </Rail>
    </section>
  )
}

// ── Stage anchor nav ─────────────────────────────────────────────────────────
function StageNav({ stages, active }: { stages: ResolvedStage[]; active: string }) {
  return (
    <div className="sk-anchor-nav">
      <Rail>
        {stages.map(stage => {
          const accent = getSurfaceAccent(stage.themeId)
          const isActive = active === stage.id
          return (
            <a
              key={stage.id}
              href={`#${stage.id}`}
              className={`sk-anchor${isActive ? ' is-active' : ''}`}
              style={{
                color: isActive ? S.ink : undefined,
                borderBottomColor: isActive ? accent.solid : 'transparent',
                textDecoration: 'none',
              }}
            >
              {stage.label}
            </a>
          )
        })}
      </Rail>
    </div>
  )
}

// ── Stream card ──────────────────────────────────────────────────────────────
function StreamCard({ stream, themeId }: { stream: ResolvedStream; themeId: ResolvedStage['themeId'] }) {
  const accent = getSurfaceAccent(themeId)
  return (
    <article className="sk-edu-stream">
      <div className="sk-edu-stream-head">
        <div style={{ minWidth: 0 }}>
          <div className="sk-edu-stream-abbr">{stream.abbr}</div>
          <div className="sk-edu-stream-name">{stream.name}</div>
        </div>
        <StatusPill availability={stream.availability} size="sm" />
      </div>

      <p className="sk-edu-stream-audience">{stream.audience}</p>

      <div className="sk-edu-stream-foot">
        <p className="sk-edu-stream-status">{stream.availability.explanation}</p>
        <Link
          to={stream.href}
          style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {stream.availability.ctaLabel} →
        </Link>
      </div>
    </article>
  )
}

// ── Stage section ────────────────────────────────────────────────────────────
function Stage({ stage }: { stage: ResolvedStage }) {
  const accent = getSurfaceAccent(stage.themeId)

  return (
    <section id={stage.id} className="sk-edu-stage">
      <div className="sk-edu-stage-grid">
        <div className="sk-edu-stage-index">
          <div className="sk-edu-stage-kicker">Stage {stage.numeral}</div>
          <span className="sk-edu-numeral" style={{ color: accent.solid }} aria-hidden>
            {stage.numeral}
          </span>
          <h2 className="sk-edu-stage-label">{stage.label}</h2>
          <div className="sk-edu-stage-sub">{stage.sub}</div>
          <p className="sk-edu-stage-intro">{stage.intro}</p>
        </div>

        <div style={{ minWidth: 0 }}>
          {stage.programmes.length > 0 ? (
            <>
              <div className="sk-grid sk-grid-2">
                {stage.programmes.map(program => (
                  <ProgrammeCard key={program.slug} program={program} compact />
                ))}
              </div>
              {stage.id === 'competitive-exams' && (
                <div style={{ marginTop: 16 }}>
                  <Note>
                    JEE Advanced and CAT are the only entrance exams Skylent has programmes for. No other exam —
                    including NEET — is on the platform.
                  </Note>
                </div>
              )}
            </>
          ) : (
            <div className="sk-edu-streams">
              {stage.streams.map(stream => (
                <StreamCard key={stream.id} stream={stream} themeId={stage.themeId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── What is open today ───────────────────────────────────────────────────────
function OpenToday() {
  const { openProgrammes, publishedCourses } = useMemo(() => {
    return {
      openProgrammes: programs.filter(program => getProgrammeAvailability(program).canStartLearning),
      publishedCourses: courses.filter(course => publishedLessonCount(course.slug) > 0),
    }
  }, [])

  return (
    <section id="open-today" className="sk-edu-open">
      <Rail>
        <SectionHeading
          title="Open in the learning platform today"
          lead="None of it is a degree. These are the programmes and courses with lessons you can actually open."
          action={<ButtonLink to="/programs" variant="secondary" size="sm">All programmes</ButtonLink>}
        />

        {openProgrammes.length > 0 && (
          <div className="sk-grid sk-grid-3">
            {openProgrammes.map(program => (
              <ProgrammeCard key={program.slug} program={program} compact />
            ))}
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <SectionHeading
            size="sm"
            title="Courses with published lessons"
            lead="Self-paced courses that open as soon as you enrol."
            action={<ButtonLink to="/courses" variant="secondary" size="sm">All courses</ButtonLink>}
          />
          <div className="sk-grid sk-grid-3">
            {publishedCourses.map(course => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </Rail>
    </section>
  )
}

// ── Institutions ─────────────────────────────────────────────────────────────
function ForInstitutions() {
  const institution = getSurfaceAccent('institution')

  return (
    <section className="sk-section">
      <Rail>
        <div className="sk-grid sk-grid-2">
          <Card padding={26} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ ...TY.label, color: institution.text }}>For schools and universities</span>
            <h2 style={{ ...TY.h2, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>
              Academic delivery runs through institutions
            </h2>
            <p style={{ ...TY.body, color: S.inkSecondary, margin: 0 }}>
              Degree and school coursework reaches learners through the institution that teaches them. Schools,
              colleges and universities get their own dashboards for programmes, learners, faculty and progress.
            </p>
            <MetaRow items={['Programmes', 'Learners', 'Faculty', 'Progress']} />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <ButtonLink to="/institutions" variant="secondary" themeId="institution">For institutions</ButtonLink>
            </div>
          </Card>

          <Card tone="muted" padding={26}>
            <span style={{ ...TY.label, color: S.inkMuted }}>Where this stands</span>
            <dl className="sk-edu-disclosure" style={{ margin: 0, gridTemplateColumns: 'minmax(0, 1fr)' }}>
              <div>
                <dt>No degrees are awarded</dt>
                <dd>Skylent issues its own completion certificates. They are not university qualifications.</dd>
              </div>
              <div>
                <dt>No partner institutions are named</dt>
                <dd>No university or school partnership is published on this site.</dd>
              </div>
              <div>
                <dt>Academic coursework is unpublished</dt>
                <dd>Schooling, undergraduate and postgraduate material is not in the learning platform.</dd>
              </div>
            </dl>
          </Card>
        </div>
      </Rail>
    </section>
  )
}

// ── Closing ──────────────────────────────────────────────────────────────────
function ClosingCta() {
  return (
    <section className="sk-section-tight">
      <Rail>
        <div className="sk-cta">
          <div style={{ minWidth: 0 }}>
            <h2 style={{ ...TY.h2, color: S.inkOnDark, margin: 0, fontFamily: 'var(--font-display)' }}>
              Tell us which stage you need
            </h2>
            <p style={{ ...TY.body, color: S.inkOnDarkSecondary, margin: '8px 0 0', maxWidth: '52ch' }}>
              Academic coursework is built stage by stage. Registering interest tells us which one to build next —
              it does not reserve a place or charge anything.
            </p>
          </div>
          <div className="sk-cta-actions">
            <Link to="/contact" className="sk-cta-primary">Register interest</Link>
            <Link to="/courses" className="sk-cta-secondary">See what is open</Link>
          </div>
        </div>
      </Rail>
    </section>
  )
}

export default function EducationPage() {
  const stages = useMemo(() => resolveAcademicStages(), [])
  const active = useActiveStage(stages.map(stage => stage.id))

  return (
    <ProductShell>
      <EducationHeader stages={stages} />
      <StageNav stages={stages} active={active} />
      <Rail>
        {stages.map(stage => (
          <Stage key={stage.id} stage={stage} />
        ))}
      </Rail>
      <OpenToday />
      <ForInstitutions />
      <ClosingCta />
    </ProductShell>
  )
}
