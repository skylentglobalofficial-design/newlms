import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { programs } from '../data'
import type { Program, ProgramType } from '../data'
import { catalogProgramBySlug, type CatalogProgramSummary } from '../lib/catalog-api'
import { useCatalogPrograms } from '../hooks/useCatalog'
import { WORLD_DOORS, catalogTypeFromSearch, worldForProgramType } from '../skylent-worlds'

const TYPE_LABELS: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional',
  CERTIFICATE: 'Certificate',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

function displayPrice(program: Program, catalog: CatalogProgramSummary[] | null | undefined) {
  const facts = catalogProgramBySlug(catalog, program.slug)
  if (facts?.pricing.length) return Math.min(...facts.pricing.map((tier) => tier.price))
  return Math.min(...program.pricing.map((tier) => tier.price))
}

function displayStatus(program: Program, catalog: CatalogProgramSummary[] | null | undefined) {
  return catalogProgramBySlug(catalog, program.slug)?.enrollmentStatus ?? program.enrollmentStatus ?? 'open'
}

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const [params, setParams] = useSearchParams()
  const [type, setType] = useState<'All' | ProgramType>(() => catalogTypeFromSearch(params.get('type')))
  const [query, setQuery] = useState(() => params.get('q') ?? '')

  useEffect(() => {
    setType(catalogTypeFromSearch(params.get('type')))
    setQuery(params.get('q') ?? '')
  }, [params])

  const typeOptions: { value: 'All' | ProgramType; label: string }[] = [
    { value: 'All', label: 'All published types' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'EXAM_PREP', label: 'Exam prep' },
    { value: 'SCHOOLING', label: 'Schooling' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate' },
    { value: 'POSTGRADUATE', label: 'Postgraduate' },
  ]

  const filtered = useMemo(() => programs.filter((program) => {
    if (type !== 'All' && program.programType !== type) return false
    if (query.trim()) {
      const haystack = `${program.name} ${program.desc} ${program.outcome}`.toLowerCase()
      if (!haystack.includes(query.trim().toLowerCase())) return false
    }
    return true
  }), [type, query])

  function updateFilters(nextType: 'All' | ProgramType, nextQuery = query) {
    setType(nextType)
    setQuery(nextQuery)
    const next = new URLSearchParams()
    if (nextType !== 'All') next.set('type', nextType)
    if (nextQuery.trim()) next.set('q', nextQuery.trim())
    setParams(next, { replace: true })
  }

  return (
    <PageShell aurora={false}>
      <div className="catalog-page world-page">
        <header className="world-hero">
          <div className="world-rail">
            <p className="world-kicker">Catalogue</p>
            <h1 className="world-title">Programmes that actually exist.</h1>
            <p className="world-lede">
              Filter by type. Schooling, undergraduate, and postgraduate stay empty until they are published. Enrollment, curriculum, and pricing stay on each programme page.
            </p>
          </div>
        </header>

        <section className="world-section" id="catalog-controls">
          <div className="world-rail">
            <div className="world-picker" aria-label="Programme type">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`world-chip${type === option.value ? ' is-active' : ''}`}
                  onClick={() => updateFilters(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <form className="catalog-filters" onSubmit={(event) => { event.preventDefault(); updateFilters(type, query) }}>
              <label className="world-note" htmlFor="program-search">Search</label>
              <input
                id="program-search"
                className="catalog-search"
                type="search"
                value={query}
                onChange={(event) => updateFilters(type, event.target.value)}
                placeholder="Search by programme name"
              />
            </form>
            <p className="world-meta" style={{ marginTop: 12 }}>{filtered.length} published match{filtered.length === 1 ? '' : 'es'}</p>
          </div>
        </section>

        <section className="world-section" id="results">
          <div className="world-rail">
            <p className="world-kicker">Results</p>
            <h2 className="world-title" style={{ fontSize: 'clamp(24px, 3vw, 34px)', maxWidth: '22ch' }}>
              {filtered.length ? 'Open a programme for curriculum and enrollment' : 'Nothing published for this filter'}
            </h2>
            {!filtered.length && (
              <p className="world-empty">Empty filters are honest. We do not invent schooling or degree products to fill the grid.</p>
            )}
            {filtered.map((program) => {
              const status = displayStatus(program, catalog.data)
              const world = worldForProgramType(program.programType)
              const door = WORLD_DOORS.find((item) => item.id === world)
              return (
                <Link key={program.slug} to={`/programs/${program.slug}`} className="catalog-result">
                  <div>
                    <div className="world-meta">
                      <span>{TYPE_LABELS[program.programType]}</span>
                      <span>{status === 'open' ? 'Enrolling' : status.replace('_', ' ')}</span>
                      {program.careerSupport ? <span>Career OS</span> : null}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '6px 0 6px' }}>{program.name}</div>
                    <p className="world-note">{program.desc}</p>
                    <div className="world-meta" style={{ marginTop: 8 }}>
                      <span>{program.duration}</span>
                      <span>{program.format}</span>
                      <span>{program.level}</span>
                      {door ? <span>{door.label} world</span> : null}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}>₹{displayPrice(program, catalog.data).toLocaleString('en-IN')}</div>
                    <div className="world-note" style={{ marginTop: 6 }}>View →</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="world-section">
          <div className="world-rail">
            <p className="world-kicker">Worlds</p>
            <div className="world-card-list">
              {WORLD_DOORS.map((door) => (
                <Link key={door.id} className="world-card" to={door.href}>
                  <b>{door.label}</b>
                  <p>{door.question}</p>
                </Link>
              ))}
            </div>
            <div className="world-actions">
              <Link className="world-btn-ghost" to="/contact">Talk to an advisor</Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
