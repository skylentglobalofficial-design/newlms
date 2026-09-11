import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ContentRail,
  ContextHeader,
  EmptyState,
  FilterDrawer,
  FilterPanel,
  FilterToggle,
  ProductLayout,
  ProgrammeList,
  SectionHeader,
  programCard,
} from '../components/product-ui'
import { programs } from '../data'
import type { Program, ProgramType } from '../data'
import { catalogProgramBySlug, type CatalogProgramSummary } from '../lib/catalog-api'
import { useCatalogPrograms } from '../hooks/useCatalog'
import { PROGRAM_TYPE_LABELS, catalogTypeFromSearch, worldForProgramType } from '../skylent-worlds'

function displayPrice(program: Program, catalog: CatalogProgramSummary[] | null | undefined) {
  const facts = catalogProgramBySlug(catalog, program.slug)
  if (facts?.pricing.length) return Math.min(...facts.pricing.map((tier) => tier.price))
  return Math.min(...program.pricing.map((tier) => tier.price))
}

function displayStatus(program: Program, catalog: CatalogProgramSummary[] | null | undefined) {
  return catalogProgramBySlug(catalog, program.slug)?.enrollmentStatus ?? program.enrollmentStatus ?? 'open'
}

const TYPE_OPTIONS: { id: string; label: string; type: 'All' | ProgramType }[] = [
  { id: 'All', label: 'All published', type: 'All' },
  { id: 'PROFESSIONAL', label: PROGRAM_TYPE_LABELS.PROFESSIONAL, type: 'PROFESSIONAL' },
  { id: 'CERTIFICATE', label: PROGRAM_TYPE_LABELS.CERTIFICATE, type: 'CERTIFICATE' },
  { id: 'EXAM_PREP', label: PROGRAM_TYPE_LABELS.EXAM_PREP, type: 'EXAM_PREP' },
  { id: 'SCHOOLING', label: PROGRAM_TYPE_LABELS.SCHOOLING, type: 'SCHOOLING' },
  { id: 'UNDERGRADUATE', label: PROGRAM_TYPE_LABELS.UNDERGRADUATE, type: 'UNDERGRADUATE' },
  { id: 'POSTGRADUATE', label: PROGRAM_TYPE_LABELS.POSTGRADUATE, type: 'POSTGRADUATE' },
]

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [type, setType] = useState<'All' | ProgramType>(() => catalogTypeFromSearch(params.get('type')))
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [sort, setSort] = useState<'name' | 'price'>(params.get('sort') === 'price' ? 'price' : 'name')

  useEffect(() => {
    setType(catalogTypeFromSearch(params.get('type')))
    setQuery(params.get('q') ?? '')
    setSort(params.get('sort') === 'price' ? 'price' : 'name')
  }, [params])

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: programs.length }
    for (const option of TYPE_OPTIONS) {
      if (option.type === 'All') continue
      map[option.id] = programs.filter((program) => program.programType === option.type).length
    }
    return map
  }, [])

  const filtered = useMemo(() => {
    const list = programs.filter((program) => {
      if (type !== 'All' && program.programType !== type) return false
      if (query.trim()) {
        const haystack = `${program.name} ${program.desc} ${program.outcome}`.toLowerCase()
        if (!haystack.includes(query.trim().toLowerCase())) return false
      }
      return true
    })
    return [...list].sort((a, b) => {
      if (sort === 'price') return displayPrice(a, catalog.data) - displayPrice(b, catalog.data)
      return a.name.localeCompare(b.name)
    })
  }, [type, query, sort, catalog.data])

  function updateFilters(nextType: 'All' | ProgramType, nextQuery = query, nextSort = sort) {
    setType(nextType)
    setQuery(nextQuery)
    setSort(nextSort)
    const next = new URLSearchParams()
    if (nextType !== 'All') next.set('type', nextType)
    if (nextQuery.trim()) next.set('q', nextQuery.trim())
    if (nextSort !== 'name') next.set('sort', nextSort)
    setParams(next, { replace: true })
    setFiltersOpen(false)
  }

  const filter = (
    <FilterPanel
      title="Type"
      options={TYPE_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
        count: counts[option.id] ?? 0,
      }))}
      value={type}
      onChange={(id) => updateFilters(id as 'All' | ProgramType)}
    />
  )

  return (
    <WorldFrame world="catalogue">
      <ContentRail>
        <ContextHeader
          world="catalogue"
          eyebrow="Catalogue"
          title="Programmes that actually exist."
          description="Filter by type. Schooling, undergraduate, and postgraduate stay empty until they are published. Curriculum, assessment, and enrollment stay on each programme page."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Programmes' }]}
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
          <form className="product-search" onSubmit={(event) => { event.preventDefault(); updateFilters(type, query) }}>
            <label className="visually-hidden" htmlFor="program-search">Search programmes</label>
            <input
              id="program-search"
              type="search"
              value={query}
              onChange={(event) => updateFilters(type, event.target.value)}
              placeholder="Search by programme name"
            />
          </form>
          <label>
            <span className="visually-hidden">Sort</span>
            <select
              className="product-search"
              value={sort}
              aria-label="Sort programmes"
              onChange={(event) => updateFilters(type, query, event.target.value as 'name' | 'price')}
              style={{ minHeight: 40, border: '1px solid var(--product-line)', borderRadius: 8, padding: '8px 10px' }}
            >
              <option value="name">Sort: name</option>
              <option value="price">Sort: price</option>
            </select>
          </label>
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Programme filters">
          {filter}
        </FilterDrawer>

        <ProductLayout sidebar={filter}>
          <SectionHeader
            title={filtered.length ? `${filtered.length} programme${filtered.length === 1 ? '' : 's'}` : 'Nothing published for this filter'}
            description={filtered.length ? 'Open a programme for curriculum, assessment, and enrollment.' : 'Empty filters are honest. We do not invent schooling or degree products to fill the list.'}
          />
          <ProgrammeList
            items={filtered.map((program) => {
              const status = displayStatus(program, catalog.data)
              const world = worldForProgramType(program.programType)
              const worldLabel = world.charAt(0).toUpperCase() + world.slice(1)
              return programCard(program, {
                price: displayPrice(program, catalog.data),
                status: `${status === 'open' ? 'Enrolling' : status.replace('_', ' ')} · ${worldLabel}`,
              })
            })}
            empty={
              <EmptyState
                title="No matching programmes"
                description="Try another type, or clear search. Empty is better than invented inventory."
                action={<Link className="product-btn-ghost" to="/programs">Clear filters</Link>}
              />
            }
          />
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
