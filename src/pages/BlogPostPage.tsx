import { Link, useParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, EmptyState, ButtonLink, Tag } from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { blogPosts } from '../data'

const accent = getSurfaceAccent('general')

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = blogPosts.find(item => item.slug === slug)

  if (!post) {
    return (
      <ProductShell>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Article not found"
              body="That essay is not in the journal."
              action={<ButtonLink to="/blog">Back to the journal</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const related = blogPosts.filter(item => item.slug !== slug && item.category === post.category).slice(0, 2)
  const blocks = post.body.split('\n\n')

  return (
    <ProductShell>
      <Rail width="reading">
        <article style={{ paddingBottom: 72 }}>
          <Link to="/blog" className="sk-backlink" style={{ marginTop: 28, display: 'inline-flex' }}>
            <span aria-hidden>←</span> Journal
          </Link>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '22px 0 14px' }}>
            <Tag>{post.category}</Tag>
            <span style={{ ...TY.meta, color: S.inkMuted }}>{post.readTime}</span>
            <span style={{ ...TY.meta, color: S.inkMuted }}>{post.date}</span>
          </div>
          <h1 style={{ ...TY.display, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{post.title}</h1>
          <p style={{ ...TY.bodyLg, color: S.inkSecondary, margin: '16px 0 32px' }}>{post.excerpt}</p>

          <div className="sk-article">
            {blocks.map((block, index) => {
              if (block.startsWith('## ')) {
                return <h2 key={index}>{block.replace('## ', '')}</h2>
              }
              if (block.startsWith('### ')) {
                return <h3 key={index}>{block.replace('### ', '')}</h3>
              }
              return <p key={index}>{block}</p>
            })}
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${S.line}` }}>
              <div style={{ ...TY.label, color: S.inkMuted, marginBottom: 12 }}>More in {post.category}</div>
              {related.map(item => (
                <Link
                  key={item.slug}
                  to={`/blog/${item.slug}`}
                  style={{ display: 'block', ...TY.body, color: accent.text, fontWeight: 600, textDecoration: 'none', marginBottom: 8 }}
                >
                  {item.title} →
                </Link>
              ))}
            </div>
          )}
        </article>
      </Rail>
    </ProductShell>
  )
}
