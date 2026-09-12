import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, SectionHeading, Card, ButtonLink, MetaRow } from '../design/primitives'
import { FeaturedProgrammeCard, ProgrammeCard } from '../design/CatalogueCard'
import { getSurfaceAccent } from '../design/accent'
import { DESTINATIONS } from '../design/destinations'
import { R, S, TY } from '../design/tokens'
import { getProgrammeAvailability } from '../lib/catalogue-status'
import { courses, programs } from '../data'
import '../design/home.css'

/**
 * Counts read straight off the catalogue so the hero states the real size of
 * the platform rather than an aspirational one.
 */
function PlatformFacts() {
  const facts = useMemo(() => {
    const openProgrammes = programs.filter(program => getProgrammeAvailability(program).canStartLearning).length
    const publishedCourses = courses.filter(course => course.modules.some(module => module.lessons.length > 0)).length
    const lessons = courses.reduce(
      (total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
      0,
    )
    return [
      { value: openProgrammes, label: openProgrammes === 1 ? 'programme open now' : 'programmes open now' },
      { value: publishedCourses, label: publishedCourses === 1 ? 'course published' : 'courses published' },
      { value: lessons, label: 'lessons in the platform' },
    ]
  }, [])

  return (
    <dl className="sk-hero-facts">
      {facts.map(fact => (
        <div key={fact.label}>
          <dt>{fact.value}</dt>
          <dd>{fact.label}</dd>
        </div>
      ))}
    </dl>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : '/courses')
  }

  return (
    <section className="sk-hero">
      <Rail>
        <div className="sk-hero-copy">
          <h1 className="sk-hero-title">
            <span>Learn something specific.</span>{' '}
            <span>Then do something with it.</span>
          </h1>
          <p className="sk-hero-lead">
            Skylent brings academic pathways, skills programmes and career workflows into one platform — and tells
            you plainly what is open today and what is still being built.
          </p>

          <form className="sk-hero-search" onSubmit={handleSearch} role="search">
            <span className="sk-hero-search-field">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.7" y2="16.7" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search courses and programmes"
                aria-label="Search courses and programmes"
              />
            </span>
            <button type="submit">Search</button>
          </form>

          <PlatformFacts />
        </div>
      </Rail>
    </section>
  )
}

// ── Six destinations ─────────────────────────────────────────────────────────
function Destinations() {
  return (
    <section className="sk-section-tight">
      <Rail>
        <SectionHeading
          title="What are you here for?"
          lead="Six places to start. Each one leads to a different product with its own structure."
        />
        <div className="sk-destination-grid">
          {DESTINATIONS.map(destination => {
            const accent = getSurfaceAccent(destination.themeId)
            return (
              <Link
                key={destination.id}
                to={destination.to}
                className="sk-destination"
                style={{ borderRadius: R.card }}
              >
                <span className="sk-destination-bar" style={{ background: accent.solid }} aria-hidden />
                <span className="sk-destination-question" style={{ color: accent.text }}>
                  {destination.question}
                </span>
                <span className="sk-destination-label">{destination.label}</span>
                <span className="sk-destination-promise">{destination.promise}</span>
                <span className="sk-destination-go" aria-hidden>→</span>
              </Link>
            )
          })}
        </div>
      </Rail>
    </section>
  )
}

// ── Real content discovery ───────────────────────────────────────────────────
function Discovery() {
  const { openNow, upcoming } = useMemo(() => {
    const withAvailability = programs.map(program => ({ program, availability: getProgrammeAvailability(program) }))
    return {
      openNow: withAvailability.filter(entry => entry.availability.canStartLearning).map(entry => entry.program),
      upcoming: withAvailability.filter(entry => !entry.availability.canStartLearning).map(entry => entry.program),
    }
  }, [])

  return (
    <section className="sk-section">
      <Rail>
        <SectionHeading
          title="Open in the learning platform today"
          lead={
            openNow.length
              ? 'These programmes have published course material you can open as soon as you enrol.'
              : 'No programme currently has published course material.'
          }
          action={<ButtonLink to="/programs" variant="secondary" size="sm">All programmes</ButtonLink>}
        />

        {openNow.length > 0 && (
          <div className="sk-grid sk-grid-3">
            {openNow.map((program, index) =>
              index === 0
                ? <FeaturedProgrammeCard key={program.slug} program={program} />
                : <ProgrammeCard key={program.slug} program={program} />,
            )}
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginTop: 34 }}>
            <SectionHeading
              size="sm"
              title="Accepting interest, not yet teaching"
              lead="Applications are open or planned for these, but the lessons are not in the platform yet."
            />
            <div className="sk-grid sk-grid-3">
              {upcoming.slice(0, 6).map(program => (
                <ProgrammeCard key={program.slug} program={program} compact />
              ))}
            </div>
          </div>
        )}
      </Rail>
    </section>
  )
}

