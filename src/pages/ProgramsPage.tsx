import { useMemo, useState, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Button, T, Eyebrow, Section, SectionHeader, CTABand, Heading,
} from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'
import { programs } from '../data'
import type { Program, ProgramType } from '../data'
import { catalogProgramBySlug, type CatalogProgramSummary } from '../lib/catalog-api'
import { useCatalogPrograms } from '../hooks/useCatalog'
import { PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from '../media'

const accent = getDomainAccent('general')
const careerAccent = getDomainAccent('career')

const TYPE_LABELS: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional Program',
  CERTIFICATE: 'Certificate Program',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam Preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  open: { text: 'Enrolling now', color: '#4ade80' },
  waitlist: { text: 'Waitlist', color: '#fbbf24' },
  coming_soon: { text: 'Coming soon', color: 'rgba(255,255,255,0.42)' },
}

const PROGRAM_TYPE_THEME: Record<ProgramType, AuroraThemeId> = {
  PROFESSIONAL: 'professional',
  CERTIFICATE: 'certificate',
  WEBINAR: 'webinar',
  EXAM_PREP: 'jee',
  SCHOOLING: 'schooling',
  UNDERGRADUATE: 'undergraduate',
  POSTGRADUATE: 'postgraduate',
}

type Pillar = 'All' | 'Education' | 'Skills' | 'Exams' | 'Career'

const FEATURED_SLUG = 'data-science-ai'

function programAccent(type: ProgramType) {
  return getDomainAccent(PROGRAM_TYPE_THEME[type])
}

function lowestPrice(program: Program) {
  return Math.min(...program.pricing.map(p => p.price))
}

function programFacts(catalog: CatalogProgramSummary[] | null | undefined, slug: string) {
  return catalogProgramBySlug(catalog, slug)
}

function displayProgramPrice(program: Program, facts: CatalogProgramSummary | null) {
  if (facts?.pricing.length) return Math.min(...facts.pricing.map((tier) => tier.price))
  return lowestPrice(program)
}

function displayProgramStatus(program: Program, facts: CatalogProgramSummary | null) {
  const status = facts?.enrollmentStatus ?? program.enrollmentStatus ?? 'open'
  return STATUS_LABEL[status]
}

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function CatalogHeroVisual({ preview }: { preview: Program[] }) {
  const active = preview[0]

  return (
    <div style={{ position: 'relative', minHeight: 420 }}>
      <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.lineDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skylent-label" style={{ color: accent.text }}>Program catalog</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, borderRadius: 8, padding: '6px 10px', minWidth: 140 }}>
            <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>Search</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>programs…</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', minHeight: 280 }}>
          <div style={{ borderRight: `1px solid ${T.lineDark}`, padding: '8px 0' }}>
            {preview.slice(0, 4).map((program) => {
              const typeAccent = programAccent(program.programType)
              const isActive = program.slug === active?.slug
              return (
                <div
                  key={program.slug}
                  style={{
                    padding: '12px 16px',
                    borderLeft: `2px solid ${isActive ? typeAccent.primary : 'transparent'}`,
                    background: isActive ? typeAccent.subtle : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: typeAccent.text, marginBottom: 4 }}>
                    {TYPE_LABELS[program.programType]}
                  </div>
                  <div style={{ color: isActive ? C.white : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: isActive ? 600 : 400 }}>
                    {program.name}
                  </div>
                </div>
              )
            })}
          </div>
          {active && (
            <div style={{ padding: '18px 20px' }}>
              <div className="skylent-label" style={{ color: programAccent(active.programType).text, marginBottom: 10 }}>Preview</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, marginBottom: 8 }}>{active.name}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.6, margin: '0 0 16px' }}>
                {active.desc.slice(0, 120)}…
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { k: 'Duration', v: active.duration },
                  { k: 'Modules', v: String(active.modules) },
                  { k: 'Projects', v: String(active.projects) },
                  { k: 'Level', v: active.level },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.28)', marginBottom: 3 }}>{k}</div>
                    <div style={{ color: C.white, fontSize: 12 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassSurface>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-5% -4%',
          border: `1px dashed ${accent.border}`,
          borderRadius: T.rCard,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  )
}

// ─── DOMAIN RAIL ──────────────────────────────────────────────────────────────

