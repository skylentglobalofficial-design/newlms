import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { courses } from '../data'

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

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || c.category === category
    const matchLevel = level === 'All' || c.level === level
    const matchMode = mode === 'All' || c.mode.includes(mode)
    return matchSearch && matchCat && matchLevel && matchMode
  })

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>SKYLENT COURSES</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Focused learning.<br /><span style={{ color: C.orange }}>Real skills.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: '0 0 40px' }}>Short, practical courses across data, AI, technology and management. Learn at your own pace. Build real projects.</p>
          </FadeIn>
          {/* Search */}
          <FadeIn delay={80}>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." style={{ background: 'none', border: 'none', outline: 'none', color: C.white, fontSize: 14, width: '100%', fontFamily: 'var(--font-body)' }} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Filters + Grid */}
      <section style={{ background: C.warmWhite, padding: '48px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            {[['Category', categories, category, setCategory], ['Level', levels, level, setLevel], ['Mode', modes, mode, setMode]].map(([label, opts, val, setter]) => (
              <div key={label as string} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{label as string}:</span>
                {(opts as string[]).map(o => (
                  <button key={o} onClick={() => (setter as (v: string) => void)(o)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${(val as string) === o ? C.ink : 'rgba(11,13,15,0.15)'}`, background: (val as string) === o ? C.ink : 'transparent', color: (val as string) === o ? C.white : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>{o}</button>
                ))}
              </div>
            ))}
          </div>

          {/* Count */}
          <div style={{ color: C.slate, fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: 28 }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col">
            {filtered.map((course, i) => (
              <FadeIn key={course.slug} delay={i * 40}>
                <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(11,13,15,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                >
                  {/* Card top */}
                  <div style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1a1e22 100%)`, padding: '28px 24px 24px', minHeight: 110 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 5, padding: '3px 10px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{course.category}</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{course.level}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>{course.title}</h3>
                  </div>
                  {/* Card body */}
                  <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 18px', flex: 1 }}>{course.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                      {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', `${course.lessons}`], ['Projects', `${course.projects}`]].map(([l, v]) => (
                        <div key={l} style={{ background: C.sand, borderRadius: 7, padding: '9px 12px' }}>
                          <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{(l as string).toUpperCase()}</div>
                          <div style={{ color: C.ink, fontSize: 12, fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(s => <div key={s} style={{ width: 10, height: 10, background: s <= Math.round(course.rating) ? C.orange : C.sand, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />)}
                      </div>
                      <span style={{ fontSize: 12, color: C.slate, fontFamily: 'var(--font-mono)' }}>{course.rating} ({course.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: C.ink }}>₹{course.price.toLocaleString('en-IN')}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: C.slate, textDecoration: 'line-through', marginLeft: 8 }}>₹{course.originalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={`/courses/${course.slug}`} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 7, padding: '9px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', transition: 'opacity 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >Enroll Now</Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: C.slate }}>No courses match your filters.</div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
