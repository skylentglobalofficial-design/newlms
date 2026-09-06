import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, T } from '../components/ui'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { blogPosts } from '../data'

const accent = getDomainAccent('general')
const ARTICLE_MAX = 680

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    return (
      <PageShell auroraTheme="general">
        <Section tone="canvas" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="skylent-display-md" style={{ color: C.white }}>Article not found</h2>
            <Button variant="secondary" onClick={() => navigate('/blog')} style={{ marginTop: 16 }}>← Back to blog</Button>
          </div>
        </Section>
      </PageShell>
    )
  }

  const related = blogPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 2)

  return (
    <PageShell auroraTheme="general">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 28}px ${T.gutter} clamp(32px, 5vw, 48px)` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: ARTICLE_MAX, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 24, padding: 0 }}
          >
            ← Back to blog
          </button>
          <FadeIn>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 6, padding: '4px 12px', color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.category}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.readTime} read</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.date}</span>
            </div>
            <h1 className="skylent-display-md" style={{ color: C.white, margin: '0 0 18px', lineHeight: 1.1 }}>{post.title}</h1>
            <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.75 }}>{post.excerpt}</p>
          </FadeIn>
        </div>
      </section>

      <Section tone="canvas" divider>
        <div style={{ maxWidth: ARTICLE_MAX, margin: '0 auto', width: '100%' }}>
          <FadeIn>
            <GlassSurface level={2} padding="clamp(28px, 5vw, 44px)">
              <article
                className="skylent-article"
                style={{
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 'clamp(16px, 2.1vw, 17px)',
                  lineHeight: 1.85,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {post.body.split('\n\n').map((para, i) => {
                  if (para.startsWith('## ')) {
                    return (
                      <h2
                        key={i}
                        className="skylent-display-sm"
                        style={{ color: C.white, margin: '2.4em 0 0.75em', lineHeight: 1.2, letterSpacing: '-0.02em' }}
                      >
                        {para.replace('## ', '')}
                      </h2>
                    )
                  }
                  if (para.startsWith('### ')) {
                    return (
                      <h3
                        key={i}
                        style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, margin: '1.8em 0 0.6em', lineHeight: 1.3 }}
                      >
                        {para.replace('### ', '')}
                      </h3>
                    )
                  }
                  if (para.startsWith('```') || para.startsWith('    ')) {
                    return (
                      <pre
                        key={i}
                        style={{
                          background: 'rgba(0,0,0,0.35)',
                          border: `1px solid ${T.lineDark}`,
                          borderRadius: 10,
                          padding: '16px 18px',
                          overflowX: 'auto',
                          fontSize: 13,
                          lineHeight: 1.6,
                          fontFamily: 'var(--font-mono)',
                          color: 'rgba(255,255,255,0.72)',
                          margin: '0 0 1.5em',
                        }}
                      >
                        {para.replace(/```/g, '')}
                      </pre>
                    )
                  }
                  return <p key={i} style={{ margin: '0 0 1.35em' }}>{para}</p>
                })}
              </article>
            </GlassSurface>
          </FadeIn>

          {related.length > 0 && (
            <FadeIn delay={80}>
              <div style={{ marginTop: 48 }}>
                <Eyebrow tone="dark">Related</Eyebrow>
                <h2 className="skylent-display-sm" style={{ color: C.white, margin: '12px 0 24px' }}>More in {post.category}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }} className="two-col">
                  {related.map(p => (
                    <Link key={p.slug} to={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <GlassSurface level={2} padding="20px 22px" style={{ height: '100%' }}>
                        <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>{p.category}</span>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, lineHeight: 1.35, marginBottom: 8 }}>{p.title}</div>
                        <span style={{ color: accent.text, fontSize: 13, fontWeight: 600 }}>Read →</span>
                      </GlassSurface>
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </Section>
    </PageShell>
  )
}
