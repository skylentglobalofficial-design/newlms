import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill } from '../design/primitives'
import { PROGRAM_TYPE_LABEL, formatInr } from '../design/CatalogueCard'
import { getCourseAvailability, getProgrammeAvailability, publishedLessonCount, publishedModuleCount } from '../lib/catalogue-status'
import { courses, programs } from '../data'
import type { Course, Program } from '../data'
import { DESTINATIONS } from '../design/destinations'
import '../design/home.css'

function useInventory() {
  return useMemo(() => {
    const withAvailability = programs.map(program => ({
      program,
      availability: getProgrammeAvailability(program),
    }))
    const openPrograms = withAvailability.filter(entry => entry.availability.canStartLearning).map(entry => entry.program)
    const upcomingPrograms = withAvailability.filter(entry => !entry.availability.canStartLearning).map(entry => entry.program)
    const openCourses = courses.filter(course => getCourseAvailability(course.slug).canStartLearning)
    const lessons = openCourses.reduce((total, course) => total + publishedLessonCount(course.slug), 0)
    return { openPrograms, upcomingPrograms, openCourses, lessons }
  }, [])
}

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  placeholder: string
}) {
  return (
    <form className="sk-home-search" onSubmit={onSubmit} role="search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <line x1="20" y1="20" x2="16.7" y2="16.7" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button type="submit">Search</button>
    </form>
  )
}

function FeaturedPoster({ program }: { program: Program }) {
  const availability = getProgrammeAvailability(program)
  const modules = publishedModuleCount(program)
  const lowestPrice = program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null

  return (
    <Link to={`/programs/${program.slug}`} className="sk-home-poster">
      <div className="sk-home-poster-top">
        <StatusPill availability={availability} size="sm" />
        <span className="sk-home-poster-type">{PROGRAM_TYPE_LABEL[program.programType]}</span>
      </div>
      <h2 className="sk-home-poster-title">{program.name}</h2>
      <p className="sk-home-poster-lead">{availability.explanation}</p>
      <ul className="sk-home-poster-meta">
        {modules > 0 && <li>{modules} published modules</li>}
        <li>{program.duration}</li>
        <li>{program.level}</li>
        {lowestPrice !== null && <li>From {formatInr(lowestPrice)}</li>}
      </ul>
      <span className="sk-home-poster-cta">
        View programme
        <span aria-hidden>→</span>
      </span>
    </Link>
  )
}

function Hero({ featured }: { featured: Program | null }) {
  const { openPrograms, openCourses, lessons } = useInventory()

  return (
    <section className="sk-home-hero">
      <Rail>
        <div className={`sk-home-hero-grid${featured ? '' : ' is-solo'}`}>
          <div className="sk-home-hero-copy">
            <p className="sk-home-kicker">Education · skills · career</p>
            <h1 className="sk-home-title">
              Skylent
              <span>One platform. Different jobs.</span>
            </h1>
            <p className="sk-home-lead">
              Find something to learn, follow an academic path, or open a professional workspace. Every product
              says whether it is open today.
            </p>
            <div className="sk-home-hero-actions">
              <Link to="/skills" className="sk-home-btn">Learn</Link>
              <Link to="/education" className="sk-home-btn-ghost">Education</Link>
            </div>
            <p className="sk-home-facts">
              Open today: {openPrograms.length} {openPrograms.length === 1 ? 'programme' : 'programmes'},{' '}
              {openCourses.length} {openCourses.length === 1 ? 'course' : 'courses'}, {lessons} lessons.
            </p>
          </div>
          {featured && <FeaturedPoster program={featured} />}
        </div>
      </Rail>
    </section>
  )
}

function Destinations() {
  return (
    <section className="sk-home-intent">
      <Rail>
        <div className="sk-home-section-head">
          <h2>Where should I go next?</h2>
          <p>Same platform — six different jobs. Start with the one that matches why you are here.</p>
        </div>
        <div className="sk-home-doors">
          {DESTINATIONS.map((destination, index) => (
            <Link
              key={destination.id}
              to={destination.to}
              className={`sk-home-door is-${destination.role}`}
            >
              <span className="sk-home-door-index" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="sk-home-door-label">{destination.label}</span>
              <span className="sk-home-door-q">{destination.question}</span>
              <span className="sk-home-door-promise">{destination.promise}</span>
            </Link>
          ))}
        </div>
      </Rail>
    </section>
  )
}