function DomainsSection({
  onSelectPillar,
  activePillar,
  onJobAssistance,
}: {
  onSelectPillar: (pillar: Pillar, type?: ProgramType) => void
  activePillar: Pillar
  onJobAssistance: () => void
}) {
  const domains = [
    {
      pillar: 'Education' as Pillar,
      label: 'Education',
      accent: getDomainAccent('schooling'),
      desc: 'Structured academic pathways from school through postgraduate study.',
      items: [
        { label: 'Schooling', type: 'SCHOOLING' as ProgramType },
        { label: 'Undergraduate', type: 'UNDERGRADUATE' as ProgramType },
        { label: 'Postgraduate', type: 'POSTGRADUATE' as ProgramType },
        { label: 'Competitive Exams', type: 'EXAM_PREP' as ProgramType },
      ],
    },
    {
      pillar: 'Skills' as Pillar,
      label: 'Skills',
      accent: getDomainAccent('professional'),
      desc: 'Practical learning from live webinars to career-ready professional programs.',
      items: [
        { label: 'Webinars', type: 'WEBINAR' as ProgramType },
        { label: 'Certificate Programs', type: 'CERTIFICATE' as ProgramType },
        { label: 'Professional Programs', type: 'PROFESSIONAL' as ProgramType },
        { label: 'Job Assistance', type: null },
      ],
    },
  ]

  return (
    <Section tone="canvas" divider id="domains">
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Program domains"
          title="Browse by what you need."
          lead="Education and skills are different products — each domain filters the catalog to programs that actually exist."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 4vw, 48px)' }} className="two-col">
        {domains.map((domain, i) => (
          <FadeIn key={domain.label} delay={i * 60}>
            <GlassSurface
              level={1}
              padding="24px 26px"
              style={{
                borderLeft: `2px solid ${activePillar === domain.pillar ? domain.accent.primary : 'transparent'}`,
                height: '100%',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectPillar(domain.pillar)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div className="skylent-label" style={{ color: domain.accent.text, marginBottom: 10 }}>{domain.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, marginBottom: 10 }}>{domain.label}</div>
                <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>{domain.desc}</p>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {domain.items.map(item => {
                  const hasPrograms = item.type ? programs.some(p => p.programType === item.type) : true
                  if (!hasPrograms) return null
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.type) onSelectPillar(domain.pillar, item.type)
                        else onJobAssistance()
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderTop: `1px solid ${T.lineDark}`,
                        background: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        fontFamily: 'var(--font-body)',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 14 }}>{item.label}</span>
                      <span style={{ color: domain.accent.text, fontSize: 14 }}>→</span>
                    </button>
                  )
                })}
              </div>
            </GlassSurface>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

// ─── FILTER CONTROLS ──────────────────────────────────────────────────────────

function FilterControls({
  pillar,
  setPillar,
  type,
  setType,
  level,
  setLevel,
  mode,
  setMode,
  query,
  setQuery,
  typeOptions,
  levels,
  modes,
  resultCount,
}: {
  pillar: Pillar
  setPillar: (p: Pillar) => void
  type: 'All' | ProgramType
  setType: (t: 'All' | ProgramType) => void
  level: string
  setLevel: (l: string) => void
  mode: string
  setMode: (m: string) => void
  query: string
  setQuery: (q: string) => void
  typeOptions: { value: 'All' | ProgramType; label: string }[]
  levels: string[]
  modes: string[]
  resultCount: number
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const pillars: Pillar[] = ['All', 'Education', 'Skills', 'Exams', 'Career']

  const selectStyle: CSSProperties = {
    border: `1px solid ${T.lineDark}`,
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: 'var(--font-body)',
    background: 'rgba(255,255,255,0.04)',
    color: C.white,
    fontSize: 13,
    width: '100%',
  }

  const labelStyle: CSSProperties = {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <Section tone="canvas" divider id="catalog-controls" style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <GlassSurface level={2} padding="clamp(18px, 3vw, 24px)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>
            {resultCount} program{resultCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="program-search">Search</label>
          <input
            id="program-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by program name or description…"
            style={{
              ...selectStyle,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {pillars.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => { setPillar(f); setType('All') }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${pillar === f ? accent.border : T.lineDark}`,
                background: pillar === f ? accent.subtle : 'transparent',
                color: pillar === f ? accent.text : 'rgba(255,255,255,0.55)',
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: pillar === f ? 600 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="show-mobile"
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            width: '100%',
            padding: '10px 14px',
            marginBottom: filtersOpen ? 16 : 0,
            borderRadius: 8,
            border: `1px solid ${T.lineDark}`,
            background: 'rgba(255,255,255,0.04)',
            color: C.white,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
          className={`programs-filter-grid${filtersOpen ? ' programs-filter-open' : ''}`}
        >
          <div>
            <label style={labelStyle} htmlFor="filter-type">Type</label>
            <select id="filter-type" value={type} onChange={e => setType(e.target.value as 'All' | ProgramType)} style={selectStyle}>
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="filter-level">Level</label>
            <select id="filter-level" value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
              {levels.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="filter-mode">Format</label>
            <select id="filter-mode" value={mode} onChange={e => setMode(e.target.value)} style={selectStyle}>
              {modes.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </GlassSurface>

      <style>{`
        .programs-filter-grid { display: grid; }
        @media (max-width: 1100px) {
          .programs-filter-grid { grid-template-columns: 1fr !important; display: none; }
          .programs-filter-grid.programs-filter-open { display: grid !important; }
        }
        @media (min-width: 1101px) {
          .programs-filter-grid { display: grid !important; }
        }
      `}</style>
    </Section>
  )
}

// ─── FEATURED PROGRAM ─────────────────────────────────────────────────────────

function FeaturedProgramSection({ program, catalog }: { program: Program; catalog: CatalogProgramSummary[] | null }) {
  const navigate = useNavigate()
  const typeAccent = programAccent(program.programType)
  const photo = PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO
  const facts = programFacts(catalog, program.slug)
  const price = displayProgramPrice(program, facts)
  const status = displayProgramStatus(program, facts)
  const moduleCount = facts?.moduleCount ?? program.modules
  const projectCount = facts?.projectCount ?? program.projects

  return (
    <Section tone="canvas" divider id="featured">
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center' }} className="two-col">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <div className="skylent-label" style={{ color: typeAccent.text, marginBottom: 0 }}>{TYPE_LABELS[program.programType]}</div>
              <span style={{ color: status.color, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{status.text}</span>
            </div>
            <Heading tone="dark" size="md" style={{ marginBottom: 16 }}>{program.name}</Heading>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 24px', maxWidth: 520 }}>{program.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 28 }}>
              {[
                { k: 'Duration', v: program.duration },
                { k: 'Format', v: program.format },
                { k: 'Level', v: program.level },
                { k: 'Modules', v: String(moduleCount) },
                { k: 'Projects', v: String(projectCount) },
                { k: 'Outcome', v: program.outcome },
                { k: 'From', v: `₹${price.toLocaleString('en-IN')}` },
              ].map(({ k, v }) => (
                <div key={k}>
                  <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>{k}</div>
                  <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate(`/programs/${program.slug}`)}>View Program →</Button>
          </div>
          <MediaImage src={photo} alt={program.name} aspect="4/3" overlay="full" />
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── PROGRAM RESULTS ──────────────────────────────────────────────────────────

function ProgramResultRow({ program, prominent, catalog }: { program: Program; prominent?: boolean; catalog: CatalogProgramSummary[] | null }) {
  const typeAccent = programAccent(program.programType)
  const photo = PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO
  const facts = programFacts(catalog, program.slug)
  const price = displayProgramPrice(program, facts)
  const status = displayProgramStatus(program, facts)
  const moduleCount = facts?.moduleCount ?? program.modules
  const projectCount = facts?.projectCount ?? program.projects

  return (
    <Link
      to={`/programs/${program.slug}`}
      style={{
        display: 'grid',
        gridTemplateColumns: prominent ? 'minmax(0, 1fr)' : '88px minmax(0, 1fr) auto',
        gap: prominent ? 0 : 18,
        alignItems: prominent ? 'stretch' : 'center',
        padding: prominent ? 0 : '20px 0',
        borderBottom: prominent ? 'none' : `1px solid ${T.lineDark}`,
        textDecoration: 'none',
        color: 'inherit',
      }}
      className={prominent ? 'programs-result-featured' : undefined}
    >
      {prominent ? (
        <GlassSurface level={1} padding="0" style={{ overflow: 'hidden', borderLeft: `2px solid ${typeAccent.primary}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }} className="two-col">
            <div style={{ padding: '24px 26px' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: typeAccent.text }}>{TYPE_LABELS[program.programType]}</span>
                <span style={{ color: status.color, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{status.text}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: C.white, marginBottom: 10 }}>{program.name}</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.65, margin: '0 0 16px' }}>{program.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                <span>{program.duration}</span>
                <span>{program.format}</span>
                <span>{program.level}</span>
                <span>{moduleCount} modules</span>
                <span>{projectCount} projects</span>
              </div>
            </div>
            <div style={{ minHeight: 200, position: 'relative' }}>
              <MediaImage src={photo} alt={program.name} aspect="4/3" radius={0} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 26px', borderTop: `1px solid ${T.lineDark}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: C.white }}>₹{price.toLocaleString('en-IN')}</div>
            <span style={{ color: typeAccent.text, fontSize: 13, fontWeight: 600 }}>View Program →</span>
          </div>
        </GlassSurface>
      ) : (
        <>
          <div style={{ width: 88, height: 66, borderRadius: 8, overflow: 'hidden', background: C.ink3, borderLeft: `2px solid ${typeAccent.primary}` }}>
            <MediaImage src={photo} alt="" aspect="4/3" radius={8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: typeAccent.text }}>{TYPE_LABELS[program.programType]}</span>
              <span style={{ color: status.color, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{status.text}</span>
              {program.careerSupport && <span style={{ color: careerAccent.text, fontSize: 10, fontFamily: 'var(--font-mono)' }}>Career OS</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, marginBottom: 4 }}>{program.name}</div>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {program.desc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 11.5, color: 'rgba(255,255,255,0.38)' }}>
              <span>{program.duration}</span>
              <span>{program.format}</span>
              <span>{program.level}</span>
              {program.projects > 0 && <span>{program.projects} projects</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: C.white }}>₹{price.toLocaleString('en-IN')}</div>
            <div style={{ color: typeAccent.textMuted, fontSize: 12, marginTop: 4 }}>→</div>
          </div>
        </>
      )}
    </Link>
  )
}

