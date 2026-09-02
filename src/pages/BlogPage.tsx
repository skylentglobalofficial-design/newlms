import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { blogPosts } from '../data'

export default function BlogPage() {
  const [category, setCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(blogPosts.map(p => p.category)))]
  const filtered = blogPosts.filter(p => category === 'All' || p.category === category)

  return (
    <PageShell>
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>SKYLENT BLOG</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 18px' }}>
              Thinking about<br /><span style={{ color: C.orange }}>education and careers.</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      <section style={{ background: C.warmWhite, padding: '48px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 44 }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: '7px 18px', borderRadius: 20, border: `1px solid ${category === c ? C.ink : 'rgba(11,13,15,0.15)'}`, background: category === c ? C.ink : 'transparent', color: category === c ? C.white : C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>{c}</button>
            ))}
          </div>

          {/* Featured */}
          {filtered[0] && (
            <FadeIn>
              <Link to={`/blog/${filtered[0].slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
                <div style={{ background: C.ink, borderRadius: 18, padding: '48px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', transition: 'transform 0.2s' }} className="two-col"
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.005)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                      <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 5, padding: '3px 10px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{filtered[0].category}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{filtered[0].readTime} read</span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 700, color: C.white, letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 16px' }}>{filtered[0].title}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.75, margin: '0 0 20px' }}>{filtered[0].excerpt}</p>
                    <span style={{ color: C.orange, fontSize: 14, fontWeight: 600 }}>Read article →</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 28, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 700, lineHeight: 1, textAlign: 'center', letterSpacing: '-0.05em' }}>{filtered[0].category.slice(0, 2)}</div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col">
            {filtered.slice(1).map((post, i) => (
              <FadeIn key={post.slug} delay={i * 40}>
                <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(11,13,15,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ background: C.sand, borderRadius: 5, padding: '3px 10px', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{post.category}</span>
                      <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 10px', flex: 1 }}>{post.title}</h3>
                    <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 16px' }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.date}</span>
                      <span style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>Read →</span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
