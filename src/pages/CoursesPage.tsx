import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, SectionHeader, T } from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { courses } from '../data'
import { PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO, coursePhoto } from '../media'

const accent = getDomainAccent('professional')

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

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))]
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const modes = ['All', 'Self-paced', 'Live', 'Blended']

  const filtered = useMemo(() => courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || c.category === category
    const matchLevel = level === 'All' || c.level === level
    const matchMode = mode === 'All' || c.mode.includes(mode)
    return matchSearch && matchCat && matchLevel && matchMode
  }), [search, category, level, mode])

  return (
    <PageShell auroraTheme="professional">
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: `${T.navH + 32}px ${T.gutter} clamp(48px, 6vw, 72px)`,
        }}
      >
        <Aurora themeId="professional" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="hero-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 56px)', alignItems: 'center' }}>
            <FadeIn>
              <Eyebrow tone="dark" accent>Courses</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 560 }}>
                Short courses with<br />
                <span style={{ color: accent.text }}>hands-on work.</span>
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.58)', maxWidth: 480, margin: '0 0 28px' }}>
                Practice SQL, Python, dashboards, and more — with structured lessons and projects you can show in a portfolio.
              </p>
              <GlassSurface level={2} padding="12px 16px" style={{ maxWidth: 420 }}>
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
              </GlassSurface>
            </FadeIn>
            <FadeIn delay={80}>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', minHeight: 320 }}>
                <MediaImage
                  src={PROGRAM_PHOTO['data-analytics-pro'] ?? DEFAULT_PROGRAM_PHOTO}
                  alt="Course workspace preview"
                  className="skylent-hero-visual"
                  style={{ minHeight: 300 }}
                />
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>

      <Section tone="canvas" divider>
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Browse"
            title={`${filtered.length} course${filtered.length !== 1 ? 's' : ''}`}
            lead="Filter by category, level, or delivery mode. For full programs with Career OS access, see Programs."
          />
        </FadeIn>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32, marginBottom: 36 }}>
          {[['Category', categories, category, setCategory], ['Level', levels, level, setLevel], ['Mode', modes, mode, setMode]].map(([label, opts, val, setter]) => (
            <div key={label as string} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)' }}>{label as string}</span>
              {(opts as string[]).map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => (setter as (v: string) => void)(o)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: `1px solid ${(val as string) === o ? accent.border : T.lineDark}`,
                    background: (val as string) === o ? accent.subtle : 'transparent',
                    color: (val as string) === o ? accent.text : 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s',
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.45)' }}>
            No courses match your filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col programs-grid">
            {filtered.map((course, i) => (
              <FadeIn key={course.slug} delay={i * 40}>
                <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', minHeight: 140, borderBottom: `1px solid ${T.lineDark}` }}>
                    <MediaImage
                      src={coursePhoto(course.slug)}
                      alt={course.title}
                      style={{ minHeight: 140, height: 140 }}
                    />
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                      <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 5, padding: '3px 10px', color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{course.category}</span>
                      <span style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${T.lineDark}`, borderRadius: 5, padding: '3px 10px', color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{course.level}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 10px' }}>{course.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.65, margin: '0 0 16px', flex: 1 }}>{course.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                      {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', String(course.lessons)], ['Projects', String(course.projects)]].map(([l, v]) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 8, padding: '8px 10px' }}>
                          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 3 }}>{l}</div>
                          <div style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: C.white }}>₹{course.price.toLocaleString('en-IN')}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', marginLeft: 8 }}>₹{course.originalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={`/courses/${course.slug}`} style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="sm">View course</Button>
                      </Link>
                    </div>
                  </div>
                </GlassSurface>
              </FadeIn>
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  )
}