function ProgramResultsSection({ results, excludeSlug, catalog }: { results: Program[]; excludeSlug?: string; catalog: CatalogProgramSummary[] | null }) {
  const list = excludeSlug ? results.filter(p => p.slug !== excludeSlug) : results
  const [lead, ...rest] = list

  return (
    <Section tone="canvas" divider id="results">
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Catalog results"
          title={list.length ? `${list.length} program${list.length !== 1 ? 's' : ''} in view` : 'No programs match'}
          lead={list.length ? 'Open any program to see curriculum, projects, pricing, and enrollment.' : undefined}
        />
      </FadeIn>

      {list.length === 0 ? (
        <FadeIn>
          <GlassSurface level={1} padding="48px 32px" style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              No programs match these filters yet. Schooling, undergraduate, and postgraduate listings will appear here as they are published.
            </p>
          </GlassSurface>
        </FadeIn>
      ) : (
        <div style={{ marginTop: 36 }}>
          {lead && (
            <FadeIn>
              <div style={{ marginBottom: 24 }}>
                <ProgramResultRow program={lead} prominent catalog={catalog} />
              </div>
            </FadeIn>
          )}
          {rest.length > 0 && (
            <div>
              <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>More programs</div>
              {rest.map((program, i) => (
                <FadeIn key={program.slug} delay={i * 40}>
                  <ProgramResultRow program={program} catalog={catalog} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

// ─── DECISION SUPPORT ─────────────────────────────────────────────────────────

function DecisionSupportSection() {
  const navigate = useNavigate()

  const paths = [
    { label: 'Education', desc: 'Structured academic pathways from school to postgraduate.', to: '/education', accent: getDomainAccent('schooling') },
    { label: 'Skills', desc: 'Practical, career-focused learning and credentials.', to: '/skills', accent: getDomainAccent('professional') },
    { label: 'Exams', desc: 'Preparation and practice for competitive exams.', to: '/education#competitive-exams', accent: getDomainAccent('jee') },
    { label: 'Career', desc: 'Profile, applications, interview prep, and jobs.', to: '/career-os', accent: getDomainAccent('career') },
  ]

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Where to start"
          title="Not sure which path fits?"
          lead="Start with Education, Skills, Exams, or Career — then filter programs by type, format, and outcome."
        />
      </FadeIn>
      <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
        {paths.map((path, i) => (
          <FadeIn key={path.label} delay={i * 50}>
            <button
              type="button"
              onClick={() => navigate(path.to)}
              style={{
                flex: '1 1 min(200px, 100%)',
                minWidth: 'min(200px, 100%)',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderTop: `1px solid ${T.lineDark}`,
                padding: '24px clamp(12px, 2vw, 20px)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div className="skylent-label" style={{ color: path.accent.text, marginBottom: 10 }}>{path.label}</div>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{path.desc}</p>
            </button>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const navigate = useNavigate()
  const [pillar, setPillar] = useState<Pillar>('All')
  const [type, setType] = useState<'All' | ProgramType>('All')
  const [level, setLevel] = useState('All')
  const [mode, setMode] = useState('All')
  const [query, setQuery] = useState('')

  const levels = useMemo(() => ['All', ...Array.from(new Set(programs.map(p => p.level)))], [])
  const modes = useMemo(() => ['All', ...Array.from(new Set(programs.map(p => p.format)))], [])

  const allTypeOptions: { value: 'All' | ProgramType; label: string }[] = [
    { value: 'All', label: 'All types' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'EXAM_PREP', label: 'Exam prep' },
    { value: 'SCHOOLING', label: 'Schooling' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate' },
    { value: 'POSTGRADUATE', label: 'Postgraduate' },
  ]
  const typeOptions = allTypeOptions.filter(opt => opt.value === 'All' || programs.some(p => p.programType === opt.value))

  const filtered = useMemo(() => programs.filter(p => {
    if (pillar === 'Exams' && p.programType !== 'EXAM_PREP') return false
    if (pillar === 'Education' && !['SCHOOLING', 'UNDERGRADUATE', 'POSTGRADUATE'].includes(p.programType)) return false
    if (pillar === 'Skills' && !['WEBINAR', 'CERTIFICATE', 'PROFESSIONAL'].includes(p.programType)) return false
    if (pillar === 'Career' && !p.careerSupport) return false
    if (type !== 'All' && p.programType !== type) return false
    if (level !== 'All' && p.level !== level) return false
    if (mode !== 'All' && p.format !== mode) return false
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      const haystack = `${p.name} ${p.desc} ${p.outcome}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  }), [pillar, type, level, mode, query])

  const featured = programs.find(p => p.slug === FEATURED_SLUG) ?? programs[0]
  const heroPreview = programs.slice(0, 4)

  function handleDomainSelect(nextPillar: Pillar, nextType?: ProgramType) {
    setPillar(nextPillar)
    setType(nextType ?? 'All')
    setQuery('')
    requestAnimationFrame(() => {
      const el = document.getElementById('catalog-controls')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <PageShell auroraTheme="general">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'center' }} className="two-col skylent-page-hero">
            <FadeIn>
              <Eyebrow tone="dark" accent>Programs</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 640 }}>
                Find the program that fits where you want to go.
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 28px' }}>
                Discovery layer for listed programs — browse by domain and format, then enroll into a live workspace when a program is open.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore Programs
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/education')}>Explore Education</Button>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <CatalogHeroVisual preview={heroPreview} />
            </FadeIn>
          </div>
        </div>
      </section>

      <DomainsSection onSelectPillar={handleDomainSelect} activePillar={pillar} onJobAssistance={() => navigate('/skills#job-assistance')} />

      <FilterControls
        pillar={pillar}
        setPillar={setPillar}
        type={type}
        setType={setType}
        level={level}
        setLevel={setLevel}
        mode={mode}
        setMode={setMode}
        query={query}
        setQuery={setQuery}
        typeOptions={typeOptions}
        levels={levels}
        modes={modes}
        resultCount={filtered.length}
      />

      {featured && <FeaturedProgramSection program={featured} catalog={catalog.data} />}

      <ProgramResultsSection results={filtered} excludeSlug={featured?.slug} catalog={catalog.data} />

      <DecisionSupportSection />

      {filtered.length > 0 && (
        <Section tone="canvas" style={{ paddingTop: 0, paddingBottom: T.sectionTight }}>
          <FadeIn>
            <GlassSurface level={1} padding="28px 32px" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, marginBottom: 6 }}>Need help choosing?</div>
                <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14 }}>Tell us your background — we will help you choose from what is actually available.</div>
              </div>
              <Button variant="secondary" onClick={() => navigate('/contact')}>Talk to an advisor</Button>
            </GlassSurface>
          </FadeIn>
        </Section>
      )}

      <CTABand
        eyebrow="Get started"
        title={<>Programs with structure,<br />not placeholders.</>}
        lead="Open a program to see curriculum, projects, and enrollment — or explore Skylent as an institution partner."
        primary={{ label: 'Explore Programs', to: '/programs#results' }}
        secondary={{ label: 'For Institutions', to: '/institutions' }}
        auroraTheme="general"
      />
    </PageShell>
  )
}
