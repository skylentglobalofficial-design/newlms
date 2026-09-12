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
            <p className="sk-home-kicker">Skylent OS</p>
            <h1 className="sk-home-title">
              Learn something specific.
              <span>Then do something with it.</span>
            </h1>
            <p className="sk-home-lead">
              Academic pathways, skills programmes and a career workspace — with a clear line between what you can
              open today and what is still being built.
            </p>
            <div className="sk-home-hero-actions">
              <Link to="/programs" className="sk-home-btn">Browse programmes</Link>
              <Link to="/courses" className="sk-home-btn-ghost">See courses</Link>
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
          <h2>What are you here for?</h2>
          <p>Six doors. Pick the one that matches the job you came to do.</p>
        </div>
        <div className="sk-home-doors">
          {DESTINATIONS.map((destination, index) => (
            <Link key={destination.id} to={destination.to} className="sk-home-door">
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

function ProgramProductCard({ program, featured = false }: { program: Program; featured?: boolean }) {
  const availability = getProgrammeAvailability(program)
  const modules = publishedModuleCount(program)
  const lowestPrice = program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null
  const detailsTo = `/programs/${program.slug}`

  return (
    <article className={`sk-home-pcard${featured ? ' is-featured' : ''}`}>
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
        <Link to={detailsTo} className={featured ? 'sk-home-pcard-primary' : 'sk-home-pcard-fill'}>
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

function OpenNow({ featuredSlug }: { featuredSlug: string | null }) {
  const navigate = useNavigate()
  const { openPrograms, upcomingPrograms, openCourses } = useInventory()
  const [tab, setTab] = useState<'programmes' | 'courses'>('programmes')
  const [query, setQuery] = useState('')

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    const path = tab === 'courses' ? '/courses' : '/programs'
    navigate(trimmed ? `${path}?q=${encodeURIComponent(trimmed)}` : path)
  }

  const programCards = openPrograms
  const featuredInGrid = featuredSlug ? programCards.find(program => program.slug === featuredSlug) : programCards[0]
  const restPrograms = programCards.filter(program => program.slug !== featuredInGrid?.slug)

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
            placeholder={tab === 'courses' ? 'Search courses' : 'Search programmes'}
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
              {featuredInGrid && <ProgramProductCard program={featuredInGrid} featured />}
              {restPrograms.map(program => (
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

const OS_COLUMNS = [
  {
    id: 'education',
    kicker: 'Education',
    title: 'Schooling to postgraduate',
    to: '/education',
    items: [
      { label: 'Schooling', sub: 'Grades 1–12' },
      { label: 'Undergraduate', sub: 'B.Tech · BCA' },
      { label: 'Postgraduate', sub: 'MBA · MCA' },
      { label: 'Entrance exams', sub: 'JEE Advanced · CAT' },
    ],
  },
  {
    id: 'skills',
    kicker: 'Skills',
    title: 'Programmes you can take',
    to: '/programs',
    items: [
      { label: 'Professional programmes', sub: 'Long-form, career-focused' },
      { label: 'Certificate programmes', sub: 'Focused credentials' },
      { label: 'Courses', sub: 'Self-paced, open in the platform' },
      { label: 'Virtual labs', sub: 'Experiments you run yourself' },
      { label: 'Webinars', sub: 'None scheduled yet' },
    ],
  },
  {
    id: 'career',
    kicker: 'Career OS',
    title: 'After a professional programme',
    to: '/career-os',
    items: [
      { label: 'Profile', sub: 'Skills, projects, resume' },
      { label: 'Job board', sub: 'Empty until an employer posts' },
      { label: 'Applications', sub: 'Track what you have sent' },
      { label: 'Interview practice', sub: 'Structured question sets' },
    ],
  },
]

function Ecosystem() {
  return (
    <section className="sk-home-os">
      <Rail>
        <div className="sk-home-section-head">
          <h2>How Skylent OS connects</h2>
          <p>Learn, practice, prove — then a career workspace. One platform, not three brochures.</p>
        </div>
        <div className="sk-home-os-grid">
          {OS_COLUMNS.map(column => (
            <Link key={column.id} to={column.to} className="sk-home-os-col">
              <span className="sk-home-os-kicker">{column.kicker}</span>
              <span className="sk-home-os-title">{column.title}</span>
              <ul>
                {column.items.map(item => (
                  <li key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.sub}</span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
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
            <Link to="/programs" className="sk-home-btn">Browse programmes</Link>
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
      <OpenNow featuredSlug={featured?.slug ?? null} />
      <Ecosystem />
      <Closing />
    </ProductShell>
  )
}
