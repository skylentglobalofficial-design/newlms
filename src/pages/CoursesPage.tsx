import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Section, SectionHeader, T, MarketingHero } from '../components/ui'
import { MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { courses } from '../data'
import type { Course } from '../data'
import { PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO, coursePhoto } from '../media'

const accent = getDomainAccent('professional')

const CATEGORY_ORDER = ['Data', 'Programming', 'AI', 'Business', 'Engineering'] as const

const CATEGORY_META: Record<string, { label: string; sub: string }> = {
  Data: { label: 'Data & analytics', sub: 'SQL, dashboards, and analysis workflows' },
  Programming: { label: 'Programming', sub: 'Languages and foundations for technical work' },
  AI: { label: 'Artificial intelligence', sub: 'LLMs, prompts, and applied AI projects' },
  Business: { label: 'Business skills', sub: 'Product, strategy, and stakeholder work' },
  Engineering: { label: 'Engineering', sub: 'Full-stack and software development' },
}

function CourseDiscoveryRow({ course }: { course: Course }) {
  const visual = coursePhoto(course.slug)
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="courses-discovery-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '96px minmax(0, 1fr) auto',
        gap: 20,
        alignItems: 'center',
        padding: '22px 0',
        borderBottom: `1px solid ${T.lineDark}`,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.lineDark}`, height: 72 }}>
        <MediaImage src={visual} alt={course.title} aspect="4/3" style={{ height: 72, minHeight: 72 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: accent.text, letterSpacing: '0.06em' }}>{course.level}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.38)' }}>{course.mode}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.38)' }}>{course.duration}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 600, color: C.white, marginBottom: 6, lineHeight: 1.25 }}>
          {course.title}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>{course.desc}</p>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.lessons} lessons</span>
          <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.projects} projects</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: C.white }}>₹{course.price.toLocaleString('en-IN')}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.32)', textDecoration: 'line-through', marginTop: 4 }}>₹{course.originalPrice.toLocaleString('en-IN')}</div>
        <div style={{ marginTop: 12 }}>
          <span style={{ color: accent.text, fontSize: 13, fontWeight: 600 }}>View course →</span>
        </div>
      </div>
    </Link>
  )
}

export default function CoursesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [mode, setMode] = useState('All')

  const categories = ['All', ...CATEGORY_ORDER.filter(c => courses.some(course => course.category === c))]
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const modes = ['All', 'Self-paced', 'Live', 'Blended']

  const filtered = useMemo(() => courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || c.category === category
    const matchLevel = level === 'All' || c.level === level
    const matchMode = mode === 'All' || c.mode.includes(mode)
    return matchSearch && matchCat && matchLevel && matchMode
  }), [search, category, level, mode])

  const featuredSlug = 'data-analytics'
  const featured = filtered.find(c => c.slug === featuredSlug) ?? filtered[0]

  const grouped = useMemo(() => {
    if (category !== 'All') return null
    return CATEGORY_ORDER
      .map(cat => ({
        category: cat,
        courses: filtered.filter(c => c.category === cat && c.slug !== featured?.slug),
      }))
      .filter(g => g.courses.length > 0)
  }, [category, filtered, featured?.slug])

  return (
    <PageShell auroraTheme="professional">
      <MarketingHero
        auroraTheme="professional"
        eyebrow="Catalog preview"
        title={<>Short courses with<br /><span style={{ color: accent.text }}>hands-on work.</span></>}
        lead="Browse by subject area — each course lists duration, level, delivery mode, and what you build. Pricing and curriculum are catalog previews until launch."
        visualMaxWidth={880}
        visual={
          <MediaImage
            src={PROGRAM_PHOTO['data-analytics-pro'] ?? DEFAULT_PROGRAM_PHOTO}
            alt="Course workspace preview"
            className="skylent-hero-visual"
            style={{ minHeight: 280, borderRadius: 12, border: `1px solid ${T.lineDark}` }}
            aspect="21/9"
            overlay="bottom"
          />
        }
      >
        <div style={{ maxWidth: 480, margin: '28px auto 0', borderBottom: `1px solid ${T.lineDark}`, paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              aria-label="Search courses"
              style={{ background: 'none', border: 'none', outline: 'none', color: C.white, fontSize: 14, width: '100%', fontFamily: 'var(--font-body)' }}
            />
          </div>
        </div>
      </MarketingHero>

      <Section tone="canvas" divider>
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Catalog preview"
            title={`${filtered.length} course${filtered.length !== 1 ? 's' : ''} in catalog`}
            lead="For full programs with Career OS access, see Programs."
          />
        </FadeIn>

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 12 }}>Category</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 100,
                    border: `1px solid ${category === c ? accent.border : T.lineDark}`,
                    background: category === c ? accent.subtle : 'transparent',
                    color: category === c ? accent.text : 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {c === 'All' ? 'All subjects' : CATEGORY_META[c]?.label ?? c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[['Level', levels, level, setLevel], ['Mode', modes, mode, setMode]].map(([label, opts, val, setter]) => (
              <div key={label as string} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)' }}>{label as string}</span>
                {(opts as string[]).map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => (setter as (v: string) => void)(o)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 100,
                      border: `1px solid ${(val as string) === o ? accent.border : T.lineDark}`,
                      background: (val as string) === o ? accent.subtle : 'transparent',
                      color: (val as string) === o ? accent.text : 'rgba(255,255,255,0.45)',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.45)' }}>
            No courses match your filters.
          </div>
        ) : category !== 'All' && CATEGORY_META[category] ? (
          <div style={{ marginTop: 40 }}>
            <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${T.lineDark}` }}>
              <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 8px' }}>{CATEGORY_META[category].label}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>{CATEGORY_META[category].sub}</p>
            </div>
            {filtered.map((course, i) => (
              <FadeIn key={course.slug} delay={i * 30}>
                <CourseDiscoveryRow course={course} />
              </FadeIn>
            ))}
          </div>
        ) : grouped ? (
          <div style={{ marginTop: 40 }}>
            {featured && (
              <FadeIn>
                <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: `1px solid ${T.lineDark}` }}>
                  <div className="skylent-label" style={{ color: accent.text, marginBottom: 12 }}>Featured</div>
                  <CourseDiscoveryRow course={featured} />
                </div>
              </FadeIn>
            )}
            {grouped.map((group, gi) => (
              <div key={group.category} style={{ marginBottom: gi < grouped.length - 1 ? 48 : 0 }}>
                <div style={{ marginBottom: 8, paddingBottom: 16, borderBottom: `1px solid ${T.lineDark}` }}>
                  <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 6px' }}>
                    {CATEGORY_META[group.category]?.label ?? group.category}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, margin: 0 }}>
                    {CATEGORY_META[group.category]?.sub}
                  </p>
                </div>
                {group.courses.map((course, i) => (
                  <FadeIn key={course.slug} delay={gi * 40 + i * 30}>
                    <CourseDiscoveryRow course={course} />
                  </FadeIn>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${T.lineDark}`, textAlign: 'center' }}>
          <Button variant="secondary" onClick={() => window.location.assign('/programs')}>View full programs</Button>
        </div>
      </Section>
    </PageShell>
  )
}
