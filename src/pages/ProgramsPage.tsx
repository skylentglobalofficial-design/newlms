import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell, EnrollmentModal } from '../components/shared'
import { T } from '../components/ui'
import { programs } from '../data'
import type { Program, ProgramType } from '../data'

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
  open: { text: 'Enrolling Now', color: '#4ade80' },
  waitlist: { text: 'Join Waitlist', color: '#fbbf24' },
  coming_soon: { text: 'Coming Soon', color: 'rgba(255,255,255,0.35)' },
}

type TopFilter = 'All' | 'Skills' | 'Education' | 'Career'
type SubFilter = 'All' | ProgramType

const SUB_FILTERS: Record<TopFilter, { value: SubFilter; label: string }[]> = {
  All: [],
  Skills: [
    { value: 'All', label: 'All' },
    { value: 'PROFESSIONAL', label: 'Professional Programs' },
    { value: 'CERTIFICATE', label: 'Certificate Programs' },
    { value: 'WEBINAR', label: 'Webinars' },
  ],
  Education: [
    { value: 'All', label: 'All' },
    { value: 'SCHOOLING', label: 'Schooling' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate' },
    { value: 'POSTGRADUATE', label: 'Postgraduate' },
    { value: 'EXAM_PREP', label: 'Competitive Exams' },
  ],
  Career: [
    { value: 'All', label: 'All' },
  ],
}

function programMatchesFilter(p: Program, top: TopFilter, sub: SubFilter): boolean {
  const typeToTop: Record<ProgramType, TopFilter> = {
    PROFESSIONAL: 'Skills',
    CERTIFICATE: 'Skills',
    WEBINAR: 'Skills',
    SCHOOLING: 'Education',
    UNDERGRADUATE: 'Education',
    POSTGRADUATE: 'Education',
    EXAM_PREP: 'Education',
  }
  if (top !== 'All' && typeToTop[p.programType] !== top) return false
  if (sub !== 'All' && p.programType !== sub) return false
  return true
}

function EnrollBadge({ status }: { status?: string }) {
  const s = STATUS_LABEL[status ?? 'open']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <span style={{ color: s.color, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{s.text}</span>
    </div>
  )
}

function ProgramCard({ program, onEnroll }: { program: Program; onEnroll: () => void }) {
  const navigate = useNavigate()
  const lowestPrice = Math.min(...program.pricing.map(p => p.price))
  const typeLabel = TYPE_LABELS[program.programType]

  return (
    <div
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.rCard, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
      onClick={() => navigate(`/programs/${program.slug}`)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(243,107,33,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Header */}
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 8 }}>
          <span style={{ background: 'rgba(243,107,33,0.12)', border: '1px solid rgba(243,107,33,0.25)', borderRadius: 5, padding: '3px 10px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', flexShrink: 0 }}>
            {typeLabel.toUpperCase()}
          </span>
          <EnrollBadge status={program.enrollmentStatus} />
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 8px' }}>{program.name}</h3>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{program.desc}</p>
      </div>

      {/* Metadata grid */}
      <div style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { label: 'Duration', value: program.duration },
          { label: 'Level', value: program.level },
          { label: 'Format', value: program.format },
          { label: 'Certificate', value: program.cert },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 2 }}>{label.toUpperCase()}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Outcome + Career OS */}
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Outcome: <span style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>{program.outcome}</span></span>
        {program.careerSupport && (
          <span style={{ marginLeft: 'auto', background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 4, padding: '2px 7px', color: C.orange, fontSize: 9, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>+ CAREER OS</span>
        )}
      </div>

      {/* Batch + Price + CTA */}
      <div style={{ padding: '14px 24px 18px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 3, letterSpacing: '0.06em' }}>NEXT BATCH</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 }}>{program.upcomingBatch}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 1, letterSpacing: '0.06em' }}>STARTING FROM</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: C.white }}>₹{lowestPrice.toLocaleString('en-IN')}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onEnroll() }}
            style={{ background: 'rgba(243,107,33,0.14)', border: '1px solid rgba(243,107,33,0.32)', color: C.orange, borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(243,107,33,0.24)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(243,107,33,0.14)')}
          >
            Quick Enroll
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProgramsPage() {
  const [topFilter, setTopFilter] = useState<TopFilter>('All')
  const [subFilter, setSubFilter] = useState<SubFilter>('All')
  const [enrollItem, setEnrollItem] = useState<Program | null>(null)

  const topFilters: TopFilter[] = ['All', 'Skills', 'Education', 'Career']

  const handleTopFilter = (f: TopFilter) => {
    setTopFilter(f)
    setSubFilter('All')
  }

  const filtered = programs.filter(p => programMatchesFilter(p, topFilter, subFilter))
  const subFilters = SUB_FILTERS[topFilter]

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 64px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>SKYLENT PROGRAMS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 600, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.04, margin: '0 0 18px' }}>
              Programs built for<br /><span style={{ color: C.orange }}>real outcomes.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 17, lineHeight: 1.78, maxWidth: 520, margin: 0 }}>
              Structured programs across education, skills, and career readiness. Each one designed to be completed, not just started.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Programs grid */}
      <section style={{ background: '#0d0f12', padding: '48px 32px 80px', minHeight: '60vh' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>

          {/* Top-level category filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: subFilters.length > 0 ? 12 : 36 }}>
            {topFilters.map(f => (
              <button
                key={f}
                onClick={() => handleTopFilter(f)}
                style={{
                  padding: '9px 20px', borderRadius: 24,
                  border: `1px solid ${topFilter === f ? C.orange : 'rgba(255,255,255,0.1)'}`,
                  background: topFilter === f ? 'rgba(243,107,33,0.14)' : 'transparent',
                  color: topFilter === f ? C.orange : 'rgba(255,255,255,0.42)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.18s', fontWeight: topFilter === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sub-filters */}
          {subFilters.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 36, paddingLeft: 4, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {subFilters.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSubFilter(value)}
                  style={{
                    padding: '6px 14px', borderRadius: 16,
                    border: `1px solid ${subFilter === value ? 'rgba(243,107,33,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    background: subFilter === value ? 'rgba(243,107,33,0.1)' : 'rgba(255,255,255,0.03)',
                    color: subFilter === value ? C.orange : 'rgba(255,255,255,0.35)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s', fontWeight: subFilter === value ? 500 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Count */}
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 24 }}>
            {filtered.length} program{filtered.length !== 1 ? 's' : ''}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="three-col">
            {filtered.map((program, i) => (
              <FadeIn key={program.slug} delay={i * 50}>
                <ProgramCard program={program} onEnroll={() => setEnrollItem(program)} />
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && (
            <FadeIn>
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>No programs in this category yet</div>
                <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12 }}>Check back soon — this category is being built out.</div>
              </div>
            </FadeIn>
          )}

          {/* Advisory CTA */}
          {filtered.length > 0 && (
            <FadeIn>
              <div style={{ marginTop: 64, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: T.rCard, padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>NOT SURE WHICH PROGRAM?</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, marginBottom: 6, letterSpacing: '-0.02em' }}>Talk to a career advisor</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, maxWidth: 380 }}>
                    Share your background and goals — we'll help you find the right path.
                  </div>
                </div>
                <a
                  href="/contact"
                  style={{ display: 'inline-block', background: C.orange, color: C.white, textDecoration: 'none', padding: '12px 28px', borderRadius: 9, fontSize: 14, fontWeight: 600, transition: 'opacity 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Book a Free Session →
                </a>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {enrollItem && (
        <EnrollmentModal
          item={{ id: enrollItem.slug, title: enrollItem.name, price: Math.min(...enrollItem.pricing.map(p => p.price)), type: 'program' }}
          onClose={() => setEnrollItem(null)}
        />
      )}
    </PageShell>
  )
}
