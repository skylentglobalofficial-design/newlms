import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { blogPosts } from '../data'

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    return (
      <PageShell>
        <div style={{ padding: '120px 32px', textAlign: 'center', background: C.warmWhite, minHeight: '60vh' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: C.ink }}>Article not found</h2>
          <button onClick={() => navigate('/blog')} style={{ color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>← Back to Blog</button>
        </div>
      </PageShell>
    )
  }

  const related = blogPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 2)

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 28, padding: 0 }}>← Back to Blog</button>
          <FadeIn>
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.category}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.readTime} read</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{post.date}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 22px' }}>{post.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18, lineHeight: 1.75, margin: 0 }}>{post.excerpt}</p>
          </FadeIn>
        </div>
      </section>

      {/* Article body */}
      <section style={{ background: C.warmWhite, padding: '64px 32px 80px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: C.ink, fontSize: 17, lineHeight: 1.85, fontFamily: 'var(--font-body)' }}>
              {post.body.split('\n\n').map((para, i) => {
                if (para.startsWith('## ')) {
                  return <h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', margin: '44px 0 16px', lineHeight: 1.2 }}>{para.replace('## ', '')}</h2>
                }
                if (para.startsWith('### ')) {
                  return <h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, letterSpacing: '-0.015em', margin: '32px 0 12px', lineHeight: 1.3 }}>{para.replace('### ', '')}</h3>
                }
                return <p key={i} style={{ margin: '0 0 24px', color: '#2a2d31', lineHeight: 1.85 }}>{para}</p>
              })}
            </div>
          </FadeIn>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(11,13,15,0.1)', margin: '48px 0' }} />

          {/* Related */}
          {related.length > 0 && (
            <FadeIn>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>RELATED ARTICLES</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="two-col">
                {related.map(p => (
                  <div key={p.slug} onClick={() => navigate(`/blog/${p.slug}`)} style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(11,13,15,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <span style={{ background: C.sand, borderRadius: 4, padding: '2px 8px', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', display: 'inline-block', marginBottom: 10 }}>{p.category}</span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.ink, lineHeight: 1.3, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>Read →</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>
    </PageShell>
  )
}
