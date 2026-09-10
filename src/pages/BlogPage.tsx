import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Eyebrow, Section, T } from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { blogPosts } from '../data'
import { PHOTO } from '../media'

const accent = getDomainAccent('general')

export default function BlogPage() {
  const [category, setCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(blogPosts.map(p => p.category)))]
  const filtered = blogPosts.filter(p => category === 'All' || p.category === category)
  const featured = filtered[0]

  return (
    <PageShell auroraTheme="general">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 32}px ${T.gutter} clamp(40px, 5vw, 56px)` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 0.85fr', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'center' }}>
            <FadeIn>
              <Eyebrow  accent>Editorial</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '18px 0 14px' }}>
                Notes on education<br />and careers.
              </h1>
              <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 480, margin: 0 }}>
                Practical writing on programs, portfolios, and hiring — not press-release marketing.
              </p>
            </FadeIn>
            <FadeIn delay={80}>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
                <MediaImage src={PHOTO.research} alt="Editorial workspace" style={{ minHeight: 220 }} />
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>

      <Section tone="canvas" divider>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            {categories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 100,
                  border: `1px solid ${category === c ? accent.border : T.lineLight}`,
                  background: category === c ? accent.subtle : 'transparent',
                  color: category === c ? accent.text : C.slate,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {featured && (
            <FadeIn>
              <Link to={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
                <GlassSurface level={2} padding="clamp(24px, 4vw, 40px)" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(24px, 4vw, 40px)', alignItems: 'center' }} className="two-col">
                  <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                      <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 5, padding: '3px 10px', color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{featured.category}</span>
                      <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{featured.readTime} read</span>
                    </div>
                    <h2 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 14px' }}>{featured.title}</h2>
                    <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.75, margin: '0 0 18px' }}>{featured.excerpt}</p>
                    <span style={{ color: accent.text, fontSize: 14, fontWeight: 600 }}>Read article →</span>
                  </div>
                  <MediaImage src={PHOTO.study} alt="" aspect="4/3" radius={12} />
                </GlassSurface>
              </Link>
            </FadeIn>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col">
            {filtered.slice(1).map((post, i) => (
              <FadeIn key={post.slug} delay={i * 40}>
                <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <GlassSurface level={2} padding="22px 24px" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: '$rgba(11,13,15,0.04)', borderRadius: 5, padding: '3px 10px', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{post.category}</span>
                      <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 10px', flex: 1 }}>{post.title}</h3>
                    <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 16px' }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.date}</span>
                      <span style={{ color: accent.text, fontSize: 13, fontWeight: 600 }}>Read →</span>
                    </div>
                  </GlassSurface>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>
    </PageShell>
  )
}
