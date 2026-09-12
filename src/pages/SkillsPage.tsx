import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, EmptyState, Button } from '../design/primitives'
import { getSkillDomains } from '../lib/skills-domains'
import {
  filterLearnInventory,
  getEmptyLearnDomains,
  getLearnInventory,
  sortLearnInventory,
  uniqueLearnValues,
  type LearnInventoryItem,
  type LearnSort,
} from '../lib/learn-inventory'
import '../design/learn.css'

const ALL = 'all'

const KIND_OPTIONS = [
  { value: ALL, label: 'Any type' },
  { value: 'program', label: 'Programme' },
  { value: 'course', label: 'Course' },
  { value: 'workshop', label: 'Webinar' },
]

const AVAILABILITY_OPTIONS = [
  { value: ALL, label: 'Any status' },
  { value: 'available', label: 'Available now' },
  { value: 'interest', label: 'Interest open' },
  { value: 'coming-soon', label: 'Coming soon' },
]

const DURATION_OPTIONS = [
  { value: ALL, label: 'Any duration' },
  { value: 'under-8', label: 'Under 8 weeks' },
  { value: '8-16', label: '8–16 weeks' },
  { value: '16-plus', label: '16 weeks or more' },
  { value: 'unspecified', label: 'Not specified' },
]

const SORT_OPTIONS: { value: LearnSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'title', label: 'Title' },
  { value: 'duration', label: 'Duration' },
]

function resultActionLabel(item: LearnInventoryItem) {
  if (item.availability.canStartLearning) return 'Start learning'
  if (item.availabilityGroup === 'interest') return 'Register interest'
  return 'Coming soon'
}

function resultRowClass(item: LearnInventoryItem) {
  const quiet = item.availabilityGroup === 'coming-soon'
  const wait = item.availabilityGroup === 'interest'
  return [
    'sk-learn-row',
    `is-${item.kind}`,
    item.availability.canStartLearning ? 'is-open' : '',
    quiet ? 'is-quiet' : '',
    wait ? 'is-wait' : '',
  ].filter(Boolean).join(' ')
}

function ResultMeta({ item }: { item: LearnInventoryItem }) {
  return (
    <p className="sk-learn-meta">
      {[
        item.duration,
        item.level,
        item.format,
        item.kind === 'workshop'
          ? null
          : item.labCount > 0
            ? `${item.labCount} matching ${item.labCount === 1 ? 'lab' : 'labs'}`
            : 'No matching lab',
      ]
        .filter(Boolean)
        .join(' · ')}
    </p>
  )
}

function RadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="sk-learn-options">
        {options.map(option => (
          <label key={option.value} className="sk-learn-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function SkillsPage() {
  const inventory = useMemo(() => getLearnInventory(), [])
  const domains = useMemo(() => getSkillDomains().filter(domain => domain.hasCatalog), [])
  const emptyDomains = useMemo(() => getEmptyLearnDomains(), [])
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [domain, setDomain] = useState(searchParams.get('domain') ?? ALL)
  const [kind, setKind] = useState(searchParams.get('kind') ?? ALL)
  const [level, setLevel] = useState(searchParams.get('level') ?? ALL)
  const [format, setFormat] = useState(searchParams.get('format') ?? ALL)
  const [duration, setDuration] = useState(searchParams.get('duration') ?? ALL)
  const [availability, setAvailability] = useState(searchParams.get('availability') ?? ALL)
  const [sort, setSort] = useState<LearnSort>(
    searchParams.get('sort') === 'title' || searchParams.get('sort') === 'duration'
      ? searchParams.get('sort') as LearnSort
      : 'recommended',
  )
  const [filtersOpen, setFiltersOpen] = useState(false)

  const levels = useMemo(() => uniqueLearnValues(inventory, 'level'), [inventory])
  const formats = useMemo(() => uniqueLearnValues(inventory, 'format'), [inventory])

  const results = useMemo(() => {
    const filtered = filterLearnInventory(inventory, {
      query,
      domain,
      kind,
      level,
      format,
      duration,
      availability,
    })
    return sortLearnInventory(filtered, sort)
  }, [inventory, query, domain, kind, level, format, duration, availability, sort])

  const openCount = results.filter(item => item.availability.canStartLearning).length
  const leadId = sort === 'recommended'
    ? results.find(item => item.availability.canStartLearning)?.id ?? null
    : null
  const filtersActive =
    query.trim() !== '' ||
    domain !== ALL ||
    kind !== ALL ||
    level !== ALL ||
    format !== ALL ||
    duration !== ALL ||
    availability !== ALL ||
    sort !== 'recommended'

  function persist(next: Record<string, string>) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== ALL && !(key === 'sort' && value === 'recommended') && !(key === 'q' && value.trim() === '')) {
        params.set(key, value)
      }
    }
    setSearchParams(params, { replace: true })
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    persist({ q: query, domain, kind, level, format, duration, availability, sort })
  }

  function reset() {
    setQuery('')
    setDomain(ALL)
    setKind(ALL)
    setLevel(ALL)
    setFormat(ALL)
    setDuration(ALL)
    setAvailability(ALL)
    setSort('recommended')
    setSearchParams({}, { replace: true })
  }

  return (
    <ProductShell>
      <Rail>
        <header className="sk-learn-hero">
          <p className="sk-eyebrow">Learn</p>
          <h1>What can you learn here?</h1>
          <p>
            Search the programmes, courses and webinars that actually exist. Status on every result is real — open,
            interest, or coming soon.
          </p>
          <form className="sk-learn-search" onSubmit={handleSearch} role="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.7" y2="16.7" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={event => {
                setQuery(event.target.value)
              }}
              placeholder="What are you trying to learn or become?"
              aria-label="What are you trying to learn or become?"
            />
            <button type="submit">Search</button>
          </form>
          {domains.length > 0 && (
            <div className="sk-learn-intents" role="group" aria-label="Domains with catalogue">
              {domains.map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  className={`sk-learn-intent${domain === entry.id ? ' is-active' : ''}`}
                  aria-pressed={domain === entry.id}
                  onClick={() => {
                    const next = domain === entry.id ? ALL : entry.id
                    setDomain(next)
                    persist({ q: query, domain: next, kind, level, format, duration, availability, sort })
                  }}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="sk-learn-layout">
          <aside className={`sk-learn-filters${filtersOpen ? ' is-open' : ''}`} aria-label="Discovery filters">
            <div className="sk-learn-filters-head">
              <h2>Filters</h2>
              <button
                type="button"
                className="sk-learn-filters-toggle"
                aria-expanded={filtersOpen}
                aria-controls="learn-filter-body"
                onClick={() => setFiltersOpen(open => !open)}
              >
                {filtersOpen ? 'Hide filters' : 'Show filters'}
              </button>
            </div>
            <div id="learn-filter-body" className="sk-learn-filters-body">
            <RadioGroup
              legend="Domain"
              name="learn-domain"
              value={domain}
              onChange={value => {
                setDomain(value)
                persist({ q: query, domain: value, kind, level, format, duration, availability, sort })
              }}
              options={[{ value: ALL, label: 'All domains' }, ...domains.map(entry => ({ value: entry.id, label: entry.label }))]}
            />
            <RadioGroup
              legend="Type"
              name="learn-kind"
              value={kind}
              onChange={value => {
                setKind(value)
                persist({ q: query, domain, kind: value, level, format, duration, availability, sort })
              }}
              options={KIND_OPTIONS}
            />
            <RadioGroup
              legend="Availability"
              name="learn-availability"
              value={availability}
              onChange={value => {
                setAvailability(value)
                persist({ q: query, domain, kind, level, format, duration, availability: value, sort })
              }}
              options={AVAILABILITY_OPTIONS}
            />
            <fieldset>
              <legend>Level</legend>
              <select
                className="sk-select"
                value={level}
                onChange={event => {
                  setLevel(event.target.value)
                  persist({ q: query, domain, kind, level: event.target.value, format, duration, availability, sort })
                }}
                aria-label="Filter by level"
              >
                <option value={ALL}>All levels</option>
                {levels.map(entry => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </fieldset>
            <fieldset>
              <legend>Format</legend>
              <select
                className="sk-select"
                value={format}
                onChange={event => {
                  setFormat(event.target.value)
                  persist({ q: query, domain, kind, level, format: event.target.value, duration, availability, sort })
                }}
                aria-label="Filter by format"
              >
                <option value={ALL}>All formats</option>
                {formats.map(entry => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </fieldset>
            <fieldset>
              <legend>Duration</legend>
              <select
                className="sk-select"
                value={duration}
                onChange={event => {
                  setDuration(event.target.value)
                  persist({ q: query, domain, kind, level, format, duration: event.target.value, availability, sort })
                }}
                aria-label="Filter by duration"
              >
                {DURATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </fieldset>
            <fieldset>
              <legend>Sort</legend>
              <select
                className="sk-select"
                value={sort}
                onChange={event => {
                  const next = event.target.value as LearnSort
                  setSort(next)
                  persist({ q: query, domain, kind, level, format, duration, availability, sort: next })
                }}
                aria-label="Sort results"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </fieldset>
            {filtersActive && (
              <Button variant="quiet" size="sm" onClick={reset}>Clear filters</Button>
            )}
            </div>
          </aside>

          <div>
            <div className="sk-learn-results-head">
              <p>
                <strong>{results.length}</strong> {results.length === 1 ? 'result' : 'results'}
                {openCount > 0 ? ` · ${openCount} open today` : ''}
              </p>
              <p>
                <Link to="/programs">Programmes</Link>
                {' · '}
                <Link to="/courses">Courses</Link>
                {' · '}
                <Link to="/labs">Labs</Link>
              </p>
            </div>

            {results.length === 0 ? (
              <EmptyState
                title="Nothing matches these filters"
                body="Clear a filter or search for a subject that is actually in the catalogue — for example Python, SQL, or data analytics."
                action={filtersActive ? <Button variant="secondary" onClick={reset}>Clear filters</Button> : undefined}
              />
            ) : (
              <div className="sk-learn-results">
                {results.map(item => {
                  const isLead = item.id === leadId
                  if (isLead) {
                    return (
                      <Link key={item.id} to={item.href} className="sk-learn-lead">
                        <div className="sk-learn-lead-copy">
                          <div className="sk-learn-card-top">
                            <span className="sk-learn-kind">{item.kindLabel}</span>
                            <StatusPill availability={item.availability} size="sm" />
                          </div>
                          <h2>{item.title}</h2>
                          <p className="sk-learn-desc">{item.description}</p>
                          {item.forWhom && <p className="sk-learn-who">For {item.forWhom}</p>}
                          {item.outcomes.length > 0 && (
                            <p className="sk-learn-outcomes">
                              You’ll learn: {item.outcomes.slice(0, 2).join(' · ')}
                            </p>
                          )}
                          <ResultMeta item={item} />
                        </div>
                        <span className="sk-learn-cta">{resultActionLabel(item)}</span>
                      </Link>
                    )
                  }

                  return (
                    <Link key={item.id} to={item.href} className={resultRowClass(item)}>
                      <span className="sk-learn-kind">{item.kindLabel}</span>
                      <div className="sk-learn-row-copy">
                        <h2>{item.title}</h2>
                        <p className="sk-learn-desc">{item.description}</p>
                        <ResultMeta item={item} />
                      </div>
                      <StatusPill availability={item.availability} size="sm" />
                      <span className={`sk-learn-go${item.availability.canStartLearning ? '' : ' is-quiet'}`}>
                        {resultActionLabel(item)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}

            {emptyDomains.length > 0 && (
              <section className="sk-learn-empty-domains">
                <h2>No catalogue yet</h2>
                <p>These domains are named so the map is complete. They have no programme, course or webinar behind them.</p>
                <div className="sk-learn-chips">
                  {emptyDomains.map(entry => (
                    <span key={entry.id} className="sk-learn-chip">{entry.label}</span>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