function ProgramProductCard({ program }: { program: Program }) {
  const availability = getProgrammeAvailability(program)
  const modules = publishedModuleCount(program)
  const lowestPrice = program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null
  const detailsTo = `/programs/${program.slug}`

  return (
    <article className="sk-home-pcard">
      <div className="sk-home-pcard-body">
        <div className="sk-home-pcard-head">
          <span className="sk-home-pcard-type">{PROGRAM_TYPE_LABEL[program.programType]}</span>
          <StatusPill availability={availability} size="sm" />
        </div>
        <h3 className="sk-home-pcard-title">
          <Link to={detailsTo}>{program.name}</Link>
        </h3>
        <p className="sk-home-pcard-meta">
          {[
            modules > 0 ? `${modules} modules` : null,
            program.duration,
            program.level,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {lowestPrice !== null && (
          <p className="sk-home-pcard-price">
            From <strong>{formatInr(lowestPrice)}</strong>
          </p>
        )}
      </div>
      <div className="sk-home-pcard-actions">
        <Link to={detailsTo} className="sk-home-pcard-fill">
          View programme
        </Link>
      </div>
    </article>
  )
}

function CourseProductCard({ course }: { course: Course }) {
  const availability = getCourseAvailability(course.slug)
  const lessons = publishedLessonCount(course.slug)
  const detailsTo = `/courses/${course.slug}`

  return (
    <article className="sk-home-pcard">
      <div className="sk-home-pcard-body">
        <div className="sk-home-pcard-head">
          <span className="sk-home-pcard-type">{course.category}</span>
          <StatusPill availability={availability} size="sm" />
        </div>
        <h3 className="sk-home-pcard-title">
          <Link to={detailsTo}>{course.title}</Link>
        </h3>
        <p className="sk-home-pcard-meta">
          {[
            lessons > 0 ? `${lessons} lessons` : 'No lessons yet',
            course.duration,
            course.level,
          ].join(' · ')}
        </p>
        <p className="sk-home-pcard-price">
          <strong>{formatInr(course.price)}</strong>
        </p>
      </div>
      <div className="sk-home-pcard-actions">
        <Link to={detailsTo} className="sk-home-pcard-fill">
          View course
        </Link>
      </div>
    </article>
  )
}

function OpenNow() {
  const navigate = useNavigate()
  const { openPrograms, upcomingPrograms, openCourses } = useInventory()
  const [tab, setTab] = useState<'programmes' | 'courses'>('programmes')
  const [query, setQuery] = useState('')

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/skills?q=${encodeURIComponent(trimmed)}` : '/skills')
  }

  return (
    <section className="sk-home-store" id="open-now">
      <Rail>
        <div className="sk-home-store-head">
          <div>
            <h2>Open to start today</h2>
            <p>Only programmes and courses with published lessons. Nothing here is a placeholder.</p>
          </div>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="What do you want to learn?"
          />
        </div>

        <div className="sk-home-tabs" role="tablist" aria-label="Open catalogue">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'programmes'}
            className={tab === 'programmes' ? 'is-active' : ''}
            onClick={() => setTab('programmes')}
          >
            Programmes <span>{openPrograms.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'courses'}
            className={tab === 'courses' ? 'is-active' : ''}
            onClick={() => setTab('courses')}
          >
            Courses <span>{openCourses.length}</span>
          </button>
        </div>

        {tab === 'programmes' ? (
          openPrograms.length === 0 ? (
            <p className="sk-home-empty">No programme currently has published course material.</p>
          ) : (
            <div className="sk-home-store-grid">
              {openPrograms.map(program => (
                <ProgramProductCard key={program.slug} program={program} />
              ))}
            </div>
          )
        ) : openCourses.length === 0 ? (
          <p className="sk-home-empty">No course currently has published lessons.</p>
        ) : (
          <div className="sk-home-store-grid">
            {openCourses.map(course => (
              <CourseProductCard key={course.slug} course={course} />
            ))}
          </div>
        )}

        {tab === 'programmes' && upcomingPrograms.length > 0 && (
          <div className="sk-home-waitlist">
            <h3>Accepting interest, not yet teaching</h3>
            <ul>
              {upcomingPrograms.map(program => {
                const availability = getProgrammeAvailability(program)
                return (
                  <li key={program.slug}>
                    <Link to={`/programs/${program.slug}`}>{program.name}</Link>
                    <span>{availability.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </Rail>
    </section>
  )
}

const HOW_IT_WORKS = [
  { label: 'Learn', body: 'A programme or course with published lessons.' },
  { label: 'Practise', body: 'A virtual lab only when the subject has one.' },
  { label: 'Build', body: 'Projects and assignments in the curriculum.' },
  { label: 'Prove', body: 'Quizzes and a completion record — not a degree.' },
  { label: 'Move', body: 'Career OS: profile, jobs and applications you actually send.' },
]

function HowItWorks() {
  return (
    <section className="sk-home-how">
      <Rail>
        <div className="sk-home-section-head">
          <h2>How Skylent works</h2>
          <p>A short path. Nothing here invents a classroom, a ranking or a placement.</p>
        </div>
        <ol className="sk-home-how-list">
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step.label}>
              <span className="sk-home-how-index" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.label}</strong>
              <span>{step.body}</span>
            </li>
          ))}
        </ol>
      </Rail>
    </section>
  )
}

function Closing() {
  return (
    <section className="sk-home-close">
      <Rail>
        <div className="sk-home-close-inner">
          <h2>Start with what is actually open.</h2>
          <p>Check the status on every card. If lessons are not published, it will say so.</p>
          <div className="sk-home-hero-actions">
            <Link to="/skills" className="sk-home-btn">Find something to learn</Link>
            <Link to="/education" className="sk-home-btn-ghost">Explore education</Link>
          </div>
        </div>
      </Rail>
    </section>
  )
}

export default function HomePage() {
  const { openPrograms } = useInventory()
  const featured = openPrograms[0] ?? null

  return (
    <ProductShell className="sk-home">
      <Hero featured={featured} />
      <Destinations />
      <OpenNow />
      <HowItWorks />
      <Closing />
    </ProductShell>
  )
}