// ── How it fits together ─────────────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Pick a programme or course',
    body: 'Every listing shows its real curriculum, duration, fee and whether material is published.',
  },
  {
    step: '02',
    title: 'Learn in the platform',
    body: 'Lessons, notes, quizzes and assignments unlock in order, with your progress saved.',
  },
  {
    step: '03',
    title: 'Keep the work you produce',
    body: 'Assignments you submit become evidence you can attach to your career profile.',
  },
  {
    step: '04',
    title: 'Use Career OS',
    body: 'Profile, job board, applications and interview practice — opened by completing a professional programme.',
  },
]

function HowItWorks() {
  return (
    <section className="sk-section" style={{ background: S.surface, borderBlock: `1px solid ${S.line}` }}>
      <Rail>
        <SectionHeading
          title="How Skylent fits together"
          lead="One sequence, four stages. Institutions run the same sequence with their own dashboards."
        />
        <ol className="sk-steps">
          {STEPS.map(item => (
            <li key={item.step} className="sk-step">
              <span className="sk-step-index">{item.step}</span>
              <h3 style={{ ...TY.h3, color: S.ink, margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{item.title}</h3>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0 }}>{item.body}</p>
            </li>
          ))}
        </ol>
      </Rail>
    </section>
  )
}

// ── Career + Institutions ────────────────────────────────────────────────────
function Pathways() {
  const career = getSurfaceAccent('career')
  const institution = getSurfaceAccent('institution')

  return (
    <section className="sk-section">
      <Rail>
        <div className="sk-grid sk-grid-2">
          <Card padding={26} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ ...TY.label, color: career.text }}>For learners</span>
            <h3 style={{ ...TY.h2, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>Career OS</h3>
            <p style={{ ...TY.body, color: S.inkSecondary, margin: 0 }}>
              A career workspace rather than a promise: your profile, the roles on the board, the applications you
              have sent, and structured interview practice. It opens once you complete a professional programme.
            </p>
            <MetaRow items={['Profile', 'Job board', 'Applications', 'Interview practice']} />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <ButtonLink to="/career-os" variant="secondary" themeId="career">Explore Career OS</ButtonLink>
            </div>
          </Card>

          <Card padding={26} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ ...TY.label, color: institution.text }}>For institutions</span>
            <h3 style={{ ...TY.h2, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>Run your programmes on Skylent</h3>
            <p style={{ ...TY.body, color: S.inkSecondary, margin: 0 }}>
              Schools, colleges, universities and training institutes get dashboards for programmes, learners,
              faculty and progress — the same infrastructure, scoped to your organisation.
            </p>
            <MetaRow items={['Programmes', 'Learners', 'Faculty', 'Progress']} />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <ButtonLink to="/institutions" variant="secondary" themeId="institution">For institutions</ButtonLink>
            </div>
          </Card>
        </div>
      </Rail>
    </section>
  )
}

// ── Closing CTA ──────────────────────────────────────────────────────────────
function ClosingCta() {
  return (
    <section className="sk-section-tight">
      <Rail>
        <div className="sk-cta">
          <div style={{ minWidth: 0 }}>
            <h2 style={{ ...TY.h2, color: S.inkOnDark, margin: 0, fontFamily: 'var(--font-display)' }}>
              Start with what is actually open
            </h2>
            <p style={{ ...TY.body, color: S.inkOnDarkSecondary, margin: '8px 0 0', maxWidth: '52ch' }}>
              Browse the catalogue, check the status on each card, and begin with a programme that has lessons
              waiting for you.
            </p>
          </div>
          <div className="sk-cta-actions">
            <Link to="/programs" className="sk-cta-primary">Browse programmes</Link>
            <Link to="/courses" className="sk-cta-secondary">See courses</Link>
          </div>
        </div>
      </Rail>
    </section>
  )
}

export default function HomePage() {
  return (
    <ProductShell>
      <Hero />
      <Destinations />
      <Discovery />
      <HowItWorks />
      <Pathways />
      <ClosingCta />
    </ProductShell>
  )
}
